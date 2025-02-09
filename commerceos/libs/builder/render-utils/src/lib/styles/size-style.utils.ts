import { PebMixSize, PebSize, PebUnit } from '@pe/builder/core';

import { getPebSize } from '../models';


export function sizeCss(size: PebMixSize, emptyValue: string = 'unset'): string {
  if (!size) {
    return emptyValue;
  }

  if (size === 'auto') {
    return 'auto';
  }

  const { value, unit } = getPebSize(size) ?? {};

  if (value === undefined) {
    return emptyValue;
  }

  if (unit === PebUnit.Auto) {
    return 'auto';
  }

  return `${value}${unit}`;
}

export function percentCss(size: PebSize): string {
  if (!size) {
    return '0';
  }

  return `${(size.value ?? 0) / 100}`;
}
