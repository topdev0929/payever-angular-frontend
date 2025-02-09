import { PEB_ROOT_SCREEN_KEY } from '@pe/builder/core';
import { flattenELements, getAllScreenStyles } from '@pe/builder/render-utils';

import { toDocument, toRenderElement } from '../src/app/renderer/helpers';
import { CLIENT_CONTAINER, PEB_CACHE_VER } from '../src/constants';

import * as elementService from './element.service';
import * as themeCacheService from './theme-cache.service';


export async function getPageStyles(res: any, themeId: string, version: number | string, pageId: string)
  : Promise<string | undefined> {

  const elementDefs = await elementService.retrieveElementDefsNoCache(themeId, version, pageId);
  const screens = Object.values(themeCacheService.getScreens(themeId) ?? {});

  if (!screens?.length) {
    throw new Error('screens not defined');
  }
  const rootDef = toDocument(elementDefs, { screens, languages: [], pages: {} });
  const rootElement = toRenderElement(rootDef, PEB_ROOT_SCREEN_KEY, pageId, CLIENT_CONTAINER);
  const renderingElements = Object.values(flattenELements(rootElement));

  const stylesTxt = getAllScreenStyles(renderingElements, screens);

  return stylesTxt;
}

export function getStyleRequestKey(themeId: string, version: number | string, pageId: string): string {
  return `${pageId}-${version}-${PEB_CACHE_VER}.css`;
}