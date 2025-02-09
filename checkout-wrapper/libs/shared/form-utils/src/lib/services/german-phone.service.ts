import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

@Injectable()
export class GermanPhoneService {
  // Additional validation for KA-119

  transform(phone: string): string {
    phone = phone || '';
    if (phone.startsWith('00')) {
      phone = `+${phone.substring(2)}`;
    }
    phone = phone.replace(/\s-/g, '');

    return phone;
  }

  validators(): ValidatorFn[] {
    return [
      (control: AbstractControl): ValidationErrors => {
        const value: string = String(control.value || '').replace(/\s\+-/g, '');

        return value && (value.length < 8 || value.length > 15)
          ? {
              phone: {
                valid: false,
              },
            }
          : null;
      },
    ];
  }
}
