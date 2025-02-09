import { PebFillType, PebGradientType } from '@pe/builder/core';
import { convertPathToHtml } from '.';
import { RGBA } from '@pe/builder/color-utils';

describe('Vector Util', () => {
  it('return empty when vector is undefined', () => {
    const svg = convertPathToHtml('1', '', {});
    expect(svg).toEqual('');
  });

  it('should convert vector without style', () => {
    const path =  'M0 0L10 10';

    const svg = convertPathToHtml('1', path, {});
    expect(svg).toEqual(`
    <path id="vector1" d="${path}" />
    `);
  });

  it('should convert vector with fill style', () => {
    const path = 'M0 0L10 10';

    const svg = convertPathToHtml('1', path, { fill: { type: PebFillType.Solid, color: new RGBA(10, 10, 10, 1) } });

    expect(svg).toEqual(`
    <style>
    #vector1 {
      fill: rgba(10,10,10, 1)
    }
    </style>
  <path id="vector1" d="${path}" />
  </svg>`);
  });

  it('should convert vector with gradient fill style', () => {
    const path = 'M0 0L10 10';

    const svg = convertPathToHtml('1', path, {
      fill: {
        type: PebFillType.Gradient,
        angle: 45,
        colorStops: [
          { offset: 0, color: new RGBA(10, 20, 30, 1) },
          { offset: 100, color: new RGBA(20, 30, 40, 1) },
        ],
        gradientType: PebGradientType.Linear,
      },
    });

    expect(svg).toEqual(`
    <defs><linearGradient id="gradient-vector1" x1="0" x2="0.7071067811865476" y1="1" y2="0.7071067811865475">
    <stop offset="0" stop-color="#0a141eff" />
<stop offset="100" stop-color="#141e28ff" />
  </linearGradient></defs><style>
    #vector1 {
      fill: url(#gradient-vector1)
    }
    </style>
  <path id="vector1" d="${path}" />
  `);
  });
});
