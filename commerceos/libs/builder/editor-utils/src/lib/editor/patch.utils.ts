import { Draft } from 'immer';

import { PebElementDef, PebElementDefUpdate } from '@pe/builder/core';
import { PebLinkedList, PebLinkedValue, deserializeLinkedList, serializeLinkedList } from '@pe/builder/render-utils';


export function applyDefUpdates(
  draft: Draft<{ [id: string]: Partial<PebElementDef> }>,
  updates: PebElementDefUpdate[],
) {
  updates.forEach((update) => {
    const id = update.id;
    if (!draft[id]) {
      draft[id] = update;

      return;
    };

    applyDefUpdateRecursive(draft[id], update, '');
  });
}

function applyDefUpdateRecursive(
  receiver: Draft<any>,
  source: any,
  path: string,
) {
  Object.keys(source).forEach((key) => {
    const value = source[key];

    if (value === undefined) {
      delete receiver[key];
    } else if (isPlainObject(value) && receiver[key] !== undefined) {
      applyDefUpdateRecursive(receiver[key], value, path + '/' + key);
    } else {
      receiver[key] = value;
    }
  });
}

export function setIndexWithPatches<T extends PebLinkedValue>(
  list: PebLinkedList<T>,
  currentIndex: number,
  newIndex: number,
): { id: string, next: string | null, prev: string | null }[] {
  const item = [...list][currentIndex];

  const map = new Map();
  serializeLinkedList(list).forEach(({ id, next, prev }) => map.set(id, { next, prev }));
  
  list.deleteAt(currentIndex);
  list.insertAt(newIndex, item);

  return serializeLinkedList(list).filter(({ id, next, prev }) => {
    const item = map.get(id);

    return !item || item.next !== next || item.prev !== prev;
  }).map(({ id, next, prev }) => ({ id, next, prev }));
}

export function deleteWithPatches<T extends PebLinkedValue>(list: PebLinkedList<T>, index: number)
  : { id: string, next: any, prev: any }[] {
  const map = new Map();
  serializeLinkedList(list).forEach(({ id, next, prev }) => map.set(id, { next, prev }));

  list.deleteAt(index);

  return serializeLinkedList(list).filter(({ id, next, prev }) => {
    const item = map.get(id);

    return !item || item.next !== next || item.prev !== prev;
  }).map(({ id, next, prev }) => ({ id, next, prev }));
}

export function addWithPatches<T extends PebLinkedValue>(
  list: PebLinkedList<T> | undefined,
  newItem: Partial<T>,
  index?: number,
)
  : { id: string, next: any, prev: any }[] {
  const map = new Map();
  list = list ?? new PebLinkedList<T>();
  serializeLinkedList(list).forEach(({ id, next, prev }) => map.set(id, { next, prev }));

  index !== undefined ? list.insertAt(index, newItem as T) : list.add(newItem as T);

  return serializeLinkedList(list).filter(({ id, next, prev }) => {
    const item = map.get(id);

    return !item || item.next !== next || item.prev !== prev;
  }).map(({ id, next, prev }) => ({ id, next, prev }));
}

export function cloneLinkedList<T extends PebLinkedValue>(list: PebLinkedList<T> | undefined)
  : PebLinkedList<T> {
  return deserializeLinkedList(serializeLinkedList(list ?? new PebLinkedList<T>()));
}

const isPlainObject = (obj: any): boolean => {
  if (obj) {
    const prototype = Object.getPrototypeOf(obj);

    return prototype === Object.getPrototypeOf({}) || prototype === null;
  }

  return false;
};
