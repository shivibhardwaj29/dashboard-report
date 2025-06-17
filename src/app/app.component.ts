import { Component } from '@angular/core';
import { JwtTokenService } from './core/services/jwt-token.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'dashboard-report';

  constructor(private jwtTokenService: JwtTokenService) {
  }
}
