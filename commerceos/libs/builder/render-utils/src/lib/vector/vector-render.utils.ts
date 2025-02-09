import { stringToRgba } from '@pe/builder/color-utils';
import { PebElementStyles, PebFillType, PebGradientFill, PebGradientType, RGBA } from '@pe/builder/core';

import { PebVectorStylesResult } from './vector-renderer.model';

export const getVectorStyles = (styles: Partial<PebElementStyles>): PebVectorStylesResult => {
  return {
    host: {
      position: styles?.position,
      dimension: styles?.dimension,
      display: styles?.display,
      shadow: styles?.shadow,
      filter: styles?.filter,
      opacity: styles?.opacity,
      zIndex: styles?.zIndex,
    },
    inner: {
      fill: styles.fill,
      border: styles.border,
    },
  };
};

export const getVectorPatchElementStyles = (
  style: Partial<CSSStyleDeclaration>,
): PebVectorStylesResult => {
  const inner: Partial<PebElementStyles> = {};

  if (style.backgroundImage?.startsWith('linear-gradient')) {
    inner.fill = getGradientFillStyle(style.backgroundImage);
  } else if (style.backgroundColor) {
    inner.fill = {
      type: PebFillType.Solid,
      color: stringToRgba(style.backgroundColor) as RGBA,
    };
  }

  const hostStyleKeys: (keyof CSSStyleDeclaration)[] = ['top', 'left', 'width', 'height', 'opacity', 'filter'];
  const css = hostStyleKeys.reduce((acc, key) => {
    if (style[key]) {
      acc[key] = style[key];
    }

    return acc;
  }, {} as any);
  
  return { css, inner };
};

const getGradientFillStyle = (gradient: string): PebGradientFill => {
  const splitted = gradient.substring(gradient.indexOf('(') + 1, gradient.lastIndexOf(')')).split('rgba');

  const fill: PebGradientFill = {
    type: PebFillType.Gradient,
    angle: +splitted[0].replace('deg,', ''),
    gradientType: PebGradientType.Linear,
    colorStops: [
      { offset: 0, color: stringToRgba('rgba' + splitted[1].substring(0, splitted[1].lastIndexOf(' '))) as RGBA },
      { offset: 100, color: stringToRgba('rgba' + splitted[2].substring(0, splitted[2].lastIndexOf(' '))) as RGBA },
    ],
  };

  return fill;
};
