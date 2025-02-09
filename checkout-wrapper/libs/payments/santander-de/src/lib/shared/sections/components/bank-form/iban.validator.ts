import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { isValid } from 'iban';

export const ibanValidator: ValidatorFn =
  (control: AbstractControl): ValidationErrors => control.value && isValid(control.value)
    ? null
    : {
      pattern: false,
    };
