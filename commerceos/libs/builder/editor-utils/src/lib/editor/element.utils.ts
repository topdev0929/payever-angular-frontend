import RBush, { BBox } from 'rbush';

import {
  PebElementDef,
  PebElementType,
  isGridLayout,
  PebEditorPoint,
  isPinnedPosition,
  isBlockOrInlinePosition,
} from '@pe/builder/core';
import {
  PebElement,
  PebLinkedList,  
  hasGridLayout,
  isDocument,
  isGridElement,
  isReadonly,
  isSection,
  isShape,
  isText,
} from '@pe/builder/render-utils';

import {
  bboxDimension,
  bboxIsInsideBBox,
  elementBBox,
  paddingBBox,
  pointIsInsideBBox,
} from './bbox.utils';
import { findCellByPoint } from './layout.utils';
import { isFreeMove } from './move.utils';
import { elementInnerSpace } from './position.utils';
import { isDeltaEmpty } from './text.utils';


export const findCommonAncestor = (elements: PebElement[]): PebElement => {
  if (elements.length === 1 && !elements[0].parent) {
    return elements[0];
  }

  const parents = elements.map((elm) => {
    let parent = elm.parent;
    const parents: PebElement[] = [];
    while (parent) {
      parents.unshift(parent);
      parent = parent.parent;
    }

    return parents;
  });

  const transpose = <T>(m: T[][]): T[][] => m[0].map((x, i) => m.map(x => x[i]));
  const tree = transpose(parents).map(arr => new Set(arr));
  const [[container]] = tree.filter(s => s.size === 1).reverse();

  return container;
};

export function findElementSection(element: PebElement | undefined): PebElement | undefined {
  if (!element) {
    return undefined;
  }

  if (element.type === PebElementType.Section) {
    return element;
  }

  return findElementSection(element.parent);
}

export function findElementRoot(element: PebElement | undefined): PebElement | undefined {
  if (!element) {
    return undefined;
  }

  if (isDocument(element)) {
    return element;
  }

  return findElementRoot(element.parent) ?? element;
}

export function canInsertChild(
  child: PebElement,
  parent: PebElement,
  movingBBox?: BBox,
  dropPoint?: PebEditorPoint,
): { allowed: boolean, bbox?: BBox } {

  /* Rule for insert elements
   - document cannot insert into any other types
   - cannot insert element into grid
   - only section can be added to document 
   - section can be inserted only to element
   - cannot insert element into text
   - cannon insert element into any element that has text

   - if element is free move and drop point is inside parent it allowed

   - if movingBBox is set, then should not overlap with any other elements inside host
   - if movingBBox is not set, then should have empty place

   - if element position is block or inline-block it can be inserted to element

  */
  if (isReadonly(parent)) {
    return { allowed: false };
  }

  if (!child || !parent || isGridElement(parent) || isText(parent) || isDocument(child)) {
    return { allowed: false };
  }

  if (!isDeltaEmpty(parent.text)) {
    return { allowed: false };
  }

  if (isDocument(parent)) {
    return { allowed: !isDocument(child) };
  }

  if (isSection(child)) {
    return { allowed: isDocument(parent) };
  }

  if (isFreeMove(child) && dropPoint && pointIsInsideBBox(dropPoint, parent)) {
    return { allowed: true, bbox: parent };
  }

  if (isBlockOrInlinePosition(child.styles.position)) {
    return { allowed: true, bbox: parent };
  }

  const parentSpace = elementInnerSpace(parent);
  if (isGridLayout(parent.styles?.layout)) {
    const bbox = dropPoint ? findCellByPoint(parent, dropPoint)?.bbox : parentSpace;
    const allowed = bbox !== undefined && (!dropPoint || pointIsInsideBBox(dropPoint, elementBBox(parent)));

    return { allowed, bbox };
  }

  const parentDim = bboxDimension(parentSpace);
  const childDim = movingBBox ? bboxDimension(movingBBox) : { width: 0, height: 0 };

  let allowed = !movingBBox || bboxIsInsideBBox(movingBBox, parentSpace);
  allowed = allowed && (childDim.width < parentDim.width && childDim.height < parentDim.height);
  const bbox = allowed ? elementBBox(parent) : undefined;

  return { allowed, bbox };
}

export function canMoveTo(
  movingElements: PebElement[],
  movingBBox: BBox,
  parent: PebElement,
): { allowed: boolean, collisions?: PebElement[] } {
  if (movingElements.every(isFreeMove)) {
    return { allowed: true, collisions: [] };
  }

  const toSkip = new Set(movingElements.map(elm => elm.id));
  const tree = new RBush<PebElement>();
  tree.load([...parent.children ?? []].filter(elm => !toSkip.has(elm.id)));
  const collisions = tree.search(paddingBBox(movingBBox, { left: 1, top: 1, right: 1, bottom: 1 }));

  const allowed = movingElements.every(elm => isPinnedPosition(elm.styles?.position) || isText(elm))
    || collisions.filter(elm => !isPinnedPosition(elm.styles.position)).length === 0;

  return { allowed, collisions };
}

export function collectAllChildren(root: PebElement): { [id: string]: PebElement } {
  const map: any = {};

  const recursive = (list?: PebLinkedList<PebElement>) => {
    [...list ?? []].forEach(elm => (map[elm.id] = elm) && recursive(elm.children));
  };
  recursive(root.children);

  return map;
}

export function elementIsVisible(element: PebElement): boolean {
  let node: PebElement | undefined = element;
  const circularCheck = new Set<string>();

  while (node && !circularCheck.has(node.id)) {
    if (node.visible === false) {
      return false;
    }

    circularCheck.add(node.id);
    node = node.parent;
  }

  return true;
}

export function sortByInnerElements(elements: PebElement[]): PebElement[] {
  const nodes = elements.reduce((acc: any, element: PebElement) => {
    return (acc[element.id] = { level: undefined, element }) && acc;
  }, {} as any);

  const calcLevel = (node: any) => {
    if (!node || node.level !== undefined) {
      return;
    }
    const parent = nodes[node.element.parent?.id];
    parent && calcLevel(parent);
    node.level = (parent?.level ?? 0) + 1;
  };
  Object.values(nodes).forEach(node => calcLevel(node));

  return Object.values(nodes).sort((a: any, b: any) => b.level - a.level).map((node: any) => node.element);
}

export function findAllChildren(parentId: string, elements: PebElementDef[]): PebElementDef[] {
  const res: PebElementDef[] = [];
  const addRecursive = (parentId: string) => {
    const children = elements.filter(elm => elm.parent?.id === parentId);
    res.push(...children);

    children.forEach(elm => addRecursive(elm.id));
  };
  addRecursive(parentId);

  return res;
}

export function canAddText(element: PebElement): boolean {
  if (hasGridLayout(element)) {
    return false;
  }

  if (element.children?.length) {
    return false;
  }

  if (isText(element) || isShape(element)) {
    return true;
  }

  return false;
}


export function clonePebElement(element: PebElement): PebElement {

  const clonedParent = {
    ...element,
    children: new PebLinkedList<PebElement>(),
    minX: element.minX,
    minY: element.minY,
    maxX: element.maxX,
    maxY: element.maxY,
  };

  if (element.children) {
    [...element.children].forEach((elm) => {
      const clonedChildren = clonePebElement(elm);
      clonedChildren.parent = clonedParent;
      clonedParent.children.add(clonedChildren);
    });
  }

  return clonedParent;
}