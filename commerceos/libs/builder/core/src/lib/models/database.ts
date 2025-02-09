export interface PebThemeEntity {
  id: string;
  name: string;
  picture: string;
  sourceId: string;
  versionsIds: string[];
  publishedId: null | string;
}

export interface PebImageUploadResponse {
  blobName: string;
  brightnessGradation: string;
  preview: string;
  loaded: string;
}

export interface PebThemeLanguageMap {
  isDefault: boolean;
  locale: string;
  data: { [code: string]: string; };
}

export interface PebThemeDetail {
  id: string;
  pages: any[];
  application: any;
  hash: string;
  updatedAt?: string;
  languageMaps: PebThemeLanguageMap[];
  lastAction: string;
  lastPublishedActionId: string;
}
