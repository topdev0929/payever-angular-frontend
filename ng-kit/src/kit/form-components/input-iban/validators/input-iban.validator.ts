import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isValid as isValidIban } from 'iban';

export const inputIbanValidator: ValidatorFn = (control: AbstractControl): ValidationErrors => {
  return control.value && isValidIban(control.value) ? null : {
    pattern: {
      valid: false
    }
  };
};
