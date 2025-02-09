import { PebDefaultScreens, PebElementDef, PebScreenEnum } from '@pe/builder/core';
import { PebElement, PebLinkedList } from '@pe/builder/render-utils';

import { findInViewportElements, insertElements } from './insert.utils';

describe('Insert util', () => {
  it('should insert section', () => {
    const document: PebElement = {
      id: 'document',
      type: 'document',
      children: new PebLinkedList(),
    } as any;

    const section1: PebElement = {
      id: 'section-1',
      parent: { id: document.id },
    } as any;

    const section2: PebElement = {
      id: 'section-2',
      parent: { id: document.id },
    } as any;

    document.children?.add(section1);
    document.children?.add(section2);

    const children = document.children?.serialize() ?? [];
    expect(children[0].next).toEqual(section2.id);
    expect(children[0].prev).toEqual(null);
    expect(children[1].prev).toEqual(section1.id);

    const newSection: PebElementDef = {
      id: 'new-section',
      type: 'section',
      name: 'section',
      next: null,
      prev: null,
    } as any;

    const screen = PebDefaultScreens[PebScreenEnum.Desktop];
    const screens = Object.values(PebDefaultScreens);

    const res = insertElements([newSection], { ...section1, parent: document }, screen, screens);
    const inserted = res.insertedElements ?? [];

    expect(inserted[0]).toEqual({ ...newSection, id: inserted[0]?.id, parent: { id: document.id, type: document.type } });
  });

  it('should insert elements def', () => {
    const root = {
      id: 'parent',
      name: 'root',
      type: 'shape',
      parent: { id: 'not-exist-id', type: 'document' },
      next: 'parent-next',
      prev: 'parent-preview',
      styles: { desktop: { color: 'red' } },
    } as any;

    const child1 = {
      id: 'child-1',
      name: 'child-1',
      type: 'shape',
      parent: { id: root.id, type: root.type },
      next: 'child-2',
      prev: null,
      styles: { desktop: { color: 'color-1' } },
    } as any;

    const child2 = {
      id: 'child-2',
      name: 'child-2',
      type: 'shape',
      parent: { id: root.id, type: root.type },
      next: 'child-3',
      prev: 'child-1',
      styles: { desktop: { color: 'color-2' } },
    } as any;

    const child3 = {
      id: 'child-3',
      name: 'child-3',
      type: 'shape',
      parent: { id: root.id, type: root.type },
      next: null,
      prev: 'child-2',
      styles: { desktop: { color: 'color-3' } },
    } as any;

    const child1a = {
      id: 'child-1-a',
      type: 'shape',
      parent: { id: child1.id, type: child1.type },
      next: null,
      prev: null,
      styles: { desktop: { color: 'color-1-a' } },
    } as any;

    const target = { id: 'target', parent: { id: 'soma-parent', type: 't-type' } } as any;

    const elements = [root, child1, child2, child3, child1a];
    const screen = PebDefaultScreens[PebScreenEnum.Desktop];
    const screens = Object.values(PebDefaultScreens);

    const res = insertElements(elements, target, screen, screens);
    const inserted = res.insertedElements ?? [];

    expect(inserted.length).toEqual(5);
    expect(inserted.filter(item => !item.parent).length).toEqual(0);

    expect(inserted.every(item => item.id !== root.id)).toBeTruthy();
    expect(inserted.every(item => item.id !== child1.id)).toBeTruthy();
    expect(inserted.every(item => item.id !== child2.id)).toBeTruthy();
    expect(inserted.every(item => item.id !== child3.id)).toBeTruthy();
    const insertedRoot = inserted.find(item => item.name === 'root');
    const insertedChild1 = inserted.find(item => item.name === 'child-1');
    const insertedChild2 = inserted.find(item => item.name === 'child-2');
    const insertedChild3 = inserted.find(item => item.name === 'child-3');
    expect(insertedRoot?.parent?.id).toEqual(target.id);
    expect(insertedChild1?.parent?.id).toEqual(insertedRoot?.id);
    expect(insertedChild2?.parent?.id).toEqual(insertedRoot?.id);
    expect(insertedChild3?.parent?.id).toEqual(insertedRoot?.id);
  });

  it('should find elements in viewport', () => {
    const getBBox = (minX: number, maxX: number, minY: number, maxY: number) => {
      return { minX, maxX, minY, maxY, type: 'section' };
    };

    const elements: any[] = [
      getBBox(0, 100, 0, 100),
      getBBox(0, 100, 100, 300),
      getBBox(0, 300, 300, 700),
    ];

    let result = findInViewportElements([...elements], getBBox(0, 100, 0, 200));

    expect(result[0].coverage).toBe(0.5);
    expect(result[1].coverage).toBe(0.5);
    expect(result[2].coverage).toBe(0);

    result = findInViewportElements([...elements], getBBox(0, 100, 0, 300));
    expect(result[0].coverage).toBe(1/3);
    expect(result[1].coverage).toBe(2/3);
    expect(result[2].coverage).toBe(0);

    expect(findInViewportElements([], getBBox(0, 100, 0, 300))).toEqual([]);
  });
});

