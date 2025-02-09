import { isRGBA, RGBA } from './rgba';

describe('ColorPicker:Formats', () => {

  it('should test rgba', () => {

    expect(isRGBA(new RGBA(51, 51, 51, 1))).toBe(true);
    expect(isRGBA(new RGBA(51, 51, 51, undefined))).toBe(false);

  });

});
