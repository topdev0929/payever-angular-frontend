import { ValidationErrors, ValidatorFn } from '@angular/forms';

import { isEighteen, isValidCentury, isValidSwedishPIN } from './ssn-validator-utils';

const STUBS = [
  '888888888888',
  '888888888889',
];

export function createSsnValidator(): ValidatorFn {
  return (control): ValidationErrors | null => {
    if (!control.value
      || STUBS.includes(control.value)
      || isValidSwedishPIN(control.value)
        && isValidCentury(control.value)
        && control.value.length === 12
        && isEighteen(control.value)
    ) {
      return null;
    }

    return { control: 'pattern' };
  };
}
