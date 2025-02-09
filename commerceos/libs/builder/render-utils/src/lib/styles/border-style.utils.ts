import { DEFAULT_RGBA, pebColorToCss } from '@pe/builder/color-utils';
import { PebElementStyles } from '@pe/builder/core';

export function getBorderCssStyles(styles: Partial<PebElementStyles>): Partial<CSSStyleDeclaration> {
  const css: any = {};

  const border = styles.border;
  if (border?.enabled && border.width) {
    const color = border.color ?? DEFAULT_RGBA;
    css.border = `${border.width}px ${border.style ?? 'solid'} ${pebColorToCss(color)}`;

  }

  return css;
}

export function getBorderRadiusCssStyles(styles: Partial<PebElementStyles>, borderRadiusDisabled?: boolean)
  : Partial<CSSStyleDeclaration> {
  if (!styles.borderRadius) {
    return {};
  }
  const borderRadius = borderRadiusDisabled ? '50%' : `${styles.borderRadius}px`;

  return { borderRadius };
}
