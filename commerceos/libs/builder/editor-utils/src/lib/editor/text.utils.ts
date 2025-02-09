import Delta, { Op } from 'quill-delta';

import { PebTextJustify, PebTextStyles } from '@pe/builder/core';
import { PebElement, isText } from '@pe/builder/render-utils';

export function extractElementTextStyles(element: PebElement): Partial<PebTextStyles> {
  return {
    ...extractDeltaTextStyles(element.text),
    ...element.styles.textStyles,
  };
}


export function extractDeltaTextStyles(text: Delta | undefined): Partial<PebTextStyles> {
  if (!text) {
    return {};
  }

  let res: any = {};
  text.ops.forEach((op) => {
    if (op.attributes) {
      Object.entries(op.attributes).forEach(([key, val]) => {
        if (key === 'align') {
          res.textJustify = val as PebTextJustify;
        } else {
          res[key] = val;
        }
      });

      res = { ...res, ...op.attributes };
    }
  });

  return res;
}

export function hasTextAttribute(text: Delta | undefined, attribute: string): boolean {
  const key = toDeltaAttribute(attribute);

  return text?.ops?.some(op => op.attributes && op.attributes[key] !== undefined) ?? false;
}

export function isDeltaEqual(text: Delta | undefined, text2: Delta | undefined): boolean {
  if (!text && !text2) {
    return true;
  }

  return JSON.stringify(text) === JSON.stringify(text2);
}

export function removeTextAttribute(text: Delta | undefined, attributes: string | string[])
  : Delta | undefined {
  if (!text?.ops) {
    return text;
  }
  const toRemove = (Array.isArray(attributes) ? attributes : [attributes]).map(attr => toDeltaAttribute(attr));

  const ops: Op[] = [];

  text.ops.forEach((originalOp) => {
    const op: any = { ...originalOp };

    if (op.attributes) {
      toRemove.forEach(key => op.attributes = objectWithoutKey(op.attributes, key));
    }

    ops.push(op);
  });

  return { ops } as Delta;
}

export function isAutoWidthText(element: PebElement): boolean {
  return isText(element) && !element.styles.textStyles?.fixedWidth;
}

export function isAutoHeightText(element: PebElement): boolean {
  return isText(element) && !element.styles.textStyles?.fixedHeight;
}

export function isDeltaEmpty(delta: Delta | undefined) {
  if (!delta?.ops?.length) {
    return true;
  }
  for (const op of delta.ops) {
    const insert = op.insert as string;
    if (insert && insert !== '\n') {
      return false;
    }
  }

  return true;
}

const toDeltaAttribute = (attribute: string): string => {
  return attribute === 'textJustify' ? 'align' : attribute;
};

const objectWithoutKey = (object: any, key: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [key]: deletedKey, ...otherKeys } = object;

  return otherKeys;
};
