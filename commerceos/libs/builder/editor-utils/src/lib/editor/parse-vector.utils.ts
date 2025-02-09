import { Node, RootNode, parse as parseSvg } from 'svg-parser';
import SVGPathCommander, { PathArray, PathBBox } from 'svg-path-commander';

import { parsePebColor } from '@pe/builder/color-utils';
import {
  PEB_ROOT_SCREEN_KEY,
  PebBorderStyle,
  PebDimension,
  PebElementDef,
  PebElementStyles,
  PebElementType,
  PebFillType,
  PebPosition,
  PebPositionType,
  PebVector,
  pebGenerateId,
  PEB_DEFAULT_RESIZE_SETTING,
  PebUnit,
} from '@pe/builder/core';
import { lastMigrationVersion } from '@pe/builder/migrations';
import { PebLinkedList, getPebSize } from '@pe/builder/render-utils';

import { bboxDimension, findTotalArea } from './bbox.utils';

export const parseSvgToElementDef = (html: string): PebElementDef[] => {
  const { dimension, vectors } = parseSvgToVector(html);

  const root: PebElementDef = {
    id: pebGenerateId(),
    index: 0,
    name: 'Group',
    next: null,
    prev: null,
    styles: {
      [PEB_ROOT_SCREEN_KEY]: {
        dimension: { height: getPebSize(dimension.height), width: getPebSize(dimension.width) },
        position: {
          type: PebPositionType.Default,
          left: { value: undefined, unit: PebUnit.Pixel },
          top: { value: undefined, unit: PebUnit.Pixel },
        },
      },
    },
    data: {
      resizeSetting: { ...PEB_DEFAULT_RESIZE_SETTING, resizeChildren: true },
      version: lastMigrationVersion,
      constrainProportions: true,
    },
    type: PebElementType.Shape,
  };

  const children = new PebLinkedList<PebElementDef>();
  vectors.forEach(vector => children.add(createElementDef(vector, root.id)));

  return [root, ...children.serialize()];
};

const createElementDef = (child: ParsedVector, parentId: string): PebElementDef => {
  return {
    id: pebGenerateId(),
    index: 0,
    next: null,
    prev: null,
    styles: {
      [PEB_ROOT_SCREEN_KEY]: {
        ...child.styles,
      },
    },
    type: PebElementType.Vector,
    data: {
      vector: child.vector,
      constrainProportions: true,
      version: lastMigrationVersion,
    },
    parent: { id: parentId, type: PebElementType.Shape },
  };
};

const parseSvgToVector = (html: string)=> {
  const root = parseSvg(html);

  return getRootVector(root);
};

const getRootVector = (root: RootNode):
  { vectors: ParsedVector[], dimension: { width: number, height: number } } => {
  const result: ParsedVector[] = [];
  const bboxes: PathBBox[] = [];

  const convertElementNode = (node: Node, parentStyles: Record<string, string | number> = {}) => {
    if (node?.type === 'element') {
      if (typeof node.properties?.points === 'string') {
        node.properties.points = node.properties.points.split(', ').join(',');
      }

      const shape = {
        type: node.tagName,
        ...node.properties,
      };

      const path = SVGPathCommander.shapeToPathArray(shape as any);
      if (path) {
        const { bbox, parsedVector } = getParsedVector(path, node.properties, parentStyles);
        result.push(parsedVector);
        bboxes.push(bbox);
      }

      if (node.tagName === 'g' || node.tagName === 'svg') {
        parentStyles = { ...parentStyles, ...node.properties };
      }

      node.children
        .filter((child): child is Node => typeof child !== 'string')
        .forEach(child => convertElementNode(child, parentStyles));
    }
  };

  root.children.forEach(child => convertElementNode(child));

  const boundingBox = findTotalArea(bboxes.map(bbox => ({ minX: bbox.x, minY: bbox.y, maxX: bbox.x2, maxY: bbox.y2 })));
  const { minX, minY } = boundingBox;
  const dimension = bboxDimension(boundingBox);
  dimension.width += 2 * minX;
  dimension.height += 2 * minY;

  return { dimension, vectors: result.slice().reverse() };
};

const getParsedVector = (
  path: PathArray,
  properties: Record<string, string | number> | undefined,
  parentStyles: Record<string, string | number> | undefined,
): { parsedVector: ParsedVector, bbox: PathBBox } => {
  const commander = new SVGPathCommander(SVGPathCommander.pathToString(path));
  const bbox = commander.getBBox();
  const styles = getFillAndStroke(properties, parentStyles);

  if (styles?.border?.width) {
    const borderWidth = styles?.border?.width / 2;
    bbox.width === 0 && (bbox.width += borderWidth) && (bbox.x2 += borderWidth);
    bbox.height === 0 && (bbox.height += borderWidth) && (bbox.y2 += borderWidth);
  }

  commander.transform({ translate: [-bbox.x, -bbox.y] });

  const dimension: PebDimension = {
    width: getPebSize(bbox.width),
    height: getPebSize(bbox.height),
  };

  const position: PebPosition = {
    type: PebPositionType.Pinned,
    left: getPebSize(bbox.x),
    top: getPebSize(bbox.y),
  };

  return {
    parsedVector: {
      vector: {
        path: commander.toString(),
        viewBox: { width: bbox.width, height: bbox.height },
      },
      styles: {
        dimension,
        position,
        ...styles,
      },
    },
    bbox,
  };
};

const getFillAndStroke = (
  properties: Record<string, string | number> = {},
  parentProperties: Record<string, string | number> = {},
): Partial<PebElementStyles> => {
  const fill = (properties['fill'] || parentProperties['fill']) as string;
  const stroke = (properties['stroke'] || parentProperties['stroke']) as string;
  const strokeWidth = (properties['stroke-width'] || parentProperties['stroke-width']) as number;

  const color = parsePebColor(fill) ?? { r: 0, g: 0, b: 0, a: 1 };
  const strokeColor = parsePebColor(stroke) ?? strokeWidth ? { r: 0, g: 0, b: 0, a: 1 } : null;

  return {
    fill: { type: PebFillType.Solid, color: color },
    border: strokeColor
      ? { enabled: true, color: strokeColor, width: +strokeWidth, style: PebBorderStyle.Solid }
      : undefined,
  };
};

interface ParsedVector {
  vector: PebVector;
  styles: Partial<PebElementStyles>;
};
