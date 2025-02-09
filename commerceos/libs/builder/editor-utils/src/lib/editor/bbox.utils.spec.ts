import RBush from 'rbush';
import { bboxHasOuterContactLine, bboxIsInsideBBox, findBBoxesByPoint, findNestedPointInBBox, pointToBBox } from './bbox.utils';
import { documentBBox } from './position.utils';

describe('BBox utils', () => {
  it('should detect if bbox is included inside another bbox', () => {

    expect(bboxIsInsideBBox(
      { minX: 0, minY: 0, maxX: 10, maxY: 10 },
      { minX: 0, minY: 0, maxX: 12, maxY: 10 },
    )).toBeTruthy();


    expect(bboxIsInsideBBox(
      { minX: 8, minY: 8, maxX: 10, maxY: 10 },
      { minX: 0, minY: 0, maxX: 10, maxY: 10 },
    )).toBeTruthy();

    expect(bboxIsInsideBBox(
      { minX: 8, minY: 8, maxX: 10, maxY: 10 },
      { minX: 0, minY: 0, maxX: 12, maxY: 9 },
    )).toBeFalsy();
  })

  it('should find bboxes by point', () => {
    const document = { id: '0', ...documentBBox() }
    const section = { id: '1', minX: 0, minY: 0, maxX: 1000, maxY: 500, parent: document } as any;
    const square1 = { id: '2', minX: 10, minY: 10, maxX: 500, maxY: 500, parent: section } as any;
    const square2 = { id: '3', minX: 20, minY: 20, maxX: 400, maxY: 400, parent: square1 } as any;
    const square3 = { id: '4', minX: 30, minY: 30, maxX: 300, maxY: 300, parent: square2 } as any;

    const movingElement = { id: 'moving-element', minX: 500, minY: 0, maxX: 600, maxY: 100 };

    const tree = new RBush<any>();
    tree.load([document, section, square1, square2, square3, movingElement]);
    const toSkip = new Set([movingElement.id]);
    let dropPoint = { x: 35, y: 35 };

    expect(findBBoxesByPoint(tree, dropPoint, toSkip)).toEqual([document, section, square1, square2, square3]);

    tree.clear();
    tree.load([square2, square3, movingElement]);
    dropPoint = { x: 35, y: 35 };

    expect(findBBoxesByPoint(tree, dropPoint, toSkip)).toEqual([square2, square3]);
  });

  it('should find nested point in bbox', () => {
    const bbox = { minX: 0, minY: 0, maxX: 10, maxY: 20 };

    expect(findNestedPointInBBox(bbox, { x: 0, y: 0 })).toEqual({ x: 0, y: 0 });
    expect(findNestedPointInBBox(bbox, { x: 5, y: 5 })).toEqual({ x: 5, y: 5 });
    expect(findNestedPointInBBox(bbox, { x: 5, y: 50 })).toEqual({ x: 5, y: 20 });
    expect(findNestedPointInBBox(bbox, { x: -100, y: -100 })).toEqual({ x: 0, y: 0 });
  });

  it('should create bbox form point', () => {
    expect(pointToBBox({ x: 10, y: 100 })).toEqual({ minX: 10, minY: 100, maxX: 10, maxY: 100 });
  })

  it('should find if 2 bbox has outer contact line ', () => {
    const bbox1 = { minX: 0, minY: 0, maxX: 10, maxY: 20 };
    const bbox2 = { minX: 10, minY: 100, maxX: 20, maxY: 120 };
    const bbox3 = { minX: 11, minY: 100, maxX: 10, maxY: 20 };

    expect(bboxHasOuterContactLine(bbox1, bbox1)).toEqual(false);
    expect(bboxHasOuterContactLine(bbox1, bbox2)).toEqual(true);
    expect(bboxHasOuterContactLine(bbox1, bbox3)).toEqual(false);
  });
});
