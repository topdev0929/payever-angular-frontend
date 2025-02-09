import { PebElementType } from '@pe/builder/core';
import { PebElement, PebLinkedList } from '@pe/builder/render-utils';

import { getTopElement } from './clipboard.utils';

describe('clipboard.utils', () => {
  it('should calculate element which has less minY in getTopElement method', () => {
    const parent = {
      id: 'parent',
      type: PebElementType.Section,
      children: new PebLinkedList<PebElement>(),
      minX: 0,
      minY: 0,
      maxX: 1000,
      maxY: 500,
    } as any;

    const child1 = {
      id: 'child1',
      parent,
      minY: 200,
    } as any;

    const child2 = {
      id: 'child2',
      parent,
      minY: 300,
    } as any;

    parent.children.add(child1);
    parent.children.add(child2);

    const topElement = getTopElement([child1, child2]);

    expect(topElement).toEqual(child1);
  });
});
