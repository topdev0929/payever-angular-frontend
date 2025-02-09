import produce from 'immer';
import { BBox } from 'rbush';

import {
  isBlockOrInlinePosition,
  isGridLayout,
  PebElementStyles,
  PebElementType,
  PebTextStyles,
} from '@pe/builder/core';
import { PebElement, isGridElement, isSection, isText } from '@pe/builder/render-utils';

import { bboxDimension } from './bbox.utils';
import { PebResizeDirection, PebResizeResult, PebScale } from './interfaces';
import { elementInnerSpace } from './position.utils';
import { scaleSize, translateSize } from './size.utils';
import { extractDeltaTextStyles, isDeltaEmpty } from './text.utils';

export const PEB_SCALE_EPSILON = Number.EPSILON;
export const PEB_MOVE_EPSILON = Number.EPSILON;

export function resizeElement(
  element: PebElement,
  scale: PebScale,
  options: { scalePercentSizes: boolean },
): PebResizeResult {
  const viewUpdates = [];
  const elementUpdates: any[] = [];

  elementUpdates.push(getElementUpdates(element, scale, options.scalePercentSizes));
  viewUpdates.push(getViewUpdates(element, scale));

  let resizeChildren = element.data?.resizeSetting?.resizeChildren && !isGridLayout(element.styles.layout);

  if (!isSection(element) && resizeChildren && element.children?.length) {
    const children = [...element.children];

    children.forEach((elm) => {
      const scaleChild = {
        scaleX: scale.scaleX,
        scaleY: scale.scaleY,
        moveX: (element.minX - elm.minX) * (1 - scale.scaleX),
        moveY: (element.minY - elm.minY) * (1 - scale.scaleY),
      };

      const res = resizeElement(elm, scaleChild, { scalePercentSizes: false });

      viewUpdates.push(...res.viewUpdates);
      elementUpdates.push(...res.elementUpdates);
    });
  }

  let resizedElement = produce(element, (draft) => {
    const width = element.maxX - element.minX;
    const height = element.maxY - element.minY;
    const minX = element.minX + scale.moveX;
    const minY = element.minY + scale.moveY;

    draft.minX = minX;
    draft.minY = minY;
    draft.maxX = minX + width * scale.scaleX;
    draft.maxY = minY + height * scale.scaleY;

    const styles = elementUpdates[0]?.styles;
    if (styles?.gridTemplateColumns && styles?.gridTemplateRows) {
      draft.styles = {
        ...draft.styles,
        gridTemplateColumns: styles.gridTemplateColumns,
        gridTemplateRows: styles.gridTemplateRows,
      };
    }
  });

  return {
    resizedElement,
    viewUpdates,
    elementUpdates,
  };
}

export function getConstrainedBBox(
  initialBBox: BBox, finalBBox: BBox, direction: PebResizeDirection, baseAxis?: 'x' | 'y',
): BBox {
  const scaleX = (finalBBox.maxX - finalBBox.minX) / (initialBBox.maxX - initialBBox.minX);
  const scaleY = (finalBBox.maxY - finalBBox.minY) / (initialBBox.maxY - initialBBox.minY);

  baseAxis = baseAxis ?? scaleX < scaleY ? 'x' : 'y';

  if (scaleX === scaleY) {
    return { ...finalBBox };
  }

  if (baseAxis === 'x') {
    const height = scaleX * (initialBBox.maxY - initialBBox.minY);

    return direction.n
      ? { ...finalBBox, minY: finalBBox.maxY - height }
      : { ...finalBBox, maxY: finalBBox.minY + height };
  }

  const width = scaleY * (initialBBox.maxX - initialBBox.minX);

  return direction.w
    ? { ...finalBBox, minX: finalBBox.maxX - width }
    : { ...finalBBox, maxX: finalBBox.minX + width };
}

export function getScale(elmBBox: BBox, initialBBox: BBox, finalBBox: BBox)
  : PebScale {
  const initialWidth = initialBBox.maxX - initialBBox.minX;
  const initialHeight = initialBBox.maxY - initialBBox.minY;
  const finalWidth = finalBBox.maxX - finalBBox.minX;
  const finalHeight = finalBBox.maxY - finalBBox.minY;

  let scaleX = normalizeScaleSize(finalWidth ? finalWidth / initialWidth : 0);
  let scaleY = normalizeScaleSize(finalHeight ? finalHeight / initialHeight : 0);

  let moveX = normalizeMoveSize(finalBBox.minX - initialBBox.minX - (elmBBox.minX - initialBBox.minX) * (1 - scaleX));
  let moveY = normalizeMoveSize(finalBBox.minY - initialBBox.minY - (elmBBox.minY - initialBBox.minY) * (1 - scaleY));

  return {
    moveX,
    moveY,
    scaleX,
    scaleY,
  };
}


export function getViewUpdates(
  elm: PebElement,
  scale: { scaleX: number; scaleY: number; moveX: number; moveY: number; },
): { id: string, style: Partial<CSSStyleDeclaration> } {
  if (isSection(elm)) {
    return { id: elm.id, style: { height: `${(elm.maxY - elm.minY) * scale.scaleY}px`, minHeight: 'auto' } };
  }

  const style: Partial<CSSStyleDeclaration> = {};

  if (isBlockOrInlinePosition(elm.styles.position)) {
    style.width = `${(elm.maxX - elm.minX) * scale.scaleX}px`;
    style.minHeight = style.height = `${(elm.maxY - elm.minY) * scale.scaleY}px`;
  } else {
    const parent = elm.parent && elm.parent.type !== PebElementType.Document
      ? elm.parent
      : { minX: 0, minY: 0 };

    style.top = `${scale.moveY + elm.minY - parent.minY}px`;
    style.left = `${scale.moveX + elm.minX - parent.minX}px`;
    style.width = `${(elm.maxX - elm.minX) * scale.scaleX}px`;
    style.maxWidth = 'auto';
    style.minWidth = 'auto';
    style.maxHeight = 'auto';
    style.minHeight = style.height = `${(elm.maxY - elm.minY) * scale.scaleY}px`;
    style.zIndex = '99999';
  }

  if (isText(elm)) {
    style.whiteSpace = 'normal';
    style.minHeight = style.height = 'auto';
    style.overflow = 'visible';
  }

  return { id: elm.id, style };
}

function getElementUpdates(
  elm: PebElement,
  scale: { scaleX: number; scaleY: number; moveX: number; moveY: number; },
  handlePercentSizes: boolean,
): { id: string, styles: Partial<PebElementStyles> } {

  const { position, dimension } = elm.styles ?? {};

  const container = bboxDimension(elm.parent ? elementInnerSpace(elm.parent) : elementInnerSpace(elm));

  const width = scaleSize(dimension?.width, scale.scaleX, handlePercentSizes);
  const height = scaleSize(dimension?.height, scale.scaleY, handlePercentSizes);
  const left = translateSize(position?.left, scale.moveX, handlePercentSizes, container.width);
  const top = translateSize(position?.top, scale.moveY, handlePercentSizes, container.height);
  const right = translateSize(position?.right, scale.moveX, handlePercentSizes, container.width);
  const bottom = translateSize(position?.bottom, scale.moveY, handlePercentSizes, container.height);

  const styles: any = { dimension: {}, position: {} };

  if (isSection(elm)) {
    styles.dimension.height = height;
  } else if (!isGridElement(elm.parent)) {
    styles.position.left = left;
    styles.position.top = top;
    styles.dimension.width = width;
    styles.dimension.height = height;
    styles.position.right = right;
    styles.position.bottom = bottom;
  }

  if (elm.type === PebElementType.Grid) {
    styles.gridTemplateColumns = elm.styles.gridTemplateColumns?.map(c => c * scale.scaleX) ?? [];
    styles.gridTemplateRows = elm.styles.gridTemplateRows?.map(r => r * scale.scaleY) ?? [];
  };

  if (isText(elm)) {
    const textStyles: Partial<PebTextStyles> = { fixedWidth: true, fixedHeight: false };
    styles.textStyles = textStyles;
  }

  return { id: elm.id, styles };
}

export function getResizeTextUpdates(element: PebElement, scale: number): Partial<PebTextStyles> | undefined {
  const text = element.text;

  if (isDeltaEmpty(text)) {
    return undefined;
  }

  const styles = { ...extractDeltaTextStyles(text), ...element.styles.textStyles };
  const newStyles: Partial<PebTextStyles> = {};

  styles.lineHeight && typeof styles.lineHeight === 'number' &&
    (newStyles.lineHeight = styles.lineHeight * scale);
  styles.fontSize && (newStyles.fontSize = styles.fontSize * scale);

  return newStyles;
}

export function normalizeScaleSize(val?: number): number {
  return isValidScaleSize(val) ? val ?? 1 : 1;
}

export function normalizeMoveSize(val?: number): number {
  if (!val) {
    return 0;
  }

  return Math.abs(val - PEB_MOVE_EPSILON) > 0 ? val - PEB_MOVE_EPSILON : val ?? 0;
}


export function isValidScaleSize(val?: number): boolean {
  return val !== undefined && val !== null && Math.abs(val - 1) > PEB_SCALE_EPSILON;
}
