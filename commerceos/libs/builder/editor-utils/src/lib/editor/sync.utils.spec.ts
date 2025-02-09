import { PebElementStyles, PebPositionType } from '@pe/builder/core';
import { getPebSize } from '@pe/builder/render-utils';
import { getSyncedDimension, getSyncedPosition } from './sync.utils';

describe('Sync utils: Synchronize size, position, styles over screens', () => {
  it('should calculate size & position by comparing origin and destination screen', () => {
    const square = {
      id: 'square',
      type: 'shape',
      styles: {
        position: {
          type: PebPositionType.Pinned,
          left: getPebSize('10px'),
          top: getPebSize('10px'),
          right: getPebSize('auto'),
          bottom: getPebSize('50px'),
        },
        dimension: {
          width: getPebSize('700px'),
          height: getPebSize('200px'),
        },
      } as PebElementStyles,
    } as any;

    // Scenario 1: width/dimension
    const scale = { scaleX: 0.8, scaleY: 0.8 };
    const styles = {
      ...getSyncedPosition(square, scale),
      ...getSyncedDimension(square, scale),
    };
    expect(styles).toEqual({
      position: {
        type: PebPositionType.Pinned,
        left: getPebSize('8px'),
        top: getPebSize('8px'),
        right: getPebSize('auto'),
        bottom: getPebSize('40px'),
      },
      dimension: {
        width: getPebSize('560px'),
        height: getPebSize('160px'),
      },
    });

  });

  it('should calculate size & position & grid columns and rows by comparing origin and destination screen', () => {
    const grid = {
      id: 'grid',
      type: 'grid',
      styles: {
        position: {
          type: PebPositionType.Pinned,
          left: getPebSize('10px'),
          top: getPebSize('10px'),
          right: getPebSize('auto'),
          bottom: getPebSize('50px'),
        },
        dimension: {
          width: getPebSize('700px'),
          height: getPebSize('200px'),
        },
        gridTemplateColumns: [100, 200, 100],
        gridTemplateRows: [100, 200, 100],
      } as PebElementStyles,
    } as any;

    const scale = { scaleX: 0.8, scaleY: 0.8 };
    const styles = {
      ...getSyncedPosition(grid, scale),
      ...getSyncedDimension(grid, scale),
    };
    expect(styles).toEqual({
      position: {
        type: PebPositionType.Pinned,
        left: getPebSize('8px'),
        top: getPebSize('8px'),
        right: getPebSize('auto'),
        bottom: getPebSize('40px'),
      },
      dimension: {
        width: getPebSize('560px'),
        height: getPebSize('160px'),
      },
      gridTemplateRows: [80, 160, 80],
      gridTemplateColumns: [80, 160, 80],
    });
  });
});
