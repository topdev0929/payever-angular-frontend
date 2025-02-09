import {
  PEB_WHITE_RGBA,  
  PebDefaultAnimationPresetKey,
  PebFillType,
  PebInteractionType,
  PebOverlayBackgroundType,
  PebOverlayCloseMode,
  PebOverlayPositionType,
  PebViewElementEventType,
  PebContentAlign,
  PebVerticalAlign,
  PebIndexChangeType,
} from '@pe/builder/core';
import { getPebSize } from '@pe/builder/render-utils';

import { animationActions, animationInitValue, animationTriggers } from './animation';
import { cookiesActions, cookiesTriggers } from './cookies';
import { integrationInitValue, integrations } from './integration';
import { FormModel } from './model';
import { sliderActions, sliderInitValue, sliderTriggers } from './slider';
import { videoActions, videoInitValue, videoTriggers } from './video';


export const interactionTriggers = [
  { name: 'None', value: '' },
  { name: 'Initialize', value: PebViewElementEventType.Init },
  { name: 'Click', value: PebViewElementEventType.Click },
  { name: 'Mouse Enter', value: PebViewElementEventType.MouseEnter },
  { name: 'Mouse Leave', value: PebViewElementEventType.MouseLeave },
  { name: 'Viewport Enter', value: PebViewElementEventType.ViewportEnter },
  { name: 'Viewport Exit', value: PebViewElementEventType.ViewportExit },
  { name: 'Viewport Section Focus', value: PebViewElementEventType.ViewportFocusSection },
  { name: 'Page Scroll', value: PebViewElementEventType.PageScroll },
  ...animationTriggers,
  ...sliderTriggers,
  ...videoTriggers,
  ...cookiesTriggers,
  { name: 'Integration Data', value: PebViewElementEventType.ContextData },
];

export const actions = [
  { name: 'None', value: '' },  
  { name: 'Overlay Open', value: PebInteractionType.OpenOverlay },
  { name: 'Overlay Close', value: PebInteractionType.CloseOverlay },
  { name: 'Overlay Swap', value: PebInteractionType.SwapOverlay },
  ...animationActions,
  ...sliderActions,
  ...videoActions,
  ...cookiesActions,
  ...integrations,
];

export const backgroundTypes = [
  { name: 'Default', value: PebOverlayBackgroundType.Default },
  { name: 'Transparent', value: PebOverlayBackgroundType.Transparent },
  { name: 'Fill', value: PebOverlayBackgroundType.Fill },
  { name: 'Element', value: PebOverlayBackgroundType.Element },
];

export const positionTypes = [
  { name: 'Viewport', value: PebOverlayPositionType.Viewport },
  { name: 'Viewport Fixed', value: PebOverlayPositionType.ViewportFixed },
  { name: 'Section', value: PebOverlayPositionType.Section },
];

export const buildInEffects = [
  { name: 'None', value: '' },
  { name: 'Fade In', value: PebDefaultAnimationPresetKey.FadeIn },
  { name: 'Slide In', value: PebDefaultAnimationPresetKey.SlideIn },
  { name: 'Zoom In', value: PebDefaultAnimationPresetKey.ZoomIn },
];

export const closeModes = [
  { name: 'None', value: PebOverlayCloseMode.None },
  { name: 'Mouse Leave', value: PebOverlayCloseMode.MouseLeave },
  { name: 'Click Outside', value: PebOverlayCloseMode.ClickOutside },
];

export const indexChangeTypes = [
  { name: 'None', value: '' },
  { name: 'Next', value: PebIndexChangeType.Next },
  { name: 'Previous', value: PebIndexChangeType.Prev },
  { name: 'First', value: PebIndexChangeType.First },
  { name: 'Last', value: PebIndexChangeType.Last },
  { name: 'To Number', value: PebIndexChangeType.Number },
];

export const horizontalAligns = [
  { name: 'Left', value: PebContentAlign.left },
  { name: 'Center', value: PebContentAlign.canter },
  { name: 'Right', value: PebContentAlign.right },
];

export const verticalAligns = [
  { name: 'Top', value: PebVerticalAlign.Top },
  { name: 'Center', value: PebVerticalAlign.Center },
  { name: 'Bottom', value: PebVerticalAlign.Bottom },
];

export const initialFormValue: FormModel = {
  key: 'default',
  action: PebInteractionType.None,
  trigger: PebViewElementEventType.Click,  
  contentElement: { pageId: '', elementId: '' },
  placeholderElementId: '',
  buildIn: '',
  buildInConfig: {},
  backgroundType: PebOverlayBackgroundType.Default,
  backgroundElementId: '',
  position: {
    type: PebOverlayPositionType.Viewport,
    top: getPebSize('5%'),
    left: getPebSize('auto'),
    right: getPebSize('auto'),
    bottom: getPebSize('auto'),
    width: getPebSize('inherit'),
    height: getPebSize('inherit'),
  },
  closeMode: PebOverlayCloseMode.None,
  backFill: { type: PebFillType.Solid, color: PEB_WHITE_RGBA },
  slider: sliderInitValue,
  animation: animationInitValue,
  video: videoInitValue,
  integrationAction: integrationInitValue.integrationAction,
};
