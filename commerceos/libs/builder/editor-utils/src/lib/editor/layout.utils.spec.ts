import { PEB_DEFAULT_PADDING } from '../..';
import { PebElementType, PebLayout, PebLayoutType, PebPositionType, PebUnit } from '@pe/builder/core';
import { addColumnAuto, addRowAuto, findCellByPoint, findPositionInLayout, layoutGridLines, removeColumnAuto } from './layout.utils';
import { PebElement, getPebSizeOrAuto, resolveRowAndColByIndex } from '@pe/builder/render-utils';

describe('Layout utils: Grid lines', () => {
  it('should return grid lines include borders: empty row/col', () => {
    const bbox = { minX: 100, minY: 150, maxX: 400, maxY: 950 };
    const cols: any = [];
    const rows: any = [];

    const lines = layoutGridLines(cols, rows, bbox, { outerLines: true });

    expect(lines.length).toEqual(4);
  });

  it('should return grid lines without borders: empty row/col', () => {
    const bbox = { minX: 100, minY: 150, maxX: 400, maxY: 950 };
    const cols: any = [];
    const rows: any = [];

    const lines = layoutGridLines(cols, rows, bbox, { outerLines: false });

    expect(lines.length).toEqual(0);
  });

  it('should return grid lines include borders: with rows & cols', () => {
    const bbox = { minX: 100, minY: 150, maxX: 400, maxY: 950 };
    const cols = [20, 40];
    const rows = [10, 15];

    const lines = layoutGridLines(cols, rows, bbox, { outerLines: true });

    expect(lines.length).toEqual(8);
    expect(lines.find(l => l.x1 === 100 && l.x2 === 400 && l.y1 === 150 && l.y2 === 150)).toBeDefined();
    expect(lines.find(l => l.x1 === 120 && l.x2 === 120 && l.y1 === 150 && l.y2 === 950)).toBeDefined();
    expect(lines.find(l => l.x1 === 100 && l.x2 === 400 && l.y1 === 950 && l.y2 === 950)).toBeDefined();
  });

  it('should return grid lines without borders: filled rows & cols', () => {
    const bbox = { minX: 100, minY: 150, maxX: 400, maxY: 950 };
    const cols = [20, 40];
    const rows = [10, 15];

    const lines = layoutGridLines(cols, rows, bbox, { outerLines: false });

    expect(lines.length).toEqual(4);
    expect(lines.find(l => l.x1 === 100 && l.x2 === 400 && l.y1 === 150 && l.y2 === 150)).toBeUndefined(); // top border
    expect(lines.find(l => l.x1 === 120 && l.x2 === 120 && l.y1 === 150 && l.y2 === 950)).toBeDefined(); // first vertical line
    expect(lines.find(l => l.x1 === 100 && l.x2 === 400 && l.y1 === 950 && l.y2 === 950)).toBeUndefined(); // bottom border
    expect(lines.find(l => l.x1 === 160 && l.x2 === 160 && l.y1 === 150 && l.y2 === 950)).toBeDefined(); // second vertical line
  });

  it('should not draw col & row outsize bbox', () => {
    const bbox = { minX: 100, minY: 150, maxX: 140, maxY: 170 };
    const cols = [220, 40, 50, 80];
    const rows = [210, 15, 200, 10, 60];

    const lines = layoutGridLines(cols, rows, bbox, { outerLines: true });

    expect(lines.length).toEqual(4);
    expect(lines.find(l => l.x1 < 100 || l.x2 > 140 && l.y1 < 150 && l.y2 > 170)).toBeUndefined();
  });

  it('should not draw any line when no border and 1x1', () => {
    const bbox = { minX: 100, minY: 150, maxX: 140, maxY: 170 };

    const lines1 = layoutGridLines([0], [0], bbox, { outerLines: false });
    const lines2 = layoutGridLines([40], [20], bbox, { outerLines: false });

    expect(lines1.length).toEqual(0);
    expect(lines2.length).toEqual(0);
  });
})


describe('Layout utils: Position & Layout index', () => {

  it('should find layout cell index by child position', () => {
    const layout = {
      rows: [
        { value: 40, unit: PebUnit.Percent },
        { value: 60, unit: PebUnit.Percent },
      ],
      columns: [
        { value: 20, unit: PebUnit.Percent },
        { value: 30, unit: PebUnit.Percent },
        { value: 50, unit: PebUnit.Percent },
      ]
    };

    const padding = { ...PEB_DEFAULT_PADDING };

    const parent = <PebElement>{
      type: PebElementType.Section,
      styles: {
        layout,
        padding,
      },
      minX: 0,
      minY: 100,
      maxX: 1200,
      maxY: 500,
    };

    const child = <PebElement>{
      type: PebElementType.Shape,
      styles: {
        position: {
          type: PebPositionType.Default,
          left: 0,
          top: 0,
        },
      },
      minX: 40,
      minY: 110,
      maxX: 300,
      maxY: 400,
    };

    const location = findPositionInLayout(parent, child);
    expect(location?.index).toEqual(0);
  });

  it('should find layout cell index by child position: last row/col', () => {
    const layout = {
      rows: [
        { value: 40, unit: PebUnit.Percent },
        { value: 60, unit: PebUnit.Percent },
      ],
      columns: [
        { value: 20, unit: PebUnit.Percent },
        { value: 30, unit: PebUnit.Percent },
        { value: 50, unit: PebUnit.Percent },
      ]
    };

    const padding = { ...PEB_DEFAULT_PADDING };

    const parent = <PebElement>{
      type: PebElementType.Section,
      styles: {
        layout,
        padding,
      },
      minX: 0,
      minY: 100,
      maxX: 1200,
      maxY: 500,
    };

    const child = <PebElement>{
      type: PebElementType.Shape,
      styles: {
        position: {
          type: PebPositionType.Default,
          left: 0,
          top: 0,
        },
      },
      minX: 600,
      minY: 260,
      maxX: 700,
      maxY: 800,
    };

    const location = findPositionInLayout(parent, child);
    expect(location?.index).toEqual(5);
  });

  it('should resolve row/col by index', () => {
    const rowsCount = 200;
    const colsCount = 100;

    //Undefined
    expect(resolveRowAndColByIndex(-1, rowsCount, colsCount)).toEqual({ row: -1, column: -1 });

    //Zero base
    expect(resolveRowAndColByIndex(0, rowsCount, colsCount)).toEqual({ row: 0, column: 0 });
    expect(resolveRowAndColByIndex(10, rowsCount, colsCount)).toEqual({ row: 0, column: 10 });
    expect(resolveRowAndColByIndex(99, rowsCount, colsCount)).toEqual({ row: 0, column: 99 });
    expect(resolveRowAndColByIndex(100, rowsCount, colsCount)).toEqual({ row: 1, column: 0 });
    expect(resolveRowAndColByIndex(101, rowsCount, colsCount)).toEqual({ row: 1, column: 1 });
    expect(resolveRowAndColByIndex(110, rowsCount, colsCount)).toEqual({ row: 1, column: 10 });
    expect(resolveRowAndColByIndex(199, rowsCount, colsCount)).toEqual({ row: 1, column: 99 });
    expect(resolveRowAndColByIndex(200, rowsCount, colsCount)).toEqual({ row: 2, column: 0 });

    //Overflow
    expect(resolveRowAndColByIndex(99999, rowsCount, colsCount)).toEqual({ row: -1, column: -1 });
    expect(resolveRowAndColByIndex(10, 2, 2)).toEqual({ row: -1, column: -1 });
    expect(resolveRowAndColByIndex(4, 2, 2)).toEqual({ row: -1, column: -1 });
  });

  it('should add new column and set values by sharing space: pixel mode', () => {
    const layout: PebLayout = {
      type: PebLayoutType.Default,
      rows: [
        { value: 100, unit: PebUnit.Percent },
      ],
      columns: [
        { value: 100, unit: PebUnit.Pixel }, // 10%
        { value: 400, unit: PebUnit.Pixel }, // 40%
        { value: 500, unit: PebUnit.Pixel }, // 50%
      ],
    }

    expect(addColumnAuto(layout, PebUnit.Pixel, 1000)).toEqual({
      ...layout,
      columns: [
        { value: 100, unit: PebUnit.Pixel },
        { value: 400, unit: PebUnit.Pixel },
        { value: 500, unit: PebUnit.Pixel },
        { value: 5, unit: PebUnit.Percent },
      ]
    });
  });

  it('should add/remove column and set values by sharing space: percent mode', () => {
    const maxSpace = 1000;
    const layout1: PebLayout = {
      type: PebLayoutType.Default,
      rows: [
        { value: 100, unit: PebUnit.Percent },
      ],
      columns: [
        { value: 20, unit: PebUnit.Percent },
        { value: 40, unit: PebUnit.Percent },
        { value: 40, unit: PebUnit.Percent },
      ],
    }
    const scale = 0.75;
    const expected = {
      col1: 20 * scale,
      col2: 40 * scale,
      col3: 40 * scale,
      col4: 0
    };
    expected.col4 = 100 - expected.col1 - expected.col2 - expected.col3;

    const layout2 = addColumnAuto(layout1, PebUnit.Percent, maxSpace);
    expect(layout2).toEqual({
      ...layout1,
      columns: [
        { value: expected.col1, unit: PebUnit.Percent },
        { value: expected.col2, unit: PebUnit.Percent },
        { value: expected.col3, unit: PebUnit.Percent },
        { value: expected.col4, unit: PebUnit.Percent },
      ]
    });

    expect(removeColumnAuto(layout2, 3, maxSpace)).toEqual(layout1);
    expect(removeColumnAuto(layout1, 0, maxSpace)).toEqual({
      ...layout1,
      columns: [
        { value: 50, unit: PebUnit.Percent },
        { value: 50, unit: PebUnit.Percent },
      ],
    });
  });

  it('should not change rows in pixel when auto add column', () => {
    const layout: PebLayout = {
      type: PebLayoutType.Default,
      rows: [
        { value: 100, unit: PebUnit.Pixel }, // 10%
        { value: 400, unit: PebUnit.Pixel }, // 40%
        { value: 500, unit: PebUnit.Pixel }, // 50%
      ],
      columns: [],
    }
    expect(addRowAuto(layout, PebUnit.Pixel, 1000)).toEqual({
      ...layout,
      rows: [
        { value: 100, unit: PebUnit.Pixel },
        { value: 400, unit: PebUnit.Pixel },
        { value: 500, unit: PebUnit.Pixel },
        { value: 5, unit: PebUnit.Percent },
      ]
    });
  });

  it('should find layout cell by drop point', () => {

    const layout = {
      type: PebLayoutType.Grid,
      rows: [getPebSizeOrAuto('100px'), getPebSizeOrAuto('200px')],
      columns: [getPebSizeOrAuto('100px'), getPebSizeOrAuto('200px'), getPebSizeOrAuto('300px')],
    };

    const element = {
      styles: { layout },
      minX: 1000,
      minY: 1000,
      maxX: 1600,
      maxY: 1300,
    } as any;

    expect(
      findCellByPoint(element, { x: 1150, y: 1200 })
    ).toEqual(
      { index: 4, row: 1, column: 1, bbox: { minX: 1100, minY: 1100, maxX: 1300, maxY: 1300 } }
    );
  })
})
