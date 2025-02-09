import {
  PebContentAlign,
  PebElementDef,
  PebElementStyles,
  PebElementType,
  PebLayoutType,
  PebMap,
  PebRenderElementModel,
  PebUnit,
  isAutoSize,
  isBlockOrInlinePosition,
  isPercentSize,
  isPixelSize,
  textJustifyToContentAlignMap,
} from '@pe/builder/core';

import { PebElement } from './dto';

type Element = PebElement | PebElementDef | PebRenderElementModel;

export const isReadonly = (elm?: PebElement) => elm && (elm.master?.element || elm.master?.isMaster || elm.original);

export const isDocument: (elm?: Element) => boolean = elm =>
  elm?.type === PebElementType.Document;

export const isGridElement: (elm?: PebElement | PebElementDef) => boolean = elm => elm?.type === PebElementType.Grid;

export const isVector: (elm?: PebElement | PebElementDef) => boolean = elm => elm?.type === PebElementType.Vector;

export const isSection: (elm?: Element) => boolean = elm =>
  elm?.type === PebElementType.Section;

export const isOutPage: (elm?: Element) => boolean = elm =>
  elm?.parent?.type === PebElementType.Document && elm?.type !== PebElementType.Section;

export const isText: (elm?: PebElement | PebElementDef) => boolean = elm => elm?.type === PebElementType.Text;

export const isShape: (elm?: PebElement | PebElementDef) => boolean = elm => elm?.type === PebElementType.Shape;

export const isMasterElement: (elm?: PebElement) => boolean = elm => elm?.master?.isMaster === true;

export const hasGridLayout = (elm: PebElement): boolean => elm?.styles?.layout?.type === PebLayoutType.Grid;

export const isPlainObject = (obj: any): boolean => {
  if (obj) {
    const prototype = Object.getPrototypeOf(obj);

    return prototype === Object.getPrototypeOf({}) || prototype === null;
  }

  return false;
};

export const clonePlainObject = <T = object>(obj: T): T => {
  if (isPlainObject(obj)) {
    let cloned: any = { ...obj };
    Object.entries(cloned).forEach(([key, value]) => {
      if (isPlainObject(value)) {
        cloned[key] = clonePlainObject(value);
      }
    });

    return cloned;
  }

  return obj;
};

/** clone and set new uuid */
export function cloneElementDef(value: PebElementDef, root?: boolean): PebElementDef;
export function cloneElementDef(value: PebElementDef[], root?: boolean): PebElementDef[];
export function cloneElementDef(value: any, root?: boolean) {
  const isArray = Array.isArray(value);
  const elements = isArray ? value : [value];

  const cloned = elements.map((elm: PebElementDef) => {
    const styles = Object.keys(elm.styles).reduce((acc, key) => {
      acc[key] = clonePlainObject(elm.styles[key]);

      if (root) {
        acc[key].position = {
          ...acc[key].position,
          left: { value: 0, unit: PebUnit.Pixel },
          top: { value: 0, unit: PebUnit.Pixel },
        };

        delete acc[key].left;
        delete acc[key].top;
      }

      return acc;
    }, {} as any);

    const clone: PebElementDef = {
      ...elm,
      styles,
      data: clonePlainObject(elm.data),
      parent: root ? undefined : elm.parent,
    };

    return clone;
  });

  return isArray ? cloned : cloned[0];
}

export function isFlexibleHeightElement(element: PebElement): boolean {
  const { dimension, position } = element.styles;

  if (isText(element)) {
    if (isAutoSize(dimension?.height) || isBlockOrInlinePosition(position)) {
      return true;
    }
  }

  if (!isAutoSize(dimension?.height)) {
    return false;
  }

  if (isSection(element) || !position) {
    return true;
  }

  return isPixelSize(position.top) && !isPercentSize(position.bottom) && !isPixelSize(position.bottom);
}

export function flattenELements(elm: PebRenderElementModel): PebMap<PebRenderElementModel> {
  const map = {};
  flattenElementsRecursive(elm, map);

  return map;
}

export function elementContentAlign(styles: Partial<PebElementStyles> | undefined): PebContentAlign {
  const textJustify = styles?.textStyles?.textJustify ?? PebContentAlign.left;

  return textJustifyToContentAlignMap[textJustify] ?? PebContentAlign.left;
}

function flattenElementsRecursive(element: PebRenderElementModel, map: { [id: string]: PebRenderElementModel }) {
  map[element.id] = element;
  element.children.forEach(elm => flattenElementsRecursive(elm, map));
}
