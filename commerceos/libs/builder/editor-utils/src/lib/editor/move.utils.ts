import {
  isGridLayout,
  PebEditorPoint,
  PebPositionType,
  PEB_DEFAULT_LAYOUT_POSITION,
} from '@pe/builder/core';
import {
  getPebSize,
  isDocument,
  isSection,
  PebElement,
  PebLinkedList,
} from '@pe/builder/render-utils';

import {
  bboxCenter,
  bboxDimension,
  bboxIsInsideBBox,
  pointIsInsideBBox,
  relativeBBoxSizes,
  translateBBox,
} from './bbox.utils';
import { findElementRoot } from './element.utils';
import { PebElementUpdates } from './interfaces';
import { findCellByPoint, layoutCells } from './layout.utils';
import { addWithPatches, deleteWithPatches } from './patch.utils';
import { elementInnerSpace } from './position.utils';
import { calculatePixelToPebSize } from './size.utils';

export function moveELement(
  element: PebElement,
  newParent: PebElement,
  translate: { moveX: number, moveY: number },
  siblings: PebLinkedList<PebElement>,
  newParentChildren: PebLinkedList<PebElement>,
  dropPoint?: PebEditorPoint,
): { elementUpdates: PebElementUpdates } {

  if (isDocument(newParent) && !isSection(element)) {
    return moveElementOutPage(element, translate, siblings, newParentChildren, dropPoint);
  }

  let layoutPosition;
  const newParentIsLayout = isGridLayout(newParent.styles.layout);
  const movingBBox = translateBBox(element, translate.moveX, translate.moveY);
  let container = elementInnerSpace(newParent);

  if (newParentIsLayout) {
    const point = dropPoint ?? bboxCenter(movingBBox);
    layoutPosition = { ...PEB_DEFAULT_LAYOUT_POSITION, ...element.styles?.layoutPosition };
    const cells = layoutCells(newParent) ?? [{ index: 0, bbox: container }];
    const cell = cells?.find(cell => pointIsInsideBBox(point, cell.bbox)) ?? cells[0];

    layoutPosition.index = cell.index;
    layoutPosition.auto = false;
    container = cell.bbox;
  }

  const dim = relativeBBoxSizes(container, movingBBox);
  const { position, dimension } = element.styles;

  const current = {
    left: getPebSize(position?.left),
    top: getPebSize(position?.top),
    right: getPebSize(position?.right),
    bottom: getPebSize(position?.bottom),
    width: getPebSize(dimension?.width),
    height: getPebSize(dimension?.height),
  };

  const [left, , right] = calculatePixelToPebSize(
    [dim.left, dim.width, dim.right],
    [current.left?.unit, current.width?.unit, current.right?.unit]);

  const [top, , bottom] = calculatePixelToPebSize(
    [dim.top, dim.height, dim.bottom],
    [current.top?.unit, current.height?.unit, current.bottom?.unit]);

  const changeParent = element.parent?.id !== newParent.id;
  const indexChanged = element.styles.layoutPosition?.index !== layoutPosition?.index;
  const oldParentIsLayout = isGridLayout(element.parent?.styles?.layout);
  let keepPosition = changeParent
    ? oldParentIsLayout && newParentIsLayout
    : newParentIsLayout && indexChanged;

  if (newParentIsLayout && dropPoint) {
    const cellBBox = findCellByPoint(newParent, dropPoint)?.bbox;
    cellBBox && !bboxIsInsideBBox(movingBBox, cellBBox) && (keepPosition = false);
  }

  const elementUpdates: PebElementUpdates = [{
    id: element.id,
    parent: newParent,
    styles: keepPosition ? {} : { position: { ...position, left, top, right, bottom } },
  }];

  if (changeParent) {
    const from = siblings;
    const to = newParentChildren;

    const index = from.findIndex(node => node.id === element.id);
    elementUpdates.push(...deleteWithPatches(from, index));
    elementUpdates.push(...addWithPatches(to, element));
  }

  layoutPosition && elementUpdates.push({ id: element.id, styles: { layoutPosition } });

  return {
    elementUpdates,
  };
}

export function moveElementOutPage(
  element: PebElement,
  translate: { moveX: number, moveY: number },
  siblings: PebLinkedList<PebElement>,
  newParentChildren: PebLinkedList<PebElement>,
  dropPoint?: PebEditorPoint,
): { elementUpdates: PebElementUpdates } {
  const document = findElementRoot(element);
  if (!document || !isDocument(document)) {
    throw new Error('root element should be document');
  }

  const { width, height } = bboxDimension(element);

  const elementUpdates: PebElementUpdates = [{
    id: element.id,
    parent: document,
    styles: {
      position: {
        type: PebPositionType.Pinned,
        left: getPebSize(element.minX + translate.moveX),
        top: getPebSize(element.minY + translate.moveY),
        right: undefined,
        bottom: undefined,
      },
      dimension: {
        width: getPebSize(width),
        height: getPebSize(height),
      },
    },
  }];

  if (element.parent?.id !== document.id) {
    const from = siblings;
    const to = newParentChildren;

    const index = from.findIndex(node => node.id === element.id);
    elementUpdates.push(...deleteWithPatches(from, index));
    elementUpdates.push(...addWithPatches(to, element, 0));
  }

  return { elementUpdates };
}


export function isFreeMove(elm: PebElement): boolean {
  if (!elm) {
    return false;
  }

  return !isSection(elm) && !isDocument(elm);
}
