import { DrawerSettingsInterface } from './drawer-settings.interface';

export interface SidenavSettingsInterface extends DrawerSettingsInterface {
  fixedBottomGap?: number;
  fixedInViewport?: boolean;
  fixedTopGap?: number;
}
