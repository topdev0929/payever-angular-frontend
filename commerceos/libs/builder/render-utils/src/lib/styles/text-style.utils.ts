import { getGradientStyle, pebColorToCss } from '@pe/builder/color-utils';
import {
  PebCss,
  PebGradientFill,
  PebTextStyles,
  PebTextVerticalAlign,
} from '@pe/builder/core';


export function getTextCssStyles(textStyles: Partial<PebTextStyles> | undefined): PebCss {
  const css: PebCss = {};

  if (!textStyles) {
    return css;
  }

  textStyles.fontFamily !== undefined && (css.fontFamily = textStyles.fontFamily);
  textStyles.fontSize !== undefined && (css.fontSize = `${textStyles.fontSize}px`);
  textStyles.italic !== undefined && (css.fontStyle = textStyles.italic ? 'italic' : 'normal');
  textStyles.fontWeight !== undefined && (css.fontWeight = `${textStyles.fontWeight}`);
  textStyles.color !== undefined && (css.color = pebColorToCss(textStyles.color));

  if (textStyles.fill?.colorStops) {
    css.background = getGradientStyle(textStyles.fill as PebGradientFill);
    css.backgroundClip = 'text';
    css.webkitTextFillColor = 'transparent';
  }

  const textDecoration = [];
  textStyles.underline && textDecoration.push('underline');
  textStyles.strike && textDecoration.push('line-through');
  textDecoration.length > 0 && (css.textDecoration = textDecoration.join(' '));

  textStyles.textJustify !== undefined && (css.textAlign = textStyles.textJustify);
  textStyles.verticalAlign !== undefined && (css.justifyContent = textAlignToJustifyContent(textStyles.verticalAlign));

  if (textStyles.letterSpacing !== undefined) {
    css.letterSpacing = textStyles.letterSpacing === 'auto'
      ? 'normal'
      : `${textStyles.letterSpacing}px`;
  }

  if (textStyles.lineHeight !== undefined) {
    css.lineHeight = textStyles.lineHeight === 'auto'
      ? 'normal'
      : `${textStyles.lineHeight}px`;
  }

  return css;
}

export const textAlignMap = {
  [PebTextVerticalAlign.Top]: 'flex-start',
  [PebTextVerticalAlign.Center]: 'center',
  [PebTextVerticalAlign.Bottom]: 'flex-end',
};

export function textAlignToJustifyContent(textAlign: PebTextVerticalAlign): string {
  return textAlignMap[textAlign] ?? 'normal';
}
