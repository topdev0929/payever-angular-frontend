import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { PebSetSidebarsAction } from '@pe/builder/state';
import { BusinessInterface } from '@pe/business';
import { AbbreviationPipe } from '@pe/shared/pipes';
import { BusinessState } from '@pe/user';

import { ICONS } from '../../constants';


@Component({
  selector: 'pe-affiliate-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  providers: [AbbreviationPipe],
})
export class PeAffiliateNavComponent implements OnInit {
  @Select(BusinessState.businessData) data$!: Observable<BusinessInterface>;
  business$ = this.data$.pipe(
    map(data => data.name),
  );

  icons = {
    edit: '/assets/icons/edit.svg',
    settings: '/assets/icons/settings.svg',
    themes: '/assets/icons/themes.svg',
    dashboard: '/assets/icons/dashboard.svg',
    programs: '/assets/icons/my_programs.svg',
    connect: '/assets/icons/connect.svg',
  };

  sidebarItems = [
    {
      name: 'affiliates-app.navigation.dashboard',
      icon: 'dashboard',
      link: 'dashboard',
    },
    {
      name: 'affiliates-app.navigation.my_programs',
      icon: 'programs',
      isProtected: true,
      link: 'programs',
    },
    {
      name: 'affiliates-app.navigation.edit',
      icon: 'edit',
      link: 'edit',
    },
    {
      name: 'affiliates-app.navigation.themes',
      icon: 'themes',
      link: 'themes',
    },
    {
      name: 'affiliates-app.navigation.settings',
      icon: 'settings',
      link: 'settings',
    },
    {
      name: 'affiliates-app.navigation.connect',
      icon: 'connect',
      link: 'connect',
    },
  ];

  constructor(
    private readonly appEnv: PeAppEnv,
    private readonly store: Store,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
  ) {
  }

  ngOnInit(): void {
    this.initIcons();
  }

  closeSidebar() {
    this.store.dispatch(new PebSetSidebarsAction({ left: false }));
  }

  initIcons(): void {
    for (let key in this.icons) {
      this.matIconRegistry.addSvgIcon(key, this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.icons[key]}`));
    }

    this.matIconRegistry.addSvgIcon(
      'small-close-icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl('../../assets/icons/small-close-icon.svg'),
    );

    Object.entries(ICONS).forEach(([icon, path]) => {
      const url = this.domSanitizer.bypassSecurityTrustResourceUrl(path);
      this.matIconRegistry.addSvgIcon(icon, url);
    });
  }

}
