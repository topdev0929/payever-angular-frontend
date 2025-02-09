import { AbstractControl, ValidationErrors } from '@angular/forms';

export const zipCode = (control: AbstractControl): ValidationErrors | null => {
  const v: string = control.value ?? '';
  const country: string = control.parent?.get('prevAddressCountry').value;

  if (country === 'DE') {
    const onlyDigital = /^\d{5}$/;

    return onlyDigital.test(v) ? null : { zipCodeInvalid: true };
  }

  return v.trim().length !== 5 ? { zipCodeInvalid: true } : null;
};
