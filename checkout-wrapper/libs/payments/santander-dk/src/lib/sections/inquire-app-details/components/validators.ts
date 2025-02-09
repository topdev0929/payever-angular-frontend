import { AbstractControl } from '@angular/forms';
import { isValid as isValidSsn } from 'danish-ssn';

export const REGISTRATION_NUMBER_LENGTH = 4;
export const ACCOUNT_NUMBER_MIN_LENGTH = 7;
export const ACCOUNT_NUMBER_MAX_LENGTH = 10;

export function socialSecurityNumberValidator(): (control: AbstractControl) => void {
  return (control: AbstractControl) => {
    let isValid = false;
    try {
      isValid = control?.value && isValidSsn(control.value);
    } catch (err) {}

    return isValid ? null : {
      pattern: {
        valid: false,
      },
    };
  };
}

export function phoneFirstCharValidator(): (control: AbstractControl) => void {
  return (control: AbstractControl) => {
    const value: string = control.value || '';

    return !value || (value && !value.startsWith('0')) ? null : {
      custom: $localize `:@@santander-dk.inquiry.form.phone_number.errors.cant_start_with_0:`,
    };
  };
}

export function repeatEmailValidator(): (control: AbstractControl) => void {
  return (control: AbstractControl) => {
    const email = control?.parent?.get('emailAddress')
        ? control.parent.get('emailAddress').value
        : null;

    return !control.value || control.value === email ? null : {
      custom: $localize `:@@santander-dk.inquiry.form.confirm_email.errors.email_not_much:`,
    };
  };
}
