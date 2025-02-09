import Delta from 'quill-delta';

import { hexToRgba } from '@pe/builder/color-utils';
import {
  PebContext,
  PebContextRendererConfigs,
  PebContextRendererType,
  PebFillMode,
  PebFillType,
  PebImageFill,
  PebSolidFill,
} from '@pe/builder/core';


import { PebContextEnabledElement, PebContextRendererResult } from '../models';

const dataTypeRenderers: { [key: string]: any } = {
  [PebContextRendererType.Text]: renderText,
  [PebContextRendererType.BackgroundColor]: renderColor,
  [PebContextRendererType.Image]: renderImage,
  [PebContextRendererType.Placeholder]: renderPlaceholder,
  [PebContextRendererType.Display]: renderDisplay,
};

export function renderElementContext(
  element: PebContextEnabledElement,
  context?: PebContext,
): PebContextRendererResult {
  let result = {};
  const configs = context?.renderConfigs;

  configs && Object.entries(configs).forEach(([key, config]) => {
    const fn = dataTypeRenderers[key];
    if (fn && config) {
      try {
        result = { ...result, ...fn(element, config, context) };
      } catch (err) {
        console.error('rendererContext', err);
      }
    }
  });

  return result;
}

export function renderText(element: PebContextEnabledElement, config: PebContextRendererConfigs, context?: PebContext)
  : PebContextRendererResult {
  if (context?.value === undefined) {
    return {};
  }
  let value = context?.value === undefined || context?.value === null
    ? ''
    : String(context.value);

  return { text: getDelta(element.text, value) };
}

export function renderColor(element: PebContextEnabledElement, config: PebContextRendererConfigs, context?: PebContext)
  : PebContextRendererResult {
    if (context?.value === undefined) {
      return {};
    }
    const fillStyle = element?.styles?.fill;
  
    return {
      styles: {
        ...element.styles,
        fill: {
          ...fillStyle,
          type: PebFillType.Solid,
          color: hexToRgba(context.value),
        } as PebSolidFill,
      },
    };
}

export function renderImage(element: PebContextEnabledElement, config: PebContextRendererConfigs, context?: PebContext)
  : PebContextRendererResult {
  if (context?.value === undefined) {
    return {};
  }
  const fillStyle = element?.styles?.fill as PebImageFill;

  return {
    styles: {
      ...element.styles,
      fill: {
        ...fillStyle,
        type: PebFillType.Image,
        url: context?.value,
        fillMode: fillStyle?.fillMode ?? PebFillMode.Fit,
      } as PebImageFill,
    },
  };
}

export function renderPlaceholder(
  element: PebContextEnabledElement,
  config: PebContextRendererConfigs,
  context?: PebContext,
): PebContextRendererResult {
  if (context?.value === undefined) {
    return { invisible: true };
  }

  return {};
}

export function renderDisplay(
  element: PebContextEnabledElement,
  config: PebContextRendererConfigs,
  context?: PebContext,
): PebContextRendererResult {
  if (!config.display?.hidden) {
    return { invisible: true };
  }

  return {};
}

export function getDelta(text: Delta, value: string): Delta {
  const attributes = { ...text?.ops?.[0]?.attributes };
  const { align } = text?.ops?.[1]?.attributes ?? {};

  if (align) {
    attributes.align = align;
  }

  return new Delta([
    { insert: value, ...attributes ? { attributes } : undefined },
    ...[align ? { insert: '\n', attributes: { align } } : { insert: '\n' }],
  ]);
}
