import { RGB } from './fill.model';

export interface PebSBoxShadow {
  hasShadow: boolean;
  blur: number;
  offset: number;
  color: RGB;
  opacity: number;
  angle: number;
  offsetX?: number;
  offsetY?: number;
}
