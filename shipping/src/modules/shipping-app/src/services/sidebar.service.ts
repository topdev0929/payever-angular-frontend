import { HostListener, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PebShippingSidebarService {
  isSidebarClosed$ = new BehaviorSubject(false);
  isMobile = window.innerWidth <= 720;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth <= 720;
  }

  toggleSidebar(a?: string) {
    if (a) {
      this.isSidebarClosed$.next(a === 'yes');
      return;
    }
    this.isSidebarClosed$.next(!this.isSidebarClosed$.getValue());
  }

  createSidebar() {
    return [
      {
        id: 'profiles',
        name: 'shipping-app.main_nav.profiles',
        image: 'assets/sidebar-icons/shipping.svg',
        children: [],
      },
      {
        id: 'zones',
        name: 'shipping-app.main_nav.zones',
        image: 'assets/sidebar-icons/shipping.svg',
        children: [],
      },
      {
        id: 'packages',
        name: 'shipping-app.main_nav.packages',
        image: 'assets/sidebar-icons/shipping.svg',
        children: [],
      },
      {
        id: 'delivery-by-location',
        name: 'shipping-app.main_nav.delivery_location',
        image: 'assets/sidebar-icons/location-copy-3.svg',
        children: [],
      },
      {
        id: 'pickup-by-location',
        name: 'shipping-app.main_nav.pickup_location',
        image: 'assets/sidebar-icons/location-copy-3.svg',
        children: [],
      },
      {
        id: 'packaging-slip',
        name: 'shipping-app.main_nav.slip',
        image: 'assets/sidebar-icons/shipping-packaging-slips.svg',
        children: [],
      },
      {
        id: 'connect',
        name: 'shipping-app.main_nav.connect',
        image: 'assets/sidebar-icons/shipping-connect.svg',
        children: [],
      },
    ];
  }
}
