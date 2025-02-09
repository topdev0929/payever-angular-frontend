import { PebAppType } from '@pe/builder-core';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export enum AzureAppFolderEnum {
  Shop = 'shops',
  Pos = 'terminals'
}

export enum DomainStatusEnum {
  Loaded = 'loaded',
  Unregistered = 'unregistered',
  Passworded = 'passworded',
  Unknown = 'unknown',
}

export interface BaseMessageInterface {
  name: string;
}

export interface BuilderMessageInterface extends BaseMessageInterface {
  payload: {
    businessId: string;
    applicationId: string;
    applicationType: string;
  }
}

export type DomainMessage = DomainCreatedMessageInterface
  | DomainUpdatedMessageInterface
  | DomainRemovedMessageInterface;

export interface DomainCreatedMessageInterface extends BaseMessageInterface {
  payload: DomainInterface;
}

export interface DomainUpdatedMessageInterface extends BaseMessageInterface {
  payload: {
    businessId: string;
    applicationId: string;
    oldDomainName: string;
    newDomainName: string;
    type: string;
  }
}

export interface DomainRemovedMessageInterface extends DomainCreatedMessageInterface {}

export interface ShopMessageInterface extends BaseMessageInterface {
  payload: {
    businessId: string;
    shopId: string;
    live: boolean;
  }
}

export interface ShopInterface {
  active: boolean;
  locales: string[];
  defaultLocale: string;
  live:boolean;
  _id: string;
  name: string;
  channelSet: string;
  business: string;
  theme: string;
}

export interface DomainInterface {
  id?: string;
  app?: string;
  type?: PebAppType;
  theme?: string;
  business?: string;
  name?: string;
  productIds?: string[];
  isActive?: boolean;
  isLive?: boolean;
  status?: DomainStatusEnum;
}

export interface RouteHtmlInterface {
  route: string;
  html: string;
}

export interface PrerenderRequiredDataInterface {
  routes: string[];
  appType: PebAppType;
  domainNames: string[];
}

export interface PasswordConfigInterface {
  enabled: boolean;
  message: string;
  passwordLock: boolean;
}
