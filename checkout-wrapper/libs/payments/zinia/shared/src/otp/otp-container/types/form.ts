import { ValidatorFn } from '@angular/forms';

export interface OtpFormInterface {
  [key: string]: string;
}

export interface GroupSettingsInterface {
  [key: string]: [string, ValidatorFn];
}
