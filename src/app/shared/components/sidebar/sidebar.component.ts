import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarService } from '../../../core/services/sidebar.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent implements OnInit, OnDestroy {
  isCollapsed = false;
  menuItems: string[] = ['Dashboard'];
  tooltip: string | null = null;
  tooltipX = 0;
  tooltipY = 0;

  private sidebarSub!: Subscription;

  constructor(private router: Router, private sidebarService: SidebarService) {}

  ngOnInit() {
    this.sidebarSub = this.sidebarService.collapsed$.subscribe((collapsed) => {
      this.isCollapsed = collapsed;
    });
  }

  ngOnDestroy() {
    if (this.sidebarSub) {
      this.sidebarSub.unsubscribe();
    }
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  navigateTo(item: string): void {
    if (item === 'Dashboard') {
      this.router.navigate(['/report']);
    }
  }

  showTooltip(item: string, event: MouseEvent) {
    if (this.isCollapsed) {
      this.tooltip = item;

      const iconRect = (event.target as HTMLElement).getBoundingClientRect();
      this.tooltipX = iconRect.right;
      this.tooltipY = iconRect.top + window?.scrollY + 10;
    }
  }

  hideTooltip(): void {
    this.tooltip = null;
  }
}
