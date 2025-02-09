import { Injectable } from '@angular/core';

import {
  PebAnimation,
  PebAnimationDirection,
  PebAnimationFillMode,
  PebAnimationKeyframe,
  PebAnimationPropertyKey,
  PebAnimationTiming,
  PebDefaultAnimationPresetKey,
} from '@pe/builder/core';
import { getPebSize } from '@pe/builder/render-utils';

@Injectable()
export class PebAnimationPresetService {
  resolvers: { [key in PebDefaultAnimationPresetKey]: () => PebAnimationKeyframe[] } = {
    [PebDefaultAnimationPresetKey.FadeIn]: this.createFadeInKeyframes,
    [PebDefaultAnimationPresetKey.ZoomIn]: this.createZoomInKeyframes,
    [PebDefaultAnimationPresetKey.SlideIn]: this.createSlideInKeyframes,
  };

  defaultAnimation: PebAnimation = {
    delay: 0,
    iteration: 1,
    duration: 400,
    fill: PebAnimationFillMode.Both,
    timing: PebAnimationTiming.EaseOut,
    direction: PebAnimationDirection.Normal,
    infiniteLoop: false,
    keyframes: [],
    trigger: undefined,
  }

  composeAnimation(
    presetName: PebDefaultAnimationPresetKey,
    defaults?: Partial<PebAnimation>,
  ): PebAnimation {
    const resolver = this.resolvers[presetName];

    const keyframes = resolver ? resolver() : [];

    return {
      ...this.defaultAnimation,
      ...defaults,
      id: presetName,
      keyframes,
    };
  }


  createFadeInKeyframes(): PebAnimationKeyframe[] {
    return [
      {
        offset: 0, properties: [
          { key: PebAnimationPropertyKey.Opacity, value: getPebSize(0) },
        ],
      },
      {
        offset: 100, properties: [
          { key: PebAnimationPropertyKey.Opacity, value: getPebSize(100) },
        ],
      },
    ];
  }

  createZoomInKeyframes(): PebAnimationKeyframe[] {
    return [
      {
        offset: 0, properties: [
          { key: PebAnimationPropertyKey.Opacity, value: getPebSize(0) },
          { key: PebAnimationPropertyKey.Scale, value: getPebSize(0) },
        ],
      },
      {
        offset: 100, properties: [
          { key: PebAnimationPropertyKey.Opacity, value: getPebSize(100) },
          { key: PebAnimationPropertyKey.Scale, value: getPebSize(100) },
        ],
      },
    ];
  }

  createSlideInKeyframes(): PebAnimationKeyframe[] {
    return [
      {
        offset: 0, properties: [
          { key: PebAnimationPropertyKey.Opacity, value: getPebSize(0) },
          { key: PebAnimationPropertyKey.Move, value: { x: 1000, y: 0 } },
        ],
      },
      {
        offset: 100, properties: [
          { key: PebAnimationPropertyKey.Opacity, value: getPebSize(100) },
          { key: PebAnimationPropertyKey.Move, value: { x: 0, y: 0 } },
        ],
      },
    ];
  }
}
