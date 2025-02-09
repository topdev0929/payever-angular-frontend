
import { PebElementDef } from '@pe/builder/core';

import { getPageElements } from '../src/app/services';

import { serverConfig } from './config.service';
import * as themeCacheService from './theme-cache.service';


export async function getBrowserRenderElements(themeId: string, version: number | string, pageId: string)
  : Promise<any> {
  return await retrieveElementDefs(themeId, version, pageId);
}

export async function retrieveElementDefs(themeId: string, version: number | string, pageId: string)
  : Promise<PebElementDef[]> {
  const elementCacheKey = themeCacheService.getElementsCacheKey(pageId);
  let pageElements = themeCacheService.getCacheData(themeId, elementCacheKey);

  return pageElements && pageElements.length > 0
    ? pageElements
    : await retrieveElementDefsNoCache(themeId, version, pageId);
}

export async function retrieveElementDefsNoCache(themeId: string, version: number | string, pageId: string)
  : Promise<PebElementDef[]> {
  const elementCacheKey = themeCacheService.getElementsCacheKey(pageId);

  const pageElements = await getPageElements(serverConfig, version, themeId, pageId);
  themeCacheService.setCacheData(themeId, elementCacheKey, pageElements);

  return pageElements;
}