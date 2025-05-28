import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private token: string | null = null;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const urlParams = new URLSearchParams(window?.location.search);
      const paramToken = urlParams.get('param');
      this.token = paramToken;
      this.token =
        'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJTLkFkbWluIiwiaWF0IjoxNzQ3ODIyOTcwLCJleHAiOjE3NDc4MjM4NzB9.DS_7YwiOJIbi--loyM0VocFVV7dur2ZyR8vpKvLg27g';
    }
  }

  getData<T>(
    endpoint: string,
    params?: any,
    includeToken: boolean = false
  ): Observable<T> {
    let httpParams = new HttpParams();

    if (includeToken && this.token) {
      httpParams = httpParams.set('token', this.token);
    }

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          httpParams = httpParams.set(key, value as string);
        }
      });
    }

    this.loadingSubject.next(true);

    return this.http.get<T>(endpoint, { params: httpParams }).pipe(
      finalize(() => {
        this.loadingSubject.next(false);
      })
    );
  }
}
