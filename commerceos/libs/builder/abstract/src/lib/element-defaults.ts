import {
  PebElementDef,
  PebElementType,
  pebGenerateId,
  PebPositionType,
  PebUnit,
  PEB_ROOT_SCREEN_KEY,
} from '@pe/builder/core';

export const elementsDefaults: { [key in PebElementType]: PebElementDef } = {
  [PebElementType.Document]: undefined,
  [PebElementType.Section]: {
    id: pebGenerateId(),
    name: 'Section',
    index: 0,
    type: PebElementType.Section,
    prev: null,
    next: null,
    data: {},
    meta: { deletable: true },
    parent: undefined,
    styles: {
      [PEB_ROOT_SCREEN_KEY]: {
        position: { type: PebPositionType.Default },
        dimension: { height: { value: 200, unit: PebUnit.Pixel } },
      },
    },
  },
  [PebElementType.Grid]: undefined,
  [PebElementType.Shape]: undefined,
  [PebElementType.Text]: undefined,
  [PebElementType.Vector]: undefined,
};
