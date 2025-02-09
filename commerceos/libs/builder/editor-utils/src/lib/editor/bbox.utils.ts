import RBush, { BBox } from 'rbush';

import { PebEditorPoint, PebPadding } from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';


export function elementBBox(element: PebElement | BBox): BBox {
  return {
    minX: element.minX,
    minY: element.minY,
    maxX: element.maxX,
    maxY: element.maxY,
  };
}

export function paddingBBox(bbox: BBox, padding: PebPadding | undefined): BBox {
  return padding
    ? {
      minX: bbox.minX + padding.left,
      minY: bbox.minY + padding.top,
      maxX: bbox.maxX - padding.right,
      maxY: bbox.maxY - padding.bottom,
    }
    : bbox;
}

export function bboxDimension(bbox: BBox, padding?: PebPadding): { width: number, height: number } {
  if (!bbox) {
    return { width: 0, height: 0 };
  }

  return padding
    ? {
      width: bbox.maxX - bbox.minX - padding.left - padding.right,
      height: bbox.maxY - bbox.minY - padding.top - padding.bottom,
    }
    : {
      width: bbox.maxX - bbox.minX,
      height: bbox.maxY - bbox.minY,
    };
}

export function translateBBox(bbox: BBox, moveX?: number, moveY?: number): BBox {
  const dx = moveX ?? 0;
  const dy = moveY ?? 0;

  return {
    minX: bbox.minX + dx,
    minY: bbox.minY + dy,
    maxX: bbox.maxX + dx,
    maxY: bbox.maxY + dy,
  };
}

export function resizeBBox(bbox: BBox, width: number, height: number): BBox {
  return {
    minX: bbox.minX,
    minY: bbox.minY,
    maxX: bbox.minX + width,
    maxY: bbox.minY + height,
  };
}

export function pointIsInsideBBox(point: PebEditorPoint, bbox: BBox): boolean {
  const { x, y } = point;

  return bbox.minX <= x && bbox.minY <= y && bbox.maxX >= x && bbox.maxY >= y;
}

export function bboxIsInsideBBox(child: BBox, parent: BBox): boolean {
  return child.minX >= parent.minX
    && child.minY >= parent.minY
    && child.maxX <= parent.maxX
    && child.maxY <= parent.maxY;
}

export function relativeBBoxSizes(parentBBox: BBox | undefined, innerBBox: BBox)
  : {
    left: number, right: number, top: number, bottom: number,
    width: number, height: number, parentWidth: number, parentHeight: number,
  } {

  if (!parentBBox) {
    return {
      left: innerBBox.minX,
      right: 0,
      top: innerBBox.minY,
      bottom: 0,
      width: innerBBox.maxX - innerBBox.minX,
      height: innerBBox.maxY - innerBBox.minY,
      parentWidth: 0,
      parentHeight: 0,
    };
  }

  return {
    left: innerBBox.minX - parentBBox.minX,
    right: parentBBox.maxX - innerBBox.maxX,
    top: innerBBox.minY - parentBBox.minY,
    bottom: parentBBox.maxY - innerBBox.maxY,
    width: innerBBox.maxX - innerBBox.minX,
    height: innerBBox.maxY - innerBBox.minY,
    parentWidth: parentBBox.maxX - parentBBox.minX,
    parentHeight: parentBBox.maxY - parentBBox.minY,
  };
}

export function bboxCenter(bbox: BBox): PebEditorPoint {
  return {
    x: (bbox.minX + bbox.maxX) / 2,
    y: (bbox.minY + bbox.maxY) / 2,
  };
}

export const findTotalArea = (items: BBox[]): BBox => {
  const bbox = {
    minX: Number.POSITIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
    maxX: Number.NEGATIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY,
  };

  return items.reduce((acc, { minX, minY, maxX, maxY }) => {
    return {
      minX: Math.min(acc.minX, minX),
      minY: Math.min(acc.minY, minY),
      maxX: Math.max(acc.maxX, maxX),
      maxY: Math.max(acc.maxY, maxY),
    };
  }, bbox);
};

export function findBBoxesByPoint<T extends ({ id: string } & BBox)>(
  tree: RBush<T>,
  point: PebEditorPoint,
  toSkip?: Set<string>,
): T[] {
  const bbox = { minX: point.x, minY: point.y, maxX: point.x, maxY: point.y };
  const intersects = tree.search(bbox)
    .filter(elm => !toSkip?.has(elm.id));

  return intersects;
}

export function isEqualBBox(a: BBox | undefined, b: BBox | undefined): boolean {
  if (!a && !b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  return a.minX === b.minX && a.minY === b.minY && a.maxX === b.maxX && a.maxY === b.maxY;
}

export function findNestedPointInBBox(bbox: BBox, point: PebEditorPoint): PebEditorPoint {
  if (!bbox || !point) {
    throw new Error('failed to calculate nested point');
  }

  const x = Math.max(Math.min(point.x, bbox.maxX), bbox.minX);
  const y = Math.max(Math.min(point.y, bbox.maxY), bbox.minY);

  return { x, y };
}

export function pointToBBox(point: PebEditorPoint): BBox {
  if (!point) {
    throw new Error('failed to convert point to bbox');
  }

  return {
    minX: point.x,
    minY: point.y,
    maxX: point.x,
    maxY: point.y,
  };
}

export function bboxHasOuterContactLine(bbox1: BBox, bbox2: BBox): boolean {
  return bbox1.minX === bbox2.maxX
    || bbox1.minY === bbox2.maxY
    || bbox1.maxX === bbox2.minX
    || bbox1.maxY === bbox2.minY;
}
