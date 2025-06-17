import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, switchMap, take, throwError } from 'rxjs';
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

        if (includeToken && !jwt) {
          console.error('JWT token is required but missing.');
          return throwError(
            () => new Error('JWT token is required but missing.')
          );
        }

        let httpParams = new HttpParams();

        if (includeToken && jwt) {
          httpParams = httpParams.set('token', jwt);
        }

        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              httpParams = httpParams.set(key, value as string);
            }
          });
        }

        this.loadingSubject.next(true);
        return this.http
          .get<T>(endpoint, { params: httpParams })
          .pipe(finalize(() => this.loadingSubject.next(false)));
      })
    );
  }
}
