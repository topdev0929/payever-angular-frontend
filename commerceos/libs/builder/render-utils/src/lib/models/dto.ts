import { Exclude, Expose, Transform } from 'class-transformer';
import Delta from 'quill-delta';
import { BBox } from 'rbush';

import {
  PebAnimation,
  PebDesign,
  PebElementDefData,
  PebElementDefMeta,
  PebElementStyles,
  PebElementType,
  PebIntegration,
  PebInteraction,
  PebLanguage,
  PebLink,
  PebMixSize,
  PebScreen,
  PebSize,
  PebUnit,
  PebValueByScreen,
} from '@pe/builder/core';

import { PebLinkedList } from './linked-list';

@Exclude()
export class PebElementDTO {
  @Expose() id = '';
  @Expose() type?: PebElementType;
  @Expose() index = 0;
  @Expose() styles?: PebValueByScreen<Partial<PebElementStyles>>;

  @Expose()
  @Transform(({ obj }) => getSiblings(obj).prev, { toPlainOnly: true })
  prev: string | null = null;

  @Expose()
  @Transform(({ obj }) => getSiblings(obj).next, { toPlainOnly: true })
  next: string | null = null;

  @Expose()
  @Transform(({ value }) => value ? { id: value.id, type: value.type } : undefined, { toPlainOnly: true })
  parent?: PebElementDTO;

  @Expose({ toClassOnly: true })
  children?: PebLinkedList<PebElementDTO>;

  @Expose() data?: PebElementDefData = undefined;
  @Expose() meta?: PebElementDefMeta = undefined;
  @Expose() context: any = undefined;
  @Expose() versionNumber = 0;
}

export function getSiblings(value: PebElementDTO) {
  const list = value.parent?.children;
  const siblings: { prev: string | null; next: string | null } = { prev: null, next: null };
  if (list) {
    const index = list.getIndex(value);
    const node = list.get(index);
    if (!node) {
      return siblings;
    }

    siblings.prev = node.prev?.value.id ?? null;
    siblings.next = node.next?.value.id ?? null;
  }

  return siblings;
}

/** Domain Model */
export class PebElement implements BBox {
  id = '';
  name?: string;
  index = 0;
  type?: PebElementType;
  animations?: { [key: string]: PebAnimation };
  design?: PebDesign;
  parent?: PebElement;
  children?: PebLinkedList<PebElement>;
  styles: Partial<PebElementStyles> = {};
  text?: Delta = undefined;
  visible?: boolean;
  next: string | null = null;
  prev: string | null = null;
  data?: PebElementDefData = undefined;
  meta?: PebElementDefMeta = undefined;
  original?: PebElement;
  link?: PebLink;
  integration?: PebIntegration;
  interactions?: { [id: string]: PebInteraction };
  master?: { isMaster?: boolean; page?: string; element?: string; };
  changeLog?: { version: number; }

  maxX = 0;
  maxY = 0;
  minX = 0;
  minY = 0;

  screen?: PebScreen;
  language?: PebLanguage;
}

export type PebLinkedValue = { id: string; next: string | null; prev: string | null; };

export function deserializeLinkedList<T extends PebLinkedValue>(values: T[]): PebLinkedList<T> {
  return new PebLinkedList<T>(values);
}

export function serializeLinkedList<T extends PebLinkedValue>(value: PebLinkedList<T>) {
  return value.serialize();
}

export function serializeLinkedListWithPatches<T extends PebLinkedValue>(
  value: PebLinkedList<T>,
  version: number,
  pathFromRoot = [],
  softDelete = true,
) {
  return value.serializeWithPatches(version, pathFromRoot, softDelete);
}

export const getPebSizeOrAuto = (val: PebMixSize): PebSize => getPebSize(val) ?? { value: 0, unit: PebUnit.Auto };

export const getPebSize = (val: PebMixSize): PebSize | undefined => {
  if (val === undefined) {
    return undefined;
  }

  if (typeof val === 'string') {
    if (val === 'auto') {
      return { value: 0, unit: PebUnit.Auto };
    }

    if (val === 'inherit') {
      return { value: 0, unit: PebUnit.Inherit };
    }

    if (val.endsWith('%')) {
      return { value: Number(val.replace('%', '')), unit: PebUnit.Percent };
    }

    if (val.endsWith('px')) {
      return { value: Number(val.replace('px', '')), unit: PebUnit.Pixel };
    }

    return { value: Number(val), unit: PebUnit.Pixel };
  }

  if (typeof val === 'object') {
    return val as PebSize;
  }

  if (typeof val === 'number') {
    return { value: val, unit: PebUnit.Pixel };
  }

  return undefined;
};

export function resolveRowAndColByIndex(index: number | undefined, rowsCount: number, colsCount: number)
  : { row: number, column: number } {
  if (!index || !colsCount || !rowsCount) {
    return { row: 0, column: 0 };
  }

  if (index < 0 || index >= colsCount * rowsCount) {
    return { row: -1, column: -1 };
  }

  const col = index % colsCount;
  const row = (index - col) / colsCount;

  return { row, column: col };
}
