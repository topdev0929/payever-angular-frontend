import { ValidatorFn, AbstractControl } from '@angular/forms';

export interface PhoneInputValidationInterface {
  countryCodes?: string[];
  defaultValidator?: boolean;
  patternDefault: RegExp;
  patternCodeRequired: RegExp;
}

export type PhoneInputValidatorInterface = (settings?: PhoneInputValidatorSettingsInterface) => ValidatorFn;

export interface PhoneInputValidationErrorInterface {
  phone: {
    valid: false; // strict valid value because this object return always signaling as error for Angular
    country?: boolean;
  };
}

export interface PhoneInputValidatorSettingsInterface {
  countryControl?: AbstractControl;
  countryCode?: string;
  codeRequired?: boolean;
}
