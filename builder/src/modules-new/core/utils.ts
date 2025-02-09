import { v4 as uuid } from 'uuid';

import { pebCreateElement, PebElementType, PebScreen, PebScreenAwareStyle } from '@pe/builder-core';

export const createDefaultTheme = () => ({
  id: null,
  name: 'New theme',
  pages: [
    createDefaultPage({
      name: 'Front',
      slug: 'front',
    }),
  ],
});

export const displayOnlyOnScreen = (screen: string) =>
  ({
    [PebScreen.Desktop]: 'none',
    [PebScreen.Tablet]: 'none',
    [PebScreen.Mobile]: 'none',
    [screen]: 'block',
  } as PebScreenAwareStyle<'none' | 'block' | 'flex' | 'inline-block'>);

export const createDefaultPage = (pageData: any) =>
  pebCreateElement(PebElementType.Document, {
    id: uuid(),
    meta: { deletable: false },
    style: {
      width: {
        [PebScreen.Desktop]: 900,
        [PebScreen.Tablet]: 600,
        [PebScreen.Mobile]: 300,
      },
    },
    data: {
      name: pageData.name,
      slug: pageData.slug,
    },
    children: [
      ...Object.values(PebScreen).map(screen =>
        pebCreateElement(PebElementType.Section, {
          meta: { deletable: false },
          data: { name: 'header' },
          style: {
            height: 200,
            display: displayOnlyOnScreen(screen),
          },
          children: [],
        }),
      ),
      ...Object.values(PebScreen).map(screen =>
        pebCreateElement(PebElementType.Section, {
          meta: { deletable: false },
          data: { name: 'body' },
          style: {
            height: 600,
            display: displayOnlyOnScreen(screen),
          },
          children: [],
        }),
      ),
      ...Object.values(PebScreen).map(screen =>
        pebCreateElement(PebElementType.Section, {
          meta: { deletable: false },
          data: { name: 'footer' },
          style: {
            height: 200,
            display: displayOnlyOnScreen(screen),
          },
          children: [],
        }),
      ),
    ],
  });

export function parseTestAttribute(val: string): string {
  return val.split(' ').join('+').toLowerCase();
}
