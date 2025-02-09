import { PebContainerType, PebRenderContainer } from '@pe/builder/core';

export const CLIENT_CONTAINER: PebRenderContainer = {
  key: PebContainerType.Client,
  editMode: false,
  previewMode: false,
  renderScripts: true,
};

export const SSR_CONTAINER: PebRenderContainer = {
  key: PebContainerType.SSR,
  editMode: false,
  previewMode: false,
  renderScripts: false,
};

export const PEB_CACHE_VER = '0.1.4';