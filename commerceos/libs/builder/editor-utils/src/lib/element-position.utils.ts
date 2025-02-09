import RBush, { BBox } from 'rbush';
import voronoi from 'voronoi-diagram';

import { isDocument, PebElement } from '@pe/builder/render-utils';

import { elementInnerSpace } from './editor';
import {
  bboxHasOuterContactLine,
  findNestedPointInBBox,
  findTotalArea,
  pointToBBox,
} from './editor/bbox.utils';

export function findAvailablePosition(
  tree: RBush<PebElement>,
  parent: PebElement,
  dimension: { width: number, height: number },
): { left: number; top: number } | undefined {

  if (isDocument(parent)) {
    return findAvailablePositionInDocument(parent);
  }

  let left: number;
  let top: number;
  const { width, height } = dimension;
  const parentBBox = elementInnerSpace(parent);

  const getPoints = (bbox: BBox): number[][] => {
    return [
      [bbox.minX, bbox.minY],
      [bbox.maxX, bbox.minY],
      [bbox.maxX, bbox.maxY],
      [bbox.minX, bbox.maxY],
    ];
  };

  const parentPoints = getPoints(parentBBox);
  const childPoints: number[][] = [];
  const childIds = [...parent.children ?? [] as PebElement[]].reduce((acc, child) => {
    if (child.visible) {
      childPoints.push(...getPoints(child));

      acc.push(child.id);
    }

    return acc;
  }, [] as string[]);

  const points = childPoints.reduce((acc, [cX, cY]) => {
    if (acc.findIndex(([aX, aY]) => Math.round(aX) === Math.round(cX) && Math.round(aY) === Math.round(cY)) === -1) {
      acc.push([cX, cY]);
    }

    return acc;
  }, [...parentPoints]);

  const positions: Array<{ x: number; y: number }> = voronoi(points).positions
    .reduce((acc: { x: number, y: number }[], [x, y]: voronoi.Point) => {
      if (x !== undefined && y !== undefined) {
        const point = findNestedPointInBBox(parentBBox, { x, y });
        const bbox = pointToBBox(point);
        const intersectedIds = tree.search(bbox).map(elm => elm.id);

        if (!childIds.some(id => intersectedIds.includes(id))) {
          acc.push(point);
        }
      }

      return acc;
    }, [] as { x: number, y: number }[]);

  const parentVertices = [
    { x: parentBBox.minX, y: parentBBox.minY },
    { x: parentBBox.maxX, y: parentBBox.minY },
    { x: parentBBox.maxX, y: parentBBox.maxY },
    { x: parentBBox.minX, y: parentBBox.maxY },
  ];
  const childVertices = childPoints.map(([x, y]: number[]) => ({ x, y }));
  const vertices = [...parentVertices, ...childVertices];

  const isIntersected = (bbox: BBox): boolean => {
    return tree.search(bbox)
      .filter(elm => [...parent.children ?? []].findIndex(child => child.id === elm.id) !== -1)
      .every(elm => bboxHasOuterContactLine(bbox, elm));
  };

  for (const position of positions) {
    const space: BBox[] = [];

    vertices.forEach((vertex: { x: number, y: number }) => {
      const vertexBBox = {
        minX: Math.min(position.x, vertex.x),
        maxX: Math.max(position.x, vertex.x),
        minY: Math.min(position.y, vertex.y),
        maxY: Math.max(position.y, vertex.y),
      };

      if (isIntersected(vertexBBox)) {
        space.push(vertexBBox);
      }
    });

    const spaceBBox = {
      minX: Math.min(...space.map(s => s.minX)),
      maxX: Math.max(...space.map(s => s.maxX)),
      minY: Math.min(...space.map(s => s.minY)),
      maxY: Math.max(...space.map(s => s.maxY)),
    };

    const spaceHeight = spaceBBox.maxY - spaceBBox.minY;
    const spaceWidth = spaceBBox.maxX - spaceBBox.minX;

    if ((spaceHeight > height && spaceWidth >= width
      || spaceHeight >= height && spaceWidth > width
      || spaceHeight > height && spaceWidth > width)
      && isIntersected(spaceBBox)
    ) {
      left = spaceBBox.minX - parentBBox.minX;
      top = spaceBBox.minY - parentBBox.minY;

      return { left, top };
    }
  }

  return undefined;
}

function findAvailablePositionInDocument(document: PebElement): { left: number; top: number } | undefined {
  const totalArea =
    findTotalArea([...document.children ?? []].filter(elm => elm.visible) ?? [{ minX: 0, minY: 0, maxX: 0, maxY: 0 }]);

  return { left: totalArea.maxX, top: Math.max(0, totalArea.minY) };
}
