import { PebSize } from './size.model';

export enum PebLayoutType {
  Default = 'default',
  Grid = 'grid',
}

export interface PebLayout {
  type: PebLayoutType;
  columns: PebSize[];
  rows: PebSize[];
}

export enum PebOverflowMode {
  Hidden = 'hidden',
  Visible = 'visible',
}

export const isDefaultLayout = (layout?: PebLayout): boolean => layout?.type === PebLayoutType.Default;
export const isGridLayout = (layout?: PebLayout): layout is PebLayout => layout?.type === PebLayoutType.Grid;
