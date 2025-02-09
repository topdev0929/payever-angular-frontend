import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';

import { PebSetSidebarsAction } from '@pe/builder/state';
import { BusinessInterface } from '@pe/business';
import { PeDestroyService } from '@pe/common';
import { AbbreviationPipe } from '@pe/shared/pipes';
import { BusinessState } from '@pe/user';
import { WindowService } from '@pe/window';

import { ICONS } from '../../constants';


@Component({
  selector: 'pe-subscription-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  providers: [AbbreviationPipe],
})
export class PeSubscriptionNavComponent implements OnInit {
  @Select(BusinessState.businessData) data$!: Observable<BusinessInterface>;
  isMobile = document.body.clientWidth <= 720;
  business$ = this.data$.pipe(
    map(data => data.name),
  );

  icons = {
    edit: '/assets/icons/edit.svg',
    settings: '/assets/icons/settings.svg',
    themes: '/assets/icons/themes.svg',
    dashboard: '/assets/icons/dashboard.svg',
    programs: '/assets/icons/programs.svg',
    connect: '/assets/icons/connect.svg',
    closeIcon: '/assets/icons/small-close-icon.svg',
  };

  sidebarItems = [
    {
      name: 'subscriptions-app.navigation.dashboard',
      icon: 'dashboard',
      link: 'dashboard',
    },
    {
      name: 'subscriptions-app.navigation.my_plans',
      icon: 'programs',
      isProtected: true,
      link: 'programs',
    },
    {
      name: 'subscriptions-app.navigation.edit',
      icon: 'edit',
      link: 'edit',
      class:'edit-nav-item',
    },
    {
      name: 'subscriptions-app.navigation.themes',
      icon: 'themes',
      link: 'themes',
    },
    {
      name: 'subscriptions-app.navigation.settings',
      icon: 'settings',
      link: 'settings',
    },
    {
      name: 'subscriptions-app.navigation.connect',
      icon: 'connect',
      link: 'connect',
    },
  ];

  constructor(
    private readonly store: Store,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private windowService: WindowService,
    private readonly destroy$: PeDestroyService,
  ) {
    matIconRegistry.addSvgIcon(
      'small-close-icon',
      domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/small-close-icon.svg'),
    );
  }

  ngOnInit(): void {
    this.initIcons();
    this.windowService.width$.pipe(
      tap((width)=> {
        this.isMobile = width <= 720;
        if (this.isMobile) {
          this.closeSidebar();
        }
      }),
    takeUntil(this.destroy$))
    .subscribe();
  }

  closeSidebar() {
    this.store.dispatch(new PebSetSidebarsAction({ left: false }));
  }

  open(){
    if (this.isMobile) {
      this.closeSidebar();
    }
  }

  initIcons(): void {
    for (let key in this.icons) {
      this.matIconRegistry.addSvgIcon(key, this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.icons[key]}`));
    }

    Object.entries(ICONS).forEach(([icon, path]) => {
      const url = this.domSanitizer.bypassSecurityTrustResourceUrl(path);
      this.matIconRegistry.addSvgIcon(icon, url);
    });
  }

}
