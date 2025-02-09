import Delta from 'quill-delta';

import { PebDefaultTextStyles, PebTextJustify, PebTextSelectionStyles, PebTextStyles } from '@pe/builder/core';


export const hasLinks = (text: Delta) => {
  return text.filter(op => op.attributes?.link as any).length;
};

export const getTextStyle = (text: Delta[]) => {  
  const format = text.map(delta => delta.ops.reduce((acc, op) => {
    const newLine = op.insert && typeof op.insert === 'string' && op.insert.match(/^\n/g);
    const { align, ...attributes } = op.attributes ?? {};

    const normalized: Partial<PebTextStyles> = newLine
      ? { ...attributes, textJustify: align as PebTextJustify ?? PebDefaultTextStyles.textJustify }
      : { ...attributes };

    Object.entries(normalized).forEach(([key, value]) => {
      if (acc[key] !== undefined) {
        if (Array.isArray(acc[key])) {
          if (acc[key].every(el => !compareObjects(el, value))) {
            acc[key].push(value);
          }
        } else if (!Array.isArray(acc[key]) && !compareObjects(acc[key], value)) {
          acc[key] = [acc[key], value];
        }
      } else {
        acc[key] = value;
      }
    });

    return acc;
  }, {}));

  const styles = {} as Partial<PebTextSelectionStyles>;
  format.forEach((s) => {
    Object.entries(s).forEach(([key, val]) => {
      if (styles[key] !== undefined) {
        const styleValue = Array.isArray(styles[key]) ? styles[key] : [styles[key]];
        const valueValue = Array.isArray(val) ? val : [val];
        const set = [...new Set([...styleValue, ...valueValue])];
        styles[key] = set.length === 1 ? set[0] : set;
      } else {
        styles[key] = val;
      }
    });
  });

  return styles;
};

export const compareObjects = (obj1, obj2) => {
  if (typeof obj1 === 'object' && typeof obj2 === 'object' && obj1 !== obj2) {
    const keys = Object.keys(obj1);
    if (keys.length > Object.keys(obj2).length) {
      return false;
    }

    return keys.every(key => compareObjects(obj1[key], obj2[key]));
  }

  return obj1 === obj2;
};
