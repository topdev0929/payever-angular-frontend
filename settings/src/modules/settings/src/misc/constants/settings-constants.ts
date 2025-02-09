import { InjectionToken } from '@angular/core';
import {SettingsRoutesEnum} from "../../settings-routes.enum";

export const PEB_SHOP_HOST = new InjectionToken<string>('PEB_SHOP_HOST');

export const SETTINGS_NAVIGATION = [
  {
    id: 'business_info',
    name: 'sidebar.sections.navigation.panels.business_info',
    image: '#icon-settings-business-info',
    link: `${SettingsRoutesEnum.Info}/`,
  },
  {
    id: 'business_detail',
    name: 'sidebar.sections.navigation.panels.business_details',
    image: '#icon-settings-business-details',
    link: `${SettingsRoutesEnum.Details}`,
  },
  {
    id: 'wallpaper',
    name: 'sidebar.sections.navigation.panels.wallpaper',
    image: '#icon-settings-wallpaper',
    link: `${SettingsRoutesEnum.Wallpaper}`,
  },
  {
    id: 'employees',
    name: 'sidebar.sections.navigation.panels.employees',
    image: '#icon-settings-employees',
    link: `${SettingsRoutesEnum.Employees}`,
  },
  {
    id: 'policies',
    name: 'sidebar.sections.navigation.panels.policies',
    image: '#icon-settings-policies',
    link: `${SettingsRoutesEnum.Policies}`,
  },
  {
    id: 'general',
    name: 'sidebar.sections.navigation.panels.general',
    image: '#icon-settings-general',
    link: `${SettingsRoutesEnum.General}`,
  },
  {
    id: 'appearance',
    name: 'sidebar.sections.navigation.panels.appearance',
    image: '#icon-settings-appearance',
    link: `${SettingsRoutesEnum.Appearance}`,
  },
]

