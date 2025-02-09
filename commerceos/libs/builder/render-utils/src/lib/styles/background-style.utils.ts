import { DEFAULT_RGBA, pebColorToCss } from '@pe/builder/color-utils';
import {
  isGradient,
  isImage,
  isSolid,
  isVideo,
  PebFill,
  PebFillMode,
  PebGradientFill,
  PebImageFill,
  PebSolidFill,
  PebVideoFill,
  PebViewSvg,
} from '@pe/builder/core';

import { sizeCss } from './size-style.utils';


const transparent = { backgroundColor: 'transparent' };

export function getPreviewBackgroundStyle(fill?: PebFill): Partial<CSSStyleDeclaration> {
  if (!fill) {
    return transparent;
  }
  if (isVideo(fill)) {
    return getPreviewVideoStyle(fill);
  }
  return getBackgroundCssStyles(fill);
}

export function getBackgroundCssStyles(fill?: PebFill): Partial<CSSStyleDeclaration> {
  if (!fill) {
    return transparent;
  }
  if (isSolid(fill)) {
    return getSolidStyle(fill)
  }
  if (isGradient(fill)) {
    return getGradientStyle(fill);
  }
  if (isImage(fill)) {
    return getImageStyle(fill)
  }

  return transparent;
}

export function getSolidStyle(fill: PebSolidFill): Partial<CSSStyleDeclaration> {
  return {
    backgroundColor: pebColorToCss(fill.color || DEFAULT_RGBA),
  };
}

export function getGradientStyle(fill: PebGradientFill): Partial<CSSStyleDeclaration> {
  const colorsStr = fill.colorStops.map(c => `${pebColorToCss(c.color || DEFAULT_RGBA)} ${c.offset}%`).join(',');
  const backgroundImage = `linear-gradient(${fill.angle}deg, ${colorsStr})`;

  return { backgroundColor: 'transparent', backgroundImage, backgroundClip: 'padding-box' };
}

export function getBaseBgStyle(fill: PebImageFill | PebVideoFill): Partial<CSSStyleDeclaration> {
  return {
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundClip: 'padding-box',
    backgroundSize: sizeCss(fill.scale),
    backgroundColor: fill.fillColor ? pebColorToCss(fill.fillColor) : 'transparent',
  };
}

export function getImageStyle(fill: PebImageFill): Partial<CSSStyleDeclaration> {
  return {
    ...getBaseBgStyle(fill),
    ...getBackgroundImageStyle(fill.url),
    ...getFillModeStyle(fill.fillMode),
    backgroundPosition: `${fill.positionX ?? 'center'} ${fill.positionY ?? 'center'}`,
    backgroundAttachment: fill.fixed ? 'fixed' : 'scroll',
  };
}

export function getFillModeStyle(mode: PebFillMode): Partial<CSSStyleDeclaration> {
  switch (mode) {
    case PebFillMode.Original:
      return {};

    case PebFillMode.Stretch:
      return {
        backgroundSize: '100% 100%',
      };

    case PebFillMode.Tile:
      return {
        backgroundRepeat: 'repeat',
      };

    case PebFillMode.Fill:
      return {
        backgroundSize: 'cover',
      };

    case PebFillMode.Fit:
      return {
        backgroundSize: 'contain',
      };

    default:
      return {};
  }
}

export function getBackgroundImageStyle(url: string): Partial<CSSStyleDeclaration> {
  return url ? { backgroundImage: `url(${url})` } : {};
}

export function getPreviewVideoStyle(fill: PebVideoFill): Partial<CSSStyleDeclaration> {
  return {
    ...getBaseBgStyle(fill),
    backgroundSize: '100%',
    ...getBackgroundImageStyle(fill.preview),
    ...getFillModeStyle(fill.fillMode),
  };
}


export function pebFillToViewSvg(fill: PebImageFill): PebViewSvg {
  return {
    url: fill.url ?? '',
    scale: 1,
    tile: false,
  };
}
