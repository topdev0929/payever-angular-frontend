import { PebDefaultTextStyles, PebViewStyle, isBlockOrInlinePosition } from '@pe/builder/core';
import {
  getDefaultOverflow,
  getTextCssStyles,
  getCursorCssStyles,
  getBackgroundCssStyles,
  getBorderCssStyles,
  getBorderRadiusCssStyles,
  getFilterCssStyles,
  innerStyles,
  PebElement,
  isDocument,
  isSection,
  getPaddingCssStyles,
  getOverflowCssStyles,
  isHiddenOverflow,
  getContentAlignCssStyles,
  getBlockCssStyles,
} from '@pe/builder/render-utils';

import { bboxDimension } from './bbox.utils';
import { PEB_DEFAULT_PADDING } from './position.utils';
import { isAutoWidthText } from './text.utils';


export function editorElementStyles(elm: PebElement): PebViewStyle {
  return splitStyles(editorMappedStyles(elm));
}

export function editorMappedStyles(elm: PebElement): Partial<CSSStyleDeclaration> {
  if (!elm?.type) {
    return {};
  }

  if (elm.styles.display === 'none') {
    return { display: 'none' };
  }

  const styles = elm.styles ?? {};
  elm.styles.overflow = elm.styles.overflow ?? getDefaultOverflow(elm.type, elm.parent?.type);

  let css: Partial<CSSStyleDeclaration> = {
    display: styles.display,
    zIndex: `${styles.zIndex ?? 'unset'}`,
    boxSizing: 'border-box',
    opacity: Number.isFinite(styles.opacity) ? `${styles.opacity}` : '1',
  };

  if (!elm.parent?.id) {
    css = {
      ...css,
      ...getTextCssStyles(PebDefaultTextStyles),
    };
  }

  css = {
    ...css,
    ...getOverflowCssStyles(elm.styles),
    ...getContentAlignCssStyles(elm.styles, elm.parent?.styles),
    ...getCursorCssStyles(elm),
    ...getBackgroundCssStyles(styles?.fill),
    ...getBorderCssStyles(styles),
    ...getBorderRadiusCssStyles(styles, elm.meta?.borderRadiusDisabled),
    ...getFilterCssStyles(styles),
    ...getTextCssStyles(styles.textStyles),
    ...getPaddingCssStyles(elm.styles),
    ...getLayoutCssStyles(elm),
  };

  return css;
}

export function splitStyles(value: Partial<CSSStyleDeclaration>): PebViewStyle {
  const style: PebViewStyle = { host: {}, inner: {} };

  if (value) {
    Object.entries(value).forEach(([k, v]: any[]) => {
      !style.inner && (style.inner = {});
      !style.host && (style.host = {});

      if (innerStyles.includes(k)) {
        style.inner[k] = v;
      } else {
        style.host[k] = v;
      }
    });
  }

  return style;
};

function getLayoutCssStyles(elm: PebElement): Partial<CSSStyleDeclaration> {
  if (isDocument(elm)) {
    return {
      position: 'relative',
      display: 'block',
      height: 'auto',
      width: '100%',
      ...getBackgroundCssStyles(elm.styles.fill),
      ...getTextCssStyles(PebDefaultTextStyles),
    };
  }

  const { width, height } = bboxDimension(elm);

  if (isSection(elm)) {
    const padding = elm.styles.padding ?? PEB_DEFAULT_PADDING;
    const screenPadding = elm.data?.fullWidth
      ? 0
      : elm.screen?.padding ?? 0;

    return {
      position: 'relative',
      display: 'block',
      width: `${width}px`,
      height: isHiddenOverflow(elm.styles) ? `${height}px` : 'auto',
      minHeight: `${height}px`,
      paddingLeft: `${padding.left + screenPadding}px`,
      paddingRight: `${padding.right + screenPadding}px`,
    };
  }

  if (isBlockOrInlinePosition(elm.styles.position)) {
    return getBlockCssStyles(elm, elm.styles);
  }

  const [x0, y0] = elm?.parent && isDocument(elm.parent) ? [0, 0] : [elm.parent?.minX ?? 0, elm.parent?.minY ?? 0];
  const left = elm.minX - x0;
  const top = elm.minY - y0;

  return {
    position: 'absolute',
    left: `${left}px`,
    top: `${top}px`,
    width: isAutoWidthText(elm) ? 'auto' : `${width}px`,
    height: isHiddenOverflow(elm.styles) ? `${height}px` : 'auto',
    minHeight: `${height}px`,
    right: 'auto',
    bottom: 'auto',
  };
};
