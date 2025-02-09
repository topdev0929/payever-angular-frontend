import { PebDocument, PebPage, PebThemeRoute } from '@pe/builder-core';

export type AppTypeEnum = 'pos' | 'shop' | 'marketing';

export type ThemeCardActions = 'install' | 'duplicate' | 'translate' | 'edit' | 'export' | 'delete';

export enum ThemeTypeEnum {
  app = 'app',
  business = 'business',
  system = 'system',
}

export interface BaseThemeVersionInterface {
  id: string;
  current: boolean;
  name: string;
  version: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  pages: string[] | PebDocument[] | PebPage[];
}

export interface ThemeVersionWithPagesInterface extends BaseThemeVersionInterface {
  data: any;
  pages: PebDocument[];
}

export interface BaseThemeInterface {
  id: null | string;
  appType: AppTypeEnum;
  active: boolean;
  name: string;
  business: string;
  logo: string;
  type: ThemeTypeEnum;
  currentVersion: string;
  versions: ThemeVersionWithPagesInterface[];
  pages: string[] | PebDocument[];
}

/**
 * Themes with this interface are fetched from server as-is. It is used in Themes
 */
export interface RawThemeInterface extends BaseThemeInterface {
  pages: string[];
}

/**
 * Theme with filled content for every page. Used in Builder
 */
export interface ThemeWithPageInterface extends BaseThemeInterface {
  pages: PebDocument[];
}

export interface ThemeCategoryIndustryInterface {
  uuid: string;
  name: string;
}

export interface ThemeCategoryInterface {
  id: string;
  industries: ThemeCategoryIndustryInterface[];
  name: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}


export interface Product {
  barcode: string;
  description: string;
  hidden: boolean;
  images: string[];
  price: number;
  salePrice: number;
  sku: string;
  title: string;
  uuid: string;
  variants: ProductVariant[];
}

export interface ProductVariant {
  isTrackable?: boolean;
  sku?: string;
  id: string;
  title: string;
  description: string;
  price: number;
  salePrice: number;
  hidden: boolean;
  images: string[];
}
