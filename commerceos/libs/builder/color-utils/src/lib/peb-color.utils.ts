import { PebColorStop, PebFillType, PebGradientFill, PebGradientType, RGB, RGBA } from '@pe/builder/core';

import { hexToRgba } from './hex-to-rgba';

export const DEFAULT_RGBA = { r: 0, g: 0, b: 0, a: 0 };

export const parsePebColor = (val: string): RGB | RGBA | null => {
  if (!val) {
    return null;
  }

  return parseRgba(val) || hexToRgba(val);
};

export const pebColorToCss = (color: RGB | RGBA): string => {
  if (!color) {
    return '';
  }
  const rgba = color as RGBA;

  return rgba.a !== undefined
    ? `rgba(${rgba.r},${rgba.g},${rgba.b}, ${rgba.a})`
    : `rgb(${rgba.r},${rgba.g},${rgba.b})`;
};

export const getGradientStyle = (fill: PebGradientFill): string => {
  if (!fill?.colorStops?.length) {
    return '';
  }

  const validColorStops = fill.colorStops.filter(c => c?.offset !== null);
  const colorsStr = validColorStops
    .map(c => `${pebColorToCss(c.color || DEFAULT_RGBA)} ${c.offset}%`)
    .join(',');
  const backgroundImage = `linear-gradient(${fill.angle}deg, ${colorsStr})`;

  return backgroundImage;
};

export const pebColorToHEX = (color: RGB | RGBA): string => {
  if (!color) {
    return '';
  }
  const r = Math.round(color.r).toString(16).padStart(2, '0');
  const g = Math.round(color.g).toString(16).padStart(2, '0');
  const b = Math.round(color.b).toString(16).padStart(2, '0');
  const rgbaColor = color as RGBA;
  const a = rgbaColor.a !== undefined ? Math.round(rgbaColor.a * 255).toString(16).padStart(2, '0') : '';

  return `#${r}${g}${b}${a}`.toLowerCase();
};

export const parseRgba = (value: string): RGB | RGBA | null => {
  let m = /^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(value);
  if (m) {
    return { r: +m[1], g: +m[2], b: +m[3] };
  }

  m = /^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+\.?\d*|\.\d+)\s*\)$/i.exec(value);
  if (m) {
    return { r: +m[1], g: +m[2], b: +m[3], a: +m[4] };
  }

  return null;
};


export function getPebGradient(backgroundImage: string): PebGradientFill | null {
  if (!backgroundImage?.includes('linear-gradient')) {
    return null;
  }

  backgroundImage = backgroundImage?.replace('white', '#ffffff');

  const re =
    /\d+\.?\d?deg,\s?|#[a-fA-F0-9]{3,8}\s\d+%|rgba?\(\d+\.?\d*,\s?\d+\.?\d*,\s?\d+\.?\d*,?\s?\d?\.?\d*\)\s\d+\.?\d*%/g;
  const matches = backgroundImage.match(re);
  if (matches) {
    const angle = parseFloat(matches.shift() ?? '0');
    const colorStops: PebColorStop[] = matches.map((step) => {
      const [colorStr, offsetStr] = step.split(' ');

      return { color: parsePebColor(colorStr) ?? DEFAULT_RGBA, offset: parseFloat(offsetStr) };
    });

    return {
      type: PebFillType.Gradient,
      gradientType: PebGradientType.Linear,
      angle,
      colorStops: [colorStops[0], colorStops[1]],
    };
  }

  return {
    type: PebFillType.Gradient,
    gradientType: PebGradientType.Linear,
    angle: 90,
    colorStops: [
      { offset: 0, color: parsePebColor('#ffffff') ?? DEFAULT_RGBA },
      { offset: 0, color: parsePebColor('#ffffff') ?? DEFAULT_RGBA },
    ],
  };
}
