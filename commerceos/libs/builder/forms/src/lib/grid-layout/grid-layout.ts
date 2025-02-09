import Delta, { Op } from 'quill-delta';

import {
  PebElementDef,
  PebElementType,
  PebLanguageEnum,
  PebValueByLanguage,
  PebValueByScreen,
  PebScreen,
  PebDefaultTextStyles,
  PebElementDefUpdate,
} from '@pe/builder/core';
import { cloneElement } from '@pe/builder/editor-utils';
import { deserializeLinkedList, PebElement, serializeLinkedList } from '@pe/builder/render-utils';
import { PebUpdateActionPayload } from '@pe/builder/state';

export const addColumns = (
  columns: number,
  elm: PebElement & { type: PebElementType.Grid },
  defs: { [key: string]: PebElementDef },
  screens: PebScreen[],
) => {
  const list = deserializeLinkedList(serializeLinkedList(elm.children));
  const lastColumn = [...list].filter((e, i) => (i + 1) % elm.styles.gridTemplateColumns.length === 0);

  const newIds = [];
  lastColumn.forEach((e) => {
    const index = list.getIndex(e);
    for (let i = 0; i < columns; i += 1) {
      const clone = cloneElement(e, false);
      list.insertAt(index + 1 + i, clone);
      newIds.push(clone.id);
    }
  });

  const newElements: PebElementDefUpdate[] = [];
  const newList = deserializeLinkedList(serializeLinkedList(list));
  [...newList].filter(e => newIds.includes(e.id)).forEach((e) => {
    const def = defs[e.original ? e.original.id : e.id];

    newElements.push({
      ...def,
      id: e.id,
      data: {
        ...def.data,
        text: getText(def, screens),
      },
      parent: {
        id: e.parent.id,
        type: e.parent.type,
      },
      prev: e.prev,
      next: e.next,
    });
  });

  const updates: PebUpdateActionPayload = [...serializeLinkedList(newList)]
    .filter(e => !newIds.includes(e.id))
    .map(({ id, prev, next }) => ({ id, prev, next }));

  return { updates, newElements };
};

export const collectChildren = (elm: PebElement): PebElement[] => {
  const acc = [elm];

  [...elm.children].forEach((child) => {
    acc.push(...collectChildren(child));
  });

  return acc;
};

export const removeColumns = (columns: number, elm: PebElement & { type: PebElementType.Grid }) => {
  const list = deserializeLinkedList(serializeLinkedList(elm.children));
  const lastColumn = [...list].filter((e, i) => (i + 1) % elm.styles.gridTemplateColumns.length < columns);

  const removedElements = [];
  lastColumn.forEach(e => removedElements.push(...collectChildren(e)));

  return removedElements;
};

export const addRows = (
  rows: number,
  elm: PebElement & { type: PebElementType.Grid },
  defs: { [key: string]: PebElementDef },
  screens: PebScreen[],
) => {
  const list = deserializeLinkedList(serializeLinkedList(elm.children));
  const lastRow = [...list].slice(-elm.styles.gridTemplateColumns.length);

  const newIds = [];
  for (let i = 0; i < rows; i += 1) {
    lastRow.forEach((e) => {
      const clone = cloneElement(e, false);
      list.add(clone);
      newIds.push(clone.id);
    });
  }

  const newElements: PebElementDefUpdate[] = [];
  const newList = deserializeLinkedList(serializeLinkedList(list));

  [...newList].filter(e => newIds.includes(e.id)).forEach((e) => {
    const def = defs[e.original ? e.original.id : e.id];

    newElements.push({
      ...def,
      id: e.id,
      data: {
        ...def.data,
        text: getText(def, screens),
      },
      parent: {
        id: e.parent.id,
        type: e.parent.type,
      },
      prev: e.prev,
      next: e.next,
    });
  });

  const updates: PebUpdateActionPayload = [...serializeLinkedList(newList)]
    .filter(e => !newIds.includes(e.id))
    .map(({ id, prev, next }) => ({ id, prev, next }));

  return { updates, newElements };
};

export const removeRows = (rows: number, elm: PebElement & { type: PebElementType.Grid }) => {
  const list = deserializeLinkedList(serializeLinkedList(elm.children));
  const cells = [...list].slice(-elm.styles.gridTemplateColumns.length * rows);

  const removedElements = [];

  cells.forEach(e => removedElements.push(...collectChildren(e)));

  return removedElements;
};

const getText = (e: PebElementDef, screens: PebScreen[]): PebValueByScreen<PebValueByLanguage<Delta>> => {
  if (!e.data?.text) {
    const emptyText: Op[] = [
      { insert: '' },
      { insert: '\n', attributes: { textJustify: PebDefaultTextStyles.textJustify } },
    ];

    return screens.map(scr => scr.key).reduce((acc, screen) => {
      acc[screen] = { [PebLanguageEnum.Generic]: new Delta(emptyText) };

      return acc;
    }, {} as PebValueByScreen<PebValueByLanguage<Delta>>);
  }

  const text = {} as PebValueByScreen<PebValueByLanguage<Delta>>;
  for (const screen in e.data.text) {
    if (!text[screen]) {
      text[screen] = {};
    }
    for (const lang in e.data.text[screen]) {
      const { align, ...attributes } = [...e.data.text[screen][lang]?.ops].reverse().reduce((acc, op) => {
        return { ...acc, ...op.attributes };
      }, {} as any);

      text[screen][lang] = new Delta([
        { insert: '', attributes },
        { insert: '\n', attributes: { textJustify: align ?? PebDefaultTextStyles.textJustify } },
      ]);
    }
  }

  return text;
};
