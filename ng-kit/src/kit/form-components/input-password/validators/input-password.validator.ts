import { Directive } from '@angular/core';
import { NG_VALIDATORS, ValidationErrors, Validator, FormControl } from '@angular/forms';
// this validator can be used as custom validator for form builder or as directive for input without fieldset
// works only with transparent fieldset

interface PasswordValidatorDefault {
  showLengthError: boolean | number;
  showRegisterError: boolean;
  showDigitError: boolean;
  showSpecialError: boolean;
}

@Directive({
  selector: '[passwordValidator]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: InputPasswordValidator, multi: true }
  ]
})
export class InputPasswordValidator implements Validator {

  validate(control: FormControl): ValidationErrors | null {
    return InputPasswordValidator.default(control);
  }

  static default(control: FormControl): ValidationErrors | null {
    const minCharacters: number = 8;
    const passwordLengthPattern: RegExp = new RegExp(`^.{${minCharacters},}$`);
    const passwordLowercasePattern: RegExp = /(?=.*?[a-z])/;
    const passwordUppercasePattern: RegExp = /(?=.*?[A-Z])/;
    const passwordDigitPattern: RegExp = /(?=.*?[0-9])/;
    const passwordSpecialPattern: RegExp = /(?=.*?[!@#\$%\^\&*\)\(+=._-])/;
    const passwordSpecialPatternAux: string[] = Array.from(`?{}[]§;:<>/\\'"~`);

    const passwordValidatorState: PasswordValidatorDefault = {
      showLengthError: !passwordLengthPattern.test(control.value),
      showRegisterError: !(passwordLowercasePattern.test(control.value) && passwordUppercasePattern.test(control.value)),
      showDigitError: !passwordDigitPattern.test(control.value),
      showSpecialError: !(passwordSpecialPattern.test(control.value) || control.value && passwordSpecialPatternAux.some(c => control.value.includes(c)))
    };

    if (passwordValidatorState.showLengthError
      || passwordValidatorState.showRegisterError
      || passwordValidatorState.showDigitError
      || passwordValidatorState.showSpecialError) {
      return passwordValidatorState;
    }
    return null;
  }
}
