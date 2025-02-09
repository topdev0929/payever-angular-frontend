import { PebElementDef, PebElementDefTree } from '@pe/builder/core';
import { PebElement } from '@pe/builder/render-utils';


export function toElementDefTree(value: PebElementDef[])
  : { rootElements: PebElementDefTree[], map: Map<string, PebElementDefTree> } {

  const rootElements: PebElementDefTree[] = [];
  const map = new Map<string, PebElementDefTree>(value.map(def => [def.id, { ...def, children: [], index: 0 }]));

  map.forEach((def) => {
    if (!def.parent) {
      rootElements.push(def);
    } else {
      const parent = map.get(def.parent.id);
      if (parent && !parent.children?.length) {
        let next: PebElementDefTree | null = def;
        parent.children = parent.children ?? [];

        while (next) {
          if (!next.deleted) {
            parent.children.push(next);
          }
          next = next.next ? map.get(next.next) ?? null : null;
        }

        let prev: PebElementDefTree | null = def.prev ? map.get(def.prev) ?? null : null;
        while (prev) {
          if (!prev.deleted) {
            parent.children.unshift(prev);
          }
          prev = prev.prev ? map.get(prev.prev) ?? null : null;
        }

        parent.children.forEach((elm, idx) => elm.index = idx);
      }
    }
  });

  return { rootElements, map };
};


export function flattenElements(parent: PebElement): { [id: string]: PebElement } {
  const recursive = (elm: PebElement, map: { [id: string]: PebElement }) => {
    if (!elm) {
      return;
    }

    map[elm.id] = elm;
    [...elm.children ?? []].forEach(child => recursive(child, map));
  };

  const map: { [id: string]: PebElement } = {};
  recursive(parent, map);

  return map;
}
