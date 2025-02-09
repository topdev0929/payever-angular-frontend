import { PebViewElementEventType } from './event.model';
import { RGBA } from './fill.model';
import { PebSize } from './size.model';

export interface PebAnimation {
  id?: string;  
  delay?: number;
  duration: number;
  infiniteLoop?: boolean;
  iteration?: number;
  direction?: PebAnimationDirection;
  timing: PebAnimationTiming;
  fill: PebAnimationFillMode;
  keyframes?: PebAnimationKeyframe[];
  trigger?: PebViewElementEventType;
  triggerSetting?: PebAnimationTriggerSetting;
  scrollBinding?: PebAnimationScrollBinding;
}

export enum PebAnimationDirection {
  Normal = 'normal',
  Reverse = 'reverse',
  Alternate = 'alternate',
  AlternateReverse = 'alternate-reverse',
}

export enum PebAnimationFillMode {
  Auto = 'auto',
  None = 'none',
  Forwards = 'forwards',
  Backwards = 'backwards',
  Both = 'both',
}

export interface PebAnimationKeyframe {
  offset: number; // 0-100
  properties: PebAnimationProperty[]
}

export interface PebAnimationKeyframeValue {
  x?: number;
  y?: number;
  z?: number;
}

export interface PebAnimationScrollBinding {
  target: PebAnimationScrollTarget;
  start?: PebSize;
  end?: PebSize;
}

export enum PebAnimationScrollTarget {
  Page = 'page',
  Section = 'section',
  Element = 'element',
}

export type PenAnimationPropertyValueType = undefined
  | PebSize
  | { x: number, y: number }
  | RGBA;

export interface PebAnimationProperty {
  key: PebAnimationPropertyKey;
  value: PenAnimationPropertyValueType;
}

export enum PebAnimationValueType {
  Size = 'size',
  XY = 'xy',
  Color = 'color'
}

export enum PebAnimationPropertyKey {
  Move = 'move',
  Opacity = 'opacity',
  Scale = 'scale',
  ScaleX = 'scale-x',
  ScaleY = 'scale-y',
  Skew = 'skew',
  SkewX = 'skew-x',
  SkewY = 'skew-y',
  RotateX = 'rotate-x',
  RotateY = 'rotate-y',
  RotateZ = 'rotate-z',
  Left = 'left',
  Right = 'right',
  Top = 'top',
  Bottom = 'bottom',
  Width = 'width',
  Height = 'height',
  TextColor = 'text-color',
  BackgroundColor = 'background-color',
  BorderColor = 'border-color',
  BorderSize = 'border-size',
  BorderRadius = 'border-radius',
}

export enum PebAnimationKeyframeStart {
  After = 'after',
  With = 'with',
}

export enum PebAnimationAction {
  Custom = 'custom',
  FadeIn = 'fade-in',
  FadeOut = 'fade-out',
}

export enum PebAnimationTiming {
  Ease = 'ease',
  EaseIn = 'ease-in',
  EaseOut = 'ease-out',
  EaseInOut = 'ease-in-out',
  EaseInSine = 'cubic-bezier(0.12, 0, 0.39, 0)',
  EaseOutSine = 'cubic-bezier(0.61, 1, 0.88, 1)',
  EaseInOutSine = 'cubic-bezier(0.37, 0, 0.63, 1)',
  EaseInQuad = 'cubic-bezier(0.11, 0, 0.5, 0)',
  EaseOutQuad = 'cubic-bezier(0.5, 1, 0.89, 1)',
  EaseInOutQuad = 'cubic-bezier(0.45, 0, 0.55, 1)',
  EaseInCubic = 'cubic-bezier(0.32, 0, 0.67, 0)',
  EaseOutCubic = 'cubic-bezier(0.33, 1, 0.68, 1)',
  EaseInOutCubic = 'cubic-bezier(0.65, 0, 0.35, 1)',
  EaseInQuart = 'cubic-bezier(0.5, 0, 0.75, 0)',
  EaseOutQuart = 'cubic-bezier(0.25, 1, 0.5, 1)',
  EaseInOutQuart = 'cubic-bezier(0.76, 0, 0.24, 1)',
  EaseInQuint = 'cubic-bezier(0.64, 0, 0.78, 0)',
  EaseOutQuint = 'cubic-bezier(0.22, 1, 0.36, 1)',
  EaseInOutQuint = 'cubic-bezier(0.83, 0, 0.17, 1)',
  EaseInExpo = 'cubic-bezier(0.7, 0, 0.84, 0)',
  EaseOutExpo = 'cubic-bezier(0.16, 1, 0.3, 1)',
  EaseInOutExpo = 'cubic-bezier(0.87, 0, 0.13, 1)',
  EaseInCirc = 'cubic-bezier(0.55, 0, 1, 0.45)',
  EaseOutCirc = 'cubic-bezier(0, 0.55, 0.45, 1)',
  EaseInOutCirc = 'cubic-bezier(0.85, 0, 0.15, 1)',
  EaseInBack = 'cubic-bezier(0.36, 0, 0.66, -0.56)',
  EaseOutBack = 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  EaseInOutBack = 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  Linear = 'linear',
}

export interface PebAnimationPreset {
  presetKey: PebDefaultAnimationPresetKey | undefined;
  config: Partial<PebAnimation> | undefined;
}

export type PebAnimationPresets = { [key: string]: PebAnimation };

export enum PebDefaultAnimationPresetKey {
  FadeIn = 'fade-in',
  SlideIn = 'slide-in',
  ZoomIn = 'zoom-in',
}

export enum PebAnimationBindingType {
  Animation = 'animation',
  Keyframe = 'keyframe',
}

export enum PebAnimationKeyframeMapper {
  None = 'none',
  IsEnabled = 'is-enabled',
  IsFirst = 'is-first',
  IsLast = 'is-last',
  IsNumberEqual = 'is-number-equal',
  IsContentEqual = 'is-content-equal',
  Linear = 'linear',
  ContextIsEqual = 'context.is-equal',
  ContextIsSet = 'context.is-set',
  ContextArraySize = 'context.array-size',
}

export interface PebAnimationTriggerSetting { 
  sourceElementId: string;
  bindingType?: PebAnimationBindingType;
  keyframeMapper: PebAnimationKeyframeMapper;
  equalNumber?: number;
  contentElementId?: string;
  contextTag?: string;
  contextField?: string;
}

export const hasAnimationBinding = (anim: PebAnimation | undefined): boolean =>
  !anim?.triggerSetting?.bindingType
  || anim?.triggerSetting?.bindingType === PebAnimationBindingType.Animation;

export const hasKeyframeBinding = (anim: PebAnimation | undefined): boolean =>
  anim?.triggerSetting?.bindingType === PebAnimationBindingType.Keyframe;