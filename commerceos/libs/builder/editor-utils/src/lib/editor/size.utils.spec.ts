import { PebUnit } from '@pe/builder/core';
import { calculatePebSizeToPixel, calculatePixelToPebSize, convertedSize, convertUnit, normalizeSizes, scaleSize } from './size.utils';


describe('Size Utils: Calculate pebSize to pixel', () => {
  it('should calculate pebSize to pixel: pixel', () => {
    expect(calculatePebSizeToPixel(
      [
        { value: 10, unit: PebUnit.Pixel },
      ],
      1000
    )).toEqual([10]);

    expect(calculatePebSizeToPixel(
      [
        { value: 0, unit: PebUnit.Pixel },
        { value: 10, unit: PebUnit.Pixel },
        { value: 400, unit: PebUnit.Pixel },
      ],
      1000
    )).toEqual([0, 10, 400]);
  });

  it('should calculate pebSize to pixel: auto', () => {
    expect(calculatePebSizeToPixel(
      [
        { value: 0, unit: PebUnit.Auto },
      ],
      1000
    )).toEqual([1000]);

    expect(calculatePebSizeToPixel(
      [
        { value: 0, unit: PebUnit.Auto },
        { value: 0, unit: PebUnit.Auto },
      ],
      1000
    )).toEqual([500, 500]);

    expect(calculatePebSizeToPixel(
      [
        { value: 0, unit: PebUnit.Auto },
        { value: 0, unit: PebUnit.Auto },
      ],
      1000
    )).toEqual([500, 500]);
  });

  it('should calculate pixel when overflow the parent', () => {
    expect(calculatePebSizeToPixel(['80px', '100%', 'auto'], 1000)).toEqual([80, 1000, 0]);
  })

  it('should calculate pebSize to pixel: percent', () => {
    expect(calculatePebSizeToPixel(
      [
        { value: 15, unit: PebUnit.Percent },
      ],
      1000
    )).toEqual([150]);

    expect(calculatePebSizeToPixel(
      [
        { value: 0, unit: PebUnit.Percent },
        { value: 10, unit: PebUnit.Percent },
        { value: 80, unit: PebUnit.Percent },
      ],
      2000
    )).toEqual([0, 200, 1600]);
  });

  it('should calculate pebSize to pixel: mix', () => {
    expect(calculatePebSizeToPixel(
      [
        { value: undefined, unit: PebUnit.Auto },
        { value: 200, unit: PebUnit.Pixel },
        { value: 50, unit: PebUnit.Percent },
        { value: undefined, unit: PebUnit.Auto },
      ],
      1000
    )).toEqual([150, 200, 500, 150]);
  });

  it('should accept mix value types', ()=>{
    expect(calculatePebSizeToPixel(
      ['auto', 200, { value: 50, unit: PebUnit.Percent }, 'auto', undefined],
      1000
    )).toEqual([150, 200, 500, 150, 0]);
  })

  it('should return negative sizes', () => {
    expect(calculatePebSizeToPixel(
      [
        { value: -100, unit: PebUnit.Pixel },
        { value: -10, unit: PebUnit.Percent },
      ],
      1000
    )).toEqual([-100, -100]);
  });

});

describe('Size Utils: Calculate pixel to pebSizes', () => {
  it('should get pebSizes based on pixel unit', () => {
    expect(calculatePixelToPebSize(
      [10, 30, 60],
      [PebUnit.Pixel, PebUnit.Pixel, PebUnit.Pixel],
    )).toEqual([
      { value: 10, unit: PebUnit.Pixel },
      { value: 30, unit: PebUnit.Pixel },
      { value: 60, unit: PebUnit.Pixel },
    ]);

    expect(calculatePixelToPebSize(
      [10, 30, 60],
      [PebUnit.Pixel, undefined, PebUnit.Pixel],
    )).toEqual([
      { value: 10, unit: PebUnit.Pixel },
      { value: 0, unit: PebUnit.Auto },
      { value: 60, unit: PebUnit.Pixel },
    ]);

  });

  it('should get pebSizes based on percent unit', () => {
    expect(calculatePixelToPebSize(
      [100, 300, 600],
      [PebUnit.Percent, PebUnit.Percent, PebUnit.Percent],
    )).toEqual([
      { value: 10, unit: PebUnit.Percent },
      { value: 30, unit: PebUnit.Percent },
      { value: 60, unit: PebUnit.Percent },
    ]);
  });

  it('should get pebSizes based on mixed units', () => {
    expect(calculatePixelToPebSize(
      [100, 800, 100],
      [PebUnit.Percent, PebUnit.Pixel, PebUnit.Pixel],
    )).toEqual([
      { value: 10, unit: PebUnit.Percent },
      { value: 800, unit: PebUnit.Pixel },
      { value: 100, unit: PebUnit.Pixel },
    ]);

    expect(calculatePixelToPebSize(
      [100, 800, 100],
      [PebUnit.Percent, PebUnit.Percent, PebUnit.Pixel],
    )).toEqual([
      { value: 10, unit: PebUnit.Percent },
      { value: 80, unit: PebUnit.Percent },
      { value: 100, unit: PebUnit.Pixel },
    ]);

    expect(calculatePixelToPebSize(
      [100, 100, 100, 100],
      [PebUnit.Percent, PebUnit.Percent, PebUnit.Pixel, PebUnit.Auto],
    )).toEqual([
      { value: 25, unit: PebUnit.Percent },
      { value: 25, unit: PebUnit.Percent },
      { value: 100, unit: PebUnit.Pixel },
      { value: 0, unit: PebUnit.Auto },
    ]);

  });
});


describe('Size Utils: Convert units', () => {
  it('should convert size units', () => {
    // Unchanged
    expect(convertUnit({ value: 12, unit: PebUnit.Percent }, PebUnit.Percent, 55.4, 0)).toEqual({ value: 12, unit: PebUnit.Percent });
    expect(convertUnit({ value: 100, unit: PebUnit.Pixel }, PebUnit.Pixel, 55.4, 0)).toEqual({ value: 100, unit: PebUnit.Pixel });

    // pixel to percent
    expect(convertUnit({ value: 80, unit: PebUnit.Percent }, PebUnit.Pixel, 1000, 800)).toEqual({ value: 800, unit: PebUnit.Pixel });
    expect(convertUnit({ value: 500, unit: PebUnit.Pixel }, PebUnit.Percent, 1000, 500)).toEqual({ value: 50, unit: PebUnit.Percent });
    expect(convertUnit({ value: 100, unit: PebUnit.Pixel }, PebUnit.Percent, 1000, 100)).toEqual({ value: 10, unit: PebUnit.Percent });

    // Zero
    expect(convertUnit({ value: 0, unit: PebUnit.Percent }, PebUnit.Pixel, 1000, 100)).toEqual({ value: 0, unit: PebUnit.Pixel });
    expect(convertUnit({ value: 0, unit: PebUnit.Pixel }, PebUnit.Percent, 1000, 100)).toEqual({ value: 0, unit: PebUnit.Percent });

    // To Auto
    expect(convertUnit({ value: 55.4, unit: PebUnit.Pixel }, PebUnit.Auto, 55.4, 55.4)).toEqual({ value: 0, unit: PebUnit.Auto });

    // From Auto
    expect(convertUnit({ value: 0, unit: PebUnit.Auto }, PebUnit.Pixel, 1000, 100)).toEqual({ value: 100, unit: PebUnit.Pixel });
    expect(convertUnit({ value: 0, unit: PebUnit.Auto }, PebUnit.Percent, 1000, 100)).toEqual({ value: 10, unit: PebUnit.Percent });
  })

  it('should get converted size', () => {
    // Percent to Pixel
    expect(convertedSize(
      { value: 100, unit: PebUnit.Percent },
      { value: 100, unit: PebUnit.Pixel },
      500,
      500,
    )).toEqual(
      { value: 500, unit: PebUnit.Pixel }
    );

    // Same unit
    expect(convertedSize(
      { value: 100, unit: PebUnit.Percent },
      { value: 100, unit: PebUnit.Percent },
      500,
      500,
    )).toEqual(
      { value: 100, unit: PebUnit.Percent }
    );

    // Pixel to Percent
    expect(convertedSize(
      { value: 100, unit: PebUnit.Pixel },
      { value: 100, unit: PebUnit.Percent },
      500,
      500,
    )).toEqual(
      { value: 20, unit: PebUnit.Percent }
    );

    // Auto to Percent
    expect(convertedSize(
      { value: 0, unit: PebUnit.Auto },
      { value: 0, unit: PebUnit.Percent },
      500,
      250,
    )).toEqual(
      { value: 50, unit: PebUnit.Percent }
    );

    // Auto to Pixel
    expect(convertedSize(
      { value: 0, unit: PebUnit.Auto },
      { value: 0, unit: PebUnit.Pixel },
      500,
      250,
    )).toEqual(
      { value: 250, unit: PebUnit.Pixel }
    );

  })

  it('should scale single size', () => {
    expect(scaleSize({ value: 0, unit: PebUnit.Auto }, 0.5, true)).toEqual({ value: 0, unit: PebUnit.Auto });
    expect(scaleSize({ value: 100, unit: PebUnit.Percent }, 0.5, true)).toEqual({ value: 50, unit: PebUnit.Percent });
    expect(scaleSize({ value: 100, unit: PebUnit.Percent }, 0.5, false)).toEqual({ value: 100, unit: PebUnit.Percent });
    expect(scaleSize({ value: 1000, unit: PebUnit.Pixel }, 0.5, true)).toEqual({ value: 500, unit: PebUnit.Pixel });
  })

  it('should normalize a serries of sizes', () => {
    expect(normalizeSizes([100, 200, 300], 606)).toEqual([
      { value: 100, unit: PebUnit.Pixel },
      { value: 200, unit: PebUnit.Pixel },
      { value: 306, unit: PebUnit.Pixel },
    ]);

    expect(normalizeSizes([100, 200, 300], 550)).toEqual([
      { value: 100, unit: PebUnit.Pixel },
      { value: 200, unit: PebUnit.Pixel },
      { value: 250, unit: PebUnit.Pixel },
    ]);

    expect(normalizeSizes([
      { value: 20, unit: PebUnit.Percent },
      { value: 77, unit: PebUnit.Percent },
    ], 100)).toEqual([
      { value: 20, unit: PebUnit.Percent },
      { value: 80, unit: PebUnit.Percent },
    ]);

  })
});
