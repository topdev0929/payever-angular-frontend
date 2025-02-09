
import { pebColorToCss } from '@pe/builder/color-utils';
import {
  PebAnimationProperty,
  PebAnimationPropertyKey,
  PebCss,
  PenAnimationPropertyValueType,
} from '@pe/builder/core';

import { percentCss, sizeCss } from './size-style.utils';

export const SELF = ':self';

export const propertyResolvers: { [key: string]: PropertyResolver } = {
  [PebAnimationPropertyKey.Opacity]: { style: (val: any) => ({ opacity: percentCss(val) }) },
  [PebAnimationPropertyKey.Move]: { style: (val: any) => ({ transform: `translate(${val.x ?? 0}px, ${val.y ?? 0}px)` }) },
  [PebAnimationPropertyKey.Left]: { style: (val: any) => ({ left: `${sizeCss(val)}` }) },
  [PebAnimationPropertyKey.Right]: { style: (val: any) => ({ right: `${sizeCss(val)}` }) },
  [PebAnimationPropertyKey.Top]: { style: (val: any) => ({ top: `${sizeCss(val)}` }) },
  [PebAnimationPropertyKey.Bottom]: { style: (val: any) => ({ bottom: `${sizeCss(val)}` }) },
  [PebAnimationPropertyKey.Width]: { style: (val: any) => ({ width: `${sizeCss(val)}` }) },
  [PebAnimationPropertyKey.Height]: {
    style: (val: any) => ({
      height: `${sizeCss(val)}`,
      minHeight: `${sizeCss(val)}`,
      maxHeight: `${sizeCss(val)}`,
    }),
  },
  [PebAnimationPropertyKey.RotateX]: { style: (val: any) => ({ transform: `rotateX(${sizeCss(val)})` }) },
  [PebAnimationPropertyKey.RotateY]: { style: (val: any) => ({ transform: `rotateY(${sizeCss(val)})` }) },
  [PebAnimationPropertyKey.RotateZ]: { style: (val: any) => ({ transform: `rotateZ(${sizeCss(val)})` }) },
  [PebAnimationPropertyKey.Scale]: { style: (val: any) => ({ transform: `scale(${percentCss(val)})` }) },
  [PebAnimationPropertyKey.ScaleX]: { style: (val: any) => ({ transform: `scaleX(${percentCss(val)})` }) },
  [PebAnimationPropertyKey.ScaleY]: { style: (val: any) => ({ transform: `scaleY(${percentCss(val)})` }) },
  [PebAnimationPropertyKey.Skew]: { style: (val: any) => ({ transform: `skew(${val.x ?? 0}deg, ${val.y ?? 0}deg)` }) },
  [PebAnimationPropertyKey.SkewX]: { style: (val: any) => ({ transform: `skewX(${sizeCss(val)})` }) },
  [PebAnimationPropertyKey.SkewY]: { style: (val: any) => ({ transform: `skewY(${sizeCss(val)})` }) },
  [PebAnimationPropertyKey.TextColor]: {
    style: (val: any) => ({ color: `${pebColorToCss(val)}` }),
    query: '.ql-editor p, .ql-editor p > span',
  },
  [PebAnimationPropertyKey.BackgroundColor]: { style: (val: any) => ({ 'background-color': `${pebColorToCss(val)}` }) },
  [PebAnimationPropertyKey.BorderColor]: { style: (val: any) => ({ 'border-color': `${pebColorToCss(val)}` }) },
  [PebAnimationPropertyKey.BorderSize]: { style: (val: any) => ({ 'border-width': sizeCss(val) }) },
  [PebAnimationPropertyKey.BorderRadius]: { style: (val: any) => ({ 'border-radius': sizeCss(val) }) },
};

export function propertiesToQueryStyles(properties: PebAnimationProperty[] | undefined): { [query: string]: PebCss } {
  const res: { [query: string]: PebCss } = {};

  for (const prop of properties ?? []) {
    const resolver = propertyResolvers[prop.key];
    if (!resolver) {
      continue;
    }

    const query = resolver.query ?? SELF;
    const resolverStyles = resolver.style(prop.value);

    if (!resolverStyles) {
      continue;
    }

    const queryStyles: any = res[query] ?? (res[query] = {});
    Object.keys(resolverStyles).forEach((key: string) => {
      if (key === 'transform' && queryStyles[key]) {
        queryStyles[key] += ' ' + resolverStyles[key];
      }
      else {
        queryStyles[key] = resolverStyles[key];
      }
    });
  };

  return res;
}

export interface PropertyResolver {
  query?: string;
  style: (val: PenAnimationPropertyValueType) => { [key: string]: string }
}
