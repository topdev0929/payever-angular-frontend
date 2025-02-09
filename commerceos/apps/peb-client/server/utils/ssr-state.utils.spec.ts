import { toTransferObject } from './ssr-state.utils';


describe('SSR utils: Convert javascript object to js string', () => {
  const cases: { obj?: any, expected: string }[] = [
    {
      obj: {},
      expected: '{}',
    },
    {
      obj: 123.456,
      expected: '123.456',
    },
    {
      obj: true,
      expected: 'true',
    },
    {
      obj: "text",
      expected: '`text`',
    },
    {
      obj: `@!@#$%^&*()_+|"';:/?.>,<`,
      expected: `\`@!@#$%^&*()_+|"';:/?.>,<\``,
    },
    {
      obj: [1, 2, 3],
      expected: `[1,2,3]`,
    },
  ];

  test.each(cases)('%s', (item) => {
    expect(toTransferObject(item.obj)).toEqual(item.expected);
  });
})