
import {
  PebAnimation,
  PebAnimationBindingType,
  PebAnimationKeyframe,
  PebRenderElementModel,
  PebScreen,
  PebViewElementEventType,
  PebViewStyle,
  isAnimationKeyframeInteraction,
  isImage,
} from '@pe/builder/core';

import {
  getGlobalKeyframeId,
} from '../animation.utils';
import { isOutPage } from '../models';
import { getVectorInlineStyle } from '../vector/vector.utils';

import { SELF, propertiesToQueryStyles } from './animation.style.utils';
import { checkoutStyle } from './integration-style.utils';
import { getSortedScreens } from './screen-style.utils';
import { sizeCss } from './size-style.utils';
import { getInlineStyle, toInlineStyle } from './view-styles.utils';

export const PEB_LAZY_CLASS = 'peb-lazy-image';
export const PEB_LAZY_LOADED_CLASS = 'peb-lazy-loaded';

export function getAllScreenStyles(elements: PebRenderElementModel[], screens: PebScreen[]): string {
  let screenStyles: string[] = [];
  const sortedScreens = getSortedScreens(screens);

  sortedScreens.forEach((screen, idx) => {
    const variableStyles = getScreenVariables(elements, screen);
    const vectorStyles = getVectorCssRules(elements, screen).join('\n');

    let screenText = [variableStyles, vectorStyles].join('\n');
    elements.forEach((element) => {
      const style = element.defs?.screenStyles[screen.key];
      if (!style) {
        return;
      }

      screenText += getElementCssRules(element, style);
    });

    const largerScreen = sortedScreens[idx - 1];
    const smallerScreen = sortedScreens[idx + 1];
    const text = sortedScreens.length === 1
      ? screenText
      : getWithMediaQuery(screen, largerScreen, smallerScreen, screenText);

    screenStyles.push(text);
  });

  const keyframeStyles = getKeyframeCssRules(elements);
  const revealStyles = getRevealCssRules();

  return ['\n', ...revealStyles, ...screenStyles, ...keyframeStyles, checkoutStyle].join('\n');
}

function getRevealCssRules(): string[] {
  return [
    'div[peb-type=document]{display:block;}',
  ];
}

function getKeyframeCssRules(elements: PebRenderElementModel[]): (string | undefined)[] {
  const elementKeyframeStyles = elements.map((elm) => {
    if (!elm.animations) {
      return undefined;
    }

    const animationKeyframeStyles: string[] = Object.values(elm.animations).map((animation) => {
      const keyframes = getKeyframesToExtractStyles(elm, animation, elements);

      if (!keyframes?.length) {
        return '';
      }

      const keyframeStyles: string[] = keyframes.map((keyframe, index) => {
        const id = getGlobalKeyframeId(elm.id, animation, index);
        const styleMap = propertiesToQueryStyles(keyframe.properties);

        const styles = Object.entries(styleMap).map(([key, style]) => {
          const selector = key === SELF ? `.${id}` : key.split(',').map(s => `.${id} ${s}`);

          return `${selector}{${toInlineStyle(style)}}`;
        });

        return styles.join('\n');
      });

      return keyframeStyles.filter(Boolean).join('\n');
    });

    return animationKeyframeStyles.filter(Boolean).join('\n');
  });

  return elementKeyframeStyles.filter(Boolean);
}

function getVectorCssRules(elements: PebRenderElementModel[], screen: PebScreen): (string | undefined)[] {
  const styles = elements.map((elm) => {
    if (!elm.vector?.styles) {
      return;
    }

    return getVectorInlineStyle(elm.id, elm.vector?.styles);
  });

  return styles.filter(Boolean);
}

function getWithMediaQuery(
  screen: PebScreen,
  largerScreen: PebScreen | undefined,
  smallerScreen: PebScreen | undefined,
  text: string,
): string {
  const queries = ['only screen'];

  largerScreen && queries.push(`(max-width: ${largerScreen.width - 1}px) `);
  smallerScreen && queries.push(`(min-width: ${screen.width}px)`);

  return `@media ${queries.join(' and ')} {\n${text}\n}`;
}

function getElementCssRules(element: PebRenderElementModel, style: PebViewStyle | undefined): string {
  if (!style) {
    return '';
  }

  const elementId = element.id;
  const { backgroundImage, ...hostStyle } = style.host ?? {};
  const lazyImage = isImage(element.fill);

  const imageCssStyle = lazyImage ? hostStyle : style.host;
  const host = style.host ? `.elm-${elementId}{${getInlineStyle(imageCssStyle)}}` : '';
  const wrapper = style.wrapper ? `.wrapper-${elementId}{${getInlineStyle(style.wrapper)}}` : '';
  let hostLazy = '';

  if (lazyImage) {
    hostLazy = `.elm-${elementId}.peb-lazy-loaded{background-image:${backgroundImage}}`;
  }

  return [host, hostLazy, wrapper].filter(str => !!str).join('\n');
}

function getScreenVariables(elements: PebRenderElementModel[], screen: PebScreen): string {
  const vars: PebCssVariable[] = [
    { key: 'screen-key', value: `${screen.key}` },
    { key: 'screen-width', value: `${screen.width}px` },
    { key: 'screen-padding', value: `${screen.padding}px` },
    ...getSlidesVariables(elements, screen),
  ];

  return `:root{${vars.map(v => '--' + v.key + ':' + v.value).join(';')}}`;
}

function getSlidesVariables(elements: PebRenderElementModel[], screen: PebScreen): PebCssVariable[] {
  const contentIds = elements.filter(isOutPage).map(elm => elm.id);
  if (!contentIds.length) {
    return [];
  }

  const slides = elements.filter(elm => contentIds.includes(elm.parent?.id));

  const vars: PebCssVariable[] = [];
  slides.forEach((elm) => {
    const styles = elm.defs?.pebStyles[screen.key];
    vars.push({ key: `slide-${elm.id}-top`, value: sizeCss(styles?.position?.top) });
    vars.push({ key: `slide-${elm.id}-left`, value: sizeCss(styles?.position?.left) });
    vars.push({ key: `slide-${elm.id}-width`, value: sizeCss(styles?.dimension?.width) });
    vars.push({ key: `slide-${elm.id}-height`, value: sizeCss(styles?.dimension?.height) });
  });

  return vars;
}

function getKeyframesToExtractStyles(
  element: PebRenderElementModel,
  animation: PebAnimation,
  elements: PebRenderElementModel[],
): PebAnimationKeyframe[] | undefined {
  if (!animation?.keyframes) {
    return undefined;
  }

  if (animation.triggerSetting?.bindingType === PebAnimationBindingType.Keyframe) {
    return animation.keyframes;
  }

  if (
    elements.some(elm => elm.interactions && Object.values(elm.interactions).some(inter =>
      isAnimationKeyframeInteraction(inter) && inter.placeholder?.elementId === element.id
    ))
  ) {
    return animation.keyframes;
  }

  const initialAnimation = getInitialAnimation(element);

  return initialAnimation?.keyframes?.length
    ? [initialAnimation.keyframes[0]]
    : undefined;
}

export function getInitialKeyframeClass(element: PebRenderElementModel): { [className: string]: boolean } | undefined {
  const animation = getInitialAnimation(element);
  const keyframe = animation?.keyframes?.[0];

  if (!animation || !keyframe) {
    return undefined;
  }

  return { [getGlobalKeyframeId(element.id, animation, 0)]: true };
}

function getInitialAnimation(element: PebRenderElementModel): PebAnimation | undefined {
  if (!element.animations) {
    return undefined;
  }

  const animation = Object.values(element.animations)
    .find(a => a.trigger === PebViewElementEventType.PageScroll);

  if (!animation?.keyframes) {
    return undefined;
  }

  return animation;
}

interface PebCssVariable {
  key: string;
  value: string | undefined;
}
