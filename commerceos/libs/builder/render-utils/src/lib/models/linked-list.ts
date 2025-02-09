import { castDraft, enablePatches, Patch, produceWithPatches } from 'immer';

import { PebLinkedValue } from './dto';


enablePatches();

export class PebLinkedListNode<T extends PebLinkedValue> {
  prev: PebLinkedListNode<T> | null = null;
  next: PebLinkedListNode<T> | null = null;

  constructor(public value: T) {
  }
}

export class PebLinkedList<T extends PebLinkedValue> implements Iterable<T> {
  head: PebLinkedListNode<T> | null = null;
  tail: PebLinkedListNode<T> | null = null;
  length = 0;

  /** use object as immer do not support Map by default  */
  private readonly values: { [key: string]: T } = {};

  * [Symbol.iterator](): Iterator<T> {
    for (let current = this.head; current !== null; current = current.next) {
      yield current.value;
    }
  }

  constructor(values?: T[]) {
    if (values) {
      /** prevent circular references in the list (old themes) */
      const unique = new Set<T>();

      let node = values.find(item => item.prev === null);
      while (node && !unique.has(node)) {
        this.add(node);
        unique.add(node);
        this.values[node.id] = node;
        node = values.find(item => node?.next && item.id === node.next);
      }
    }
  }

  serialize() {
    const values: T[] = [];
    let node = this.head;

    while (node) {
      const prev = node.prev?.value.id ?? null;
      const next = node.next?.value.id ?? null;
      /** keep object references if not changed */
      if (node.value.prev !== prev || node.value.next !== next) {
        values.push({ ...node.value, prev, next });
      } else {
        values.push(node.value);
      }
      node = node.next;
    }

    return values;
  }

  serializeWithPatches(version: number, pathFromRoot = [], softDelete = true): [T[], Patch[], Patch[]] {
    const list = this.serialize();

    const changed = new Map(list.filter(item => this.values[item.id] !== item).map(item => [item.id, item]));
    const added = new Map(list.filter(item => this.values[item.id] === undefined).map(item => [item.id, item]));
    const deleted = new Map(Object.values(this.values)
      .filter(item => !list.some(v => item.id === v.id))
      .map(item => [item.id, item])
    );

    const [state, patches, inversePatches] = produceWithPatches(this.values, (draft) => {
      added.forEach((item) => {
        draft[item.id] = castDraft({ ...item, versionNumber: version });
      });

      deleted.forEach((item) => {
        if (softDelete) {
          (draft[item.id] as any).deleted = true;
          (draft[item.id] as any).versionNumber = version;
        } else {
          delete draft[item.id];
        }
      });

      changed.forEach((item) => {
        Object.entries(item).forEach(([key, value]) => {
          (draft[item.id] as any)[key] = value;
        });

        draft[item.id].prev = item.prev;
        draft[item.id].next = item.next;
        (draft[item.id] as any).versionNumber = version;
      });
    });

    return [
      list.map(({ id }) => state[id]),
      patches.map(patch => ({ ...patch, path: [...pathFromRoot, ...patch.path] })),
      inversePatches.map(patch => ({ ...patch, path: [...pathFromRoot, ...patch.path] })),
    ];
  }

  add = (value: T): PebLinkedListNode<T> => {
    const node = new PebLinkedListNode(value);
    if (this.length === 0) {
      this.head = node;
      this.tail = node;
    } else {
      if (!this.tail) {
        throw new Error();
      }
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }

    this.length += 1;

    return node;
  };

  prepend = (value: T): PebLinkedListNode<T> => {
    const node = new PebLinkedListNode(value);
    if (this.length === 0) {
      this.head = node;
      this.tail = node;
    } else {
      if (!this.head){
        throw new Error();
      }
      this.head.prev = node;
      node.next = this.head;
      this.head = node;
    }

    this.length += 1;

    return node;
  };

  get(index: number): PebLinkedListNode<T> | undefined {
    if (index < 0 || index >= this.length) {
      return undefined;
    }

    let node = this.head;

    for (let i = 0; i < index; i++) {
      if (!node) {
        throw new Error();
      }
      node = node.next;
    }

    return node ?? undefined;
  }

  getIndex(value: T): number {
    let node = this.head;
    let index = 0;
    while (node && node?.value !== value) {
      node = node.next;
      index += 1;
    }

    return node ? index : -1;
  }

  findIndex(fn: (val: T) => boolean): number {
    let node = this.head;
    let index = 0;
    while (node && !fn(node.value)) {
      node = node.next;
      index += 1;
    }

    return node ? index : -1;
  }

  contains(value: T): boolean {
    let node = this.head;
    while (node && node?.value !== value) {
      node = node.next;
    }

    return node !== null;
  }

  delete(value: T) {
    const index = this.getIndex(value);

    if (index !== -1) {
      return this.deleteAt(index);
    }

    return undefined;
  }

  insertAt(index: number, value: T) {
    if (index < 0 || index > this.length) {
      return undefined;
    }

    if (index === 0) {
      return this.prepend(value);
    }

    if (index === this.length) {
      return this.add(value);
    }

    const node = new PebLinkedListNode(value);
    const before = this.get(index - 1);

    if (!before?.next) {
      throw new Error();
    }
    node.prev = before;
    before.next.prev = node;
    node.next = before.next;
    before.next = node;

    this.length += 1;

    return node;
  }

  deleteAt(index: number) {
    if (index < 0 || index > this.length) {
      return undefined;
    }

    if (index === 0) {
      return this.shift();
    }

    if (index === this.length - 1) {
      return this.pop();
    }

    const before = this.get(index - 1);
    if (!before?.next) {
      throw new Error();
    }
    const node = before.next;

    before.next = node.next;
    if (before.next) {
      before.next.prev = before;
    }
    node.next = null;

    this.length -= 1;

    return node;
  }

  public shift(): PebLinkedListNode<T> | undefined {
    if (this.length === 0) {
      return undefined;
    }

    const node = this.head;

    this.length -= 1;

    if (this.length === 0) {
      this.head = null;
      this.tail = null;
    } else {
      if (!node || !this.head?.next){
        throw new Error();
      }
      this.head = this.head.next;
      this.head.prev = null;
      node.next = null;
    }

    return node ?? undefined;
  }

  public pop(): PebLinkedListNode<T> | undefined {
    if (this.length === 0) {
      return undefined;
    }

    const node = this.tail;

    this.length -= 1;

    if (this.length === 0) {
      this.head = null;
      this.tail = null;
    } else {
      if (!node || !this.tail?.prev){
        throw new Error();
      }
      this.tail = this.tail.prev;
      this.tail.next = null;
      node.prev = null;
    }

    return node ?? undefined;
  }
}
