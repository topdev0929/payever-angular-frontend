import { LogoAlignmentType } from '@pe/checkout/types';

export interface LogoSettings {
  url: string;
  alignment: LogoAlignmentType;
}

export interface HeaderSettings {
  stylesActive: boolean;
  logo: LogoSettings;
  fullWidth: boolean;
}
