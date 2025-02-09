import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const inputCreditCardNumberValidator: ValidatorFn = (control: AbstractControl): ValidationErrors => {
  const allowedLength: number[] = [15, 16];
  if (control.value && allowedLength.indexOf(control.value.length) >= 0) {
    return null;
  }
  return !control.value ? null : {
    pattern: {
      valid: false
    }
  };
};
