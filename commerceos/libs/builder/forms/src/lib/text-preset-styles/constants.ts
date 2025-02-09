import { PebDefaultTextStyles, PebTextJustify, PebTextStyles } from '@pe/builder/core';

const getPresetStyle = (name: string, style: Partial<PebTextStyles>): PebTextPresetStyle => {
  return {
    name,
    styles: {
      ...PebDefaultTextStyles,
      ...style,
    },
  };
};

export const pebPresetTextStyles: PebTextPresetStyle[] = [
  getPresetStyle('Title', { fontWeight: 700, fontSize: 60 }),
  getPresetStyle('Title Small', { fontWeight: 700, fontSize: 48 }),
  getPresetStyle('Subtitle', { fontWeight: 700, fontSize: 26 }),
  getPresetStyle('Subtitle Alt', { fontWeight: 700, fontSize: 26, textJustify: PebTextJustify.Center }),
  getPresetStyle('Body', { fontSize: 24 }),
  getPresetStyle('Caption', {
    fontSize: 14,
    textJustify: PebTextJustify.Center,
    color: { r: 0, g: 0, b: 0, a: 0.14 },
  }),
  getPresetStyle('Quote', { fontSize: 24 }),
  getPresetStyle('Attribution', { fontWeight: 700, fontSize: 24 }),
  getPresetStyle('Heading', { fontWeight: 700, fontSize: 24 }),
  getPresetStyle('Agenda', { fontSize: 48, textJustify: PebTextJustify.Center }),
  getPresetStyle('Section', { fontSize: 48 }),
  getPresetStyle('Fact', { fontWeight: 700, fontSize: 60 }),
];

export type PebTextPresetStyle = { name: string; styles: Partial<PebTextStyles> };
