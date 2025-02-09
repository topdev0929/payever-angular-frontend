import { Injectable } from '@angular/core';

import { TranslateService } from '@pe/i18n';
import { FolderItem } from '@pe/shared/folders';

import { PeAppointmentsRoutingPathsEnum } from '../enums';

@Injectable({ providedIn: 'root' })
export class PeAppointmentsSidebarService {
  constructor(private translateService: TranslateService) { }

  public readonly createSidebar = (): FolderItem<{ link: string }>[] => [
    {
      _id: '0',
      position: 0,
      image: '../../assets/icons/dashboard.svg',
      name: this.translateService.translate('appointments-app.navigation.dashboard'),
      isProtected: true,
      data: {
        link: 'dashboard',
      },
    },
    {
      _id: '1',
      position: 1,
      image: '../../assets/icons/appointments-calendar.svg',
      name: this.translateService.translate('appointments-app.navigation.calendar'),
      isProtected: true,
      data: {
        link: PeAppointmentsRoutingPathsEnum.Calendar,
      },
    },
    {
      _id: '2',
      position: 2,
      image: '../../assets/icons/appointments-calendar.svg',
      name: this.translateService.translate('appointments-app.navigation.types'),
      isProtected: true,
      data: {
        link: PeAppointmentsRoutingPathsEnum.Types,
      },
    },
    {
      _id: '3',
      position: 3,
      image: '../../assets/icons/appointments-calendar.svg',
      name: this.translateService.translate('appointments-app.navigation.availability'),
      isProtected: true,
      data: {
        link: 'availability',
      },
    },
    {
      _id: '4',
      position: 4,
      image: '../../assets/icons/edit.svg',
      name: this.translateService.translate('appointments-app.navigation.edit'),
      isProtected: true,
      data: {
        link: 'edit',
      },
    },
    {
      _id: '5',
      position: 5,
      image: '../../assets/icons/themes.svg',
      name: this.translateService.translate('appointments-app.navigation.themes'),
      isProtected: true,
      data: {
        link: 'themes',
      },
    },
    {
      _id: '6',
      position: 6,
      image: '../../assets/icons/settings.svg',
      name: this.translateService.translate('appointments-app.navigation.settings'),
      isProtected: true,
      data: {
        link: 'settings',
      },
    },
  ];
}
