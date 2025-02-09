import { SliderChangeEvent } from './slider-change-event.interface';

export interface SliderSettingsInterface {
  displayWith?: (value: number | null) => string | number;
  max?: number;
  min?: number;
  multiplyFactor?: number;
  roundToFixed?: number;
  showValueLabel?: boolean;
  step?: number;
  thumbLabel?: boolean;
  valueLabelAppend?: string;
  preventUpdatingValueByInput?: boolean;
  onInput?: (event: SliderChangeEvent) => void;
  onValueChange?: (event: SliderChangeEvent) => void;
}
