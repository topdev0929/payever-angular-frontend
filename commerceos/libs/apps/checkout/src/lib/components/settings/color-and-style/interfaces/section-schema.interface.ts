import { ScreenTypeEnum, SizeUnitEnum, StyleItemTypeEnum } from '../enums';

export interface FormSchemeItemInterface {
  controlName: string;
  labelKey: string;
  type: StyleItemTypeEnum;
  screen?: ScreenTypeEnum[];
  buttonLabelKey?: string;
  min?: number;
  max?: number;
  excludeUnits?: SizeUnitEnum[]
}

export interface FormSchemeGroupInterface {
  controls?: FormSchemeItemInterface[];
  modals?: FormSchemeModalInterface[],
}

export interface FormSchemeModalInterface {
  titleKey: string;
  controls: FormSchemeItemInterface[];
}

export interface FormSchemeInterface {
  groups?: FormSchemeGroupInterface[],
}
