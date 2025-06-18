import { Component, OnInit } from '@angular/core';
import { JwtTokenService } from './core/services/jwt-token.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'dashboard-report';

  constructor(private jwtTokenService: JwtTokenService) {}

  ngOnInit(): void {
    const loader = document.getElementById('global-loader');
    if (loader) {
      loader.remove();
    }
  }
}
