import { PebLinkedList, PebLinkedValue, serializeLinkedList } from '@pe/builder/render-utils';


export function getFilteredLinkedList<T extends PebLinkedValue>(
  linkedList: PebLinkedList<T> | undefined,
  callback: (item: T) => boolean,
): PebLinkedList<T> {
  if (!linkedList) {
    return new PebLinkedList<T>();
  }

  return createLinkedList([...linkedList].filter(callback));
}

export function createLinkedList<T extends PebLinkedValue>(items: T[]): PebLinkedList<T> {

  const linkedList = new PebLinkedList<T>();
  items.forEach(item => linkedList.add(item));

  return linkedList;
};


export function getLinkedListNextPrev<T extends PebLinkedValue>(linkedList: PebLinkedList<T> | undefined)
  : PebLinkedValue[] {
  if (!linkedList) {
    return [];
  }

  return serializeLinkedList(linkedList).map(item => ({ id: item.id, next: item.next, prev: item.prev }));
}
