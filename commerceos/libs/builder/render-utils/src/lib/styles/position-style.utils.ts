import {
  isAutoOrUndefined,
  isAutoSize,
  isGridLayout,
  isPixelSize,
  PebCss,
  PebDimension,
  PebElementDef,
  PebElementStyles,
  PebLayout,
  PebPositionType,
  PEB_DEFAULT_LAYOUT_POSITION,
  PebElementType,
  isBlockOrInlinePosition,
  isInlineBlockPosition,
  PebOverflowMode,
  PebContentAlign,
  isBlockPosition,
  PebPadding,
  PebClonePositioningType,
} from '@pe/builder/core';

import { PebElement, resolveRowAndColByIndex } from '../models/dto';
import { elementContentAlign, isSection } from '../models/element.utils';
import { calculatePebSizeToPixel } from '../render-size.utils';

import { sizeCss } from './size-style.utils';


export function getPositionCssStyles(
  elm: PebElement | PebElementDef,
  styles: Partial<PebElementStyles>,
  parentLayout: PebLayout | undefined,
): PebCss {
  if (styles.display === 'none') {
    return { display: 'none' };
  }

  if (isSection(elm)) {
    return getSectionPositionCssStyles(elm);
  }

  if (isBlockOrInlinePosition(styles.position)) {
    return getBlockCssStyles(elm, styles);
  }

  const position = styles.position;
  const dimension = getDimension(elm, styles);
  if (!position || !dimension) {
    return { display: 'none' };
  }

  let css: PebCss = {
    top: sizeCss(position.top) ?? 'auto',
    right: sizeCss(position.right) ?? 'auto',
    bottom: sizeCss(position.bottom) ?? 'auto',
    left: sizeCss(position.left) ?? 'auto',
    width: isAutoWidthText(elm.type, styles) ? 'auto' : sizeCss(dimension.width) ?? 'auto',
    maxWidth: isAutoWidthText(elm.type, styles) ? '100%' : 'auto',
    height: canGrowHeight(elm.type, styles) ? 'auto' : sizeCss(dimension.height),
    minHeight: sizeCss(dimension.height) ?? 'auto',
    minWidth: sizeCss(dimension.minWidth) ?? 'auto',
    position: positionsMap[getPositionType(styles)],
    zIndex: `${styles.zIndex ?? 0}`,
    ...getAspectRatioCssStyles(elm, styles),
    ...getGridArea(elm, styles, parentLayout),
  };

  if (!isAutoOrUndefined(dimension.minHeight)) {
    css.height = sizeCss(dimension.height);
    css.minHeight = sizeCss(dimension.minHeight);
  }

  if (isPixelSize(styles.position?.horizontalCenter)) {
    css.left = sizeCss(styles.position?.horizontalCenter);
    css.right = 'auto';
    css.top = '0px';
    css.bottom = 'auto';
    css.position = 'relative';
  }

  if (css.position !== 'relative') {
    const isVerticalCenter = isAutoOrUndefined(position.top) && isAutoOrUndefined(position.bottom);
    const isHorizontalCenter = isAutoOrUndefined(position.left) && isAutoOrUndefined(position.right);

    isVerticalCenter && makeVerticalCenter(css, dimension);
    isHorizontalCenter && makeHorizontalCenter(css, dimension);
  }

  return css;
}

export function getBlockCssStyles(
  elm: PebElement | PebElementDef,
  styles: Partial<PebElementStyles>,
): PebCss {
  const dimension = getDimension(elm, styles) ?? {};
  const aspectRatio = getAspectRatioCssStyles(elm, styles);

  let css = {
    position: 'relative',
    display: isInlineBlockPosition(styles.position) ? 'inline-block' : 'block',
    left: 'auto',
    top: 'auto',
    right: 'auto',
    bottom: 'auto',
    width: 'auto',
    height: canGrowHeight(elm.type, styles) ? 'auto' : sizeCss(dimension.height),
    minHeight: sizeCss(dimension.minHeight) ?? 'auto',
    verticalAlign: 'top',
    ...aspectRatio,
  };

  if (dimension) {
    !isAutoWidthText(elm.type, styles) && (css.width = sizeCss(dimension.width));
    !isAutoHeightText(elm.type, styles) && !aspectRatio && (css.minHeight = sizeCss(dimension.height));
  }

  return css;
}

export function getClonedElementPositionStyles(
  style: PebCss | undefined,
  positioning?: { type: PebClonePositioningType },
): PebCss {
  return positioning?.type === PebClonePositioningType.Array
    ? {
      position: 'relative',
      display: style?.display && ['inline-block', 'block'].includes(style.display) ? style.display : 'inline-block',
    }
    : {};
}

export function makeVerticalCenter(css: PebCss, dimension: PebDimension | undefined): void {
  const allAuto = css.top === 'auto' && css.bottom === 'auto' && isAutoOrUndefined(dimension?.height);
  css.height = allAuto ? `${100 / 3}%` : sizeCss(dimension?.height);
  css.top = '0';
  css.bottom = '0';
  css.marginTop = 'auto';
  css.marginBottom = 'auto';

}

export function makeHorizontalCenter(css: PebCss, dimension: PebDimension | undefined): void {
  const allAuto = css.left === 'auto' && css.right === 'auto' && isAutoOrUndefined(dimension?.width);
  css.width = allAuto ? `${100 / 3}%` : sizeCss(dimension?.width);
  css.left = '0';
  css.right = '0';
  css.marginLeft = 'auto';
  css.marginRight = 'auto';
}

export function getPositionCssStylesForWrapper(
  elm: PebElement | PebElementDef,
  styles: Partial<PebElementStyles>,
  parentLayout: PebLayout | undefined,
): PebCss {
  if (!isPixelSize(styles.position?.horizontalCenter)) {
    return {};
  }

  const position = styles.position;
  const dimension = getDimension(elm, styles);

  if (!position || !dimension) {
    return { display: 'none' };
  }

  let css: PebCss = {
    top: sizeCss(position.top),
    bottom: sizeCss(position.bottom),
    left: '50%',
    right: 'auto',
    width: sizeCss(dimension.width) ?? '0px',
    height: '0px',
    position: 'absolute',
    zIndex: `${styles.zIndex ?? 0}`,
    ...getGridArea(elm, styles, parentLayout),
  };

  return css;
}

export function getAspectRatioCssStyles(
  element: PebElement | PebElementDef,
  style: Partial<PebElementStyles>,
): PebCss | undefined {
  const { width, height } = style.absoluteBound ?? {};

  if (!width || !height || !element.data?.constrainProportions || element.type !== PebElementType.Shape) {
    return undefined;
  }

  return {
    aspectRatio: `${width} / ${height}`,
    height: 'auto',
    minHeight: 'auto',
  };
}

export function getContentAlignCssStyles(
  styles: Partial<PebElementStyles>,
  parentStyles: Partial<PebElementStyles> | undefined,
): PebCss {
  const textAlign = styles.textStyles?.textJustify;
  const css: PebCss = {
    textAlign: textAlign ?? 'left',
  };

  const parentContentAlign = elementContentAlign(parentStyles);

  if (isBlockPosition(styles.position) && parentContentAlign) {
    if (parentContentAlign === PebContentAlign.left) {
      css.marginLeft = '0';
      css.marginRight = 'auto';
    } else if (parentContentAlign === PebContentAlign.right) {
      css.marginRight = '0';
      css.marginLeft = 'auto';
    } else if (parentContentAlign === PebContentAlign.canter) {
      css.marginLeft = 'auto';
      css.marginRight = 'auto';
    }
  }

  return css;
}


function getSectionPositionCssStyles(elm: PebElement | PebElementDef): PebCss {
  const full = elm.data?.fullWidth;

  return {
    position: 'relative',
    gridArea: full
      ? '1 / 1 / span 1 / span 1'
      : '1 / 2 / span 1 / span 1',
  };
}

function getPositionType(styles: Partial<PebElementStyles>): PebPositionType {
  if (
    isAutoOrUndefined(styles.position?.left)
    || isAutoOrUndefined(styles.position?.top)
    || isAutoOrUndefined(styles.dimension?.width)
    || isAutoOrUndefined(styles.dimension?.height)
  ) {
    return PebPositionType.Pinned;
  }

  return styles.position?.type ?? PebPositionType.Default;
}

function getDimension(
  elm: PebElement | PebElementDef,
  styles: Partial<PebElementStyles>,
): PebDimension | undefined {
  const { fill } = styles.layoutPosition ?? PEB_DEFAULT_LAYOUT_POSITION;
  const dimension = { ...styles.dimension };

  fill && isAutoSize(dimension.width) && isAutoSize(dimension.height);

  return dimension;
}

function getGridArea(
  elm: PebElement | PebElementDef,
  styles: Partial<PebElementStyles>,
  parentLayout: PebLayout | undefined,
): PebCss {
  if (!parentLayout || !isGridLayout(parentLayout) || !styles.layoutPosition) {
    return { gridArea: '1/1' };
  }

  const { row, column } =
    resolveRowAndColByIndex(styles.layoutPosition.index, parentLayout.rows.length, parentLayout.columns.length);

  const css: PebCss = row < 0 || column < 0
    ? { display: 'none' }
    : { gridArea: `${row + 1} / ${column + 1} / span 1 / span 1` };

  styles.layoutPosition.fill && (css.position = 'relative');

  return css;
}

export function getStickyWrapperForShape(styles: Partial<PebElementStyles>, parentPadding: PebPadding) {
  const [top, height] = calculatePebSizeToPixel([
    styles.position?.top,
    styles.dimension?.height,
  ], styles.absoluteBound?.height ?? 0);

  const css: PebCss = {
    width: '100%',
    height: `${top + height}px`,
    position: 'sticky',
    top: `${parentPadding.top - top}px`,
  };

  !isAutoOrUndefined(styles.position?.left) && (css.marginLeft = `${-parentPadding.left}px`);
  !isAutoOrUndefined(styles.position?.right) && (css.marginLeft = `${parentPadding.left}px`);

  return css;
};


const positionsMap: { [key: string]: string } = {
  [PebPositionType.Default]: 'absolute',
  [PebPositionType.Pinned]: 'absolute',
  [PebPositionType.Sticky]: 'absolute',
};

function canGrowHeight(type: PebElementType | undefined, styles: Partial<PebElementStyles>): boolean {
  if (type === PebElementType.Text) {
    return isAutoHeightText(type, styles);
  }

  if (type === PebElementType.Section) {
    return true;
  }

  return styles.overflow !== PebOverflowMode.Hidden;
}

function isAutoWidthText(type: PebElementType | undefined, styles: Partial<PebElementStyles>): boolean {
  return type === PebElementType.Text && !styles.textStyles?.fixedWidth;
}

function isAutoHeightText(type: PebElementType | undefined, styles: Partial<PebElementStyles>): boolean {
  return type === PebElementType.Text && !styles.textStyles?.fixedHeight;
}
