import { PebElementStyles, PebSBoxShadow } from '@pe/builder/core';


export function getFilterCssStyles(styles: Partial<PebElementStyles>): { filter?: string, backdropFilter?: string } {
  return {
    filter: getFilterCss(styles),
    backdropFilter: getBackdropFilterCss(styles.filter?.backBlur),
  };
}

export function getFilterCss({ filter, shadow }: Partial<PebElementStyles>): string | undefined {
  const values = [getBoxShadowCss(shadow), getBlurCss(filter?.blur)].filter(Boolean);

  return values.length ? values.join(' ') : '';
}

export function getBlurCss(blur?: { enabled: boolean, value: number }): string | undefined {
  if (!blur?.enabled) {
    return '';
  }

  return `blur(${blur.value}px)`;
}

export function getBoxShadowCss(shadow: PebSBoxShadow | undefined): string | undefined {
  if (!shadow?.hasShadow || !shadow.color) {
    return '';
  }

  const { blur, color, offset, angle, opacity } = shadow;

  const offsetX = shadow.offsetX ?? offset * Math.cos(angle * Math.PI / 180);
  const offsetY = shadow.offsetY ?? offset * -Math.sin(angle * Math.PI / 180);

  return `drop-shadow(${offsetX}pt ${offsetY}pt ${blur}px rgba(${color.r},${color.g},${color.b},${opacity / 100}))`;
}

export function getBackdropFilterCss(backdropFilter?: { enabled: boolean, value: number }): string | undefined {
  if (!backdropFilter?.enabled) {
    return '';
  }

  return `blur(${backdropFilter.value}px)`;
}

export function calculateShadowOffset(offset: number, angle: number): { offsetX: number, offsetY: number } {

  const offsetX = offset * Math.cos(angle * Math.PI / 180);
  const offsetY = offset * -Math.sin(angle * Math.PI / 180);

  return { offsetX, offsetY };
}
