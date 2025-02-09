import { FormControl, ValidationErrors } from '@angular/forms';

import { creditCardExpirationValidator } from './cc-expiration.validator';

describe('creditCardExpirationValidator', () => {
  const patternError = { 'pattern': { 'valid': false } } as const;
  const expiredError = { 'expired': { 'valid': false } } as const;
  const format = (m: number, y: number) =>
    `${m.toString().padStart(2, '0')}${y.toString().slice(-2).padStart(2, '0')}`;
  const now = new Date();
  const cases: {
    input: string;
    expected: ValidationErrors | null;
  }[] = [
      {
        input: '',
        expected: patternError,
      },
      {
        input: format(now.getMonth(), now.getFullYear()),
        expected: expiredError,
      },
      {
        input: format(now.getMonth() + 1, now.getFullYear()),
        expected: null,
      },
    ];
  cases.forEach(({ input, expected }) => {
    it(`should return ${JSON.stringify(expected)} on ${JSON.stringify(input)}`, () => {
      expect(creditCardExpirationValidator(new FormControl(input))).toEqual(expected);
    });
  });
});
