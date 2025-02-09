import {
  PebAnimation,
  PebAnimationFillMode,
  PebAnimationPropertyKey,
  PebAnimationTiming,
  PebViewElementEventType,
  PebAnimationTriggerSetting,
  PebAnimationValueType,
  PebSize,
  RGBA,
  PebAnimationScrollBinding,
} from '@pe/builder/core';

export interface FormModel {
  key: string;
  trigger: PebViewElementEventType;
  timing: PebAnimationTiming;
  fill: PebAnimationFillMode;
  delay: number;
  duration: number;
  keyframes: KeyframeFormModel[];
  infiniteLoop: boolean;
  iteration: number;
  triggerSetting: PebAnimationTriggerSetting;
  scrollBinding: PebAnimationScrollBinding;
}

export interface KeyframeFormModel {
  offset: PebSize;
  properties: PropertyFormModel[];
}

export interface PropertyFormModel {
  key: PebAnimationPropertyKey;
  values: {
    [PebAnimationValueType.Size]: PebSize;
    [PebAnimationValueType.Color]: RGBA;
    [PebAnimationValueType.XY]: { x: number; y: number };
  };
}

export interface ListItemModel {
  key: string;
  animation: PebAnimation;
  trigger: string;
  action: string;
}
