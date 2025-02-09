import { PebSize } from './size.model';

export type RGB = { r: number; g: number; b: number; }
export type RGBA = RGB & { a: number };

export enum PebFillType {
  Solid = 'solid',
  Gradient = 'gradient',
  Image = 'image',
  Video = 'video',
  ThreeJs = 'three-js',
  Js = 'js',
  Iframe = 'iframe',
}

export enum PebGradientType {
  Linear = 'linear',
  Radial = 'radial',
}

export enum PebFillMode {
  Original = 'original',
  Stretch = 'stretch',
  Tile = 'tile',
  Fill = 'fill',
  Fit = 'fit',
}

export enum PebFillOrigin {
  Builder = 'builder',
  Studio = 'studio',
}

export type PebVideoFillMode = Exclude<PebFillMode, PebFillMode.Tile>;

export interface PebBaseFill {
  origin?: PebFillOrigin;
  lazy?: PebLazyLoading;
}

export interface PebSolidFill extends PebBaseFill {
  type: PebFillType.Solid;
  color: RGB | RGBA;
}

export interface PebColorStop {
  offset: number;
  color: RGB | RGBA;
}

export interface PebGradientFill extends PebBaseFill {
  type: PebFillType.Gradient;
  gradientType: PebGradientType;
  angle: number;
  colorStops: [PebColorStop, PebColorStop, ...PebColorStop[]];
}

export interface PebImageFill extends PebBaseFill {
  type: PebFillType.Image;
  url: string;
  mimeType: string;
  fillMode: PebFillMode;
  scale?: PebSize;
  fillColor: RGB | RGBA | null;
  fixed?: boolean;
  positionX?: 'left' | 'center' | 'right';
  positionY?: 'top' | 'center' | 'bottom';
}

export interface PebVideoFill extends PebBaseFill {
  type: PebFillType.Video;
  url: string;
  mimeType: string;
  fillMode: PebVideoFillMode;
  scale?: PebSize;
  fillColor: RGB | RGBA | null;
  preview: string;
  sound: boolean;
  controls: boolean;
  autoplay: boolean;
  loop: boolean;
}

export enum VideoSize {
  Contain = 'contain',
  Cover = 'cover',
  Stretch = 'fill',
  OriginalSize = 'none',
}

export enum PebVideoPlayStatus {
  Paused = 'paused',
  Playing = 'playing',
}

export interface PebThreeJsFill extends PebBaseFill {
  type: PebFillType.ThreeJs;
  url: string;
  title: string;
}

export interface PebJsFill extends PebBaseFill {
  type: PebFillType.Js;
  url: string;
  title: string;
}

export interface PebIframeFill extends PebBaseFill {
  type: PebFillType.Iframe;
  src: string;
  title: string;
}

export interface PebLazyLoading {
  enabled: boolean;
}

export type PebFill =
  | PebSolidFill
  | PebGradientFill
  | PebImageFill
  | PebVideoFill
  | PebThreeJsFill
  | PebJsFill
  | PebIframeFill;

export const isSolid = (fill?: PebFill): fill is PebSolidFill => fill?.type === PebFillType.Solid;
export const isGradient = (fill?: PebFill): fill is PebGradientFill => fill?.type === PebFillType.Gradient;
export const isImage = (fill?: PebFill): fill is PebImageFill => fill?.type === PebFillType.Image;
export const isSVG = (fill?: PebFill): fill is PebImageFill => isImage(fill) && fill?.mimeType === 'image/svg+xml';
export const isVideo = (fill?: PebFill): fill is PebVideoFill => fill?.type === PebFillType.Video;
export const isAutoPlayVideo = (fill?: PebFill): fill is PebVideoFill =>
  fill?.type === PebFillType.Video && fill.autoplay;
export const isJs = (fill?: PebFill): fill is PebJsFill => fill?.type === PebFillType.Js;
export const isIframe = (fill?: PebFill): fill is PebIframeFill => fill?.type === PebFillType.Iframe;
export const isThreeJs = (fill?: PebFill): fill is PebThreeJsFill => fill?.type === PebFillType.ThreeJs;
export const isStudioOrigin = (fill?: PebFill) => fill?.origin === PebFillOrigin.Studio;

export const isRGB = (color: RGB | RGBA): color is RGB =>
  color && typeof color === 'object' && (color as RGBA).a === undefined;
export const isRGBA = (color: RGB | RGBA): color is RGBA =>
  color && typeof color === 'object' && (color as RGBA).a !== undefined;

export const isEqualRGBA = (color1: RGB | RGBA, color2: RGB | RGBA): boolean => {
  if (!color1 && !color2) {
    return true;
  }
  if (!color1 || !color2) {
    return false;
  }
  const c1 = color1 as RGBA;
  const c2 = color2 as RGBA;

  return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b && (c1.a ?? 1) === (c2.a ?? 1);
};
