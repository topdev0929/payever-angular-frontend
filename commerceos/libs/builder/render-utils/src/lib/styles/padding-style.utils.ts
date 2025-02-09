import { PebCss, PebElementStyles } from '@pe/builder/core';


export function getPaddingCssStyles(styles: Partial<PebElementStyles>): PebCss {
  const css = {};
  const padding = styles.padding;

  if (!padding) {
    return css;
  }

  return {
    paddingLeft: `${padding.left}px`,
    paddingTop: `${padding.top}px`,
    paddingRight: `${padding.right}px`,
    paddingBottom: `${padding.bottom}px`,
  };
}
