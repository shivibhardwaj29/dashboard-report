// src/app/core/services/sidebar.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',  // This makes the service globally available in the app
})
export class SidebarService {
  // BehaviorSubject to track the collapsed state of the sidebar
  private isCollapsed = new BehaviorSubject<boolean>(false);

  // Observable to provide the collapsed state to other components
  collapsed$ = this.isCollapsed.asObservable();

  // Method to toggle the collapsed state
  toggleSidebar() {
    this.isCollapsed.next(!this.isCollapsed.value); // Flip the current value
  }

  constructor() {}
}
