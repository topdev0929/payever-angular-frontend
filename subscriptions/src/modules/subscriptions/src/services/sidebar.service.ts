import { HostListener, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class PeSubscriptionSidebarService {
  isSidebarClosed$ = new BehaviorSubject(false);
  isMobile = window.innerWidth <= 720;
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth <= 720;
  }

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
        image: 'assets/icons-png/dashboard.png',
        children: [],
      },
      {
        id: 'programs',
        name: 'My plans',
        image: 'assets/icons-png/plan.png',
        children: [],
      },
      {
        id: 'themes',
        name: 'Themes',
        image: 'assets/icons-png/theme.png',
        children: [],
      },
      {
        id: 'connect',
        name: 'Connect',
        image: 'assets/icons-png/connect.png',
        children: [],
      },
      {
        id: 'edit',
        name: 'Edit',
        image: 'assets/icons-png/edit.png',
        children: [],
      },
      {
        id: 'settings',
        name: 'Settings',
        image: 'assets/icons-png/settings.png',
        children: [],
      },
    ];
  }
}
