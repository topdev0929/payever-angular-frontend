import { FormControl } from '@angular/forms';

import { createSsnValidator } from './ssn.validator';

import '@angular/localize/init';

describe('ssn-validator', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createSsnValidator', () => {
    const validate = createSsnValidator();
    const validCases = [
      '888888888888',
      '888888888889',
      '196212133471',
      '206212133471',
      '216212133471',
      '',
    ];
    const invalidCases = [
      '2',
      '8888888888888',
      'a88888888888',
      '123456789012',
      '196212133480',
      '196212133499',
      '19621213-3471',
      '123456789012121221',
    ];

    const cases = [
      ...validCases.map(ssn => ({ ssn, expected: null })),
      ...invalidCases.map(ssn => ({
        ssn,
        expected: { control: $localize`:@@santander-se.inquiry.form.social_security_number.invalid:` },
      })),
    ];
    cases.forEach(({ ssn, expected }) => {
      it(`Should return ${JSON.stringify(expected)} for ${JSON.stringify(ssn)}`, () => {
        expect(validate(new FormControl(ssn))).toEqual(expected);
      });
    });

  });

});
