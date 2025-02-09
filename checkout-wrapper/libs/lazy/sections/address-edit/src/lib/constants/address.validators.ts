import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class AddressValidators {

  static houseNumberRequired(control: AbstractControl): ValidationErrors {
    if (control.value) {
      const number = control.value.split(/(\d+)/)[1];

      return number ? null : { houseNumberRequired: true };
    }

    return null;
  }

  static phoneValid(
    phoneRequired: boolean,
    codeRequired: boolean,
    patternDefault: string,
    patternCodeRequired: string
  ): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value || '';

      if (!value && !phoneRequired) {
        return null;
      }

      const pattern = codeRequired ? patternCodeRequired : patternDefault;
      const regexp = new RegExp(pattern);

      return regexp.test(value) ? null : {
        pattern: true,
      };
    };
  }
}
