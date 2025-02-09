import {
  PebElementDef,
  PebElementStyles,
  PebElementType,
  PebLayout,
  PebLayoutPosition,
  PebLayoutType,
  PebOverflowMode,
} from '@pe/builder/core';


import { PebElement, getPebSizeOrAuto, resolveRowAndColByIndex } from '../models/dto';
import { isGridElement } from '../models/element.utils';

import { sizeCss } from './size-style.utils';

export function getDefaultOverflow(type?: PebElementType, parentType?: PebElementType): PebOverflowMode {
  return parentType === PebElementType.Grid
    ? PebOverflowMode.Hidden
    : PebOverflowMode.Visible;
}

export function getLayoutCssStyles(
  elm: PebElement | PebElementDef,
  styles: Partial<PebElementStyles>,
): Partial<CSSStyleDeclaration> {

  let layout = isGridElement(elm) ? gridLayout(styles) : styles.layout;

  if (!layout) {
    return {};
  }

  const gridTemplateColumns = layout.columns.map((col: any) => sizeCss(col)).join(' ');
  const gridTemplateRows = layout.rows.map((row: any) => sizeCss(row)).join(' ');

  return {
    display: 'grid',
    gridTemplateColumns,
    gridTemplateRows,
  };
}

export function gridLayout(styles: Partial<PebElementStyles>): PebLayout {
  return {
    type: PebLayoutType.Grid,
    columns: styles.gridTemplateColumns?.map(col => getPebSizeOrAuto(col)) ?? [],
    rows: styles.gridTemplateRows?.map(row => getPebSizeOrAuto(row)) ?? [],
  };
}

export function arrangeLayoutPositions(
  layoutPositions: (PebLayoutPosition | undefined)[],
  parentLayout: PebLayout,
): PebLayoutPosition[] {
  if (!layoutPositions?.length) {
    return [];
  }

  const queue = [...layoutPositions].filter(item => item !== undefined);
  const res: PebLayoutPosition[] = [];
  let next;
  let index = -1;

  do {
    next = { ...queue.shift() };
    if (!next) {
      continue;
    }

    if (next.index === undefined || next.auto) {
      let reserved;
      do {
        index++;
        reserved = queue.find(lp => lp?.index === index && !lp.auto);
      } while (reserved);

      next.index = index;
    }

    const location = resolveRowAndColByIndex(Number(next.index), parentLayout.rows.length, parentLayout.columns.length);
    next.row = location.row;
    next.column = location.column;

    res.push(next);
  } while (next && queue.length > 0);

  return res;
}

export const isHiddenOverflow =
  (styles: Partial<PebElementStyles> | undefined) => styles?.overflow === PebOverflowMode.Hidden;