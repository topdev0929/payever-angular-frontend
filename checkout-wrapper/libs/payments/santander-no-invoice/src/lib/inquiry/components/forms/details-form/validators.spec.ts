import { AbstractControl, ValidationErrors } from '@angular/forms';

import { validateSsn, validatePostNumber } from './validators';

describe('Validators', () => {
  describe('validateSsn', () => {
    it('should return null for a valid Norwegian ID number', () => {
      const control: AbstractControl = { value: '27060955358' } as AbstractControl;

      const result: ValidationErrors | null = validateSsn(control);

      expect(result).toBeNull();
    });

    it('should return null for a null or undefined value', () => {
      const control: AbstractControl = { value: null } as AbstractControl;

      const result: ValidationErrors | null = validateSsn(control);

      expect(result).toBeNull();
    });

    it('should return an error for an invalid Norwegian ID number', () => {
      const control: AbstractControl = { value: '12345678901' } as AbstractControl;

      const result: ValidationErrors | null = validateSsn(control);

      expect(result).toEqual({ pattern: true });
    });
  });

  describe('validatePostNumber', () => {
    it('should return null for a valid post number', () => {
      const control: AbstractControl = { value: '1313' } as AbstractControl;

      const result: ValidationErrors | null = validatePostNumber(control);

      expect(result).toBeNull();
    });

    it('should return null for a null or undefined value', () => {
      const control: AbstractControl = { value: null } as AbstractControl;

      const result: ValidationErrors | null = validatePostNumber(control);

      expect(result).toBeNull();
    });

    it('should return an error for an invalid post number', () => {
      const control: AbstractControl = { value: '*56#23-' } as AbstractControl;

      const result: ValidationErrors | null = validatePostNumber(control);

      expect(result).toEqual({ pattern: true });
    });
  });
});
