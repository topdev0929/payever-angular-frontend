import { creditCardExpirationMaskFn, creditCardExpirationUnmaskFn } from './cc-expiration-mask.util';

describe('creditCardExpirationMask', () => {
  describe('creditCardExpirationMask', () => {
    const cases: {
      input: Parameters<typeof creditCardExpirationMaskFn>;
      expected: string;
    }[] = [
        {
          input: [null],
          expected: '',
        },
        {
          input: ['2612'],
          expected: '26/12',
        },
        {
          input: ['2612', '.'],
          expected: '26.12',
        },
      ];
    cases.forEach(({ input, expected }) => {
      it(`should return ${JSON.stringify(expected)} when called with the following args ${JSON.stringify(input)} `, () => {
        expect(creditCardExpirationMaskFn(...input)).toEqual(expected);
      });
    });
  });

  describe('creditCardExpirationUnmaskFn', () => {
    const cases: {
      input: Parameters<typeof creditCardExpirationUnmaskFn>;
      expected: string;
    }[] = [
        {
          input: ['26/12'],
          expected: '2612',
        },
        {
          input: ['26.12', '.'],
          expected: '2612',
        },
      ];
    cases.forEach(({ input, expected }) => {
      it(`should return ${JSON.stringify(expected)} when called with the following args ${JSON.stringify(input)} `, () => {
        expect(creditCardExpirationUnmaskFn(...input)).toEqual(expected);
      });
    });
  });
});
