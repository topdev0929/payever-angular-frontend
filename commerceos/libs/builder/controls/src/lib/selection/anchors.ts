import { anchorRect, CursorType, PeAnchorType, PebAnchorType, THREE_ANCHORS_MIN_SIZE } from '@pe/builder/events';

import { PebControlAnchorType, PebDefaultControl, PebGridControl, PebSectionControl } from './controls';

/**
 * Create array of anchors for elements depending on control type,
 * except grid, to insert into anchors RTree
 */
export function elementAnchors(control: PebDefaultControl | PebSectionControl, scale = 1, radius = 4): PeAnchorType[] {
  let anchors = [];
  const { minX, minY, maxX, maxY, anchorType } = control;

  if (anchorType === PebControlAnchorType.None) {
    return anchors;
  }

  const width = maxX - minX;
  const height = maxY - minY;

  if (anchorType === PebControlAnchorType.Section) {
    return [
      {
        type: PebAnchorType.N,
        ...anchorRect(minX + width / 2, minY, scale, 36, 18),
        cursor: CursorType.NS_Resize,
      },
      {
        type: PebAnchorType.S,
        ...anchorRect(minX + width / 2, maxY, scale, 36, 18),
        cursor: CursorType.NS_Resize,
      },
    ];
  }

  const n = {
    type: PebAnchorType.N,
    ...anchorRect(minX + width / 2, minY, scale, radius),
    cursor: CursorType.NS_Resize,
  };

  const s = {
    type: PebAnchorType.S,
    ...anchorRect(minX + width / 2, maxY, scale, radius),
    cursor: CursorType.NS_Resize,
  };

  const w = {
    type: PebAnchorType.W,
    ...anchorRect(minX, minY + height / 2, scale, radius),
    cursor: CursorType.EW_Resize,
  };

  const e = {
    type: PebAnchorType.E,
    ...anchorRect(maxX, minY + height / 2, scale, radius),
    cursor: CursorType.EW_Resize,
  };

  if (anchorType === PebControlAnchorType.Text) {
    return [w, e];
  }

  if (width >= THREE_ANCHORS_MIN_SIZE) {
    anchors = anchors.concat(n, s);
  }

  if (height >= THREE_ANCHORS_MIN_SIZE) {
    anchors = anchors.concat(w, e);
  }

  anchors = anchors.concat([
    {
      type: PebAnchorType.NW,
      ...anchorRect(minX, minY, scale, radius),
      cursor: CursorType.NWSE_Resize,
    },
    {
      type: PebAnchorType.NE,
      ...anchorRect(maxX, minY, scale, radius),
      cursor: CursorType.NESW_Resize,
    },
    {
      type: PebAnchorType.SE,
      ...anchorRect(maxX, maxY, scale, radius),
      cursor: CursorType.NWSE_Resize,
    },
    {
      type: PebAnchorType.SW,
      ...anchorRect(minX, maxY, scale, radius),
      cursor: CursorType.NESW_Resize,
    },
  ]);

  return anchors;
}

/**
 * Create RTree items for grid anchors
 * @param control Grid Control
 * @param scale Current Scale of editor
 * @param ruler Scale independent height of columns and width of rows rulers
 * @param separator width of columns and height of rows resize anchors
 */
export function gridAnchors(control: PebGridControl, scale = 1, ruler = 16, separator = 8): PeAnchorType[] {
  /** Half of resize anchor width */
  const hw = separator / 2 / scale;
  /** Scaled ruler size */
  const d = ruler / scale;

  const { minX, minY, maxX, maxY } = control;

  const anchors: PeAnchorType[] = [
    {
      type: PebAnchorType.Move,
      cursor: CursorType.Move,
      minX: minX - d,
      minY: minY - d,
      maxX: minX,
      maxY: minY,
    },
    {
      type: PebAnchorType.EW,
      cursor: CursorType.EW_Resize,
      minX: maxX + hw,
      minY: minY - d,
      maxX: maxX + (ruler - 3) / scale,
      maxY: minY,
    },
    {
      type: PebAnchorType.NS,
      cursor: CursorType.NS_Resize,
      minX: minX - d,
      minY: maxY + hw,
      maxX: minX,
      maxY: maxY + (ruler - 3) / scale,
    },
  ];

  control.columns.forEach((col, index) => {
    anchors.push(
      {
        index,
        type: PebAnchorType.ColSelect,
        cursor: CursorType.Cell,
        selected: col.selected,
        minX: minX + col.minX + (index === 0 ? 0 : hw),
        minY: minY - d,
        maxX: minX + col.maxX - hw,
        maxY: minY,
      },
      {
        index,
        type: PebAnchorType.ColResize,
        cursor: CursorType.ColResize,
        minX: minX + col.maxX - hw,
        minY: minY - d,
        maxX: minX + col.maxX + hw,
        maxY: minY,
      },
    );
  });

  control.rows.forEach((row, index) => {
    anchors.push(
      {
        index,
        type: PebAnchorType.RowSelect,
        cursor: CursorType.Default,
        selected: row.selected,
        minX: minX - d,
        minY: minY + row.minY + (index === 0 ? 0 : hw),
        maxX: minX,
        maxY: minY + row.maxY - hw,
      },
      {
        index,
        type: PebAnchorType.RowResize,
        cursor: CursorType.RowResize,
        minX: minX - d,
        minY: minY + row.maxY - hw,
        maxX: minX,
        maxY: minY + row.maxY + hw,
      },
    );
  });

  return anchors;
}
