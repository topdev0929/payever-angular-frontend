import { PebMixSize, PebSize, PebUnit } from '@pe/builder/core';

import { getPebSize } from './models';

export function calculatePebSizeToPixel(mixSizes: PebMixSize[], totalSpace: number): number[] {
  if (!mixSizes?.length) {
    return [];
  }

  const sizes = mixSizes.map(getPebSize);

  const pixelSpaces = sizes
    .filter(size => size && size.unit === PebUnit.Pixel)
    .reduce((p, c) => p + getValueOrDefault(c), 0);

  const totalPercents = sizes
    .filter(size => size && size.unit === PebUnit.Percent)
    .reduce((p, c) => p + getValueOrDefault(c), 0);

  let percentSpace = totalSpace * totalPercents / 100;

  const autoCount = sizes.filter(size => size && size.unit === PebUnit.Auto).length;
  const autoSpace = totalSpace - pixelSpaces - percentSpace;
  const eachAutoSize = autoCount > 0 ? autoSpace / autoCount : 0;

  return sizes.map((size) => {
    const val = getValueOrDefault(size);

    if (!size) {
      return 0;
    }

    if (size.unit === PebUnit.Pixel) {
      return val;
    }

    if (size.unit === PebUnit.Percent) {
      return val * totalSpace / 100;
    }

    if (size.unit === PebUnit.Auto) {
      return eachAutoSize;
    }

    if (size.unit === PebUnit.Fragment) {
      return eachAutoSize * val
    }

    return 0;
  });
}

const getValueOrDefault = (size: PebSize | undefined): number => {
  return size?.value !== undefined ? size.value : 0;
};
