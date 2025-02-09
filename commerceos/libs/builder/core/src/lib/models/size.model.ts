export interface PebSize {
  value: number | undefined;
  unit: PebUnit;
}

export enum PebUnit {
  Auto = 'auto',
  Inherit = 'inherit',
  Pixel = 'px',
  Percent = '%',
  Fragment = 'fr',
  Degree = 'deg',
}

export type PebMixSize = PebSize | number | string | undefined;

export const isAutoSize = (size?: PebMixSize): boolean =>
  size !== undefined && (size === 'auto' || typeof size === 'object' && size.unit === PebUnit.Auto);
export const isPixelSize = (size?: PebSize): boolean => size?.unit === PebUnit.Pixel;
export const isPercentSize = (size?: PebSize): boolean => size?.unit === PebUnit.Percent;
export const isAutoOrUndefined = (size?: PebMixSize): boolean =>
  size === undefined || size === 'auto' || typeof size === 'object' && size.unit === PebUnit.Auto;
export const isInheritSize = (size?: PebSize): boolean => size?.unit === PebUnit.Inherit;

