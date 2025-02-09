import { PebUnit } from '@pe/builder/core';
import { sizeCss } from './size-style.utils';

describe('Size style utils', () => {
  it('should return css code for pebSizeMix', () => {
    expect(sizeCss(10)).toEqual('10px');
    expect(sizeCss('auto')).toEqual('auto');
    expect(sizeCss(undefined)).toEqual('');
    expect(sizeCss({ value: undefined, unit: PebUnit.Auto })).toEqual('auto');
    expect(sizeCss({ value: 50.05, unit: PebUnit.Percent })).toEqual('50.05%');
    expect(sizeCss({ value: 200, unit: PebUnit.Pixel })).toEqual('200px');
    expect(sizeCss({ value: undefined, unit: PebUnit.Pixel })).toEqual('');
    expect(sizeCss({ value: 'any', unit: 'invalid' } as any)).toEqual('any');
  });
})
