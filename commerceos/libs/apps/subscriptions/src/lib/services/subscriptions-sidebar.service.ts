import { Injectable } from '@angular/core';

import { TranslateService } from '@pe/i18n';
import { FolderItem } from '@pe/shared/folders';

import { PeSubscriptionsRoutingPathsEnum } from '../enums';

@Injectable({ providedIn: 'root' })
export class PeSubscriptionsSidebarService {
  constructor(private translateService: TranslateService) { }

  public createSidebar(): FolderItem<{ link: string }>[] {
    return [
      {
        _id: '0',
        position: 0,
        name: this.translateService.translate('subscriptions-app.navigation.dashboard'),
        image: '../../assets/icons/dashboard.svg',
        isProtected: true,
        data: {
          link: 'dashboard',
        },
      },
      {
        _id: '1',
        position: 1,
        name: this.translateService.translate('subscriptions-app.navigation.my_plans'),
        image: '../../assets/icons/programs.svg',
        isProtected: true,
        data: {
          link: PeSubscriptionsRoutingPathsEnum.Programs,
        },
      },
      {
        _id: '3',
        position: 3,
        name: this.translateService.translate('subscriptions-app.navigation.edit'),
        image: '../../assets/icons/edit.svg',
        isProtected: true,
        data: {
          link: 'edit',
        },
      },
      {
        _id: '2',
        position: 2,
        name: this.translateService.translate('subscriptions-app.navigation.themes'),
        image: '../../assets/icons/themes.svg',
        isProtected: true,
        data: {
          link: 'themes',
        },
      },
      {
        _id: '4',
        position: 4,
        name: this.translateService.translate('subscriptions-app.navigation.settings'),
        image: '../../assets/icons/settings.svg',
        isProtected: true,
        data: {
          link: 'settings',
        },
      },
      {
        _id: '5',
        position: 5,
        name: this.translateService.translate('subscriptions-app.navigation.connect'),
        image: '../../assets/icons/connect.svg',
        isProtected: true,
        data: {
          link: PeSubscriptionsRoutingPathsEnum.Connect,
        },
      },
    ];
  }
}
