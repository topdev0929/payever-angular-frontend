import { RGBA } from './rgba';

export class HSVA {
  constructor(
    public h: number,
    public s: number,
    public v: number,
    public a: number,
  ) {
  }
}

export function isHSVA(value: RGBA | HSVA | string): value is HSVA {
  const { h, s, v, a } = value as HSVA;

  return h !== undefined && s !== undefined && v !== undefined && a !== undefined;
}
