import { PebViewElementEventType } from './event.model';
import { PebAnimationKeyframeInteraction, PebAnimationPlayInteraction } from './interaction.animation.model';
import { PebIntegrationInteraction } from './interaction.integration.model';
import {
  PebCloseOverlayInteraction,
  PebOpenOverlayInteraction,
  PebSwapOverlayInteraction,
} from './interaction.overlay.model';
import { PebSliderLoadInteraction, PebSliderChangeInteraction } from './interaction.slider.model';


export type PebInteraction = PebInteractionBase
  | PebAnimationPlayInteraction
  | PebAnimationKeyframeInteraction
  | PebOpenOverlayInteraction
  | PebCloseOverlayInteraction
  | PebSwapOverlayInteraction
  | PebSliderLoadInteraction
  | PebSliderChangeInteraction
  | PebIntegrationInteraction;

export enum PebInteractionType {
  None = '',
  NavigateInternal = 'navigate.internal-page',
  NavigateInternalSpecial = 'navigate.internal-special-page',
  NavigateExternal = 'navigate.external-page',
  NavigateApplicationLink = 'navigate.application-link',
  NavigateBack = 'navigate.back',
  ChangeLanguage = 'change-language',
  OpenOverlay = 'overlay.open',
  CloseOverlay = 'overlay.close',
  SwapOverlay = 'overlay.swap',
  SliderLoad = 'slides.load',
  SliderUnload = 'slides.unload',
  SliderChange = 'slides.change',
  SliderPlay = 'slides.play',
  SliderPause = 'slides.pause',
  SliderTogglePlay = 'slides.toggle-play',
  AnimationPlay = 'animation.play',
  AnimationKeyframe = 'animation.keyframe',
  VideoPlay = 'video.play',
  VideoTogglePlay = 'video.toggle-play',
  VideoPause = 'video.pause',
  ContextUpdateValue = 'context.update-value',
  ContextPatch = 'context.patch',
  CookiesAccept = 'cookies.accept',
  CookiesReject = 'cookies.reject',
  IntegrationAction = 'integration.action',
}

export interface PebInteractionBase {
  type: PebInteractionType;
  trigger: PebViewElementEventType;
}

export interface PebInteractionWithPayload<P = any> {
  type: PebInteractionType;
  payload: P;
  context?: any;
}

export interface PebIndexChange {
  type: PebIndexChangeType;
  number?: number;
  loop?: boolean;
}

export enum PebIndexChangeType {
  Next = 'next',
  Prev = 'prev',
  First = 'first',
  Last = 'last',
  Number = 'number',
}
