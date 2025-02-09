import { FormControl, ValidationErrors } from '@angular/forms';
import '@angular/localize/init';

import { ibanValidator, instantPaymentIbanValidator } from './iban.validator'; // Update with the actual file path

describe('Validators', () => {
  it('should validate IBAN', () => {
    const control = new FormControl('DE89370400440532013000');
    const result: ValidationErrors | null = ibanValidator(control);
    expect(result).toBeNull();

    control.setValue('InvalidIBAN');
    const errorResult: ValidationErrors | null = ibanValidator(control);
    expect(errorResult).toEqual({ pattern: { valid: false } });
  });

  it('should validate instant payment IBAN', () => {
    const control = new FormControl('DEDE89370400440532013000');
    const result: ValidationErrors | null = instantPaymentIbanValidator(control);
    expect(result).toBeNull();

    control.setValue('InvalidCountry12');
    const errorResult: ValidationErrors | null = instantPaymentIbanValidator(control);
    expect(errorResult).toEqual({
      iban: '',
    });
  });
});
