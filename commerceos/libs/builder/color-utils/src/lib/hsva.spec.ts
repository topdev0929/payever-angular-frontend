import { HSVA, isHSVA } from './hsva';

describe('ColorPicker:Formats', () => {

  it('should test hsva', () => {

    expect(isHSVA(new HSVA(0, 0, 20, 1))).toBe(true);
    expect(isHSVA(new HSVA(0, 0, 20, undefined))).toBe(false);

  });

});
