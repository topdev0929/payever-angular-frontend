import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const creditCardExpirationValidator: ValidatorFn = (control: AbstractControl): ValidationErrors => {
  const value = control.value?.split?.(/(.{2})/).filter(Boolean) ?? control.value;
  if (value && value[0] > 12) {

    return {
      pattern: {
        valid: false,
      },
    };
  }
  if (value?.[0] && value?.[1]) {
    const expirationMonth: Date = new Date(2000 + Number(value[1]), Number(value[0]) - 1, 1);
    const currentMonth: Date = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    if (expirationMonth < currentMonth) {
      return {
        expired: {
          valid: false,
        },
      };
    } else {
      return null;
    }
  }

  return !value
    ? null
    : {
      pattern: { valid: false },
    };
};
