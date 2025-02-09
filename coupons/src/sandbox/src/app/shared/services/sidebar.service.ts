import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

@Injectable({ providedIn: 'any' })
export class PebCouponSidebarService {
  isSidebarClosed$ = new BehaviorSubject(false);

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private domSanitizer: DomSanitizer,
  ) {

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
        id: 'profiles',
        name: 'shipping-app.main_nav.profiles',
        image: this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons/app-icon-shipping.svg`),
        children: [],
      },
      {
        id: 'zones',
        name: 'shipping-app.main_nav.zones',
        image: this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons/app-icon-shipping.svg`),
        children: [],
      },
      {
        id: 'packages',
        name: 'shipping-app.main_nav.packages',
        image: this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons/app-icon-shipping.svg`),
        children: [],
      },
      {
        id: 'delivery-by-location',
        name: 'shipping-app.main_nav.delivery_location',
        image: this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons/app-icon-pos.svg`),
        children: [],
      },
      {
        id: 'pickup-by-location',
        name: 'shipping-app.main_nav.pickup_location',
        image: this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons/app-icon-pos.svg`),
        children: [],
      },
      {
        id: 'packaging-slip',
        name: 'shipping-app.main_nav.slip',
        image: this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons/apps-icon.svg`),
        children: [],
      },
      {
        id: 'connect',
        name: 'shipping-app.main_nav.connect',
        image: this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons/app-icon-connect.svg`),
        children: [],
      },
    ];
  }
}
