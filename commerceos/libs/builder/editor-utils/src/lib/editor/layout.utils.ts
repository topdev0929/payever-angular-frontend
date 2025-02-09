import { BBox } from 'rbush';

import {
  isGridLayout,
  isPercentSize,
  PebEditorLine,
  PebEditorPoint,
  PebLayout,
  PebLayoutType,
  PebMixSize,
  PebPosition,
  PebSize,
  PebUnit,
} from '@pe/builder/core';
import { getPebSizeOrAuto, isGridElement, PebElement } from '@pe/builder/render-utils';

import { bboxDimension, pointIsInsideBBox, translateBBox } from './bbox.utils';
import { PebEditorLayoutCell } from './interfaces';
import { childPositionByBBox, elementInnerSpace, gridCellBBoxes, PEB_DEFAULT_PADDING } from './position.utils';
import { calculatePebSizeToPixel, normalizeSizes, scaleSize } from './size.utils';


export function elementLayoutLines(element: PebElement, option?: { outerLines: boolean }): PebEditorLine[] {
  const layout = element.styles.layout;
  if (!layout || !isGridLayout(layout)) {
    return [];
  }

  const container = elementInnerSpace(element);
  const { width, height } = bboxDimension(container);
  const cols = calculatePebSizeToPixel(layout.columns, width);
  const rows = calculatePebSizeToPixel(layout.rows, height);

  return layoutGridLines(cols, rows, container, option);
}

export function layoutGridLines(
  colSizes: number[],
  rowSizes: number[],
  bbox: BBox,
  option?: { outerLines: boolean },
): PebEditorLine[] {

  const pointsX = points(colSizes, bbox.minX, bbox.maxX, option?.outerLines);
  const pointsY = points(rowSizes, bbox.minY, bbox.maxY, option?.outerLines);

  return [
    ...pointsX.map(x => ({ x1: x, y1: bbox.minY, x2: x, y2: bbox.maxY })),
    ...pointsY.map(y => ({ x1: bbox.minX, y1: y, x2: bbox.maxX, y2: y })),
  ];
}

export function findPositionInLayout(parent: PebElement, child: PebElement)
  : { position: PebPosition | undefined, index?: number } {

  const layout = parent.styles?.layout;

  if (!layout) {
    return { position: undefined };
  }

  const padding = parent.styles.padding ?? PEB_DEFAULT_PADDING;
  const { width, height } = bboxDimension(parent, padding);
  const rows = parent.styles.layout?.rows ?? [];
  const cols = parent.styles.layout?.columns ?? [];
  const dx = parent.minX + padding.left;
  const dy = parent.minY + padding.top;

  const gridCells = gridCellBBoxes(rows, cols, width, height);

  if (!gridCells) {
    return { position: undefined, index: undefined };
  }

  let container = gridCells
    .map(cell => ({ ...cell, bbox: translateBBox(cell.bbox, dx, dy) }))
    .find(cell => isInsideCell(cell.bbox, child)) ?? gridCells[0];

  const { position } = childPositionByBBox(container.bbox, child, child.styles);

  return { position, index: container.index };
}

export function addColumnAuto(layout: PebLayout, unit: PebUnit, maxSpace: number): PebLayout {
  return { ...layout, columns: addSizeWithAutoShare(layout.columns, unit, maxSpace) };
}

export function addRowAuto(layout: PebLayout, unit: PebUnit, maxSpace: number): PebLayout {
  return { ...layout, rows: addSizeWithAutoShare(layout.rows, unit, maxSpace) };
}

export function removeColumnAuto(layout: PebLayout, index: number, maxSpace: number): PebLayout {
  return {
    ...layout,
    columns: removeSizeWithAutoShare(layout.columns, index, maxSpace),
  };
}

export function removeRowAuto(layout: PebLayout, index: number, maxSpace: number): PebLayout {
  return {
    ...layout,
    rows: removeSizeWithAutoShare(layout.rows, index, maxSpace),
  };
}

export function layoutCells(element: PebElement): PebEditorLayoutCell[] | undefined {
  const layout = element.styles.layout;
  if (!layout) {
    return undefined;
  }

  const space = elementInnerSpace(element);
  const { width, height } = bboxDimension(space);
  const [moveX, moveY] = [space.minX, space.minY];
  const gridCells = gridCellBBoxes(layout.rows, layout.columns, width, height);

  return gridCells.map(cell => ({ ...cell, bbox: translateBBox(cell.bbox, moveX, moveY) }));
}

export function findCellByPoint(element: PebElement, point: PebEditorPoint): PebEditorLayoutCell | undefined {
  return layoutCells(element)?.find(cell => pointIsInsideBBox(point, cell.bbox));
}

export function findEmptyCells(element: PebElement): PebEditorLayoutCell[] {
  const layout = element?.styles?.layout;
  if (!layout) {
    return [];
  }

  const totalCells: number = (layout.rows?.length ?? 0) * (layout.columns?.length ?? 0);

  if (!totalCells) {
    return [];
  }

  const children = [...element.children ?? []];
  const cells = layoutCells(element);
  if (!children?.length) {
    return cells ?? [];
  }

  const found = cells?.filter(cell => children.every((elm) => {
    const lp = elm.styles?.layoutPosition;

    return !lp || lp.auto || lp.index !== cell.index;
  }));

  return found ?? [];
}

export function elementLayout(element: PebElement): PebLayout | undefined {
  return isGridElement(element)
    ? createGridLayout(element.styles.gridTemplateRows ?? [], element.styles.gridTemplateColumns ?? [])
    : element.styles?.layout;
}

export function createGridLayout(rows: number[], cols: number[]) {
  return {
    type: PebLayoutType.Grid,
    rows: rows?.map(row => getPebSizeOrAuto(row)) ?? [],
    columns: cols?.map(col => getPebSizeOrAuto(col)) ?? [],
  };
}

function points(
  sizes: number[],
  min: number,
  max: number,
  includeEdges?: boolean,
): number[] {
  if (!sizes?.length && !includeEdges) {
    return [];
  }

  let point = min;
  let points = [min];

  sizes.forEach((size) => {
    points.push(point + size);
    point += size;
  });

  points.push(point);
  points.push(max);

  points = [...new Set(points.filter(p => p <= max && p >= min))];

  return includeEdges
    ? points
    : points.filter(p => p !== min && p !== max);
}

function isInsideCell(container: BBox, child: BBox): boolean {
  return container.minX <= child.minX
    && container.minY <= child.minY
    && container.maxX > child.minX
    && container.maxY > child.minY;
}

function addSizeWithAutoShare(mixSizes: PebMixSize[], unit: PebUnit, maxSpace: number): PebSize[] {
  const list = mixSizes.map(size => getPebSizeOrAuto(size));
  if (list.some(size => !isPercentSize(size))) {
    return [...list, { value: 5, unit: PebUnit.Percent }];
  }

  const scale = 1 / (mixSizes.length + 1);
  const value = unit === PebUnit.Percent ? 100 * scale : maxSpace * scale;
  const sizes = [...mixSizes.map(col => scaleSize(col, 1 - scale, true)), { value, unit }];

  return normalizeSizes(sizes, maxSpace);
}

function removeSizeWithAutoShare(mixSizes: PebMixSize[], index: number, maxSpace: number): PebSize[] {
  if (!mixSizes || mixSizes.length === 1) {
    return mixSizes.map(size => getPebSizeOrAuto(size));
  }

  const pix = calculatePebSizeToPixel(mixSizes, maxSpace);
  pix.splice(index, 1);
  const calculated = pix.reduce((acc, s) => acc + s, 0);

  const sizes = [...mixSizes.map(s => getPebSizeOrAuto(s))];
  sizes.splice(index, 1);

  if (!calculated || sizes.some(size => !isPercentSize(size))) {
    return sizes;
  }
  const scale = maxSpace / calculated;

  return normalizeSizes(sizes.map(s => scaleSize(s, scale, true)), maxSpace);
}
