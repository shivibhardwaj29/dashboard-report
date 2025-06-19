import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  firstValueFrom,
  filter,
  timeout,
  catchError,
  of,
} from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class JwtTokenService {
  private jwtTokenSubject = new BehaviorSubject<string | null>(null);
  public jwtToken$: Observable<string | null> =
    this.jwtTokenSubject.asObservable();
  private tokenReceived = false;
  private isWaitingForToken = false;
  private readonly TOKEN_WAIT_TIMEOUT = 10000;
  private readonly READY_SIGNAL_DELAY = 1000;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    console.log('JwtTokenService constructor initialized');
    if (isPlatformBrowser(this.platformId)) {
      console.log('Browser platform detected, setting up message listener');
      this.initializeMessageListener();
      this.checkExistingToken();
      this.signalReadiness();
    }
  }

  private initializeMessageListener(): void {
    console.log('Setting up message event listener');
    window.addEventListener('message', this.receiveMessage.bind(this), false);
  }

  private signalReadiness(): void {
    setTimeout(() => {
      if (window.opener && typeof window.opener.postMessage === 'function') {
        window.opener.postMessage(
          {
            type: 'ANGULAR_READY',
            timestamp: Date.now(),
            ready: true,
          },
          '*'
        );
        console.log('Sent ANGULAR_READY signal to parent window');
      }
    }, this.READY_SIGNAL_DELAY);
  }

  private receiveMessage(event: MessageEvent): void {
    console.log('MESSAGE RECEIVED:', event);
    console.log('Event origin:', event.origin);
    console.log('Event data:', event.data);

    const allowedOrigins = [
      'https://trackit-testreport.mpstechnologies.com',
      'http://localhost:4200',
      'https://trackit.test.mpstechnologies.com',
      'http://localhost:8080',
      'http://localhost:8443',
      'http://localhost:9090',
    ];

    if (!allowedOrigins.includes(event.origin)) {
      console.warn('Unauthorized origin:', event.origin);
      console.log('Allowed origins:', allowedOrigins);
      return;
    }

    if (event.data?.type === 'JWT_TOKEN') {
      const jwt = event.data.token;
      console.log('JWT token received:', jwt ? 'Token present' : 'No token');

      if (jwt) {
        this.setJwtToken(jwt);
        this.tokenReceived = true;
        this.isWaitingForToken = false;
        localStorage.setItem('token', jwt);

        if (window.opener && typeof window.opener.postMessage === 'function') {
          window.opener.postMessage(
            {
              type: 'JWT_TOKEN_RECEIVED',
              success: true,
              timestamp: Date.now(),
            },
            event.origin
          );
          console.log('Sent acknowledgment to parent window');
        }
      } else {
        console.error('Received JWT_TOKEN message but no token in data');
      }
    } else if (event.data?.type === 'CUSTOM_ON_URL_CHANGED') {
      console.log('Invalid Token Type');
      // this.redirectToLogin();
    }
  }

  private checkExistingToken(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const token = localStorage.getItem('token');
    // token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJTLkFkbWluIiwiaWF0IjoxNzUwMjU0MTE0LCJleHAiOjE3NTAyNTUwMTR9.9oOg8Kgz15CwcEOstU9qmzQGrPlEtSW44f-d9UoLPOg"
    if (token && !this.tokenReceived) {
      console.log('Found token in localStorage, using it');
      this.setJwtToken(token);
      this.tokenReceived = true;
    } else {
      console.log('No token in localStorage yet');
    }
  }

  private redirectToLogin(): void {
    console.warn('Redirecting to login due to missing token...');
    localStorage.clear();
    window.location.href =
      'https://trackit.test.mpstechnologies.com/mpstrak/login/index';
  }

  private setJwtToken(token: string): void {
    const current = this.jwtTokenSubject.value;
    if (token && token !== current) {
      console.log('Updating JWT token in service & localStorage');
      localStorage.setItem('token', token);
      this.jwtTokenSubject.next(token);
    } else {
      console.log('Token is already current, no update needed');
    }
  }

  public getToken(): string | null {
    const current = this.jwtTokenSubject.value;

    if (!current && isPlatformBrowser(this.platformId)) {
      const local = localStorage.getItem('token');
      if (local) {
        this.setJwtToken(local);
        return local;
      }
    }

    return current;
  }

  public isTokenReceived(): boolean {
    return this.tokenReceived;
  }

  public checkForToken(): void {
    console.log('Manually checking for token');
    this.checkExistingToken();
  }

  // SIMPLE TOKEN WAIT METHODS

  /**
   * Wait for any token to arrive (no validation)
   * @param timeoutMs - Optional timeout in milliseconds (default: 10000ms)
   * @returns Promise that resolves when any token is received
   */

  private tokenWaitPromise: Promise<string | null> | null = null;

  public async waitForToken(
    timeoutMs: number = this.TOKEN_WAIT_TIMEOUT
  ): Promise<string | null> {
    if (this.tokenWaitPromise) return this.tokenWaitPromise;

    this.tokenWaitPromise = new Promise(async (resolve) => {
      const existingToken = this.getToken();
      if (existingToken) {
        this.tokenWaitPromise = null;
        return resolve(existingToken);
      }

      this.isWaitingForToken = true;

      try {
        const token = await firstValueFrom(
          this.jwtToken$.pipe(
            filter((token) => token !== null),
            timeout(timeoutMs),
            catchError((error) => {
              console.error('Token wait timeout:', error);
              return of(null);
            })
          )
        );

        this.isWaitingForToken = false;
        this.tokenWaitPromise = null;
        // token =
        //   'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJTLkFkbWluIiwiaWF0IjoxNzUwMjU0MTE0LCJleHAiOjE3NTAyNTUwMTR9.9oOg8Kgz15CwcEOstU9qmzQGrPlEtSW44f-d9UoLPOg';
        if (!token) {
          console.warn('Token still missing after wait. Redirecting...');
          this.redirectToLogin();
        }

        resolve(token);
      } catch (error) {
        console.error('Token wait error:', error);
        this.isWaitingForToken = false;
        this.tokenWaitPromise = null;
        this.redirectToLogin();
        resolve(null);
      }
    });

    return this.tokenWaitPromise;
  }

  /**
   * Wait for token before proceeding with any action
   * @param timeoutMs - Optional timeout in milliseconds
   * @returns Promise that resolves when token is available (or timeout)
   */
  public async waitForTokenReady(timeoutMs?: number): Promise<void> {
    console.log('Waiting for token to be ready...');
    await this.waitForToken(timeoutMs);
    console.log('Token wait completed');
  }

  /**
   * Check if currently waiting for token
   */
  public isWaitingForTokenStatus(): boolean {
    return this.isWaitingForToken;
  }
}
