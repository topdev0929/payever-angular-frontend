import { HSVA } from './hsva';

export class RGBA {
  constructor(
    public r: number,
    public g: number,
    public b: number,
    public a: number,
  ) {
  }
}

export function isRGBA(value: RGBA | HSVA | string): value is RGBA {
  const { r, g, b, a } = value as RGBA;

  return r !== undefined && g !== undefined && b !== undefined && a !== undefined;
}
