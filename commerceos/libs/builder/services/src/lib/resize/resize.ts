import { BBox } from 'rbush';
import { applyToPoints, Matrix, scale } from 'transformation-matrix';

import { PebElementType, PebScreen } from '@pe/builder/core';
import { findTotalArea, splitGrid } from '@pe/builder/editor-utils';
import { isAnchor, PebAnchorType, PebEvent } from '@pe/builder/events';
import { PebElement } from '@pe/builder/render-utils';


export const intersects = (elm: BBox, area: BBox) => {
  return elm.maxX > area.minX && elm.minX < area.maxX && elm.maxY > area.minY && elm.minY < area.maxY;
};

export const filterElements = (elements: PebElement[], selected: PebElement[]) => {
  return elements.filter(elm => elm.visible && !selected.some(e => e.id === elm.id));
};

export const resizeDirection = (event: PebEvent) => {
  if (!isAnchor(event.target)) {
    return { s: false, e: false, n: false, w: false };
  }

  return {
    s: [PebAnchorType.SW, PebAnchorType.S, PebAnchorType.SE, PebAnchorType.NS].includes(event.target.type),
    w: [PebAnchorType.NW, PebAnchorType.W, PebAnchorType.SW].includes(event.target.type),
    n: [PebAnchorType.NW, PebAnchorType.N, PebAnchorType.NE].includes(event.target.type),
    e: [PebAnchorType.NE, PebAnchorType.E, PebAnchorType.SE, PebAnchorType.EW].includes(event.target.type),
  };
};

export const applyMatrix = <T extends BBox>(bbox: T, matrix: Matrix): BBox => {
  const [[minX, minY], [maxX, maxY]] = applyToPoints(matrix, [[bbox.minX, bbox.minY], [bbox.maxX, bbox.maxY]]);

  return { minX, minY, maxX, maxY };
};

export const intersectSearchAreas = (prev: BBox, next: BBox): { [key in keyof BBox]: BBox } => {
  return {
    minX: {
      minX: next.minX,
      minY: prev.minY,
      maxX: prev.minX,
      maxY: prev.maxY,
    },
    minY: {
      minX: prev.minX,
      minY: next.minY,
      maxX: prev.maxX,
      maxY: prev.minY,
    },
    maxX: {
      minX: prev.maxX,
      minY: prev.minY,
      maxX: next.maxX,
      maxY: prev.maxY,
    },
    maxY: {
      minX: prev.minX,
      minY: prev.maxY,
      maxX: prev.maxX,
      maxY: next.maxY,
    },
  };
};

export const getScale = (elements, sx, sy, cx, cy) => {
  let scaleX = Math.max(sx, 0);
  let scaleY = Math.max(sy, 0);

  const matrix = scale(scaleX, scaleY, cx, cy);
  const selection = findTotalArea(elements);
  const scaled = applyMatrix(selection, matrix);

  elements.forEach((element) => {
    const elm = applyMatrix(element, matrix);

    const children = filterElements([...element.children], elements);
    const inner = element.type === PebElementType.Grid
      ? { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
      : findTotalArea(children);

    const isSection = element.parent.type === PebElementType.Section && !element.parent.data?.fullWidth;
    const parent = {
      minX: isSection ? element.parent.styles.left : element.parent.minX,
      minY: element.parent.minY,
      maxX: isSection ? element.parent.styles.left + element.parent.styles.width : element.parent.maxX,
      maxY: element.parent.maxY,
    };

    const search = intersectSearchAreas(element, elm);

    const siblings = filterElements([...element.parent.children], elements).filter(e => e.type !== PebElementType.Section);
    const outer = {
      minX: Math.max(parent.minX, ...siblings.filter(e => intersects(e, search.minX)).map(({ maxX }) => maxX)),
      minY: Math.max(parent.minY, ...siblings.filter(e => intersects(e, search.minY)).map(({ maxY }) => maxY)),
      maxX: Math.min(parent.maxX, ...siblings.filter(e => intersects(e, search.maxX)).map(({ minX }) => minX)),
      maxY: Math.min(parent.maxY, ...siblings.filter(e => intersects(e, search.maxY)).map(({ minY }) => minY)),
    };

    let minWidth = 1;
    let minHeight = 1;
    if (element.type === PebElementType.Grid) {
      minWidth = 10 * element.styles.gridTemplateColumns.length;
      minHeight = 10 * element.styles.gridTemplateRows.length;
    }

    const bbox = {
      minX: Math.max(Math.min(elm.minX, inner.minX, elm.maxX - minWidth), outer.minX),
      minY: Math.max(Math.min(elm.minY, inner.minY, elm.maxY - minHeight), outer.minY),
      maxX: Math.min(Math.max(elm.maxX, inner.maxX, elm.minX + minWidth), outer.maxX),
      maxY: Math.min(Math.max(elm.maxY, inner.maxY, elm.minY + minHeight), outer.maxY),
    };

    if (scaled.minX !== selection.minX && scaled.maxX === selection.maxX) {
      let s = (selection.maxX - bbox.minX) / (selection.maxX - element.minX);

      if (elm.maxX < bbox.maxX && selection.maxX !== element.maxX) {
        s = Math.min(s, (selection.maxX - bbox.maxX) / (selection.maxX - element.maxX));
      }

      if (scaleX !== 1) {
        scaleX = sx < 1 ? Math.max(scaleX, s) : Math.min(scaleX, s);
      }
    }

    if (scaled.minY !== selection.minY && scaled.maxY === selection.maxY) {
      let s = (selection.maxY - bbox.minY) / (selection.maxY - element.minY);

      if (elm.maxY < bbox.maxY && selection.maxY !== element.maxY) {
        s = Math.min(s, (selection.maxY - bbox.maxY) / (selection.maxY - element.maxY));
      }

      if (scaleY !== 1) {
        scaleY = sy < 1 ? Math.max(scaleY, s) : Math.min(scaleY, s);
      }
    }

    if (scaled.maxX !== selection.maxX && scaled.minX === selection.minX) {
      let s = (bbox.maxX - selection.minX) / (element.maxX - selection.minX);

      if (elm.minX > bbox.minX && selection.minX !== element.minX) {
        s = Math.min(s, (bbox.minX - selection.minX) / (element.minX - selection.minX));
      }

      if (scaleX !== 1) {
        scaleX = sx < 1 ? Math.max(scaleX, s) : Math.min(scaleX, s);
      }
    }

    if (scaled.maxY !== selection.maxY && scaled.minY === selection.minY) {
      let s = (bbox.maxY - selection.minY) / (element.maxY - selection.minY);

      if (elm.minY > bbox.minY && selection.minY !== element.minY) {
        s = Math.min(s, (bbox.minY - selection.minY) / (element.minY - selection.minY));
      }

      if (scaleY !== 1) {
        scaleY = sy < 1 ? Math.max(scaleY, s) : Math.min(scaleY, s);
      }
    }
  });

  return { x: scaleX, y: scaleY };
};

export const scalePayload = (elements: PebElement[], screen: PebScreen, submit = false) => {
  return elements.reduce((acc, elm) => {
    if (elm.parent?.type === PebElementType.Grid) {
      return acc;
    }

    const parent = getParentBBox(elm, screen, submit);

    if (elm.type === PebElementType.Grid) {
      acc.push({
        id: elm.id,
        styles: {
          left: elm.minX - parent.minX,
          top: elm.minY - parent.minY,
          width: elm.maxX - elm.minX,
          height: elm.maxY - elm.minY,
          gridTemplateColumns: splitGrid(
            elm.styles.gridTemplateColumns,
            elm.styles.gridTemplateColumns.length,
            elm.maxX - elm.minX,
          ),
          gridTemplateRows: splitGrid(
            elm.styles.gridTemplateRows,
            elm.styles.gridTemplateRows.length,
            elm.maxY - elm.minY,
          ),
        },
      });
    } else if (elm.type === PebElementType.Section) {
      acc.push({
        id: elm.id,
        styles: {
          height: elm.maxY - elm.minY,
        },
      });
    } else {
      acc.push({
        id: elm.id,
        styles: {
          left: elm.minX - parent.minX,
          top: elm.minY - parent.minY,
          width: elm.maxX - elm.minX,
          height: elm.maxY - elm.minY,
        },
      });
    }

    if (elm.type === PebElementType.Text) {
      acc.push({
        id: elm.id,
        data: {
          textAutosize: elm.data.textAutosize,
        },
      });
    }

    if (![PebElementType.Grid, PebElementType.Text].includes(elm.type)) {
      const children = filterElements([...elm.children], elements);
      children.forEach((child) => {
        const padding = child.parent?.type === PebElementType.Section
          ? screen.padding
          : 0;

        acc.push({
          id: child.id,
          styles: {
            left: child.minX - elm.minX - padding,
            top: child.minY - elm.minY,
          },
        });
      });
    }

    return acc;
  }, []);
};

export const getParentBBox = (elm: PebElement, screen: PebScreen, submit = false): BBox => {
  const parent = elm.parent;
  const padding = elm.styles.padding?.left ?? 0;

  return {
    minX: parent.minX - padding,
    minY: parent.minY,
    maxX: parent.maxX + padding,
    maxY: parent.maxY,
  };
};

export const sum = (values: number[]): number => {
  return values.reduce((acc, c) => acc + c, 0);
};
