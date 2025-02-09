import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import {
  PebAnimation,
  PebAnimationKeyframe,
  PebAnimationKeyframeMapper,
  PebViewElementEventType,
  PebIndexChange,
  PebRenderElementModel,
  PebVideoPlayStatus,
  PebRenderUpdateModel,
} from '@pe/builder/core';
import {
  getGlobalAnimationId,
  getGlobalKeyframeId,
  getNextIndex,
  getTransitionCssStyle,
} from '@pe/builder/render-utils';
import { PebRenderUpdateAction } from '@pe/builder/view-actions';
import { PebViewState } from '@pe/builder/view-state';


@Injectable({ providedIn: 'any' })
export class PebViewAnimationService {
  private keyframeMapperResolvers
    : { [event in PebViewElementEventType]?: (animation: PebAnimation, update: PebRenderUpdateModel) => number } =
    {
      [PebViewElementEventType.SliderIndexChange]: this.mapSlideIndexEventToKeyframe,
      [PebViewElementEventType.SliderContentChange]: this.mapSlideContentEventToKeyframe,
      [PebViewElementEventType.SliderPause]: this.mapSlidePlayEventToKeyframe,
      [PebViewElementEventType.SliderPlay]: this.mapSlidePlayEventToKeyframe,
      [PebViewElementEventType.VideoPlay]: this.mapVideoPlayEventToKeyframe,
      [PebViewElementEventType.VideoPause]: this.mapVideoPlayEventToKeyframe,
      [PebViewElementEventType.AnimationKeyframeChange]: this.mapAnimationTriggerToKeyframe,
    };

  constructor(
    private readonly store: Store,
  ) {
  }

  changeKeyframe(
    elementId: string,
    animation: PebAnimation,
    keyframeChange: PebIndexChange,
  ) {
    const element = this.store.selectSnapshot(PebViewState.elements)[elementId];
    const currentIndex = element.state?.keyframe?.keyframeIndex ?? 0;
    const nextIndex = getNextIndex(currentIndex, keyframeChange, animation.keyframes?.length);

    this.playKeyframeByIndex(element, animation, nextIndex);
  }

  playKeyframeByIndex(element: PebRenderElementModel, animation: PebAnimation, index: number) {
    const originId = element.origin?.id ?? element.id;
    const keyframeId = getGlobalKeyframeId(originId, animation, index);
    const animationId = getGlobalAnimationId(originId, animation);

    const classes = { ...element?.style?.class };
    Object.keys(classes).forEach(key => key.startsWith(animationId) && (classes[key] = undefined));
    classes[keyframeId] = true;

    this.store.dispatch(new PebRenderUpdateAction([{
      id: element.id,
      style: {
        host: getTransitionCssStyle(animation),
        class: classes,
      },
      state: {
        keyframe: {
          keyframeIndex: index,
          keyframesCount: animation.keyframes?.length ?? 0,
        },
      },
    }]));
  }

  mapEventToKeyframe(animation: PebAnimation, update: PebRenderUpdateModel): number {
    const trigger = animation.trigger;
    if (!trigger) {
      return 0;
    }
    const resolver = this.keyframeMapperResolvers[trigger];

    return resolver
      ? resolver(animation, update)
      : 0;
  }

  mapSlideIndexEventToKeyframe(animation: PebAnimation, update: PebRenderUpdateModel): number {
    const setting = animation.triggerSetting;
    const slideIndex = update.state?.slider?.slideIndex ?? 0;
    const slideCount = update.state?.slider?.slidesCount ?? 0;
    if (!setting) {
      return 0;
    }

    if (setting.keyframeMapper === PebAnimationKeyframeMapper.IsFirst) {
      return slideIndex === 0 && slideCount > 0 ? 1 : 0;
    }
    if (setting.keyframeMapper === PebAnimationKeyframeMapper.IsLast) {
      return slideIndex + 1 >= slideCount && slideCount > 0 ? 1 : 0;
    }
    if (setting.keyframeMapper === PebAnimationKeyframeMapper.IsNumberEqual) {
      return slideIndex + 1 === setting.equalNumber ? 1 : 0;
    }
    if (setting.keyframeMapper === PebAnimationKeyframeMapper.Linear) {
      return slideIndex;
    }

    return 0;
  }

  mapSlideContentEventToKeyframe(animation: PebAnimation, update: PebRenderUpdateModel): number {
    const setting = animation.triggerSetting;
    if (!setting) {
      return 0;
    }
    if (setting.keyframeMapper === PebAnimationKeyframeMapper.IsContentEqual) {
      return update.state?.slider?.contentElementId === setting.contentElementId ? 1 : 0;
    }

    return 0;
  }


  mapSlidePlayEventToKeyframe(animation: PebAnimation, update: PebRenderUpdateModel): number {
    const setting = animation.triggerSetting;
    if (!setting) {
      return 0;
    }

    if (setting.keyframeMapper === PebAnimationKeyframeMapper.Linear) {
      const isPlaying = update.state?.slider?.playing ?? false;
      const val = animation.trigger === PebViewElementEventType.SliderPlay ? isPlaying : !isPlaying;

      return val ? 1 : 0;
    }

    return 0;
  }

  mapVideoPlayEventToKeyframe(animation: PebAnimation, update: PebRenderUpdateModel): number {
    const setting = animation.triggerSetting;
    if (!setting) {
      return 0;
    }

    if (setting.keyframeMapper === PebAnimationKeyframeMapper.Linear) {
      const isPlaying = update.state?.video?.playStatus === PebVideoPlayStatus.Playing;
      const val = animation.trigger === PebViewElementEventType.VideoPlay ? isPlaying : !isPlaying;

      return val ? 1 : 0;
    }

    return 0;
  }


  mapAnimationTriggerToKeyframe(animation: PebAnimation, update: PebRenderUpdateModel): number {
    const setting = animation.triggerSetting;
    const keyframeIndex = update.state?.keyframe?.keyframeIndex ?? 0;
    const keyframesCount = update.state?.keyframe?.keyframesCount ?? 0;
    if (!setting) {
      return 0;
    }

    if (setting.keyframeMapper === PebAnimationKeyframeMapper.IsFirst) {
      return keyframeIndex === 0 && keyframesCount > 0 ? 1 : 0;
    }
    if (setting.keyframeMapper === PebAnimationKeyframeMapper.IsLast) {
      return keyframeIndex + 1 >= keyframesCount && keyframesCount > 0 ? 1 : 0;
    }
    if (setting.keyframeMapper === PebAnimationKeyframeMapper.IsNumberEqual) {
      return keyframeIndex + 1 === setting.equalNumber ? 1 : 0;
    }
    if (setting.keyframeMapper === PebAnimationKeyframeMapper.Linear) {
      return keyframeIndex;
    }

    return 0;
  }

  normalizeKeyframes(keyframes: PebAnimationKeyframe[]): PebAnimationKeyframe[] {
    if (keyframes.length > 1) {
      return keyframes;
    }

    const keyframe: PebAnimationKeyframe = {
      offset: 0,
      properties: [],
    };

    return [
      keyframe,
      ...keyframes,
    ];
  }

}
