import { AbstractControl, ValidationErrors } from '@angular/forms';

const INVALID_CHARACTERS = /[!"§$%&=?,;*+#]/;

export function idNumberValidator(control: AbstractControl): ValidationErrors | null {
  return INVALID_CHARACTERS.test(control.value)
    ? { external: $localize `:@@santander-de.inquiry.form.customer.identificationNumber.error:` }
    : null;
}
