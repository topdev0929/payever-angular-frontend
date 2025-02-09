import { BBox } from 'rbush';

import { PebElementType } from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';

/**
 * Anchor types to choose appropriate event handler
 */
export enum PebAnchorType {
  N = 'n',
  NW = 'nw',
  W = 'w',
  SW = 'sw',
  S = 's',
  SE = 'se',
  E = 'e',
  NE = 'ne',
  EW = 'ew',
  NS = 'ns',
  Move = 'move',
  ColResize = 'col-resize',
  RowResize = 'row-resize',
  ColSelect = 'col-select',
  RowSelect = 'row-select',
  Radius = 'radius',
}

/**
 * Available CSS cursor types for anchors to set on document when interacting with anchor
 */
export enum CursorType {
  Default = 'default',
  Auto = 'auto',
  Text = 'text',
  Cell = 'cell',
  Pointer = 'pointer',
  Move = 'move',
  NotAllowed = 'not-allowed',
  Grab = 'grab',
  Grabbing = 'grabbing',
  Crosshair = 'crosshair',
  ColResize = 'col-resize',
  RowResize = 'row-resize',
  N_Resize = 'n-resize',
  E_Resize = 'e-resize',
  S_Resize = 's-resize',
  W_Resize = 'w-resize',
  NE_Resize = 'ne-resize',
  NW_Resize = 'nw-resize',
  SE_Resize = 'se-resize',
  SW_Resize = 'sw-resize',
  EW_Resize = 'ew-resize',
  NS_Resize = 'ns-resize',
  NESW_Resize = 'nesw-resize',
  NWSE_Resize = 'nwse-resize',
}

/**
 * Interface for anchors to use in RTree
 */
export interface PeAnchorType extends BBox {
  type: PebAnchorType;
  cursor: CursorType;
  selected?: boolean;
  index?: number;
}

/**
 * Minimal size of element to render middle anchor on the edges
 */
export const THREE_ANCHORS_MIN_SIZE = 20;

/**
 * Create appropriate bounding box for anchors
 */
export function anchorRect(x: number, y: number, scale: number, radius: number): BBox;
export function anchorRect(x: number, y: number, scale: number, width: number, height: number): BBox;
export function anchorRect(...args: number[]): BBox {
  const [x, y, scale, w, h] = args;
  const hw = (h ? w / 2 : w) / scale;
  const hh = (h ? h / 2 : w) / scale;

  return {
    minX: x - hw,
    minY: y - hh,
    maxX: x + hw,
    maxY: y + hh,
  };
}

/** Type guard for event target */
export function isAnchor(item: PebElement | PeAnchorType): item is PeAnchorType {
  return !Object.values(PebElementType).includes(item.type as any);
}
