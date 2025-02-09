import {
  PebAnimationTiming,
  PebContentAlign,
  PebIndexChangeType,
  PebInteractionType,
  PebVerticalAlign,
  PebViewElementEventType,
} from '@pe/builder/core';

import { SliderFormModel } from '../model';

export const sliderTriggers = [
  { name: 'Slider Change Index', value: PebViewElementEventType.SliderIndexChange },
  { name: 'Slider Change Content', value: PebViewElementEventType.SliderContentChange },
  { name: 'Slider Play', value: PebViewElementEventType.SliderPlay },
  { name: 'Slider Pause', value: PebViewElementEventType.SliderPause },
];

export const sliderActions = [
  { name: 'Slider Load', value: PebInteractionType.SliderLoad },
  { name: 'Slider Unload', value: PebInteractionType.SliderUnload },
  { name: 'Slider Play', value: PebInteractionType.SliderPlay },
  { name: 'Slider Pause', value: PebInteractionType.SliderPause },
  { name: 'Slider Play Toggle', value: PebInteractionType.SliderTogglePlay },
  { name: 'Slider Change', value: PebInteractionType.SliderChange },
];

export const sliderInitValue: SliderFormModel = {
  contentElement: { elementId: '', pageId: '' },
  placeholderElementId: '',
  slideType: PebIndexChangeType.First,
  slideNumber: 1,
  slideLoop: true,
  slideAnimation: {
    duration: 400,
    timing: PebAnimationTiming.EaseInOutCubic,
    delay: 0,
  },
  slideAlign: { horizontal: PebContentAlign.canter, vertical: PebVerticalAlign.Center },
  autoPlay: { duration: 2000, loop: true, onLoad: false },
};
