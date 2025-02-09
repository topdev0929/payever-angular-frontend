// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { FormFieldInterface } from '@pe/shared/business-form';

export type ValidCountryIso = 'at' | 'de' | 'dk' | 'fi' | 'no' | 'nl' | 'se' | 'gb';

export class OnboardingRequestDTO {
  device: string;
  method: string;
  name: string;
  app: string;

  static mapCountry(country: string): ValidCountryIso {
    if (country === 'uk') {
      return 'gb';
    }

    return country as ValidCountryIso;
  }

  constructor(
    industry: string,
    public country: string,
    app: string,
    fragment: string,
    plugin?: string,
  ) {
    this.country = OnboardingRequestDTO.mapCountry(country);
    this.device = app;
    this.method = fragment;
    this.name = industry || 'business';
    this.app = plugin;
  }
}

export interface OnboardingDTO {
  id:	string;
  name:	string;
  logo:	string;
  type:	string;
  wallpaperUrl:	string;
  afterLogin: ActionDTO[];
  afterRegistration: ActionDTO[];
  accountFlags: any;
  redirectUrl:	string;
  defaultLoginByEmail:	boolean;
  defaultBusinessWallpaper?: string;
  form?: FormFieldInterface[];
}

export type ActionObjectType = {
  [key: string]: string;
}
export interface ActionDTO {
  _id: string;
  method: string;
  name: string;
  url: string;
  orderId: number;
  registerSteps: string[];
  payload: any;
  integration: any;
  priority?: number;
  capture?: ActionObjectType;
  ifTrue?: string | boolean;
  returns?: ActionObjectType;
}

export interface WallpaperDataInterface {
  wallpaper: string;
  theme: string;
}
