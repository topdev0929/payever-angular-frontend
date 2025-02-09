import {
  isAutoOrUndefined,
  isPixelSize,
  isStickyPosition,
  PebCss,
  PebDefaultTextStyles,
  PebElementDef,
  PebElementStyles,
  PebScreen,
  PebViewStyle,
} from '@pe/builder/core';

import { PebElement } from '../models/dto';
import { isDocument, isOutPage, isSection } from '../models/element.utils';

import {
  getContentAlignCssStyles,
  getPositionCssStyles,
  getPositionCssStylesForWrapper,
  getStickyWrapperForShape,
} from './position-style.utils';
import { sizeCss } from './size-style.utils';
import { getTextCssStyles } from './text-style.utils';

import {
  getBackgroundCssStyles,
  getBorderCssStyles,
  getBorderRadiusCssStyles,
  getCursorCssStyles,
  getDefaultOverflow,
  getFilterCssStyles,
  getLayoutCssStyles,
  getOverflowCssStyles,
  getPaddingCssStyles,
} from '.';


export const WEBKIT_FIX = ['backdrop-filter', 'background-clip'];
const SECTION_ZINDEX = 8000;
const STICKY_ZINDEX = 9000;


export function viewElementStyles(
  elm: PebElement | PebElementDef,
  styles: Partial<PebElementStyles>,
  screen: PebScreen,
  parentStyle: Partial<PebElementStyles> | undefined,
): PebViewStyle {
  styles.overflow = styles.overflow ?? getDefaultOverflow(elm.type, elm.parent?.type);
  if (isSection(elm)) {
    return viewElementStylesForSection(elm, styles, screen, parentStyle);
  }
  if (isDocument(elm)) {
    return viewElementStylesForDocument(styles);
  }

  return viewElementStylesForShape(elm, styles, screen, parentStyle);
}

function viewElementStylesForDocument(styles: Partial<PebElementStyles>): PebViewStyle {
  return {
    host: {
      position: 'relative',
      display: 'block',
      overflowX: 'clip',
      ...getBackgroundCssStyles(styles.fill),
      ...getTextCssStyles(PebDefaultTextStyles),
    },
    inner: {},
  };
}

function viewElementStylesForSection(
  elm: PebElement | PebElementDef,
  styles: Partial<PebElementStyles>,
  screen: PebScreen,
  parentStyle: Partial<PebElementStyles> | undefined,
): PebViewStyle {
  const fullWidth = elm.data?.fullWidth;
  const fullHeight = styles.dimension?.fullDeviceHeight;
  const zIndex: number = SECTION_ZINDEX + (styles.zIndex ?? 0);
  const position = styles.position ?? {};

  let stickyCss: PebCss = {};
  if (isStickyPosition(position)) {
    stickyCss = {
      position: 'sticky',
      top: sizeCss(position?.top),
      bottom: sizeCss(position?.bottom),
      zIndex: `${STICKY_ZINDEX + zIndex}`,
    };
    isAutoOrUndefined(position?.top) && isAutoOrUndefined(position.bottom) && (stickyCss.top = '0px');
  }

  let heightCss: PebCss;
  if (fullHeight) {
    heightCss = {
      height: '100vh',
      minHeight: sizeCss(styles.dimension?.minHeight) || 'auto',
      maxHeight: sizeCss(styles.dimension?.maxHeight) || 'auto',
    }
  } else if (isAutoOrUndefined(styles.dimension?.height)) {
    heightCss = { height: 'auto' };
  } else {
    heightCss = {
      height: 'auto',
      minHeight: sizeCss(styles.dimension?.height),
      maxHeight: 'auto',
    };
  }

  const wrapper: PebCss = {
    display: styles.display === 'none' ? 'none' : 'grid',
    width: '100%',
    height: 'auto',
    minHeight: fullHeight ? '100vh' : sizeCss(styles.dimension?.height),
    gridTemplateColumns: fullWidth ? 'auto' : `auto ${screen.width}px auto`,
    gridTemplateRows: '100%',
    position: 'relative',
    zIndex: `${zIndex}`,
    overflowX: 'hidden',
    ...heightCss,
    ...stickyCss,
    ...getBackgroundCssStyles(styles.fill),
    ...getFilterCssStyles(styles),
    ...getOverflowCssStyles(styles),
  };

  const host =
  {
    ...getOverflowCssStyles(styles),
    ...getLayoutCssStyles(elm, styles),
    ...getPositionCssStyles(elm, styles, parentStyle?.layout),
    ...getBorderCssStyles(styles),
    ...getBorderRadiusCssStyles(styles, elm.meta?.borderRadiusDisabled),
    ...getPaddingCssStyles(styles),
    ...getContentAlignCssStyles(styles, parentStyle),
  };

  const inner = {
    position: 'absolute',
    width: '100%',
    height: '100%',
  };

  return {
    host,
    inner,
    wrapper,
  };
}

function viewElementStylesForShape(
  elm: PebElement | PebElementDef,
  styles: Partial<PebElementStyles>,
  screen: PebScreen,
  parentStyle: Partial<PebElementStyles> | undefined,
): PebViewStyle {
  let wrapper: any = undefined;

  if (isStickyPosition(styles.position)) {
    const padding = parentStyle?.padding ?? { left: 0, top: 0, right: 0, bottom: 0 };
    wrapper = getStickyWrapperForShape(styles, { ...padding });
  }
  else if (isPixelSize(styles.position?.horizontalCenter)) {
    wrapper = {
      ...getPositionCssStylesForWrapper(elm, styles, parentStyle?.layout),
    };
  }

  return {
    ...clientSplitStyles(mappedStyles(elm, styles, parentStyle)),
    wrapper,
  };
}

export const mappedStyles = (
  elm: PebElement | PebElementDef,
  styles: Partial<PebElementStyles>,
  parentStyle: Partial<PebElementStyles> | undefined,
): Partial<CSSStyleDeclaration> => {
  if (!elm?.type) {
    return {};
  }

  if (styles.display === 'none') {
    return { display: 'none' };
  }

  let baseCss: PebCss = {};
  baseCss.boxSizing = 'border-box';
  baseCss.opacity = Number.isFinite(styles.opacity) ? `${styles.opacity}` : undefined;
  baseCss.fontSize = styles.fontSize ? `${styles.fontSize}px` : undefined;

  baseCss = {
    ...baseCss,
    ...getCursorCssStyles(elm),
    ...getOverflowCssStyles(styles),
    ...getContentAlignCssStyles(styles, parentStyle),
    ...getTextCssStyles(styles.textStyles),
    ...getLayoutCssStyles(elm, styles),
    ...getPositionCssStyles(elm, styles, parentStyle?.layout),
    ...getBackgroundCssStyles(styles?.fill),
    ...getBorderCssStyles(styles),
    ...getBorderRadiusCssStyles(styles, elm.meta?.borderRadiusDisabled),
    ...getFilterCssStyles(styles),
    ...getPaddingCssStyles(styles),
  };
  isOutPage(elm) && (baseCss.display = 'none');

  return baseCss;
};

export const clientSplitStyles = (value: PebCss): PebViewStyle => {
  const style: PebViewStyle = { host: {}, inner: {} };
  !style.inner && (style.inner = {});
  !style.host && (style.host = {});

  for (let key in value) {
    innerStyles.includes(key)
      ? style.inner[key] = value[key]
      : style.host[key] = value[key];
  }

  return style;
};

export function toInlineStyle(css: PebCss): string {
  return css
    ? Object.keys(css).map((key: any) => `${kebabCase(key)}:${css[key]}`).join(';')
    : '';
}

export const innerStyles = [
  'justifyContent',
  'background',
  'backgroundClip',
  'webkitTextFillColor',
  'whiteSpace',
];

export function getInlineStyle(value: PebCss | undefined): string {
  if (!value) {
    return '';
  }

  const css: any = {};

  Object.keys(value).forEach((key: any) => {
    const val = value[key];
    if (!val === undefined || val === '') {
      return;
    }
    const name = key.startsWith('webkit') ? '-' + kebabCase(key) : kebabCase(key);
    val !== undefined && (css[name] = val);
  });

  WEBKIT_FIX.forEach((key) => {
    const val = css[key];
    if (val !== undefined) {
      css[`-webkit-${key}`] = val;
    }
  });
  const inlineStyles: string = Object.keys(css).map(key => `${key}:${css[key]}`).join(';');

  return inlineStyles;
}

export function kebabCase(str: string): string {
  const regex = /(\d+|([A-Z][a-z]+)|[a-z]+|([A-Z]+)(?![a-z]))/g;

  return (str.match(regex) || []).map(x => x.toLowerCase()).join('-');
}
