import {
  PebAnimation,
  PebContentAlign,
  PebCss,
  PebRenderElementModel,
  PebSlidesInteractionBase,
  PebVerticalAlign,
} from '@pe/builder/core';


export function getSlidesContentCssStyle(
  { animation, align }: PebSlidesInteractionBase,
  slide: PebRenderElementModel,
): PebCss {

  const vars = {
    left: `var(--slide-${slide.id}-left)`,
    top: `var(--slide-${slide.id}-top)`,
    width: `var(--slide-${slide.id}-width)`,
    height: `var(--slide-${slide.id}-height)`,
  };

  // TODO: find a solution to set slide position without using 'calc' to have responsive slides
  let left: string;
  if (align.horizontal === PebContentAlign.canter) {
    left = `calc(-1 * ${vars.left} - (${vars.width}/2))`;
  } else if (align.horizontal === PebContentAlign.right) {
    left = `calc(-1 * ${vars.left} - (${vars.width}))`;
  } else {
    left = `calc(-1 * ${vars.left})`;
  }

  let top: string;
  if (align.vertical === PebVerticalAlign.Center) {
    top = `calc(-1 * ${vars.top} - (${vars.height}/2))`;
  } else if (align.vertical === PebVerticalAlign.Bottom) {
    top = `calc(-1 * ${vars.top} - (${vars.height}))`;
  } else {
    top = `calc(-1 * ${vars.top})`;
  }

  const css: PebCss = {
    position: 'absolute',
    display: 'block',
    left,
    top,
    zIndex: '1',
    ...getTransitionCssStyle(animation),
  };

  return css;
}

export function getSlidesWrapperCssStyle(align: { horizontal: PebContentAlign; vertical: PebVerticalAlign }): PebCss {
  const css: PebCss = {
    width: '0px',
    height: '0px',
    position: 'absolute',
    overflow: 'visible',
    left: '50%',
    top: '50%',
    zIndex: '0',
  };

  if (align) {
    if (align.horizontal === PebContentAlign.left) {
      css.left = '0';
    } else if (align.horizontal === PebContentAlign.right) {
      css.left = '100%';
    } else {
      css.left = '50%';
    }

    if (align.vertical === PebVerticalAlign.Top) {
      css.top = '0';
    } else if (align.vertical === PebVerticalAlign.Bottom) {
      css.top = '100%'
    } else {
      css.top = '50%';
    }
  }

  return css;
}

export function getTransitionCssStyle(animation: Partial<PebAnimation> | undefined): PebCss {
  if (!animation) {
    return {};
  }

  const delay = animation.delay ?? 0;
  const duration = animation.duration ?? 0;
  const timing = animation.timing ?? 'linier';

  return {
    transition: `all ${duration}ms ${timing} ${delay}ms`,
  };
}
