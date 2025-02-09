import { PebDesignType, PebElementType } from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';

export class PebSelectionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PebSelectionError';
  }
}

/**
 * Find all elements which belongs to selected groups
 * @param elements
 * @param openGroup
 */
export const findGroupedElements = (elements: PebElement[], openGroup?: string) => {
  return elements.reduce((acc, elm) => {
    if (elm.data?.groupId?.length) {
      const groupId = openGroup
        ? elm.data.groupId[Math.max(elm.data.groupId.indexOf(openGroup) - 1, 0)]
        : elm.data.groupId.slice(-1).pop();

      if (!acc.has(groupId)) {
        const siblings = [...elm.parent?.children].filter(elm => elm.data.groupId?.includes(groupId));
        acc.set(groupId, siblings);
      }
    }

    return acc;
  }, new Map<string, PebElement[]>());
};

export const isGridElement = (value?: any): value is PebElement & { type: PebElementType.Grid } => {
  return value && value.type === PebElementType.Grid;
};

export function isContextGrid(elm: any): boolean {
  return elm?.design?.type === PebDesignType.ContextTable;
}

export interface PebSelectionPosition {
  x: number;
  y: number;
}

export interface PebSelectionDimensions {
  width: number;
  height: number;
}

export interface PebSelectionBounding {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export type PebSelectionBBox = PebSelectionPosition & PebSelectionDimensions & PebSelectionBounding;

export const isSelectionPosition = (value: Partial<PebSelectionBBox>): value is PebSelectionPosition => {
  return value.x !== undefined && value.y !== undefined;
};

export const isSelectionDimensions = (value: Partial<PebSelectionBBox>): value is PebSelectionDimensions => {
  return value.width !== undefined && value.height !== undefined;
};

export const isSelectionBounding = (value: Partial<PebSelectionBBox>): value is PebSelectionBounding => {
  return value.left !== undefined
    && value.top !== undefined
    && value.right !== undefined
    && value.bottom !== undefined;
};

