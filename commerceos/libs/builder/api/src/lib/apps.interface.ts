import { PebShop, PebThemeDetail } from '@pe/builder/core';

export interface PebPreviewDTO {
  current: PebThemeDetail;
  published: null | PebShop;
  publishStatus: { applicationSynced: boolean, clientSynced: boolean };
}

export interface PebAppDTO {
  isDefault: boolean;
  id: string;
  name: string;
  picture: string;
  channelSet: {
    id: string;
  };
  business: {
    id: string;
    name: string;
    defaultLanguage: string;
  };
  accessConfig: PebAccessConfig;
  businessId: string;
}

export interface PebAccessConfig {
  isLive: boolean;
  isPrivate: boolean;
  isLocked: boolean;
  id: string;
  internalDomain: string;
  internalDomainPattern: string;
  ownDomain: string;
  createdAt: string;
  privateMessage: string;
}
