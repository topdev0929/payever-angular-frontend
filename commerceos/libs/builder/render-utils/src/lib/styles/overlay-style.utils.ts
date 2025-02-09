import {
  PebCss,
  PebOverlayBackgroundType,
  PebOverlayContentPosition,
  PebOverlayPositionType,
  PebSolidFill,
  isAutoOrUndefined,
  isInheritSize,
} from '@pe/builder/core';

import { getBackgroundCssStyles } from './background-style.utils';
import { sizeCss } from './size-style.utils';

export function getOverlayBackCssStyle(
  back: { type: PebOverlayBackgroundType; fill: PebSolidFill; } | undefined,
  zIndex: number | undefined,
): PebCss {
  let css: PebCss = {
    position: 'absolute',
    display: 'block',
    left: '0',
    right: '0',
    top: '0',
    bottom: '0',
    width: 'auto',
    height: 'auto',
    minWidth: 'auto',
    maxWidth: 'auto',
    minHeight: 'auto',
    maxHeight: 'auto',
    paddingTop: '5%',
    overflow: 'auto',
  };
  zIndex !== undefined && (css.zIndex = `${zIndex}`);

  if (!back || back.type === PebOverlayBackgroundType.Default) {
    css.background = '#0000007a';
  }
  else if (back.type === PebOverlayBackgroundType.Fill) {
    css = {
      ...css,
      ...getBackgroundCssStyles(back.fill),
    };
  }

  return css;
}

export function getOverlayWrapperStyle(
  position: PebOverlayContentPosition | undefined,
  zIndex?: number | undefined,
): PebCss {
  if (!position?.type || isViewport(position)) {
    const css: PebCss = {
      position: 'fixed',
      display: 'block',
      top: '0px',
      bottom: '0px',
      left: '0px',
      right: '0px',
      margin: 'auto',
      overflow: 'auto',
    };
    zIndex !== undefined && (css.zIndex = `${zIndex}`);

    return css;
  }

  return {};
}

export function getOverlayContentStyle(
  position: PebOverlayContentPosition | undefined,
  zIndex?: number | undefined,
): PebCss {
  if (!position?.type) {
    return getOverlayContentStyleDefault(zIndex);
  }

  if (position.type === PebOverlayPositionType.Viewport) {
    return getOverlayContentStyleForViewport(position, zIndex);
  }

  if (position.type === PebOverlayPositionType.ViewportFixed) {
    return getOverlayContentStyleForViewportFixed(position, zIndex);
  }

  if (position.type === PebOverlayPositionType.Section) {
    return getOverlayContentStyleForSection(position, zIndex);
  }

  return {};
}

export function getOverlayContentStyleDefault(zIndex?: number | undefined): PebCss {
  let css: PebCss = {
    position: 'absolute',
    display: 'block',
    top: '5%',
    bottom: 'auto',
    left: 'auto',
    right: 'auto',
    margin: 'auto',
  };
  zIndex !== undefined && (css.zIndex = `${zIndex}`);

  return css;
}

export function getOverlayContentStyleForViewport(
  position: PebOverlayContentPosition,
  zIndex?: number | undefined,
): PebCss {
  let css: PebCss = {
    position: 'relative',
    display: 'block',
    margin: 'auto',
    left: sizeCss(position.left),
    top: sizeCss(position.top),
    right: sizeCss(position.right),
    bottom: sizeCss(position.bottom),
  };
  !isInheritSize(position?.width) && (css.width = sizeCss(position.width));
  !isInheritSize(position.height) && (css.height = sizeCss(position.height));
  zIndex !== undefined && (css.zIndex = `${zIndex}`);

  return css;
}

export function getOverlayContentStyleForViewportFixed(
  position: PebOverlayContentPosition,
  zIndex?: number | undefined,
): PebCss {
  let css: PebCss = {
    position: 'absolute',
    display: 'block',
    margin: 'auto',
    left: sizeCss(position.left),
    top: sizeCss(position.top),
    right: sizeCss(position.right),
    bottom: sizeCss(position.bottom),
  };
  !isInheritSize(position?.width) && (css.width = sizeCss(position.width));
  !isInheritSize(position.height) && (css.height = sizeCss(position.height));
  zIndex !== undefined && (css.zIndex = `${zIndex}`);

  const isVerticalCenter = isAutoOrUndefined(position.top) && isAutoOrUndefined(position.bottom);
  const isHorizontalCenter = isAutoOrUndefined(position.left) && isAutoOrUndefined(position.right);

  let transform = [];
  isVerticalCenter && transform.push('translateY(-50%)') && (css.top = '50%');
  isHorizontalCenter && transform.push('translateX(-50%)') && (css.left = '50%');
  transform.length && (css.transform = transform.join(' '));

  return css;
}

function getOverlayContentStyleForSection(
  position: PebOverlayContentPosition,
  zIndex?: number | undefined,
): PebCss {
  let css: PebCss = {
    position: 'absolute',
    display: 'block',
    left: sizeCss(position.left),
    top: sizeCss(position.top),
    right: sizeCss(position.right),
    bottom: sizeCss(position.bottom),
  };

  !isInheritSize(position?.width) && (css.width = sizeCss(position.width));
  !isInheritSize(position.height) && (css.height = sizeCss(position.height));
  zIndex !== undefined && (css.zIndex = `${zIndex}`);

  return css;
}


function isViewport(position: PebOverlayContentPosition | undefined): boolean {
  return position?.type === PebOverlayPositionType.Viewport ||
    position?.type === PebOverlayPositionType.ViewportFixed;
}
