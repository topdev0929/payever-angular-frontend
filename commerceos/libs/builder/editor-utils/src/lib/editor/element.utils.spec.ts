import { BBox } from 'rbush';

import { PebElementType, PebLayoutType, PebPositionType } from '@pe/builder/core';
import { PebLinkedList, getPebSize } from '@pe/builder/render-utils';

import { elementBBox } from './bbox.utils';
import { canInsertChild, canMoveTo, collectAllChildren, findAllChildren, sortByInnerElements } from './element.utils';
import { documentBBox } from './position.utils';

describe('Element utils:', () => {
  it('should detect if element can be inserted into another element?', () => {

    const document = { type: PebElementType.Document } as any;
    const section = { type: PebElementType.Section, minX: 0, minY: 0, maxX: 1000, maxY: 500 } as any;
    const grid = { type: PebElementType.Grid } as any;
    const text = { type: PebElementType.Text } as any;
    const square = { type: PebElementType.Shape } as any;
    const filledLayout = {
      type: PebElementType.Section,
      styles: { layout: { type: PebLayoutType.Grid, rows: [10, 10], columns: [10, 10] } },
      children: new PebLinkedList(),
    } as any;
    filledLayout.children.add({ type: 'shape', styles: { layoutPosition: { index: 0, auto: false } } } as any);
    filledLayout.children.add({ type: 'shape', styles: { layoutPosition: { index: 1, auto: false } } } as any);
    filledLayout.children.add({ type: 'shape', styles: { layoutPosition: { index: 2, auto: false } } } as any);
    filledLayout.children.add({ type: 'shape', styles: { layoutPosition: { index: 3, auto: false } } } as any);


    const emptyLayout = {
      type: PebElementType.Section,
      styles: { layout: { type: PebLayoutType.Grid, rows: [10, 10], columns: [10, 10] } },
      children: new PebLinkedList(),
    } as any;
    emptyLayout.children.add({ type: 'shape', styles: { layoutPosition: { index: 0 } } } as any);

    // Document
    expect(canInsertChild(document, square)).toEqual({ allowed: false });
    expect(canInsertChild(square, document)).toEqual({ allowed: true });
    expect(canInsertChild(section, document)).toEqual({ allowed: true });

    expect(canInsertChild(section, square).allowed).toBeFalsy();
    expect(canInsertChild(square, section).allowed).toBeTruthy();
    expect(canInsertChild(square, text).allowed).toBeFalsy();

    // Text
    // Cannot insert element into Text
    expect(canInsertChild(square, text).allowed).toBeFalsy();

    // Shape
    // Cannot insert to another shape if bbox is not inside of target
    expect(canInsertChild(
      text,
      { ...square, minX: 0, minY: 0, maxX: 10, maxY: 10 } as any,
      { minX: 8, minY: 0, maxX: 12, maxY: 12 }
    ).allowed).toBeFalsy();

    // Con't insert into shape if child covers the shape
    expect(canInsertChild(
      square,
      { ...square, minX: 0, minY: 0, maxX: 10, maxY: 10 } as any,
      { minX: 0, minY: 0, maxX: 10, maxY: 10 }
    ).allowed).toBeFalsy();

    // Layout
    // Can insert into layout if has any empty cell
    expect(canInsertChild(square, emptyLayout).allowed).toBeTruthy();
    expect(canInsertChild(square, emptyLayout).bbox).toBeDefined();

    // Can insert into layout if all cells are filled
    expect(canInsertChild(square, filledLayout).allowed).toBeTruthy();

    // Can insert into layout only if drop point is inside layout bbox
    expect(canInsertChild(
      text,
      { ...emptyLayout, minX: 0, minY: 0, maxX: 10, maxY: 10 },
      {} as BBox,
      { x: 5, y: 5 },
    ).allowed).toBeTruthy();

    // Can't insert into layout if drop point is out of layout bbox
    expect(canInsertChild(
      text,
      { ...emptyLayout, minX: 0, minY: 0, maxX: 10, maxY: 10 },
      {} as BBox,
      { x: 15, y: 15 },
    ).allowed).toBeFalsy();

  });

  it('should collect all children of element recursively', () => {
    const root = { id: 'root1', children: new PebLinkedList<any>() };

    const child1 = { id: 'child-1' };
    const child2 = { id: 'child-2' };
    const child3 = { id: 'child-3' };
    const child4 = { id: 'child-4', children: new PebLinkedList<any>() };

    const child4a = { id: 'child-4-a' };
    const child4b = { id: 'child-4-b' };
    const child4c = { id: 'child-4-c', children: new PebLinkedList<any>() };

    root.children.add(child1);
    root.children.add(child2);
    root.children.add(child3);
    root.children.add(child4);

    child4.children.add(child4a);
    child4.children.add(child4b);
    child4.children.add(child4c);

    const map = collectAllChildren(root as any);

    expect(map).toBeDefined();
    expect(Object.values(map).length).toEqual(7);
    expect(map['child-1']).toEqual(child1);
    expect(map['child-2']).toEqual(child2);
    expect(map['child-3']).toEqual(child3);
    expect(map['child-4']).toEqual(child4);
    expect(map['child-4-a']).toEqual(child4a);
    expect(map['child-4-b']).toEqual(child4b);
    expect(map['child-4-c']).toEqual(child4c);
  })

  it('should sort elements from child to parent', () => {
    const document = { id: '0' };
    const section = { id: '1', parent: document } as any;
    const square1 = { id: '2', parent: section } as any;
    const square2 = { id: '3', parent: square1 } as any;
    const square3 = { id: '4', parent: square2 } as any;

    expect(sortByInnerElements([document, section, square1, square2, square3]))
      .toEqual([square3, square2, square1, section, document]);

    expect(sortByInnerElements([square3, square2])).toEqual([square3, square2]);

    expect(sortByInnerElements([square3])).toEqual([square3]);

    expect(sortByInnerElements([document, square2, square3])[0]).toEqual(square3);

  })

  it('should sort elements from child to parent : scenario 2', () => {
    const document = {
      id: 'document',
      ...documentBBox(),
      type: "document"
    } as any;

    const header = {
      id: 'header',
      minX: 0,
      minY: 0,
      maxX: 1200,
      maxY: 200,
      type: "section",
      name: "header",
      parent: document,
    } as any;

    const green = {
      id: 'green',
      minX: 88,
      minY: 0,
      maxX: 741,
      maxY: 200,
      type: "shape",
      name: "Green",
      parent: header,
    } as any;

    const y2 = {
      id: 'y2',
      minX: 495,
      minY: 14,
      maxX: 705,
      maxY: 164,
      type: "shape",
      name: "Y2",
      parent: green,
    } as any;

    const sorted = sortByInnerElements([document, header, green, y2]);

    expect(sorted).toEqual([y2, green, header, document]);
  })

  it('should find all children recursively', () => {
    const elements = [
      { id: '1', name: 'a', parent: { id: 'parent-1' } },
      { id: '2', name: 'b', parent: { id: 'parent-2' } }, // not included
      { id: '3', name: 'c', parent: { id: '10' } },
      { id: '4', name: 'd', parent: { id: '10' } },
      { id: '5', name: 'f', parent: { id: '3' } },
      { id: '6', name: 'f', parent: { id: '4' } },
      { id: '7', name: 'g', parent: { id: '6' } },
      { id: '8', name: 'h', parent: { id: '7' } },
      { id: '9', name: 'i', parent: { id: 'root' } }, // not included
      { id: '10', name: 'j', parent: { id: '1' } },
    ];

    const sorted = findAllChildren('1', elements as any).sort((a, b) => +a.id - +b.id);
    expect(sorted).toEqual(elements.filter(elm => ['3', '4', '5', '6', '7', '8', '10'].includes(elm.id)));
  });
});

describe('Element utils: move handler & validators', () => {
  it('should not allow move object into cell if has collision with any element', () => {
    const section = {
      id: 'section',
      type: PebElementType.Section,
      styles: {
        layout: {
          type: PebLayoutType.Grid,
          rows: [getPebSize('auto')],
          columns: [getPebSize('auto')],
        }
      },
      children: new PebLinkedList(),
      minX: 100,
      minY: 100,
      maxX: 1000,
      maxY: 500,
    } as any;

    const square = {
      id: 'square',
      type: PebElementType.Shape,
      parent: section,
      styles: {
        layoutPosition: {
          index: 0,
        },
      },
      minX: 200,
      minY: 200,
      maxX: 600,
      maxY: 500,
    } as any;

    section.children.add(square);

    const movingElement = {
      id: 'text',
      type: PebElementType.Text,
    } as any;

    const movingBBox = {
      minX: 500,
      minY: 400,
      maxX: 600,
      maxY: 500,
    }

    const res = canMoveTo([movingElement], movingBBox, section)

    expect(res.allowed).toBeFalsy();
  });

  it('should allow elements with pinned position to be overlapped', () => {
    const parent = {
      type: PebElementType.Shape,
      children: new PebLinkedList(),
      minX: 0,
      minY: 0,
      maxX: 1000,
      maxY: 1000,
    } as any;

    const fixedDefaultPosition = {
      id: 'child with default position',
      type: PebElementType.Shape,
      styles: { position: { type: PebPositionType.Default } },
      minX: 500,
      minY: 500,
      maxX: 600,
      maxY: 600,
    } as any;

    const fixedPinnedPosition = {
      id: 'child with pinned position',
      type: PebElementType.Shape,
      styles: { position: { type: PebPositionType.Pinned } },
      minX: 100,
      minY: 100,
      maxX: 200,
      maxY: 200,
    } as any;

    parent.children.add(fixedPinnedPosition);
    parent.children.add(fixedDefaultPosition);

    const movingDefaultPositionElement = {
      id: 'moving element with default position',
      type: PebElementType.Shape,
      styles: { position: { type: PebPositionType.Default } },
    } as any;

    const movingPinnedPositionElement = {
      id: 'moving element with pinned position',
      type: PebElementType.Shape,
      styles: { position: { type: PebPositionType.Pinned } },
    } as any;


    // Scenario 1: move default position over default position
    expect(canMoveTo([movingDefaultPositionElement], elementBBox(fixedDefaultPosition), parent)).toEqual({
      allowed: false,
      collisions: [fixedDefaultPosition],
    });

    // Scenario 2: move default position over pinned position
    expect(canMoveTo([movingDefaultPositionElement], elementBBox(fixedPinnedPosition), parent)).toEqual({
      allowed: true,
      collisions: [fixedPinnedPosition],
    });

    // Scenario 3: move pinned position over default position
    expect(canMoveTo([movingPinnedPositionElement], elementBBox(fixedDefaultPosition), parent)).toEqual({
      allowed: true,
      collisions: [fixedDefaultPosition],
    });

  })
});
