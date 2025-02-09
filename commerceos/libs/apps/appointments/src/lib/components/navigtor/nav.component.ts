import { Component, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PebSetSidebarsAction } from '@pe/builder/state';
import { BusinessInterface } from '@pe/business';
import { AbbreviationPipe } from '@pe/shared/pipes';
import { BusinessState } from '@pe/user';

import { ICONS } from '../../constants';


@Component({
  selector: 'pe-subscription-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss'],
  providers: [AbbreviationPipe],
})
export class PeAppointmentNavComponent implements OnInit {
  @Select(BusinessState.businessData) data$!: Observable<BusinessInterface>;
  business$ = this.data$.pipe(
    map(data => data.name),
  );

  icons = {
    edit: '/assets/icons/edit.svg',
    settings: '/assets/icons/settings.svg',
    themes: '/assets/icons/themes.svg',
    dashboard: '/assets/icons/dashboard.svg',
    calendar: '/assets/icons/appointments-calendar.svg',
  };

  sidebarItems = [
    {
      name: 'appointments-app.navigation.dashboard',
      icon: 'dashboard',
      link: 'dashboard',
    },
    {
      name: 'appointments-app.navigation.calendar',
      icon: 'calendar',
      link: 'calendar',
    },
    {
      name: 'appointments-app.navigation.types',
      icon: 'calendar',
      link: 'types',
    },
    {
      name: 'appointments-app.navigation.availability',
      icon: 'calendar',
      link: 'availability',
    },
    {
      name: 'appointments-app.navigation.edit',
      icon: 'edit',
      link: 'edit',
    },
    {
      name: 'appointments-app.navigation.themes',
      icon: 'themes',
      link: 'themes',
    },
    {
      name: 'appointments-app.navigation.settings',
      icon: 'settings',
      link: 'settings',
    },
  ];

  constructor(
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
