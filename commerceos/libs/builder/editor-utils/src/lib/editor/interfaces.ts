import { BBox } from 'rbush';

import { PebViewElement } from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';

export interface PebScale {
  scaleX: number;
  scaleY: number;
  moveX: number;
  moveY: number;
}

export interface PebResizeDirection {
  s?: boolean;
  w?: boolean;
  n?: boolean;
  e?: boolean;
}

export interface PebResizeResult {
  resizedElement: PebElement;
  viewUpdates: PebViewUpdates;
  elementUpdates: PebElementUpdates;
}

export interface PebEditorLayoutCell {
  index: number,
  row: number,
  column: number,
  bbox: BBox;
}

export type PebElementUpdates = (Pick<PebElement, 'id'> & Partial<PebElement>)[];
export type PebViewUpdates = (Pick<PebElement, 'id'> & Partial<PebViewElement>)[];
export const isSideDirection = (d: PebResizeDirection): boolean =>
  +(d.e ?? false) + +(d.n ?? false) + +(d.s ?? false) + +(d.w ?? false) === 1;
