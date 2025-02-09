import produce from 'immer';
import { isEqual } from 'lodash';
import RBush, { BBox } from 'rbush';

import {
  PebElementDef,
  pebGenerateId,
  PebElementDefUpdate,
  PebElementType,
  PebScreen,
  PebPosition,
  PebLayoutPosition,
  isGridLayout,
  isDefaultPosition,
  PebUnit,
  PebEditorViewport,
} from '@pe/builder/core';
import { PebElement, getPebSize, isDocument, isMasterElement, isSection } from '@pe/builder/render-utils';
import { PebDefRTree } from '@pe/builder/tree';

import { elementModels } from '../dto';
import { findAvailablePosition } from '../element-position.utils';

import { bboxDimension } from './bbox.utils';
import { canInsertChild, findElementRoot, findElementSection } from './element.utils';
import { findEmptyCells } from './layout.utils';
import { getFilteredLinkedList } from './linked-list.utils';
import { addWithPatches } from './patch.utils';


export function insertElements(
  elements: PebElementDef[],
  target: PebElement,
  screen: PebScreen,
  screens: PebScreen[],
): { updates?: PebElementDefUpdate[], insertedElements?: PebElementDef[], roots?: PebElementDef[] } {
  const cloned = produce(elements, (draft) => {
    draft.forEach((element) => {
      const originalId = element.id;
      const newId = element.id = pebGenerateId();

      draft.forEach((elm) => {
        elm.parent?.id === originalId && (elm.parent.id = newId);
        elm.next === originalId && (elm.next = newId);
        elm.prev === originalId && (elm.prev = newId);
        elm.data?.groupId?.includes(originalId) && (elm.data.groupId = [newId]);
      });

      const parentId = element.parent?.id;
      draft.every(elm => elm.id !== parentId) && (element.parent = undefined);
    });
  });

  const roots: PebElementDef[] = cloned.filter(elm => !elm.parent?.id);
  const children: PebElementDef[] = cloned.filter(elm => elm.parent?.id);
  const updates: PebElementDefUpdate[] = [...children];
  const insertedElements: PebElementDef[] = [...children];
  const originalTarget = target.original ?? target;

  roots.forEach((elm) => {
    if (isSection(elm)) {
      const res = insertClonedSection(elm, originalTarget);
      updates.push(...res.updates ?? []);
      insertedElements.push(...res.insertedElements ?? []);
    }
    else {
      const model = getElementTree(elm.id, cloned, screen, screens);
      const res = insertClonedElement(elm, originalTarget, model, screen);
      updates.push(...res.updates ?? []);
      insertedElements.push(...res.insertedElements ?? []);
    }
  });

  return { updates, insertedElements, roots };
}

function insertClonedElement(
  element: PebElementDef,
  target: PebElement,
  model: PebElement,
  screen: PebScreen,
): { updates?: PebElementDefUpdate[], insertedElements?: PebElementDef[] } {
  if (!target) {
    return {};
  }

  const place = findInsertPosition(model, target, screen);
  const parent = place.target;

  if (!parent) {
    return { updates: [], insertedElements: [] };
  }

  const cloned = produce(element, (draft: any) => {
    draft.parent = { id: parent.id, type: parent.type ?? PebElementType.Shape };
    draft.styles[screen.key] = {
      ...draft.styles[screen.key],
      position: { ...draft.styles[screen.key]?.position, ...place.position },
      layoutPosition: { ...draft.styles[screen.key]?.layoutPosition, ...place.layoutPosition },
    };
    draft.next = null;
    draft.prev = null;
  });

  let index = 0;
  if (isDocument(parent)) {
    const children = getFilteredLinkedList(parent.children, elm => !isMasterElement(elm));
    index = children.length - 1;
  }

  const updates: PebElementDefUpdate[] = [
    { ...cloned },
    ...addWithPatches(parent.children, { id: cloned.id }, index),
  ];

  if (place.update) {
    updates.push(place.update);
  }

  return { updates, insertedElements: [cloned] };
}

function insertClonedSection(
  section: PebElementDef,
  target: PebElement,
): { updates?: PebElementDefUpdate[], insertedElements?: PebElementDef[] } {

  const rootSection = findElementSection(target);
  const root = findElementRoot(target);
  if (!root) {
    return {};
  }

  const children = getFilteredLinkedList(root?.children, elm => !isMasterElement(elm));
  let index = children?.findIndex(elm => elm.id === rootSection?.id) ?? 0;
  (children?.length ?? 0) > 0 && index++;

  const clonedSection = produce(section, (draft: any) => {
    draft.parent = { id: root.id, type: root.type ?? PebElementType.Shape };
    draft.next = null;
    draft.prev = null;
  });

  const updates: PebElementDefUpdate[] = [
    { ...clonedSection },
    ...addWithPatches(children, { id: clonedSection.id }, index),
  ];

  return { updates, insertedElements: [clonedSection] };
}

function getElementTree(id: string, elements: PebElementDef[], screen: PebScreen, screens: PebScreen[]): PebElement {
  const map = elements.reduce((acc: any, elm) => (acc[elm.id] = elm) && acc, {});
  const models = elementModels(map, screen, undefined, screens).elements;

  const element = models.find(elm => elm.id === id);
  if (!element) {
    throw new Error('failed to create element model');
  }

  return element;
}

function findInsertPosition(
  element: PebElement,
  initialTarget: PebElement | undefined,
  screen: PebScreen,
): { target?: PebElement, position?: PebPosition, layoutPosition?: PebLayoutPosition, update?: PebElementDefUpdate } {
  const target = initialTarget;
  if (!target) {
    return {};
  }

  if (isSameDimension(element, target) && isSameType(element, target)) {
    return { target: target.parent, position: target.styles.position };
  }

  if (!canInsertChild(element, target).allowed) {
    return findInsertPosition(element, target.parent, screen);
  }

  if (isValidPosition(element.styles.position)) {
    const update = element.maxY > target.maxY - target.minY ? {
      id: target.id,
      styles: { [screen.key]: { dimension: { height: getPebSize(element.maxY) } } },
    } : undefined;

    return { target, position: element.styles.position, update };
  }

  if (isGridLayout(target.styles.layout)) {
    const index = findEmptyCells(target)[0]?.index;
    const position = isDefaultPosition(element.styles.position)
      ? { left: getPebSize(0), right: getPebSize(0) }
      : element.styles.position;

    return {
      target,
      layoutPosition: { index, auto: index === undefined },
      position,
    };
  }

  const tree = new RBush<PebElement>();
  tree.load([target, ...target.children ?? []]);

  const dimension = bboxDimension(element);
  const availablePosition = findAvailablePosition(tree, target, dimension);

  if (!availablePosition && target.type !== PebElementType.Section) {
    return findInsertPosition(element, target.parent, screen);
  }

  const maxY = [...target.children ?? []].filter(child => child.visible).map(child => child.maxY - target.minY);
  let top: number;
  if (availablePosition) {
    top = availablePosition.top;
  } else if (maxY.length === 0) {
    top = 0;
  } else {
    top = Math.max(...maxY);
  }

  const position = {
    left: getPebSize(availablePosition ? availablePosition.left : target.minX),
    top: getPebSize(top),
  };
  const update = availablePosition
    ? undefined
    : {
      id: target.id,
      styles: { [screen.key]: { dimension: { height: getPebSize(dimension.height + top) } } },
    };

  return { target, position, update };
}

function isValidPosition(position?: PebPosition): boolean {
  if (position?.type) {
    if (position.left && position.left.unit === PebUnit.Pixel && position.left.value === undefined) {
      return false;
    }

    if (position.top && position.top.unit === PebUnit.Pixel && position.top.value === undefined) {
      return false;
    }

    return true;
  }

  return false;
}

export function findInsertTarget(
  target: PebElement,
  tree: PebDefRTree,
  options: { scrollLeft: number, scrollTop: number },
  viewport: PebEditorViewport,
): PebElement | undefined {
  if (target && !isDocument(target)) {
    return target;
  }

  const viewportBBox = findViewportBBox(options, viewport);
  const searchedElements = tree.search(viewportBBox);
  const nonMasterSections = searchedElements.filter(elm => !isMasterElement(elm) && isSection(elm));
  const doc = searchedElements.find(elm => isDocument(elm));
  const viewportSections = findInViewportElements(nonMasterSections, viewportBBox)
    .sort((a, b) => a.element.minY - b.element.minY)
    .sort((a, b) => b.coverage - a.coverage)
    .map(elm => elm.element);

  return viewportSections?.[0] ?? doc;
}

function findViewportBBox(
  { scrollLeft, scrollTop }: { scrollLeft: number, scrollTop: number },
  viewport: PebEditorViewport,
): BBox {
  const { containerWidth, containerHeight, offsetX, offsetY, scale } = viewport;

  const left = scrollLeft - offsetX;
  const top = scrollTop - offsetY;
  const width = containerWidth;
  const height = containerHeight;

  return {
    minX: left / scale + 1,
    maxX: (left + width) / scale - 1,
    minY: top / scale + 1,
    maxY: (top + height) / scale - 1,
  };
}

export function findInViewportElements(
  elements: PebElement[],
  viewportBBox: BBox,
): { element: PebElement, coverage: number }[] {
  if (!elements?.length) {
    return [];
  }

  const viewportElements = elements.map(element => ({ element, coverage: heightCoverage(element, viewportBBox) }));

  return viewportElements;
}

function heightCoverage(section: BBox, viewBox: BBox): number {
  const viewHeight = viewBox.maxY - viewBox.minY;
  const displayedSectionTop = Math.max(section.minY, viewBox.minY);
  const displayedSectionBottom = Math.min(section.maxY, viewBox.maxY);
  const coverage = (displayedSectionBottom - displayedSectionTop) / viewHeight;

  return Math.max(coverage, 0);
}

function isSameDimension(element: PebElement, target: PebElement): boolean {
  return isEqual(element.styles.dimension, target.styles.dimension);
}

function isSameType(element: PebElement, target: PebElement): boolean {
  return element.type === target.type;
}

