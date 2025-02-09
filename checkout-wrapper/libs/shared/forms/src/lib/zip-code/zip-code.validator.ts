import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class ZipCodeValidators {
  private static zipCodePattern = /\S/g;

  static zipCodeValid(pattern: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value: string = control.value || '';

      if (value) {
        const regexp = new RegExp(pattern);

        return regexp.test(value) ? null : { zipCodeInvalid: true };
      }

      return null;
    };
  }

  static Required(control: AbstractControl): ValidationErrors | null {
    return control.value?.match(ZipCodeValidators.zipCodePattern) ? null : { zipCodeInvalid: true };
  }
}
