import { AbstractControl, ValidationErrors } from '@angular/forms';

const VALID_NAME_CHARACTERS = /^[\p{L}\p{M}_\s-]*$/u;

export function namePatternValidator(control: AbstractControl): ValidationErrors | null {
  const val: string = control.value;

  return !val || VALID_NAME_CHARACTERS.test(val) ? null : { invalidName: true };
}
