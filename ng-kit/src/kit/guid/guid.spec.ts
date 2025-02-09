import { guid } from './guid';

describe('guid()', () => {
  const pattern: RegExp = /[\0-9a-f]{8}-[\0-9a-f]{4}-[\0-9a-f]{4}-[\0-9a-f]{4}-[\0-9a-f]{12}/;

  it('matches pattern', () => {
    const output: string = guid();
    expect(pattern.test(output)).toBe(true);
  });
});
