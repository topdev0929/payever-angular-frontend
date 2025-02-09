import {
  PEB_WHITE_RGBA,
  PebAnimationBindingType,
  PebAnimationFillMode,
  PebAnimationKeyframeMapper,
  PebAnimationPropertyKey,
  PebAnimationTiming,
  PebViewElementEventType,
  PebAnimationValueType,
  PebAnimationScrollTarget,
} from '@pe/builder/core';
import { getPebSize } from '@pe/builder/render-utils';

import { PebFormOption } from '../models';

import { FormModel } from './models';


export const animationBindingTypes: PebFormOption[] = [
  { name: 'Animation', value: PebAnimationBindingType.Animation },
  { name: 'Keyframe', value: PebAnimationBindingType.Keyframe },
];

export const keyframeMappers: PebFormOption[] = [
  { name: 'None', value: PebAnimationKeyframeMapper.None },
  { name: 'Is First', value: PebAnimationKeyframeMapper.IsFirst },
  { name: 'Is Last', value: PebAnimationKeyframeMapper.IsLast },
  { name: 'Is Number Equal', value: PebAnimationKeyframeMapper.IsNumberEqual },
  { name: 'Is Content Equal', value: PebAnimationKeyframeMapper.IsContentEqual },
  { name: 'Linear', value: PebAnimationKeyframeMapper.Linear },
];

export const propertiesMap
  : { [key in PebAnimationPropertyKey]: { name: string; inputType: PebAnimationValueType; units?: string[] } } = {
  [PebAnimationPropertyKey.Opacity]: { name: 'Opacity', inputType: PebAnimationValueType.Size, units: ['%'] },
  [PebAnimationPropertyKey.Move]: { name: 'Move', inputType: PebAnimationValueType.XY, units: ['px', '%'] },
  [PebAnimationPropertyKey.Scale]: { name: 'Scale', inputType: PebAnimationValueType.Size, units: ['%'] },
  [PebAnimationPropertyKey.ScaleX]: { name: 'ScaleX', inputType: PebAnimationValueType.Color, units: ['%'] },
  [PebAnimationPropertyKey.ScaleY]: { name: 'ScaleY', inputType: PebAnimationValueType.Size, units: ['%'] },
  [PebAnimationPropertyKey.Skew]: { name: 'Skew', inputType: PebAnimationValueType.XY, units: ['%'] },
  [PebAnimationPropertyKey.SkewX]: { name: 'SkewX', inputType: PebAnimationValueType.Size, units: ['%', 'px'] },
  [PebAnimationPropertyKey.SkewY]: { name: 'SkewY', inputType: PebAnimationValueType.Size, units: ['%', 'px'] },
  [PebAnimationPropertyKey.RotateX]: { name: 'RotateX', inputType: PebAnimationValueType.Size, units: ['deg'] },
  [PebAnimationPropertyKey.RotateY]: { name: 'RotateY', inputType: PebAnimationValueType.Size, units: ['deg'] },
  [PebAnimationPropertyKey.RotateZ]: { name: 'RotateZ', inputType: PebAnimationValueType.Size, units: ['deg'] },
  [PebAnimationPropertyKey.Left]: { name: 'Left', inputType: PebAnimationValueType.Size, units: ['px', '%'] },
  [PebAnimationPropertyKey.Right]: { name: 'Right', inputType: PebAnimationValueType.Size, units: ['px', '%'] },
  [PebAnimationPropertyKey.Top]: { name: 'Top', inputType: PebAnimationValueType.Size, units: ['px', '%'] },
  [PebAnimationPropertyKey.Bottom]: { name: 'Bottom', inputType: PebAnimationValueType.Size, units: ['px', '%'] },
  [PebAnimationPropertyKey.Width]: { name: 'Width', inputType: PebAnimationValueType.Size, units: ['px', '%'] },
  [PebAnimationPropertyKey.Height]: { name: 'Height', inputType: PebAnimationValueType.Size, units: ['px', '%'] },
  [PebAnimationPropertyKey.TextColor]: { name: 'Text Color', inputType: PebAnimationValueType.Color },
  [PebAnimationPropertyKey.BackgroundColor]: { name: 'Background', inputType: PebAnimationValueType.Color },
  [PebAnimationPropertyKey.BorderColor]: { name: 'Border Color', inputType: PebAnimationValueType.Color },
  [PebAnimationPropertyKey.BorderSize]:
    { name: 'Border Size', inputType: PebAnimationValueType.Size, units: ['px', '%'] },
  [PebAnimationPropertyKey.BorderRadius]:
    { name: 'Border Radius', inputType: PebAnimationValueType.Size, units: ['px', '%'] },
};

export const timings: PebFormOption[] = [
  { name: 'Ease', value: PebAnimationTiming.Ease },
  { name: 'EaseIn', value: PebAnimationTiming.EaseIn },
  { name: 'EaseOut', value: PebAnimationTiming.EaseOut },
  { name: 'EaseInOut', value: PebAnimationTiming.EaseInOut },
  { name: 'Linear', value: PebAnimationTiming.Linear },
  { name: 'EaseInSine', value: PebAnimationTiming.EaseInSine },
  { name: 'EaseOutSine', value: PebAnimationTiming.EaseOutSine },
  { name: 'EaseInOutSine', value: PebAnimationTiming.EaseInOutSine },
  { name: 'EaseInQuad', value: PebAnimationTiming.EaseInQuad },
  { name: 'EaseOutQuad', value: PebAnimationTiming.EaseOutQuad },
  { name: 'EaseInOutQuad', value: PebAnimationTiming.EaseInOutQuad },
  { name: 'EaseInCubic', value: PebAnimationTiming.EaseInCubic },
  { name: 'EaseOutCubic', value: PebAnimationTiming.EaseOutCubic },
  { name: 'EaseInOutCubic', value: PebAnimationTiming.EaseInOutCubic },
];

export const scrollBindingTargets: PebFormOption[] = [
  { name: 'Page', value: PebAnimationScrollTarget.Page },
  { name: 'Section', value: PebAnimationScrollTarget.Section },
  { name: 'Element', value: PebAnimationScrollTarget.Element },
];

export const fillModes: PebFormOption[] = [
  { name: 'Auto', value: PebAnimationFillMode.Auto },
  { name: 'None', value: PebAnimationFillMode.None },
  { name: 'Forwards', value: PebAnimationFillMode.Forwards },
  { name: 'Backwards', value: PebAnimationFillMode.Backwards },
  { name: 'Both', value: PebAnimationFillMode.Both },
];

export const keyframeMapperProviders: { [key in PebViewElementEventType]?: PebFormOption[] } = {
  [PebViewElementEventType.ViewportFocusSection]: [
    { name: 'Is Focus', value: PebAnimationKeyframeMapper.IsContentEqual },
  ],
  [PebViewElementEventType.SliderIndexChange]: [
    { name: 'First Slide', value: PebAnimationKeyframeMapper.IsFirst },
    { name: 'Last Slide', value: PebAnimationKeyframeMapper.IsLast },
    { name: 'Number Equal', value: PebAnimationKeyframeMapper.IsNumberEqual },
    { name: 'Slide Number', value: PebAnimationKeyframeMapper.Linear },
  ],
  [PebViewElementEventType.SliderPlay]: [
    { name: 'Is Playing', value: PebAnimationKeyframeMapper.Linear },
  ],
  [PebViewElementEventType.SliderPause]: [
    { name: 'Is Paused', value: PebAnimationKeyframeMapper.Linear },
  ],
  [PebViewElementEventType.SliderContentChange]: [
    { name: 'Content Equal', value: PebAnimationKeyframeMapper.IsContentEqual },
  ],
  [PebViewElementEventType.AnimationKeyframeChange]: [
    { name: 'First Keyframe', value: PebAnimationKeyframeMapper.IsFirst },
    { name: 'Last Keyframe', value: PebAnimationKeyframeMapper.IsLast },
    { name: 'Number Equal', value: PebAnimationKeyframeMapper.IsNumberEqual },
    { name: 'Keyframe Number', value: PebAnimationKeyframeMapper.Linear },
  ],
  [PebViewElementEventType.VideoPlay]: [
    { name: 'Is Playing', value: PebAnimationKeyframeMapper.Linear },
  ],
  [PebViewElementEventType.VideoPause]: [
    { name: 'Is Paused', value: PebAnimationKeyframeMapper.Linear },
  ],
  [PebViewElementEventType.ContextData]: [
    { name: 'Is Equal', value: PebAnimationKeyframeMapper.ContextIsEqual },
    { name: 'Has Data', value: PebAnimationKeyframeMapper.ContextIsSet },
    { name: 'Array Size', value: PebAnimationKeyframeMapper.ContextArraySize },
  ],
};

export const initialFormValue: FormModel = {
  key: '',
  trigger: PebViewElementEventType.None,
  timing: PebAnimationTiming.Ease,
  fill: PebAnimationFillMode.Auto,
  delay: 0,
  duration: 1000,
  keyframes: [{
    offset: getPebSize('0%'),
    properties: [{
      key: PebAnimationPropertyKey.Opacity,
      values: { size: getPebSize('100%'), color: PEB_WHITE_RGBA, xy: { x: 0, y: 0 } },
    }],
  }],
  infiniteLoop: false,
  iteration: 1,
  triggerSetting: {
    sourceElementId: '',
    contentElementId: '',
    bindingType: PebAnimationBindingType.Keyframe,
    keyframeMapper: PebAnimationKeyframeMapper.None,
    equalNumber: 1,
    contextField: '',
    contextTag: '',
  },
  scrollBinding: {
    target: PebAnimationScrollTarget.Section,
    start: getPebSize('auto'),
    end: getPebSize('auto'),
  },
};
