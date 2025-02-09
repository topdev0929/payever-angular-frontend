import { PebElement, PebLinkedList, getPebSize } from '@pe/builder/render-utils';
import { moveELement, moveElementOutPage } from './move.utils';
import { PebPositionType, PebUnit } from '@pe/builder/core';

describe('Move utils', () => {
  it('should not change auto values on move', () => {
    const parent = {
      id: 'parent',
      styles: {
        padding: { left: 10, top: 0, right: 10, bottom: 0 },
      },
      minX: 10,
      minY: 20,
      maxX: 110,
      maxY: 220,
    } as any;

    const child: PebElement = {
      id: '1',
      styles: {
        position: {
          type: PebPositionType.Pinned,
          left: getPebSize('auto'),
          top: getPebSize('auto'),
          bottom: getPebSize('auto'),
          right: getPebSize('auto'),
          layoutIndex: 10,
        }
      },
      parent: parent as any,
      minX: 50,
      minY: 120,
      maxX: 60,
      maxY: 150,
    } as any;

    const moveX = 100;
    const moveY = 100;

    const res = moveELement(child, parent, { moveX, moveY });

    expect(res.elementUpdates).toBeDefined();
    expect(res.elementUpdates.length).toEqual(1);

    expect(res.elementUpdates).toEqual([{
      id: '1',
      parent,
      styles: { position: { ...child.styles.position } }
    }]);
  });

  it('should keep unit and update value based on moving bbox', () => {
    const parent = {
      styles: {
        padding: { left: 10, top: 50, right: 10, bottom: 40 },
      },
      minX: 10,
      minY: 20,
      maxX: 110,
      maxY: 270, // => based on padding available heigh is 150px
    } as any;

    const child: PebElement = {
      id: '1',
      styles: {
        position: {
          type: PebPositionType.Pinned,
          left: { value: 180, unit: PebUnit.Pixel },
          top: { value: 0, unit: PebUnit.Percent },
          bottom: { value: 100, unit: PebUnit.Percent },
          right: getPebSize('auto'),
          layoutIndex: 10,
        }
      },
      parent: parent as any,

      minX: 200,
      minY: 70,
      maxX: 60,
      maxY: 190,
    } as any;

    const moveX = -30;
    const moveY = 40;

    const res = moveELement(child, parent, { moveX, moveY });

    expect(res.elementUpdates).toBeDefined();
    expect(res.elementUpdates.length).toEqual(1);
    expect(res.elementUpdates).toEqual([{
      id: '1',
      parent,
      styles: {
        position: {
          ...child.styles.position,
          left: { value: 150, unit: PebUnit.Pixel },
          top: { value: 25, unit: PebUnit.Percent },
          bottom: { value: 0, unit: PebUnit.Percent },
        }
      }
    }]);
  });

  it('should move element outside of page', () => {
    const document = {
      id: 'document',
      type: 'document',
      children: new PebLinkedList(),
    } as any;

    const section = {
      id: 'section',
      children: new PebLinkedList(),
      parent: document,
    } as any;
    document.children.add(section);

    const child1 = { id: 'child-1', parent: section } as any;
    const child2 = { id: 'child-2', parent: section, minX: 0, minY: 0, maxX: 10, maxY: 10 } as any;
    const child3 = { id: 'child-3', parent: section } as any;
    section.children.add(child1);
    section.children.add(child2);
    section.children.add(child3);

    const res = moveElementOutPage(child2, { moveX: -10, moveY: -10 }, { x: -10, y: -10 });

    expect(res?.elementUpdates).toBeDefined();
    expect(res.elementUpdates).toEqual([
      {
        id: child2.id,
        parent: document,
        styles: {
          position: {
            type: PebPositionType.Pinned,
            left: getPebSize(-10),
            top: getPebSize(-10),
            right: undefined,
            bottom: undefined,
          },
        }
      },
      { id: child1.id, next: child3.id, prev: null },
      { id: child3.id, next: null, prev: child1.id },
      { id: section.id, next: child2.id, prev: null },
      { id: child2.id, next: null, prev: section.id },
    ]);
  });
});