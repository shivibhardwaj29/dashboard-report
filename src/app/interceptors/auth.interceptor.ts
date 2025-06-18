import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { JwtTokenService } from '../core/services/jwt-token.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private jwtService: JwtTokenService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this.jwtService.jwtToken$.pipe(
      filter((token) => !!token),
      take(1),
      switchMap((token) => {
        const clonedRequest = req.clone({
          setParams: {
            token: token as string,
          },
        });
        return next.handle(clonedRequest);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.warn('401 Unauthorized — token might be invalid');
          localStorage.clear();
          setTimeout(() => {
            window.location.href =
              'https://trackit.test.mpstechnologies.com/mpstrak/login/index';
          }, 100);
        }
        return throwError(() => error);
      })
    );
  }
}
