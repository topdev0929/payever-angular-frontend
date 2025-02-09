import { kebabCase } from './view-styles.utils';

describe('View style utils', () => {
  it('check kebabCase method', () => {
    expect(kebabCase('Background')).toEqual('background');
    expect(kebabCase('Background Color')).toEqual('background-color');
    expect(kebabCase('backgroundColor')).toEqual('background-color');
    expect(kebabCase('backgroundcolor')).toEqual('backgroundcolor');
    expect(kebabCase('background color')).toEqual('background-color');
    expect(kebabCase('background-color')).toEqual('background-color');
  });
})