import { getPebSize } from "./models";
import { calculateScrollBoundValue } from "./scroll.utils"

describe('Scroll utils', () => {
  it('should calculate scroll map value for page target', () => {
    expect(calculateScrollBoundValue(
      0,
      { top: 0, height: 500 },
    )).toEqual(0);

    expect(calculateScrollBoundValue(
      250,
      { top: 0, height: 500 },
    )).toEqual(0.5);
  });

  it('should calculate scroll map value for section target', () => {
    expect(calculateScrollBoundValue(
      100,
      { top: 200, height: 100 },
    )).toEqual(0);

    expect(calculateScrollBoundValue(
      200,
      { top: 200, height: 100 },
    )).toEqual(0);

    expect(calculateScrollBoundValue(
      250,
      { top: 200, height: 100 },
    )).toEqual(0.5);

    expect(calculateScrollBoundValue(
      300,
      { top: 200, height: 100 },
    )).toEqual(1);

    expect(calculateScrollBoundValue(
      400,
      { top: 200, height: 100 },
    )).toEqual(1);
  });

  it('should calculate scroll map value for section target and offset', () => {
    expect(calculateScrollBoundValue(
      200,
      { top: 200, height: 100 },
      getPebSize('10%'),
    )).toEqual(0);

    expect(calculateScrollBoundValue(
      210,
      { top: 200, height: 100 },
      getPebSize('10px'),
    )).toEqual(0);

    expect(calculateScrollBoundValue(
      210,
      { top: 200, height: 100 },
      getPebSize('10%'),
    )).toEqual(0);

    expect(calculateScrollBoundValue(
      255,
      { top: 200, height: 100 },
      getPebSize('10px'),
    )).toEqual(0.5);

    expect(calculateScrollBoundValue(
      270,
      { top: 200, height: 100 },
      getPebSize('20px'),
      getPebSize('70px'),
    )).toEqual(1);

    expect(calculateScrollBoundValue(
      245,
      { top: 200, height: 100 },
      getPebSize('20px'),
      getPebSize('70px'),
    )).toEqual(0.5);
  });
})