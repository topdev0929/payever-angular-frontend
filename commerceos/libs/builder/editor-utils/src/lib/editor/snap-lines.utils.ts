
import { BBox } from 'rbush';

import {
  PebElementType,
  PebSnapLine,
  PebSnapPoint,
  PebSnapTransform,
  PebSnapTransformOption,
} from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';

import { elementLayoutLines } from './layout.utils';
import { PEB_DEFAULT_PADDING, elementInnerSpace } from './position.utils';


const VIEW_GAP = 14;
const APPLY_GAP = 6;


export function detectSnapLines(
  bbox: BBox,
  snapPoints: PebSnapPoint[],
  options: PebSnapTransformOption,
): { snapLines: PebSnapLine[], transform: PebSnapTransform | undefined } {

  if (bbox.minX === bbox.maxX || bbox.minY === bbox.maxY) {
    return { snapLines: [], transform: undefined };
  }

  const gap = options.viewGap ?? VIEW_GAP;
  const applyGap = options.applyGap ?? APPLY_GAP;

  const initLines: (PebSnapLine | undefined)[] = [];

  for (const snapPoint of snapPoints) {

    if (options.move) {
      const { top, left, right, bottom, center } = options.move;

      top && initLines.push(getHorizontalSnapLine(bbox, bbox.minY, snapPoint, gap, 'move'));
      right && initLines.push(getVerticalMoveSnapLine(bbox, bbox.maxX, snapPoint, gap, 'move'));
      bottom && initLines.push(getHorizontalSnapLine(bbox, bbox.maxY, snapPoint, gap, 'move'));
      left && initLines.push(getVerticalMoveSnapLine(bbox, bbox.minX, snapPoint, gap, 'move'));
      if (center) {
        initLines.push(getVerticalMoveSnapLine(bbox, (bbox.minX + bbox.maxX) / 2, snapPoint, gap, 'move', 'center'));
        initLines.push(getHorizontalSnapLine(bbox, (bbox.minY + bbox.maxY) / 2, snapPoint, gap, 'move', 'center'));
      }
    }

    if (options.resize) {
      const { top, right, bottom, left } = options.resize;

      top && initLines.push(getHorizontalSnapLine(bbox, bbox.minY, snapPoint, gap, 'resize'));
      right && initLines.push(getVerticalMoveSnapLine(bbox, bbox.maxX, snapPoint, gap, 'resize'));
      bottom && initLines.push(getHorizontalSnapLine(bbox, bbox.maxY, snapPoint, gap, 'resize'));
      left && initLines.push(getVerticalMoveSnapLine(bbox, bbox.minX, snapPoint, gap, 'resize'));
    }
  }

  const snapLines = initLines.filter(line => !!line) as PebSnapLine[];
  const transform = applyToNearestLines(snapLines, applyGap);

  return {
    snapLines: snapLines.filter(line => line.applied || !line.center),
    transform,
  };
}

export function applyToNearestLines(snapLines: PebSnapLine[], applyGap: number): PebSnapTransform {
  const toApply = snapLines
    .filter(line => line.distance <= applyGap)
    .sort((a, b) => a.distance === b.distance ? a.weight - b.weight : a.distance - b.distance);

  const applyX = toApply.filter(line => line.transform?.moveX || line.transform?.resizeX)[0];
  const applyY = toApply.filter(line => line.transform?.moveY || line.transform?.resizeY)[0];

  applyX && (applyX.applied = true);
  applyY && (applyY.applied = true);

  const transform: PebSnapTransform = {
    moveX: applyX?.transform?.moveX ?? 0,
    moveY: applyY?.transform?.moveY ?? 0,
    resizeX: applyX?.transform?.resizeX ?? 0,
    resizeY: applyY?.transform?.resizeY ?? 0,
  };

  return transform;
}


export function getSnapPoints(
  rootElement: PebElement,
  selected: PebElement[],
  param: { includeCenters: boolean } = { includeCenters: true },
): PebSnapPoint[] {
  if (!rootElement) {
    return [];
  }

  return getSnapPointsRecursive(
    [rootElement],
    new Set(selected?.map(item => item.id) ?? []),
    param,
  );
}

function getSnapPointsRecursive(
  elements: PebElement[],
  exclude: Set<string>,
  param: { includeCenters: boolean } = { includeCenters: true },
) {
  const points: PebSnapPoint[] = [];

  for (const element of elements) {
    if (!exclude.has(element.id)) {
      if (element.type !== PebElementType.Document) {
        points.push(...getElementBorderSnapPoints(element));
        points.push(...getElementPaddingSnapPoints(element));
        points.push(...getELementLayoutSnapPoints(element));
        param.includeCenters && points.push(...getElementCenterSnapPoints(element));
      }
    }

    const children = element.children ? [...element.children] : [];

    if (children?.length > 0) {
      points.push(...getSnapPointsRecursive(
        children,
        exclude,
        param,
      ));
    }
  }

  return points;
}


function getElementBorderSnapPoints(element: PebElement): PebSnapPoint[] {
  return [
    { x: element.minX, y: element.minY, peerX: element.maxX, peerY: element.maxY, type: 'corner' }, // top left
    { x: element.maxX, y: element.minY, peerX: element.minX, peerY: element.maxY, type: 'corner' }, // top right
    { x: element.maxX, y: element.maxY, peerX: element.minX, peerY: element.minY, type: 'corner' }, // bottom right
    { x: element.minX, y: element.maxY, peerX: element.maxX, peerY: element.minY, type: 'corner' }, // bottom left
  ];
}

function getElementPaddingSnapPoints(element: PebElement): PebSnapPoint[] {
  const { left, top, right, bottom } = element.styles.padding ?? PEB_DEFAULT_PADDING;
  const bbox = elementInnerSpace(element);

  const points: PebSnapPoint[] = [];


  left && points.push({ x: bbox.minX, y: element.minY, peerX: bbox.minX, peerY: element.maxY, type: 'corner' });
  right && points.push({ x: bbox.maxX, y: element.minY, peerX: bbox.maxX, peerY: element.maxY, type: 'corner' });

  top && points.push({ x: element.minX, y: bbox.minY, peerX: element.maxX, peerY: bbox.minY, type: 'corner' });
  bottom && points.push({ x: element.minX, y: bbox.maxY, peerX: element.maxX, peerY: bbox.maxY, type: 'corner' });

  return points;
}

function getELementLayoutSnapPoints(element: PebElement): PebSnapPoint[] {
  return elementLayoutLines(element, { outerLines: false })
    .map(({ x1, y1, x2, y2 }) => ({ x: x1, y: y1, peerX: x2, peerY: y2, type: 'corner' }));
}

function getElementCenterSnapPoints(element: PebElement): PebSnapPoint[] {
  const bbox = elementInnerSpace(element);

  const centerX = (bbox.maxX + bbox.minX) / 2;
  const centerY = (bbox.maxY + bbox.minY) / 2;

  return [
    { x: bbox.minX, y: centerY, peerX: bbox.maxX, peerY: centerY, type: 'center' },
    { x: centerX, y: bbox.minY, peerX: centerX, peerY: bbox.maxY, type: 'center' },
  ];
}


function getVerticalMoveSnapLine(
  bbox: BBox,
  movingX: number,
  point: PebSnapPoint,
  gap: number,
  transformType: 'move' | 'resize',
  alignType: 'center' | 'corner' = 'corner',
): PebSnapLine | undefined {
  const { x, y } = point;
  const distance = Math.abs(x - movingX);

  if (!isFinite(distance) || distance > gap) {
    return undefined;
  }

  const minY = Math.min(y, point.peerY, bbox.minY, bbox.maxY);
  const maxY = Math.max(y, point.peerY, bbox.minY, bbox.maxY);

  const dx = x - movingX;
  let transform: PebSnapTransform;
  if (transformType === 'move') {
    transform = { moveX: dx };
  } else if (movingX === bbox.minX) {
    transform = { moveX: dx, resizeX: -dx };
  } else {
    transform = { resizeX: dx };
  }

  return {
    minX: x,
    maxX: x,
    minY,
    maxY,
    joints: [
      { x: 0, y: bbox.minY - minY },
      { x: 0, y: bbox.maxY - minY },
      { x: 0, y: point.y - minY },
      { x: 0, y: point.peerY - minY },
    ],
    transform,
    distance,
    weight: point.type === 'center' ? 1 : 0,
    center: point.type === 'center' || alignType === 'center',
  };
}

function getHorizontalSnapLine(
  bbox: BBox,
  movingY: number,
  point: PebSnapPoint,
  gap: number,
  transformType: 'move' | 'resize',
  alignType: 'center' | 'corner' = 'corner',
): PebSnapLine | undefined {
  const { x, y } = point;
  const distance = Math.abs(y - movingY);

  if (!isFinite(distance) || distance > gap) {
    return undefined;
  }

  const minX = Math.min(x, point.peerX, bbox.minX, bbox.maxX);
  const maxX = Math.max(x, point.peerX, bbox.minX, bbox.maxX);

  const dy = y - movingY;
  let transform: PebSnapTransform;
  if (transformType === 'move') {
    transform = { moveY: dy };
  } else if (movingY === bbox.minY) {
    transform = { moveY: dy, resizeY: -dy };
  } else {
    transform = { resizeY: dy };
  }

  return {
    minX,
    maxX,
    minY: y,
    maxY: y,
    joints: [
      { x: bbox.minX - minX, y: 0 },
      { x: bbox.maxX - minX, y: 0 },
      { x: point.x - minX, y: 0 },
      { x: point.peerX - minX, y: 0 },
    ],
    transform,
    distance,
    weight: point.type === 'center' ? 1 : 0,
    center: point.type === 'center' || alignType === 'center',
  };
}
