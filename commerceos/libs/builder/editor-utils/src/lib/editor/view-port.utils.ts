import { BBox } from 'rbush';

import { PEB_DEFAULT_VIEWPORT, PebEditorViewport } from '@pe/builder/core';
import { PebElement, isSection } from '@pe/builder/render-utils';

import { bboxDimension, findTotalArea } from './bbox.utils';


export function calculateViewPort(
  elements: PebElement[],
  scale: number,
  container: { width: number, height: number },
): PebEditorViewport {

  const sections = elements.filter(elm => isSection(elm) && elm.visible);

  if (sections.length === 0) {
    return PEB_DEFAULT_VIEWPORT;
  }

  const pageArea = findTotalArea(sections);
  const totalArea = findTotalArea(elements);

  return calculateViewPortByArea(pageArea, totalArea, scale, container);
}


export function calculateViewPortByArea(
  pageArea: BBox,
  totalArea: BBox,
  scale: number,
  container: { width: number, height: number },
): PebEditorViewport {

  const pageDim = bboxDimension(pageArea);
  const pageWidth = pageDim.width * scale;
  const pageHeight = pageDim.height * scale;

  const totalAreaDim = bboxDimension(totalArea);
  const totalAreaWidth = totalAreaDim.width * scale;
  const totalAreaHeight = totalAreaDim.height * scale;

  const width = container.width * 2 + totalAreaWidth;
  const height = container.height * 2 + totalAreaHeight;
  const offsetX = -totalArea.minX * scale;
  const offsetY = -totalArea.minY * scale;

  return {
    width,
    height,
    offsetX,
    offsetY,
    containerWidth: container.width,
    containerHeight: container.height,
    page: {
      width: pageWidth,
      height: pageHeight,
      originalWidth: pageDim.width,
      originalHeight: pageDim.height,
    },
    totalArea,
    scale,
  };
}


export function moveContentCenter(viewport: PebEditorViewport): PebEditorViewport {
  const dim = bboxDimension(viewport.totalArea);
  const { scale, width, height, totalArea } = viewport;
  const offsetX = (width - dim.width * scale) / 2 - totalArea.minX * scale;
  const offsetY = (height - dim.height * scale) / 2 - totalArea.minY * scale;

  return {
    ...viewport,
    offsetX,
    offsetY,
  };
}

export function calculateMountScroll(
  viewport: PebEditorViewport,
  bboxPoint: { x: number, y: number },
  clientPoint: { clientX: number; clientY: number },
): { scrollLeft: number, scrollTop: number } {
  const scrollLeft = viewport.offsetX + bboxPoint.x * viewport.scale - clientPoint.clientX;
  const scrollTop = viewport.offsetY + bboxPoint.y * viewport.scale - clientPoint.clientY;

  return { scrollLeft, scrollTop };
}

export function scaleViewport(viewport: PebEditorViewport, scale: number): PebEditorViewport {

  const { totalArea, containerWidth, containerHeight } = viewport;

  const totalAreaDim = bboxDimension(totalArea);
  const totalAreaWidth = totalAreaDim.width * scale;
  const totalAreaHeight = totalAreaDim.height * scale;

  const width = containerWidth * 2 + totalAreaWidth;
  const height = containerHeight * 2 + totalAreaHeight;

  const offsetX = (width - totalAreaWidth) / 2 - totalArea.minX * scale;
  const offsetY = (height - totalAreaHeight) / 2 - totalArea.minY * scale;

  return {
    width,
    height,
    offsetX,
    offsetY,
    containerWidth,
    containerHeight,
    page: {
      width: viewport.page.originalWidth * scale,
      height: viewport.page.originalHeight * scale,
      originalWidth: viewport.page.originalWidth,
      originalHeight: viewport.page.originalHeight,
    },
    totalArea,
    scale,
  };

}

export function panViewport(state: ViewPortState, move: { moveX: number, moveY: number }): ViewPortState {
  return {
    ...state,
    scrollLeft: state.scrollLeft - move.moveX,
    scrollTop: state.scrollTop - move.moveY,
  };
}

export function getBBoxPointer(
  viewport: PebEditorViewport,
  scroll: { scrollLeft: number, scrollTop: number },
  clientPointer: { clientX: number, clientY: number },
): { x: number, y: number } {
  const x: number = (clientPointer.clientX + scroll.scrollLeft - viewport.offsetX) / viewport.scale;
  const y: number = (clientPointer.clientY + scroll.scrollTop - viewport.offsetY) / viewport.scale;

  return { x, y };
}

export interface ViewPortState {
  scale: number;
  scrollLeft: number;
  scrollTop: number;
  width: number;
  height: number;
  top: number;
  left: number;
}
