import { BBox } from 'rbush';

import {
  isBlockOrInlinePosition,
  isBlockPosition,
  isGridLayout,
  isPixelSize,
  PEB_ROOT_SCREEN_KEY,
  PebContentAlign,
  PebDefaultScreens,
  PebDimension,
  PebElementStyles,
  PebMixSize,
  PebPadding,
  PebPosition,
  PebPositionType,
  PebScreen,
} from '@pe/builder/core';
import {
  elementContentAlign,
  getPebSize,
  isDocument,
  isFlexibleHeightElement,
  isSection,
  PebElement,
} from '@pe/builder/render-utils';

import {
  bboxDimension,
  elementBBox,
  findTotalArea,
  paddingBBox,
  translateBBox,
} from './bbox.utils';
import { PebEditorLayoutCell } from './interfaces';
import { elementLayout, layoutCells } from './layout.utils';
import { calculatePebSizeToPixel, calculatePixelToPebSize } from './size.utils';

export const PEB_DEFAULT_SECTION_HEIGHT = 10;
export const PEB_MIN_SECTION_HEIGHT = 10;
export const PEB_MIN_ELEMENT_HEIGHT = 1;
export const PEB_DEFAULT_PADDING: PebPadding = { left: 0, top: 0, right: 0, bottom: 0 };

export function calculateDocumentBBox(document: PebElement, screen: PebScreen) {
  setBBox(document, documentBBox());
  const children = document.children ? [...document.children] : [];
  const width = screen.width + screen.padding * 2;

  calculateElementsBBoxes(children, undefined, width);
}

export function calculateChildrenBBox(element: PebElement, circularCheck?: Set<string>) {
  circularCheck = circularCheck ?? new Set();
  if (circularCheck.has(element.id)) {
    return;
  }
  circularCheck.add(element.id);

  if (element.visible === false) {
    setBBox(element, invisibleBBox());

    return;
  }

  const children = element.children ? [...element.children] : [];

  let layout = elementLayout(element);

  if (isGridLayout(layout)) {
    const { width, height } = bboxDimension(element);
    const layoutBBoxes = gridCellBBoxes(layout.rows, layout.columns, width, height)
      .map(cell => ({ ...cell, bbox: translateBBox(cell.bbox, element.minX, element.minY) }));

    children.forEach((elm) => {
      const bbox = layoutBBoxes[elm.styles.layoutPosition?.index ?? 0]?.bbox;


      if (!bbox) {
        elm.visible = false;
        setBBox(elm, invisibleBBox());
      }
      else {
        setBBox(elm, elm.styles.layoutPosition?.fill ? bbox : defaultPositionBBox(elm, bbox));
        elm?.children && calculateChildrenBBox(elm, circularCheck);
      }
    });

    return;
  }

  calculateElementsBBoxes(
    children.filter(elm => elm.id !== element.id),
    element,
    bboxDimension(element).width,
  );
}

export function calculateElementsBBoxes(
  elements: PebElement[],
  parent?: PebElement,
  containerWidth?: number,
) {
  let lastSection: BBox | undefined = undefined;

  const invisibleElements = elements.filter(elm => elm.visible === false);
  const visibleElements = elements.filter(elm => elm.visible !== false);
  const blockElements = elements.filter(elm => elm.visible !== false && isBlockOrInlinePosition(elm.styles.position));

  const containerBBox = parent
    ? elementInnerSpace(parent)
    : { minX: 0, maxX: containerWidth ?? 0, minY: 0, maxY: 0 };

  calculateBlocksBBox(blockElements, paddingBBox(containerBBox, parent?.styles?.padding));

  invisibleElements.forEach(elm => setBBox(elm, invisibleBBox()));

  visibleElements.forEach((elm) => {
    const bboxPosition = isSection(elm)
      ? sectionBBox(elm, lastSection?.maxY ?? 0, bboxDimension(containerBBox).width)
      : defaultPositionBBox(elm, containerBBox);
    const bbox = isBlockOrInlinePosition(elm.styles.position)
      ? elementBBox(elm)
      : bboxPosition;

    setBBox(elm, bbox);
    calculateChildrenBBox(elm);
    isSection(elm) && (lastSection = bbox);
  });
}

export function sectionBBox(section: PebElement, minY: number, parentWidth: number): BBox {
  if (section.visible === false) {
    return invisibleBBox();
  }

  const dim = {
    width: parentWidth,
    height: findElementHeightPixel(section, parentWidth) ?? PEB_DEFAULT_SECTION_HEIGHT,
  };

  return {
    minX: 0,
    minY: minY,
    maxX: dim.width,
    maxY: minY + dim.height,
  };
}

export function gridCellBBoxes(rows: PebMixSize[], cols: PebMixSize[], parentWidth: number, parentHeight: number)
  : PebEditorLayoutCell[] {
  const res: any = [];
  const rowSizes = calculatePebSizeToPixel(rows, parentHeight);
  const colsSizes = calculatePebSizeToPixel(cols, parentWidth);

  let minY = 0;
  let index = 0;
  let row = 0;
  rowSizes.forEach((rowSize) => {
    let minX = 0;
    let column = 0;
    colsSizes.forEach((colSize) => {
      const bbox = { minX, maxX: minX + colSize, minY, maxY: minY + rowSize };
      res.push({ index, row, column, bbox });

      minX += colSize;
      index++;
      column++;
    });
    minY += rowSize;
    row++;
  });

  return res;
}

export function childPositionByBBox(
  container: BBox,
  element: BBox,
  styles: PebElementStyles,
): { position: PebPosition, dimension: PebDimension } {

  const position = styles.position ?? { type: PebPositionType.Default };
  const dimension = styles.dimension ?? { width: getPebSize(1), height: getPebSize(1) };

  const [left, width, right] = calculatePixelToPebSize([
    element.minX - container.minX,
    element.maxX - element.minX,
    container.maxX - element.maxX,
  ], [
    getPebSize(position.left)?.unit,
    getPebSize(dimension.width)?.unit,
    getPebSize(position.right)?.unit,
  ]);

  const [top, height, bottom] = calculatePixelToPebSize([
    element.minY - container.minY,
    element.maxY - element.minY,
    container.maxY - element.maxY,
  ], [
    getPebSize(position.left)?.unit,
    getPebSize(dimension.width)?.unit,
    getPebSize(position.right)?.unit,
  ]);

  return {
    position: {
      ...position,
      top,
      right,
      bottom,
      left,
    },
    dimension: {
      width,
      height,
    },
  };
}

export function defaultPositionBBox(element: PebElement, parentBBox: BBox): BBox {
  const position = element.styles?.position ?? {};
  const dimension = element.styles.dimension ?? {};

  if (!position || !dimension || !paddingBBox || element.visible === false) {
    return invisibleBBox();
  }

  const parent = bboxDimension(parentBBox);

  const sizesX = calculatePebSizeToPixel(
    [position.left, dimension.width, position.right],
    parent.width,
  );
  const sizesY = calculatePebSizeToPixel(
    [position.top, findElementHeightPixel(element, parent.width) ?? dimension.height, position.bottom],
    parent.height,
  );

  const left = sizesX[0];
  const width = sizesX[1];
  const top = sizesY[0];
  const height = sizesY[1];

  return {
    minX: parentBBox.minX + left,
    minY: parentBBox.minY + top,
    maxX: parentBBox.minX + left + width,
    maxY: parentBBox.minY + top + height,
  };
};

export function containerPaddingSpace(element: PebElement): BBox {
  if (!element?.parent) {
    throw new Error('failed to get container padding space');
  }

  const parent = element.parent;

  if (isGridLayout(parent.styles?.layout)) {
    const cells = layoutCells(parent);
    const index = element.styles.layoutPosition?.index ?? 0;

    return (cells?.[index]?.bbox) ?? element;
  }

  return paddingBBox(elementInnerSpace(parent), parent.styles?.padding);
}

export function containerMaxSpace(element: PebElement): BBox {
  if (!element?.parent) {
    throw new Error('failed to get container max space');
  }

  const parent = element.parent;

  if (isGridLayout(parent.styles?.layout)) {
    const cells = layoutCells(parent);
    const index = element.styles.layoutPosition?.index ?? 0;

    return (cells?.[index]?.bbox) ?? element;
  }

  return elementInnerSpace(parent);
}

export function elementInnerSpace(element: PebElement | undefined): BBox {
  if (!element) {
    throw new Error('failed to get element inner space');
  }

  if (isDocument(element)) {
    return findTotalArea([...element.children ?? []].filter(child => child.visible !== false && isSection(child)));
  }

  if (isSection(element)) {
    const screenPadding = element.screen?.padding ?? 0;

    return element.data?.fullWidth
      ? elementBBox(element)
      : paddingBBox(element, { left: screenPadding, top: 0, right: screenPadding, bottom: 0 });
  }

  return elementBBox(element);
}

export function screenBBox(screen: PebScreen): BBox {
  const width = screen.width + screen.padding * 2;

  return { minX: 0, minY: 0, maxX: width, maxY: width };
}

export const invisibleBBox = (): BBox => ({
  minX: -1,
  minY: -1,
  maxX: -1,
  maxY: -1,
});

export const documentBBox = () => ({
  minX: Number.NEGATIVE_INFINITY,
  minY: Number.NEGATIVE_INFINITY,
  maxX: Number.POSITIVE_INFINITY,
  maxY: Number.POSITIVE_INFINITY,
});

export function findElementHeightPixel(element: PebElement, containerWidth: number): number | undefined {
  if (!isFlexibleHeightElement(element)) {
    const height = element.styles.dimension?.height;

    return isPixelSize(height) ? height?.value : undefined;
  }

  let height = isSection(element) ? PEB_MIN_SECTION_HEIGHT : PEB_MIN_ELEMENT_HEIGHT;

  const children = [...element.children ?? []];

  const nonBlocks = children.filter(elm => !isBlockOrInlinePosition(elm.styles.position));
  nonBlocks.forEach((child) => {
    const childTop = child.styles.position?.top;
    const childHeight = findElementHeightPixel(child, containerWidth);

    const sizes = calculatePebSizeToPixel([childTop, childHeight], 0);
    const bottom = sizes[0] + sizes[1];

    height = Math.max(height, bottom);
  });

  const blocks = children.filter(elm => isBlockOrInlinePosition(elm.styles.position));
  let blocksHeight = 0;
  if (blocks.length > 0) {
    calculateBlocksBBox(blocks, { minX: 0, minY: 0, maxX: containerWidth, maxY: 0 });
    blocksHeight = bboxDimension(findTotalArea(blocks)).height;
  }

  return Math.max(height, blocksHeight);
}

export function calculateBlocksBBox(
  elements: PebElement[],
  container: BBox,
  contentAlign: PebContentAlign = PebContentAlign.left,
  updates: ViewBBoxUpdates = {},
) {
  let { minX, minY } = container;
  let maxY = minY;
  const { width, height } = bboxDimension(container);

  let toAlign: PebElement[] = [];

  elements.forEach((element, idx) => {
    const position = element.styles.position;
    if (!isBlock(element)) {
      return;
    }
    const dimUpdate = dimensionUpdate(element.id, updates);
    const elementDim = dimUpdate
      ? dimUpdate.width
      : calculatePebSizeToPixel([element.styles.dimension?.width], width)[0];

    const elmWidth = isSection(element)
      ? width
      : elementDim;
    const elmHeight = dimUpdate
      ? dimUpdate.height
      : calculatePebSizeToPixel(
        [findElementHeightPixel(element, width) ?? element.styles?.dimension?.height],
        height,
      )[0];

    const isBreakLine = minX + elmWidth > container.maxX
      || isBlockPosition(position)
      || isBlockPosition(elements[idx - 1]?.styles?.position)
      || isSection(element);

    if (isBreakLine) {
      minX = container.minX;
      minY = maxY;

      applyContentAlign(toAlign, container, contentAlign);
      toAlign = [];
    }

    const bbox = { minX, minY, maxX: minX + elmWidth, maxY: minY + elmHeight };
    toAlign.push(element);
    setBBox(element, bbox);

    minX = bbox.maxX;
    maxY = Math.max(bbox.maxY, maxY);
  });

  applyContentAlign(toAlign, container, contentAlign);
}

function applyContentAlign(elements: PebElement[], container: BBox, contentAlign: PebContentAlign) {
  if (contentAlign === PebContentAlign.left) {
    return;
  }

  const containerWidth = bboxDimension(container).width;
  const elementsTotalWidth = bboxDimension(findTotalArea(elements)).width;
  const gap = containerWidth - elementsTotalWidth;

  if (gap === 0) {
    return;
  }

  const moveX = contentAlign === PebContentAlign.canter ? gap / 2 : gap;

  elements.forEach((elm) => {
    elm.minX += moveX;
    elm.maxX += moveX;
  });
}

const setBBox = (elm: PebElement, bbox: BBox): void => {
  if (elm) {
    elm.minX = bbox.minX;
    elm.maxX = bbox.maxX;
    elm.minY = bbox.minY;
    elm.maxY = bbox.maxY;
  }
};

export function applyDocumentBBoxUpdate(document: PebElement, updates: ViewBBoxUpdates) {
  const parent = {
    type: document.type,
    children: document.children,
    styles: {
      padding: PEB_DEFAULT_PADDING,
    },
    ...screenBBox(document.screen ?? PebDefaultScreens[PEB_ROOT_SCREEN_KEY]),
  } as PebElement;

  applyBBoxUpdateRecursive(parent, updates);
}

export function applyBBoxUpdateRecursive(parent: PebElement, updates: ViewBBoxUpdates) {
  const children = [...parent.children ?? []].filter(elm => elm.visible);

  if (!children.length) {
    return;
  }

  const originalElementPositions: { [id: string]: BBox } = {};
  children.forEach(elm => originalElementPositions[elm.id] = elementBBox(elm));

  const nonBlocks = children.filter(elm => !isBlock(elm));
  nonBlocks.forEach((elm) => {
    const dimUpdate = dimensionUpdate(elm.id, updates);

    if (dimUpdate) {
      elm.maxX = elm.minX + dimUpdate.width;
      elm.maxY = elm.minY + dimUpdate.height;
    }
  });

  const blocks = children.filter(elm => isBlock(elm));
  const container = paddingBBox(elementInnerSpace(parent), parent.styles.padding);
  const contentAlign = elementContentAlign(parent.styles);
  blocks?.length && calculateBlocksBBox(blocks, container, contentAlign, updates);
  const blocksTotalArea = findTotalArea(blocks);
  parent.maxY = Math.max(parent.maxY, blocksTotalArea.maxY);

  children.forEach(elm => translateChildrenRecursive(elm, originalElementPositions[elm.id]));

  children.forEach(elm => applyBBoxUpdateRecursive(elm, updates));
}

function translateChildrenRecursive(element: PebElement, originalBBox: BBox | undefined) {
  if (!element.children?.length || !originalBBox) {
    return;
  }

  const moveX = element.minX - originalBBox.minX;
  const moveY = element.minY - originalBBox.minY;

  if (moveX === 0 && moveY === 0) {
    return;
  }

  [...element.children].forEach((elm) => {
    const elmChildren = [...elm.children ?? []];
    const originalElementPositions: { [id: string]: BBox } = {};
    elmChildren.forEach(elmChild => originalElementPositions[elmChild.id] = elementBBox(elmChild));

    setBBox(elm, translateBBox(elm, moveX, moveY));

    elmChildren.forEach(
      elmChildren => translateChildrenRecursive(elmChildren, originalElementPositions[elmChildren.id])
    );
  });
}

const isBlock = (elm: PebElement) => isSection(elm) || isBlockOrInlinePosition(elm.styles.position);

function dimensionUpdate(id: string, updates: ViewBBoxUpdates): { width: number, height: number } | undefined {
  if (!id) {
    return undefined;
  }
  const update = updates[id];

  return update ? { width: update.width, height: update.height } : undefined;
}

type ViewBBoxUpdates = { [id: string]: { width: number; height: number } };
