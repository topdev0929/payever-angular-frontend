import { PebLayout, PebLayoutPosition, PebLayoutType } from '@pe/builder/core';
import { getPebSizeOrAuto } from '@pe/builder/render-utils';

import { arrangeLayoutPositions } from './layout-style.utils';

describe('Layout utils: auto arrange children', () => {
  it('should set layout index for when all indexes are auto', () => {
    const layoutPositions: PebLayoutPosition[] = [
      { auto: true, index: 0, row: undefined, column: undefined },
      { auto: true, index: 0, row: undefined, column: undefined },
      { auto: true, index: 0, row: undefined, column: undefined },
      { auto: true, index: undefined, row: undefined, column: undefined },
      { auto: true, index: undefined, row: undefined, column: undefined },
    ];

    const parentLayout: PebLayout = {
      type: PebLayoutType.Grid,
      rows: [getPebSizeOrAuto(50), getPebSizeOrAuto(60)],
      columns: [getPebSizeOrAuto(100), getPebSizeOrAuto(200), getPebSizeOrAuto(400)],
    };

    const res = arrangeLayoutPositions(layoutPositions, parentLayout);
    expect(res).toEqual([
      { auto: true, index: 0, row: 0, column: 0 },
      { auto: true, index: 1, row: 0, column: 1 },
      { auto: true, index: 2, row: 0, column: 2 },
      { auto: true, index: 3, row: 1, column: 0 },
      { auto: true, index: 4, row: 1, column: 1 },
    ]);
  });

  it('should set layout index: mix auto and set index', () => {
    const layoutPositions: PebLayoutPosition[] = [
      { auto: true, index: 0 },
      { auto: false, index: 5 },
      { auto: false, index: 1 },
      { auto: true, index: 0 },
      { auto: false, index: 0 },
      { auto: true, index: 0 },
    ];

    const parentLayout: PebLayout = {
      type: PebLayoutType.Grid,
      rows: [getPebSizeOrAuto(50), getPebSizeOrAuto(60)],
      columns: [getPebSizeOrAuto(100), getPebSizeOrAuto(200), getPebSizeOrAuto(400)],
    };

    const res = arrangeLayoutPositions(layoutPositions, parentLayout);
    expect(res).toEqual([
      { auto: true, index: 2, row: 0, column: 2 },
      { auto: false, index: 5, row: 1, column: 2 },
      { auto: false, index: 1, row: 0, column: 1 },
      { auto: true, index: 3, row: 1, column: 0 },
      { auto: false, index: 0, row: 0, column: 0 },
      { auto: true, index: 4, row: 1, column: 1 },
    ]);
  });
});
