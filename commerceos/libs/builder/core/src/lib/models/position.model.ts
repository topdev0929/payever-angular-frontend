import { PebSize } from './size.model';
import { PebTextJustify } from './text.model';


export enum PebPositionType {
  Default = 'default',
  Sticky = 'sticky',
  Pinned = 'fixed',
  InlineBlock = 'inline-block',
  Block = 'block',
}

export interface PebPosition {
  type?: PebPositionType;
  top?: PebSize;
  left?: PebSize;
  right?: PebSize;
  bottom?: PebSize;
  horizontalCenter?: PebSize;
}

export interface PebPadding {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export interface PebLayoutPosition {
  index?: number;
  auto?: boolean;
  row?: number;
  column?: number;
  fill?: boolean;
}

export interface PebAbsoluteBound {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
}

export enum PebContentAlign {
  left = 'left',
  canter = 'center',
  right = 'right',
}

export enum PebVerticalAlign {
  Top = 'top',
  Center = 'center',
  Bottom = 'bottom',
}

export const textJustifyToContentAlignMap: { [key in PebTextJustify]: PebContentAlign } = {
  [PebTextJustify.Left]: PebContentAlign.left,
  [PebTextJustify.Right]: PebContentAlign.right,
  [PebTextJustify.Center]: PebContentAlign.canter,
  [PebTextJustify.Justify]: PebContentAlign.left,
};

export const isDefaultPosition = (pos?: PebPosition): boolean =>
  pos ? !pos.type || pos.type === PebPositionType.Default : false;
export const isStickyPosition = (pos?: PebPosition): boolean => pos?.type === PebPositionType.Sticky;
export const isPinnedPosition = (pos?: PebPosition): boolean => pos?.type === PebPositionType.Pinned;
export const isInlineBlockPosition = (pos?: PebPosition): boolean => pos?.type === PebPositionType.InlineBlock;
export const isBlockPosition = (pos?: PebPosition): boolean => pos?.type === PebPositionType.Block;
export const isBlockOrInlinePosition = (pos?: PebPosition): boolean =>
  pos?.type === PebPositionType.Block || pos?.type === PebPositionType.InlineBlock;


export const PEB_DEFAULT_LAYOUT_POSITION: PebLayoutPosition = {
  auto: true,
  fill: false,
};
