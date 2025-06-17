import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class JwtTokenService {
  private jwtTokenSubject = new BehaviorSubject<string | null>(null);
  public jwtToken$: Observable<string | null> =
    this.jwtTokenSubject.asObservable();
  private tokenReceived = false;

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
      if (window.opener) {
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
    }, 1000);
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
        localStorage.setItem('token', jwt);
        if (window.opener) {
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
    } else {
      console.log('Invalid Token Type');
    }
  }

  private checkExistingToken(): void {
    const token = localStorage.getItem('token');
    if (token && !this.tokenReceived) {
      console.log('Found token in localStorage, using it');
      this.setJwtToken(token);
      this.tokenReceived = true;
    } else {
      console.log('No token in localStorage yet');
      this.redirectToLogin();
    }
  }

  private redirectToLogin(): void {
    console.warn('Redirecting to login due to missing token...');
    localStorage.clear();
    window.location.href =
      'https://trackit.test.mpstechnologies.com/mpstrak/login/index';
  }

  private setJwtToken(token: string): void {
    console.log('Setting JWT token in service & localStorage');
    localStorage.setItem('token', token);
    this.jwtTokenSubject.next(token);
  }

  public getToken(): string | null {
    const token = this.jwtTokenSubject.value || localStorage.getItem('token');
    console.log('Getting token:', token ? 'Token exists' : 'No token');
    return token;
  }

  public isTokenReceived(): boolean {
    return this.tokenReceived;
  }

  public checkForToken(): void {
    console.log('Manually checking for token');
    this.checkExistingToken();
  }
}
