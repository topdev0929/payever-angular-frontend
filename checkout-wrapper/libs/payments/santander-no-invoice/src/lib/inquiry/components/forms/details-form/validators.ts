import { AbstractControl, ValidationErrors } from '@angular/forms';
import { validateNorwegianIdNumber } from 'norwegian-national-id-validator';

export const validateSsn = (control: AbstractControl): ValidationErrors =>
  (control.value && validateNorwegianIdNumber(control.value)) || !control.value
    ? null
    : {
      pattern: true,
    };

export const validatePostNumber = (control: AbstractControl): ValidationErrors => {
  const value = control.value ?? '';
  const correct = value.replace(/^\D+/g, '').substring(0, 4);

  return correct.length && (correct !== value || value.length !== 4)
    ? {
      pattern: true,
    }
    : null;
};
