import {
  PebGradientFill,
  PebFillMode,
  PebGradientType,
  PebFillType,
  PebImageFill,
  PebUnit,
  PebIframeFill,
  PebThreeJsFill,
} from '@pe/builder/core';

export const DEFAULT_SCALE = { value: 0, unit: PebUnit.Auto };

export const defaultGradientFill: PebGradientFill = {
  type: PebFillType.Gradient,
  gradientType: PebGradientType.Linear,
  angle: 90,
  colorStops:
    [
      { offset: 0, color: { r: 255, g: 255, b: 255, a: 1 } },
      { offset: 100, color: { r: 255, g: 255, b: 255, a: 1 } },
    ],
};

export const defaultMediaFill = {
  scale: DEFAULT_SCALE,
  fillMode: PebFillMode.Original,
};

export const defaultJsFill = {
  url: '',
};

export const defaultThreeJsFill: Partial<PebThreeJsFill> = {
  url: '',
};

export const defaultIframeFill: Partial<PebIframeFill> = {
  src: '',
};

export const defaultImageFill: Partial<PebImageFill> = {
  ...defaultMediaFill,
  positionX: 'center',
  positionY: 'center',
};

export const colorStopForm = {
  offset: [],
  color: [],
};

export const imageForm = {
  origin: [],
  url: [],
  mimeType: [],
  fillMode: [PebFillMode.Original],
  scale: [DEFAULT_SCALE],
  fillColor: [],
  width: [],
  height: [],
  positionX: ['center'],
  positionY: ['center'],
  fixed: [false],
};

export const videoForm = {
  origin: [],
  url: [],
  mimeType: [],
  fillMode: [PebFillMode.Original],
  scale: [],
  fillColor: [],
  width: [],
  height: [],
  preview: [],
  thumbnail: [],
  sound: [false],
  controls: [false],
  autoplay: [false],
  loop: [false],
};

export const jsForm = {
  origin: [],
  url: [],
  type: [],
  title: [],
};

export const iframeForm = {
  origin: [],
  src: [],
  type: [],
  title: [],
};

export const threeJsForm = {
  origin: [],
  url: [],
  type: [],
  title: [],
};

export const mainForm = {
  type: [],
  color: [],
  mediaType: [],
  file: [],
};
