import { PebScreen } from '@pe/builder/core';

import { PEB_CACHE_VER } from '../src/constants';

const cachedData: { [themeId: string]: DomainCacheModel } = {};

export function setCacheData(themeId: string, cacheKey: string, data: any) {
  const model = cachedData[themeId];
  if (!model) {
    return;
  }
  model[cacheKey] = data;
}

export function getCacheData(themeId: string, cacheKey: string): any {
  const model = cachedData[themeId];

  return model ? model[cacheKey] : undefined;
}

export function setThemeVersion(themeId: string, versionNumber: string | number) {
  let model = cachedData[themeId];
  const version = `${versionNumber}-${PEB_CACHE_VER}`;

  if (!model || model.version !== version) {
    model = { version, pages: {} };
    cachedData[themeId] = model;
  }
}

export function getScreens(themeId: string): { [id: string]: PebScreen } {
  return getCacheData(themeId, 'screens');
}

export function setScreensData(themeId: string, screens: { [id: string]: PebScreen }) {
  return setCacheData(themeId, 'screens', screens);
}

export function getElementsCacheKey(pageId: string) {
  return `page-${pageId}-elements`;
}

export function getElementsZipCacheKey(pageId: string) {
  return `page-${pageId}-elements.zip`;
}

interface DomainCacheModel {
  version: string;  
  [key: string]: any;
}
