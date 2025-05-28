import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../core/services/sidebar.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  isCollapsed = false;

  constructor(private sidebarService: SidebarService) {}

  ngOnInit(): void {
    this.sidebarService.collapsed$.subscribe((collapsed) => {
      this.isCollapsed = collapsed;
    });
  }
}
