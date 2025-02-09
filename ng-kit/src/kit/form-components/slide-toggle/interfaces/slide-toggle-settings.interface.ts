import { SlideToggleLabelPosition, SlideToggleSize } from '../enums';
import { SlideToggleChangeEvent } from './slide-toggle-change.interface';

export interface SlideToggleSettingsInterface {
  ariaLabel?: string | null;
  ariaLabelledby?: string | null;
  fullWidth?: boolean;
  withoutLeftPadding?: boolean;
  labelPosition?: SlideToggleLabelPosition;
  size?: SlideToggleSize;
  isLightFontWeight?: boolean;
  onClick?: any;
  onValueChange?(event: SlideToggleChangeEvent): void;
}
