import '@angular/localize/init';

import { FormControl } from '@angular/forms';

import { idNumberValidator } from './validators';

describe('idNumberValidator', () => {
  const validCases = [
    'LZ6311T47',
    'LZ6311T47(',
    'LZ6311T47)',
    'LZ6311T47-',
    'LZ6311T47/',
    '',
  ];
  const invalidCases = [
    '!',
    '"',
    '§',
    '$',
    '%',
    '&',
    '=',
    '?',
    ',',
    ';',
    '*',
    '+',
    '#',
  ];

  const cases = [
    ...validCases.map(id => ({ id, expected: null })),
    ...invalidCases.map(id => ({
      id,
      expected: { external: $localize `:@@santander-de.inquiry.form.customer.identificationNumber.error:` },
    })),
  ];
  cases.forEach(({ id, expected }) => {
    it(`Should return ${JSON.stringify(expected)} for ${JSON.stringify(id)}`, () => {
      expect(idNumberValidator(new FormControl(id))).toEqual(expected);
    });
  });
});
