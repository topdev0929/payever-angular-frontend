import { AbstractControl } from '@angular/forms';
import '@angular/localize/init';

import { phoneFirstCharValidator, repeatEmailValidator, socialSecurityNumberValidator } from './validators';

describe('socialSecurityNumberValidator', () => {

  it('should validate a correct SSN as valid', () => {

    const control = { value: '2201711234' };

    expect(socialSecurityNumberValidator()(control as AbstractControl)).toEqual(null);

  });

  it('should validate a incorrect SSN as invalid', () => {

    const control = { value: '22o171234' };
    const expectedValue = {
      pattern: {
        valid: false,
      },
    };

    expect(socialSecurityNumberValidator()(control as AbstractControl)).toEqual(expectedValue);

  });

});

describe('phoneFirstCharValidator', () => {

  it('should validate a correct phone number as valid', () => {

    const control = { value: '45171123456' };

    expect(phoneFirstCharValidator()(control as AbstractControl)).toEqual(null);

  });

  it('should validate a incorrect phone number as invalid', () => {

    const control = { value: '045171123456' };
    const expectedValue = {
      custom: '',
    };

    expect(phoneFirstCharValidator()(control as AbstractControl)).toEqual(expectedValue);

  });

});

function mockAbstractControl(email: string, confirmEmail: string): AbstractControl {
  return {
    value: email,
    parent: {
      get: (key: string) => {
        if (key === 'emailAddress') {
          return { value: confirmEmail };
        }

        return null;
      },
    },
  } as unknown as AbstractControl;
}

describe('repeatEmailValidator', () => {

  it('should validate a correct emails as valid', () => {

    const control = mockAbstractControl('test@payever.org', 'test@payever.org');

    expect(repeatEmailValidator()(control)).toEqual(null);

  });

  it('should validate a incorrect emails as invalid', () => {

    const control = mockAbstractControl('test@payever.org', 'different@payever.org');
    const expectedValue = {
      custom: '',
    };

    expect(repeatEmailValidator()(control)).toEqual(expectedValue);

  });

});
