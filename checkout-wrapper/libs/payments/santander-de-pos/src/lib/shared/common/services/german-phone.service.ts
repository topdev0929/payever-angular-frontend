import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class GermanPhoneService { // Additional validation for KA-119

  transform(phone: string): string {
    phone = phone || '';
    if (phone.startsWith('00')) {
      phone = `+${phone.substring(2)}`;
    }
    phone = phone.split('-').join('');
    phone = phone.split(' ').join('');

    return phone;
  }

  validators(): ValidatorFn[] {
    return [(control: AbstractControl): ValidationErrors => {
      const value: string = String(control.value || '').split('+').join('').split('-').join('').split(' ').join('');

      return value && (value.length < 8 || value.length > 15) ? {
        phone: {
          valid: false,
        },
      } : null;
    }];
  }

}
