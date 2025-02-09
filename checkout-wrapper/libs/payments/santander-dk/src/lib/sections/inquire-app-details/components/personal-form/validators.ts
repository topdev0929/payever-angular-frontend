import { AbstractControl, ValidationErrors } from '@angular/forms';

export const confirmEmailValidator = (control: AbstractControl): ValidationErrors | null => {
  const confirmEmail: string = control.value ?? '';
  const email: string = control.parent?.get('emailAddress').value;

  return confirmEmail?.toLowerCase() === email?.toLowerCase()
    ? null
    : { confirmEmail: true };
};
