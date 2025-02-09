import { PebPage, PEB_ROOT_SCREEN_KEY } from '@pe/builder/core';

export function getPagePreviewImageUrl(page: PebPage, screenKey: string): string | undefined {

  if (!page?.preview) {
    return undefined;
  }

  return page.preview[screenKey] ?? page.preview[PEB_ROOT_SCREEN_KEY];
}
