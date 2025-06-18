import { APP_INITIALIZER, NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
} from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatIconModule } from '@angular/material/icon';
import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
  provideHttpClient,
  withFetch,
} from '@angular/common/http';
import { LayoutComponent } from './layout/layout.component';
import { PagesModule } from './pages/pages.module';
import { MatCardModule } from '@angular/material/card';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { NgApexchartsModule } from 'ng-apexcharts';
import { JwtTokenService } from './core/services/jwt-token.service';

// This will block app startup until token is ready (or timeout)
export function waitForJwtFactory(jwtService: JwtTokenService) {
  return () => jwtService.waitForToken(5000); // waits for up to 10 sec
}

@NgModule({
  declarations: [AppComponent, LayoutComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    MatIconModule,
    HttpClientModule,
    PagesModule,
    MatCardModule,
    NgApexchartsModule,
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(withFetch()),

    // ✅ Add this line
    {
      provide: APP_INITIALIZER,
      useFactory: waitForJwtFactory,
      deps: [JwtTokenService],
      multi: true,
    },

    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
