import { PebBrowserConfig } from '@pe/builder/core';

export interface PebServerConfig {
  appType: string;
  host: string;
  apiUrl: string;
  builderApiUrl: string;
  storageUrl: string;
  sitemap: boolean;
  useCache: boolean;
  maxCacheSize: number;
}

export const serverConfig: PebServerConfig = {
  appType: process.env.APP_TYPE ?? '',
  host: process.env.APP_HOST ?? '',
  apiUrl: process.env.APP_API ?? '',
  builderApiUrl: process.env.BUILDER_API ?? '',
  storageUrl: process.env.STORAGE_URL ?? '',
  sitemap: process.env.SITEMAP ?? '' as any,
  useCache: process.env.SKIP_CACHE?.toLocaleLowerCase() !== 'true',
  maxCacheSize: Number(process.env.MAX_CACHE_SIZE || '5000000'),
};

export const browserConfig: PebBrowserConfig = {
  appType: process.env.APP_TYPE ?? '',
  host: process.env.APP_HOST ?? '',
  apiUrl: process.env.APP_API ?? '',
  builderApiUrl: process.env.BUILDER_API ?? '',
};
