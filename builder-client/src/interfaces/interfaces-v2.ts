import { PebElement } from '@pe/builder-core';
import { DocumentTypes } from '@pe/builder-editor/projects/modules/elements/src/index';

export interface ThemePageInterface extends PebElement {
  data: BuilderSeoSettingsInterface;
}

export interface ApplicationThemeVersionInterface {
  applicationTheme: string;
  applicationId: string;
  current: boolean;
  pages: ThemePageInterface[];
  published: boolean;
}

export interface GetApplicationThemeVersionDto {
  applicationTheme?: string;
  applicationId?: string;
  current?: boolean;
  published?: boolean;
  withPages?: boolean;
  themeInstalled?: boolean;
}

export interface BuilderSeoSettingsInterface {
  /**
   * Canonical url. <link rel="canonical" href="url" />
   */
  canonical: string;

  /**
   * Meta description
   */
  description: string;

  /**
   * JSON-LD object that should be places inside <script type="application/ld+json">
   */
  markup: string;

  /**
   * Value for title tag
   */
  name: string;

  /**
   * value for <meta name="robots" content="noindex">
   */
  showInSearchResults: true;

  /**
   * Url of page
   */
  slug: string;

  /**
   * Simple html that should be added into HEAD
   */
  tags: string;

  /**
   * Page type
   */
  type: DocumentTypes;
}

export interface SeoSettingsInterface {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  jsonLd?: string;
}

export enum ProductDataTypes {
  All = 'All Products',
  Category = 'All category products',
  Custom = 'Custom Selection'
}
