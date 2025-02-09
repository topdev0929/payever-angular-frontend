import { ButtonType } from '../../../enums';
import { AddonStyle, AddonPrependStyle, AddonType } from '../enums';
import { SlideToggleSettingsInterface } from '../../../../form-components/slide-toggle/interfaces/slide-toggle-settings.interface';

export interface AddonInterface {
  addonType: AddonType;
  addonStyle?: AddonStyle;
  addonPrependStyle?: AddonPrependStyle;
  buttonType?: ButtonType;
  noDefaultClass?: boolean;
  iconId?: string;
  iconSize?: number;
  text?: string;
  className?: string;
  toggleAddon?: ToggleAddonInterface | null;
  onClick?(event?: Event): void;
}

export interface ToggleAddonInterface extends AddonInterface {
  toggleSettings?: SlideToggleSettingsInterface | null;
}
