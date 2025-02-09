import { isAutoSize, isPercentSize, isPixelSize, PebMixSize, PebPadding, PebSize, PebUnit } from '@pe/builder/core';
import { getPebSize, PebElement } from '@pe/builder/render-utils';
import * as renderUtils from '@pe/builder/render-utils';

import { PEB_DEFAULT_PADDING } from './position.utils';


export function calculatePebSizeToPixel(mixSizes: PebMixSize[], totalSpace: number): number[] {
  return renderUtils.calculatePebSizeToPixel(mixSizes, totalSpace);
}

export function calculatePixelToPebSize(spaces: number[], units: (PebUnit | undefined)[]): PebSize[] {
  const totalSpace = spaces.reduce((s, c) => s + c, 0);
  const sizes: PebSize[] = [];

  for (let i = 0; i < spaces.length; i++) {
    const value = spaces[i] ?? 0;
    const unit = units[i] ?? PebUnit.Auto;

    if (unit === PebUnit.Percent) {
      sizes.push({ value: 100 * value / totalSpace, unit: PebUnit.Percent });
    }
    else if (unit === PebUnit.Auto) {
      sizes.push({ value: 0, unit: PebUnit.Auto });
    }
    else {
      sizes.push({ value, unit });
    }
  }

  return sizes;
}

export function convertedSize(
  current: PebMixSize,
  update: PebMixSize,
  maxSpace: number,
  calculated: number,
): PebSize | undefined {
  const currentSize = getPebSize(current);
  const updateSize = getPebSize(update);

  if (!currentSize || !updateSize) {
    return updateSize;
  }

  return convertUnit({ value: updateSize.value, unit: currentSize.unit }, updateSize.unit, maxSpace, calculated);
}

export function convertUnit(size: PebSize, newUnit: PebUnit, maxSpace: number, calculated: number,): PebSize {
  if (size.unit === newUnit || !maxSpace) {
    return size;
  }

  if (newUnit === PebUnit.Auto) {
    return { value: 0, unit: PebUnit.Auto };
  }

  if (isAutoSize(size)) {
    return { value: newUnit === PebUnit.Percent ? 100 * (calculated / maxSpace) : calculated, unit: newUnit };
  }

  if (size.unit === PebUnit.Percent && newUnit === PebUnit.Pixel) {
    return { value: 0.01 * (size.value ?? 0) * maxSpace, unit: newUnit };
  }

  if (size.unit === PebUnit.Pixel && newUnit === PebUnit.Percent) {
    return { value: 100 * (size.value ?? 0) / maxSpace, unit: newUnit };
  }

  const [px] = calculatePebSizeToPixel([size], maxSpace);

  return calculatePixelToPebSize([px], [newUnit])[0];
}

export function translateSize(
  mixSize: PebMixSize,
  move: number,
  handlePercentSize: boolean,
  maxSpace: number,
): PebSize | undefined {
  const size = getPebSize(mixSize);
  if (!size) {
    return undefined;
  }

  if (isAutoSize(size)) {
    return size;
  }

  if (isPixelSize(size)) {
    return { value: (size.value ?? 0) + move, unit: size.unit };
  }

  if (handlePercentSize && isPercentSize(size)) {
    return { value: (size.value ?? 0) + 100 * move / maxSpace, unit: size.unit };
  }

  return size;
}

export function scaleSize(
  mixSize: PebMixSize,
  scale: number,
  handlePercentSize: boolean,
): PebSize | undefined {
  const size = getPebSize(mixSize);

  if (!size) {
    return undefined;
  }

  if (isAutoSize(size)) {
    return size;
  }

  if (isPixelSize(size)) {
    return { value: (size.value ?? 0) * scale, unit: size.unit };
  }

  if (handlePercentSize && isPercentSize(size)) {
    return { value: (size.value ?? 0) * scale, unit: size.unit };
  }

  return size;
}

export function normalizeSizes(mixSizes: PebMixSize[], maxSpace?: number): PebSize[] {
  const sizes = mixSizes.map(s => ({ value: 0, unit: PebUnit.Auto, ...getPebSize(s) }));

  if (maxSpace === undefined || sizes.find(s => isAutoSize(s))) {
    return sizes;
  }

  const pixCount = sizes.filter(s => isPixelSize(s)).length;
  const prcCount = sizes.filter(s => isPercentSize(s)).length;
  const last = sizes.filter(s => s !== undefined)[sizes.length - 1];
  if (!last) {
    return sizes;
  }
  const sum = sizes.reduce((acc, s) => acc + (s?.value ?? 0), 0);
  let max: number;
  if (pixCount === 0 && prcCount > 0) {
    max = 100;
  } else if (pixCount > 0 && prcCount === 0) {
    max = maxSpace;
  } else {
    max = sum;
  }
  last.value = Math.max(0, (last.value ?? 0) + max - sum);

  return sizes;
}

export function elementPaddingOrDefault(element: PebElement): PebPadding {
  return element?.styles?.padding ?? PEB_DEFAULT_PADDING;
}
