import {
  PebAnimation,
  PebAnimationTiming,
  PebContentAlign,
  PebDefaultAnimationPresetKey,
  PebIndexChange,
  PebIndexChangeType,
  PebIntegrationAction,
  PebInteraction,
  PebInteractionType,  
  PebOverlayBackgroundType,
  PebOverlayCloseMode,
  PebOverlayContentPosition,
  PebPartialContent,
  PebSolidFill,
  PebVerticalAlign,
  PebViewElementEventType,
} from '@pe/builder/core';

export interface FormModel {
  key: string;
  action: PebInteractionType;
  trigger: PebViewElementEventType;
  contentElement: PebPartialContent;
  placeholderElementId: string;
  buildIn: PebDefaultAnimationPresetKey | '';
  buildInConfig: Partial<PebAnimation>;
  backgroundType: PebOverlayBackgroundType;
  backgroundElementId: string;
  position: PebOverlayContentPosition;
  closeMode: PebOverlayCloseMode;
  backFill: PebSolidFill;
  slider: SliderFormModel;
  animation: AnimationFormModel;
  video: VideoFormModel;
  integrationAction: PebIntegrationAction;
}

export interface AnimationFormModel {
  keyframeChange: PebIndexChange;
  customTiming: boolean;
  duration: number;
  timing: PebAnimationTiming;
}

export interface SliderFormModel {
  contentElement: PebPartialContent;
  placeholderElementId: string;
  slideType: PebIndexChangeType;
  slideNumber: number;
  slideLoop: boolean;
  slideAnimation: Partial<PebAnimation>;
  slideAlign: { horizontal: PebContentAlign; vertical: PebVerticalAlign; };
  autoPlay: { duration: number; loop: boolean; onLoad: boolean };
}

export interface VideoFormModel {
  videoElementId: string;
  reset: boolean;
}

export interface ListItemModel {
  key: string;
  interaction: PebInteraction;
  trigger: string;
  action: string;
}
