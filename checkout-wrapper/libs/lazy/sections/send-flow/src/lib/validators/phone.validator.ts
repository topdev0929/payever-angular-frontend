import { AbstractControl, ValidationErrors } from '@angular/forms';

export function phoneValidator(control: AbstractControl): ValidationErrors | null {
  let error: { external: string };
  const value: string = control.value;
  if (value?.length && !value.startsWith('+')) {
    error = {
      external: $localize `:@@checkout_send_flow.errors.phone_must_start_with_plus:`,
    };
  }

  return error;
}
