import { PebAnimationTiming } from './animation.model';
import { PebIndexChange, PebInteraction, PebInteractionBase, PebInteractionType } from './interaction.model';


export interface PebAnimationPlayInteraction extends PebAnimationInteractionBase {
  type: PebInteractionType.AnimationPlay;
}

export interface PebAnimationKeyframeInteraction extends PebAnimationInteractionBase {
  type: PebInteractionType.AnimationKeyframe;
}

export interface PebAnimationInteractionBase extends PebInteractionBase {
  placeholder: { elementId: string; };
  keyframeChange: PebIndexChange;
  customTiming: boolean;
  duration?: number;
  timing?: PebAnimationTiming;
}

export const isAnimationPlayInteraction = (m: Partial<PebInteraction>): m is PebAnimationPlayInteraction =>
  m?.type === PebInteractionType.AnimationPlay;

export const isAnimationKeyframeInteraction = (m: Partial<PebInteraction>): m is PebAnimationKeyframeInteraction =>
  m?.type === PebInteractionType.AnimationKeyframe;

export const isAnimationInteraction = (m: Partial<PebInteraction>): m is PebAnimationInteractionBase =>
  m?.type === PebInteractionType.AnimationPlay || m?.type === PebInteractionType.AnimationKeyframe;
