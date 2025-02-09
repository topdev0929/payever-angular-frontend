import { RGB, RGBA } from './fill.model';

export interface PebBorder {
  enabled: boolean;
  style: PebBorderStyle,
  color: RGB | RGBA;
  width: number;
}

export enum PebBorderStyle {
  None = 'none',
  Solid = 'solid',
  Dotted = 'dotted',
  Dashed = 'dashed',
  Double = 'double',
  Groove = 'groove',
}
