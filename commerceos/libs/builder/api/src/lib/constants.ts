import { InjectionToken } from '@angular/core';

import { PebShop } from '@pe/builder/core';

/** @deprecated: Use PEB_MEDIA_API_PATH instead */
export const BUILDER_MEDIA_API_PATH = new InjectionToken<string>('BUILDER_MEDIA_API_PATH');
export const PEB_MEDIA_API_PATH = new InjectionToken<string>('BUILDER_MEDIA_API_PATH');

/** @deprecated: Use PEB_STORAGE_PATH instead */
export const BUILDER_MEDIA_STORAGE_PATH = new InjectionToken<string>('BUILDER_MEDIA_STORAGE_PATH');
export const PEB_STORAGE_PATH = new InjectionToken<string>('BUILDER_MEDIA_STORAGE_PATH');

export const PEB_STUDIO_API_PATH = new InjectionToken<string>('PEB_STUDIO_API_PATH');

export const PEB_SYNCHRONIZER_API_PATH = new InjectionToken<string>('PEB_SYNCHRONIZER_API_PATH');

export const PEB_PRODUCTS_API_PATH = new InjectionToken<string>('PEB_PRODUCTS_API_PATH');
export const PEB_EDITOR_API_PATH = new InjectionToken<string>('PEB_EDITOR_API_PATH');
export const PEB_APPS_API_PATH = new InjectionToken<string>('PEB_SHOPS_API_PATH');


export interface CreateShopThemePayload {
  name?: string;
  namePrefix?: string;
  content: PebShop;
}

