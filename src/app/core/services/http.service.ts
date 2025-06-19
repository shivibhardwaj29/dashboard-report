import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  BehaviorSubject,
  from,
  Observable,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { finalize } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { JwtTokenService } from './jwt-token.service';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private token: string | null = null;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private jwtTokenService: JwtTokenService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const urlParams = new URLSearchParams(window.location.search);
      const paramToken = urlParams.get('param');
      if (paramToken) {
        this.token = paramToken;
      } else {
        // this.token = this.jwtTokenService.getToken();
      }
    }
  }
  getData<T>(
    endpoint: string,
    params?: any,
    includeToken: boolean = false
  ): Observable<T> {
    const token$ = this.jwtTokenService.jwtToken$;

    return token$.pipe(
      take(1),
      switchMap((jwt) => {
        if (!jwt && isPlatformBrowser(this.platformId)) {
          jwt = localStorage.getItem('token');
          if (jwt) {
            console.log('[HttpService] Token fetched from localStorage');
          }
        }

        // If token is still missing, wait for it
        if (includeToken && !jwt) {
          // const DEMO_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJTLkFkbWluIiwiaWF0IjoxNzUwMjU0MTE0LCJleHAiOjE3NTAyNTUwMTR9.9oOg8Kgz15CwcEOstU9qmzQGrPlEtSW44f-d9UoLPOg';
          console.warn('[HttpService] Token not ready yet. Waiting...');
          // return this.makeApiCall<T>(endpoint, params, DEMO_TOKEN);
          return from(this.jwtTokenService.waitForToken()).pipe(
            switchMap((token) => {
              if (!token) {
                console.error('[HttpService] JWT still missing after wait.');
                return throwError(
                  () => new Error('JWT token is required but missing.')
                );
              }

              return this.makeApiCall<T>(endpoint, params, token);
            })
          );
        }

        return this.makeApiCall<T>(endpoint, params, jwt);
      })
    );
  }

  private makeApiCall<T>(
    endpoint: string,
    params: any,
    jwt: string | null
  ): Observable<T> {
    let httpParams = new HttpParams();

    if (jwt) {
      httpParams = httpParams.set('token', jwt);
    }

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((v) => {
              httpParams = httpParams.append(key, String(v));
            });
          } else {
            httpParams = httpParams.set(key, String(value));
          }
        }
      });
    }

    this.loadingSubject.next(true);
    return this.http
      .get<T>(endpoint, { params: httpParams })
      .pipe(finalize(() => this.loadingSubject.next(false)));
  }
}
