import { PebAnimationTiming, PebIndexChangeType, PebInteractionType, PebViewElementEventType } from '@pe/builder/core';

export const animationTriggers = [
  { name: 'Animation Keyframe', value: PebViewElementEventType.AnimationKeyframeChange },
];

export const animationActions = [
  { name: 'Animation Play', value: PebInteractionType.AnimationPlay },
  { name: 'Animation Keyframe', value: PebInteractionType.AnimationKeyframe },
];

export const animationInitValue = {
  customTiming: false,
  keyframeChange: {
    type: PebIndexChangeType.Next,
    loop: true,
    number: 1,
  },
  duration: 1000,
  timing: PebAnimationTiming.Ease,
};