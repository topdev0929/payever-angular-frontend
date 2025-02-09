import { DEFAULT_RGBA, pebColorToHEX } from '@pe/builder/color-utils';
import {
  PebBorderStyle,
  PebElementStyles,
  PebFill,
  PebGradientFill,
  PebImageFill,
  PebUnit,
  isGradient,
  isImage,
} from '@pe/builder/core';

import { getBackgroundCssStyles } from '../styles';

export const convertPathToHtml = (
  id: string,
  path: string,
  styles: Partial<PebElementStyles>,
): string => {
  if (!path) {
    return '';
  }

  id = 'vector-' + id;
  const defs = getSvgDefsElement(id, styles);
  const graphics: string[] = [];
  const element = createPathSvg(id, path);
  graphics.push(element);

  return `${defs}${graphics.map(graphic => graphic).join('\n')}`;
};

const getSvgDefsElement = (
  id: string,
  styles: Partial<PebElementStyles>,
) => {
  const defs: string[] = [];

  if (styles.fill) {
    const element = getFillDefElement(id, styles.fill);
    if (element) {
      defs.push(element);
    }
  }

  return defs.length ? `<defs>${defs.join('\n')}</defs>` : '';
};

export const getVectorInlineStyle = (elementId: string, styles: Partial<PebElementStyles>): string => {
  const declaration: string[] = [];
  const id = `vector-${elementId}`;

  if (styles.fill) {
    const fillBg = getBackgroundCssStyles(styles.fill);
    let fill: string | undefined;
    if (isGradient(styles.fill)) {
      fill = 'url(#gradient-' + id + ')';
    } else if (isImage(styles.fill) && styles.fill.url) {
      fill = 'url(#image-' + id + ')';
    } else {
      fill = fillBg.backgroundColor
    }
    declaration.push(
      `fill: ${fill}`,
    );
  }

  if (styles.border?.enabled) {
    const color = styles.border.color ?? DEFAULT_RGBA;
    declaration.push(`stroke: ${pebColorToHEX(color)}`);
    declaration.push(`stroke-width: ${styles.border?.width.toString()}`);

    if (styles.border?.style === PebBorderStyle.Dotted) {
      declaration.push('stroke-dasharray: 1');
    } else if (styles.border?.style === PebBorderStyle.Dashed) {
      declaration.push('stroke-dasharray: 2');
    }
  }

  return declaration.length ? `#${id} {${declaration.join(';')}} .svg-${elementId}{width:auto;height:auto}` : '';
};

const createPathSvg = (id: string, path: string): string => {
  return `<path id="${id}" d="${path}" />`;
};

const getFillDefElement = (id: string, fill: PebFill) => {
  if (isGradient(fill)) {
    return getGradientFillDefElement(id, fill);
  }

  if (isImage(fill)) {
    return getImageFillDefElement(id, fill);
  }

  return undefined;
};

const getGradientFillDefElement = (id: string, fill: PebGradientFill) => {
  const x1 = 0;
  const y1 = 1;
  const x2 = Math.sin(fill.angle * Math.PI / 180);
  const y2 = Math.sin(fill.angle * Math.PI / 180);
  const stops: string[] = [];

  for (const colorStop of fill.colorStops) {
    stops.push(`<stop offset="${colorStop.offset}" stop-color="${pebColorToHEX(colorStop.color)}" />`);
  }

  return `<linearGradient id="gradient-${id}" x1="${x1}" x2="${x2}" y1="${y1}" y2="${y2}">
    ${stops.join('\n')}
  </linearGradient>`;
};

const getImageFillDefElement = (id: string, fill: PebImageFill) => {
  const { x, y, width } = getImageFillDimension(fill);
  const url = fill.url;

  const image = `<image x="${x}%" y="${y}%" width="${width}%" href="${url}" />`;

  return `<pattern id="image-${id}" patternUnits="userSpaceOnUse" width="100%" height="100%">${image}</pattern>`;
};

const getImageFillDimension = (fill: PebImageFill) => {
  const imageWidth = fill.scale?.unit === PebUnit.Auto ? 100 : fill.scale?.value ?? 0;

  let x: number | '0%';
  let y: number | '0%';

  if (fill.positionX === 'left') {
    x = '0%';
  } else if (fill.positionX === 'right') {
    x = 100 - imageWidth;
  } else {
    x = (100 - imageWidth) / 2;
  }

  if (fill.positionY === 'top') {
    y = '0%';
  } else if (fill.positionY === 'bottom') {
    y = 100 - imageWidth;
  } else {
    y = (100 - imageWidth) / 2
  }

  return { x, y, width: imageWidth };
};
