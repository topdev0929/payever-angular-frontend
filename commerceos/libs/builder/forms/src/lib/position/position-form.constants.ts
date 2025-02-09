import { PebPositionType } from '@pe/builder/core';

export const elementPositionTypes = [
  { name: 'Default', value: PebPositionType.Default },
  { name: 'Pinned', value: PebPositionType.Pinned },
  { name: 'Sticky', value: PebPositionType.Sticky },
  { name: 'Block', value: PebPositionType.Block },
  { name: 'Block (Inline)', value: PebPositionType.InlineBlock },
];

export const sectionPositionTypes = [
  { name: 'Default', value: PebPositionType.Default },
  { name: 'Sticky', value: PebPositionType.Sticky },
];