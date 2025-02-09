import { PebAnimation, PebAnimationPreset } from './animation.model';
import { PebPartialContent } from './element.model';
import { PebSolidFill } from './fill.model';
import { PebInteraction, PebInteractionBase, PebInteractionType } from './interaction.model';
import { PebSize } from './size.model';


export enum PebOverlayBackgroundType {
  Default = 'default',
  Transparent = 'transparent',
  None = 'none',
  Fill = 'fill',
  Element = 'element',
}

export interface PebOpenOverlayInteraction extends PebOverlayInteractionBase {
  type: PebInteractionType.OpenOverlay;
}

export interface PebSwapOverlayInteraction extends PebOverlayInteractionBase {
  type: PebInteractionType.SwapOverlay;
}

export interface PebCloseOverlayInteraction extends PebInteractionBase {
  type: PebInteractionType.CloseOverlay;
  animation?: {
    presetKey: string;
    config: PebAnimation;
  };
}

export interface PebOverlayInteractionBase extends PebInteractionBase {
  content: PebPartialContent;
  animation?: { buildId?: PebAnimationPreset },
  back?: { type: PebOverlayBackgroundType; elementId?: string; fill: PebSolidFill; };
  position?: PebOverlayContentPosition;
  closeMode: PebOverlayCloseMode;
}

export enum PebOverlayPositionType {
  Viewport = 'viewport',
  ViewportFixed = 'viewport-fixed',
  Section = 'section',
  Element = 'element',
}

export interface PebOverlayContentPosition {
  type: PebOverlayPositionType;
  top?: PebSize;
  left?: PebSize;
  right?: PebSize;
  bottom?: PebSize;
  width?: PebSize;
  height?: PebSize;
}

export enum PebOverlayCloseMode {
  None = 'none',
  MouseLeave = 'mouse-leave',
  ClickOutside = 'click-outside',
}

export const isOpenOverlayInteraction = (m: Partial<PebInteraction>): m is PebOpenOverlayInteraction =>
  m?.type === PebInteractionType.OpenOverlay;

export const isSwapOverlayInteraction = (m: Partial<PebInteraction>): m is PebSwapOverlayInteraction =>
  m?.type === PebInteractionType.SwapOverlay;

export const isCloseOverlayInteraction = (m: Partial<PebInteraction>): m is PebCloseOverlayInteraction =>
  m?.type === PebInteractionType.CloseOverlay;
