import { PebElementDef, pebGenerateId, PebPage, PebPageVariant } from '@pe/builder/core';
import { deserializeLinkedList, PebLinkedList, serializeLinkedList } from '@pe/builder/render-utils';

export interface PebPageListItem {
  id: string;
  name: string;
  preview: string;
  variant: PebPageVariant;
  active: boolean;
  master: { isMaster: boolean };
  page: PebPage;
  parentId?: string;
  prev?: string;
  next?: string;
  parent?: PebPageListItem;
  children?: PebPageListItem[];
}

export interface PebPageListItemFlat {
  id: string;
  level: number;
  expandable: boolean;
  name: string;
  preview: string;
  active: boolean;
}

export interface PebElementDefWithChildren extends PebElementDef {
  children: PebLinkedList<PebElementDefWithChildren>;
}

export const cloneElementsTree = (value: PebElementDef[]): PebElementDef[] => {
  /** Elements definitions array to map for quick access by id. */
  const defs = new Map<string, PebElementDefWithChildren>(value.map(def => [def.id, {
    ...def,
    children: new PebLinkedList<PebElementDefWithChildren>(),
    versionNumber: undefined,
  }]));

  let root: PebElementDefWithChildren;

  defs.forEach((def) => {
    if (!def.parent) {
      root = def;
    }
    const parent = defs.get(def.parent?.id);

    /** prevent circular references in the list */
    const unique = new Set<string>();

    if (parent?.children?.length === 0) {
      let next = def;
      while (next && !unique.has(next.id)) {
        unique.add(next.id);
        parent.children.add(next);
        next = defs.get(next.next);
      }

      let prev = defs.get(def.prev);
      while (prev && !unique.has(prev.id)) {
        unique.add(prev.id);
        parent.children.prepend(prev);
        prev = defs.get(prev.prev);
      }
    }
  });

  const clone = cloneElementDef(root);

  return elementDefTreeToArray(clone);
};

const cloneElementDef = (def: PebElementDefWithChildren): PebElementDefWithChildren => {
  const id = pebGenerateId();
  const clone: PebElementDefWithChildren = {
    ...def,
    id,
    children: new PebLinkedList<PebElementDefWithChildren>(),
  };

  for (const child of def.children) {
    clone.children.add({ ...cloneElementDef({ ...child, parent: { id: clone.id, type: clone.type } }) });
  }

  clone.children = deserializeLinkedList(serializeLinkedList(clone.children));

  return clone;
};

const elementDefTreeToArray = (elm: PebElementDefWithChildren, acc: PebElementDef[] = []): PebElementDef[] => {
  const { children, ...def } = elm;
  acc.push(def);
  for (const e of children) {
    elementDefTreeToArray(e, acc);
  }

  return acc;
};
