import { PebRenderElementModel, isIframe, isImage } from '@pe/builder/core';

export function hasLazyLoadingImage(element: PebRenderElementModel): boolean {
  return isImage(element.fill) && element.fill?.lazy?.enabled === true;
}

export function hasLoadLoadingIframe(element: PebRenderElementModel): boolean {
  return isIframe(element.fill) && element.fill?.lazy?.enabled === true;
}
