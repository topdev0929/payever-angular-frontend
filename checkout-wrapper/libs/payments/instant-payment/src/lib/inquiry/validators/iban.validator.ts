import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isValid } from 'iban';

import { ALLOWED_IBAN_COUNTRIES } from '../constants';

export const ibanValidator: ValidatorFn =
  (control: AbstractControl): ValidationErrors => control.value && isValid(control.value)
    ? null
    : {
      pattern: {
        valid: false,
      },
    };

export const instantPaymentIbanValidator: ValidatorFn =
  (control: AbstractControl): ValidationErrors => {
    const v: string = control.value;

    return v && v.length >= 2 && ALLOWED_IBAN_COUNTRIES.indexOf(v.substring(0, 2).toUpperCase()) < 0 ? {
      iban: $localize`:@@payment-instant-payment.inquiry.form.senderIban.errors.invalid_country:`,
    } : null;
  };
