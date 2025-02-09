import { FormControl, ValidationErrors } from '@angular/forms';

import { creditCardNumberValidator } from './cc-number.validator';

describe('creditCardNumberValidator', () => {
  const patternError = { 'pattern': { 'valid': false } } as const;
  const randomIntOfLength = (i: number) => {
    const min = Math.pow(10, i - 1);
    const max = Math.pow(10, i) - 1;

    const res = Math.floor(Math.random() * (max - min + 1)) + min;

    return res.toString();
  };
  const cases: {
    input: string;
    expected: ValidationErrors | null;
  }[] = [
      {
        input: '',
        expected: null,
      },
      {
        input: randomIntOfLength(14),
        expected: patternError,
      },
      {
        input: randomIntOfLength(15),
        expected: null,
      },
      {
        input: randomIntOfLength(16),
        expected: null,
      },
      {
        input: randomIntOfLength(17),
        expected: patternError,
      },
    ];
  cases.forEach(({ input, expected }) => {
    it(`should return ${JSON.stringify(expected)} on ${JSON.stringify(input)}`, () => {
      expect(creditCardNumberValidator(new FormControl(input))).toEqual(expected);
    });
  });
});
