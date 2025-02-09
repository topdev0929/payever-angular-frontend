import { PebGradientFill, RGB, RGBA } from './fill.model';

export interface PebTextStyles {
  fontFamily: string;
  color: RGB | RGBA;
  fontWeight: number;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  fontSize: number;
  textJustify: PebTextJustify;
  verticalAlign: PebTextVerticalAlign;
  fill?: PebGradientFill;
  letterSpacing?: number | 'auto',
  lineHeight?: number | 'auto',
  fixedWidth: boolean,
  fixedHeight: boolean,
}

export enum PebTextJustify {
  Left = 'left',
  Center = 'center',
  Right = 'right',
  Justify = 'justify',
}

export enum PebTextVerticalAlign {
  Top = 'top',
  Center = 'center',
  Bottom = 'bottom',
}

export const PebDefaultTextStyles: PebTextStyles = {
  fontFamily: 'Roboto',
  color: { r: 0, g: 0, b: 0, a: 1 },
  fontWeight: 400,
  italic: false,
  underline: false,
  strike: false,
  fontSize: 15,
  textJustify: PebTextJustify.Left,
  verticalAlign: PebTextVerticalAlign.Top,
  letterSpacing: 'auto',
  lineHeight: 'auto',
  fixedWidth: false,
  fixedHeight: false,
};

export const PEB_MIN_TEXT_WIDTH = 10;
export const PEB_MIN_TEXT_HEIGHT = 5;
