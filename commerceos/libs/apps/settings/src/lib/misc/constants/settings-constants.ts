import { UserTypeBusinessEnum } from '@pe/common';
import { FolderItem } from '@pe/shared/folders';

import { SettingsRoutesEnum } from '../../settings-routes.enum';
import { OwnerTypesEnum } from '../enum';

interface SettingsNavigationDataInterface {
  link: string,
  owners: OwnerTypesEnum[],
  hideForUserTypes?: UserTypeBusinessEnum[],
}

export const SETTINGS_NAVIGATION: FolderItem<SettingsNavigationDataInterface>[] = [
  {
    _id: '0',
    position: 0,
    name: 'sidebar.sections.navigation.panels.business_info',
    imageIcon: '#icon-settings-business-info',
    isProtected: true,
    data: {
      link: SettingsRoutesEnum.Info,
      owners: [OwnerTypesEnum.Business],
      hideForUserTypes: [UserTypeBusinessEnum.Employee],
    },
  },
  {
    _id: '1',
    position: 1,
    name: 'sidebar.sections.navigation.panels.business_details',
    imageIcon: '#icon-settings-business-details',
    isProtected: true,
    data: {
      link: SettingsRoutesEnum.Details,
      owners: [OwnerTypesEnum.Business],
      hideForUserTypes: [UserTypeBusinessEnum.Employee],
    },
  },
  {
    _id: '2',
    position: 2,
    name: 'sidebar.sections.navigation.panels.wallpaper',
    imageIcon: '#icon-settings-wallpaper',
    isProtected: true,
    data: {
      link: SettingsRoutesEnum.Wallpaper,
      owners: [OwnerTypesEnum.Business],
      hideForUserTypes: [UserTypeBusinessEnum.Employee],
    },
  },
  {
    _id: '3',
    position: 3,
    name: 'sidebar.sections.navigation.panels.employees',
    imageIcon: '#icon-settings-employees',
    isProtected: true,
    data: {
      link: SettingsRoutesEnum.Employees,
      owners: [OwnerTypesEnum.Business],
      hideForUserTypes: [UserTypeBusinessEnum.Employee],
    },
  },
  {
    _id: '4',
    position: 4,
    name: 'sidebar.sections.navigation.panels.policies',
    imageIcon: '#icon-settings-policies',
    isProtected: true,
    data: {
      link: SettingsRoutesEnum.Policies,
      owners: [OwnerTypesEnum.Business],
    },
  },
  {
    _id: '5',
    position: 5,
    name: 'sidebar.sections.navigation.panels.general',
    imageIcon: '#icon-settings-general',
    isProtected: true,
    data: {
      link: SettingsRoutesEnum.General,
      owners: [OwnerTypesEnum.Business, OwnerTypesEnum.Personal],
    },
  },
  {
    _id: '6',
    position: 6,
    name: 'sidebar.sections.navigation.panels.appearance',
    imageIcon: '#icon-settings-appearance',
    isProtected: true,
    data: {
      link: SettingsRoutesEnum.Appearance,
      owners: [OwnerTypesEnum.Business, OwnerTypesEnum.Personal],
      hideForUserTypes: [UserTypeBusinessEnum.Employee],
    },
  },
  {
    _id: '7',
    position: 7,
    name: 'sidebar.sections.navigation.panels.billing',
    imageIcon: '#icon-settings-business-details',
    isProtected: true,
    data: {
      link: SettingsRoutesEnum.Billing,
      owners: [OwnerTypesEnum.Business, OwnerTypesEnum.Personal],
    },
  },
];

