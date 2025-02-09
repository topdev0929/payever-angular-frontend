import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const inputCreditCardExpirationValidator: ValidatorFn = (control: AbstractControl): ValidationErrors => {
  if (control.value && control.value[0] > 12) {
    return {
      pattern: {
        valid: false
      }
    };
  }
  if (control.value && control.value[0] && control.value[1]) {
    const expirationMonth: Date = new Date(2000 + control.value[1], control.value[0] - 1, 1);
    const currentMonth: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    if (expirationMonth < currentMonth) {
      return {
        expired: {
          valid: false
        }
      };
    } else {
      return null;
    }
  }
  return !control.value ? null : {
    pattern: {
      valid: false
    }
  };
};
