import { PebCss, PebElementStyles, PebOverflowMode } from '@pe/builder/core';


export function getOverflowCssStyles(styles: Partial<PebElementStyles>): PebCss {
  return {
    whiteSpace: 'normal',
    overflow: styles?.overflow === PebOverflowMode.Hidden ? 'hidden' : 'visible',
  };
}
