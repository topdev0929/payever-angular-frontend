import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function tabValidator(controlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors => !control.value || new RegExp(/^\S*$/).test(control.value)
    ? null
    : {
      pattern: $localize `:@@ng_kit.forms.error.validator.tab_pattern:${controlName}:fieldName:`,
    };
}
