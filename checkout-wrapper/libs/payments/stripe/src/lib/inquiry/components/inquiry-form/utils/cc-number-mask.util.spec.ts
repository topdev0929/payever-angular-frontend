import { creditCardMaskFn, creditCardUnmaskFn } from './cc-number-mask.util';

describe('creditCardMask', () => {
  describe('creditCardMaskFn', () => {
    const cases: {
      input: Parameters<typeof creditCardMaskFn>;
      expected: string;
    }[] = [
        {
          input: [null],
          expected: '',
        },
        {
          input: ['TEST89 3704 0044 0532 0130 00'],
          expected: '8937 0400 4405 3201',
        },
        {
          input: ['TEST89 3704 0044 0532 0130 00', '.'],
          expected: '8937.0400.4405.3201',
        },
      ];
    cases.forEach(({ input, expected }) => {
      it(`should return ${JSON.stringify(expected)} when called with the following args ${JSON.stringify(input)} `, () => {
        expect(creditCardMaskFn(...input)).toEqual(expected);
      });
    });
  });

  describe('creditCardUnmaskFn', () => {
    const cases: {
      input: Parameters<typeof creditCardUnmaskFn>;
      expected: string;
    }[] = [
        {
          input: ['8937 0400 4405 3201'],
          expected: '8937040044053201',
        },
        {
          input: ['8937.0400.4405.3201', '.'],
          expected: '8937040044053201',
        },
      ];
    cases.forEach(({ input, expected }) => {
      it(`should return ${JSON.stringify(expected)} when called with the following args ${JSON.stringify(input)} `, () => {
        expect(creditCardUnmaskFn(...input)).toEqual(expected);
      });
    });
  });
});
