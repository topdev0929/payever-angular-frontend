import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PebaffiliatesSidebarService {
  isSidebarClosed$ = new BehaviorSubject(false);

  toggleSidebar(a?: string) {
    if (a) {
      this.isSidebarClosed$.next(a === 'yes' ? true : false);
      return;
    }
    this.isSidebarClosed$.next(!this.isSidebarClosed$.value);
  }

  createSidebar() {
    return [
      {
        id: 'dashboard',
        name: 'Dashboard',
        image: 'assets/sidebar-icons/dashboard.svg',
        children: [],
      },
      {
        id: 'programs',
        name: 'Programs',
        image: 'assets/sidebar-icons/programs.svg',
        children: [],
      },
      {
        id: 'settings',
        name: 'Settings',
        image: 'assets/sidebar-icons/settings.svg',
        children: [],
      },
    ];
  }
}
