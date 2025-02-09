import { PebAnimationPresets } from './animation.model';
import { PebPageVariant, PebRestrictAccess } from './client';
import { PebElementDef, PebMap, PebValueByScreen } from './element.model';
import { PebThemeLanguageSetting } from './language.model';
import { PebViewPage } from './view-state.model';

export interface PebPageSeoData {
  title: string;
  url: string;
  canonicalUrl: string;
  description: string;
  showInSearchResults: boolean;
  markupData: string;
  customMetaTags: string;
}

export interface PebPage {
  id: string;
  name: string;
  preview: Partial<PebValueByScreen<string>>;
  prev: string | null;
  next: string | null;
  variant: PebPageVariant;
  /** TODO: SEO should be per language */
  seo: PebPageSeoData;
  deleted?: true;
  versionNumber: number;
  url: string;
  updatedAt: Date;
  restrictAccess?: PebRestrictAccess;
  /** Do not rename to have proper JSON Patch path */
  element: { [id: string]: PebElementDef };
  master?: { isMaster?: boolean, page?: string };
  parentId?: string;
  defaultLanguage?: string;
}

export const toPageDTO = (value: any): PebPage => {
  return {
    ...value,
    versionNumber: value.versionNumber ?? 0,
    updatedAt: new Date(value.updatedAt),
    element: {},
  };
};

export interface PebTheme {
  id: string;
  name: string;
  data?: any;
  versionNumber: number,
  publishedVersion: number | null;
  language: PebThemeLanguageSetting;
  undo: string;
  screens: { [key: string]: PebScreen };
  favicon?: string;
  presets: {
    animations: PebAnimationPresets;
  };
  businessId?: string;
  applicationId?: string;
  channelSet?: any;
}

export type PebEditorTheme = PebTheme & {
  page?: PebMap<PebPage>,
  sortedScreens?: PebScreen[],
}

export interface PebScreen {
  key: string;
  title: string;
  width: number;
  padding: number;
  icon: string;
}

export const toThemeDTO = (value: any): PebTheme => {
  return {
    id: value.id,
    name: value.name,
    publishedVersion: value.publishedVersion,
    versionNumber: value.versionNumber ?? value.publishedVersion ?? 0,
    language: value.language,
    undo: value.undo,
    screens: value.screens,
    favicon: value.favicon,
    presets: { animations: {} },
  };
};

export const isMasterPage = (page?: PebPage | PebViewPage) => page?.master?.isMaster;
export const isChildPage = (page?: PebPage | PebViewPage) => !page?.master?.isMaster;
