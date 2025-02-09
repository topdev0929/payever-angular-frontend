import { PePosProductVariantsInterface } from "../misc/interfaces/product.interface";

export type Pos = {
  _id: string,
  logo: string,
  name: string,
  business: string,

  createdAt: string,
  updatedAt: string,
  channelSet: string,

  default: boolean,
  defaultLocale: string,
  __v: number,

  accessConfig?: PosAccessConfig,
};

export type PosAccessConfig = {
  isLive: boolean,
  isLocked: boolean,
  ownDomain: string,
  internalDomain: string,
  internalDomainPattern: string,
};

export type PosCreate = {
  name: string,
  logo?: string,
};

export interface PebPosAccessConfig {
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

export enum IntegrationCategory {
  Communications = 'communications',
}

export interface IntegrationInfoInterface {
  _id: string;
  installed: boolean;
  integration: {
    name: string;
    category: IntegrationCategory;
    displayOptions: {
      icon: string;
      title: string;
      order?: number;
    };
  };
}
export interface IntegrationConnectInfoInterface {
  _id: string;
  name: string;
  enabled: boolean;
  category: IntegrationCategory;
  timesInstalled: number;
  ratingsPerRate: [];
  ratingsCount: number;
  avgRating: number;
  extension?: {
    formAction: {
      endpoint: string;
      method: string;
    };
    url: string;
  };
}


export enum CustomChannelTypeEnum {
  DirectLink = 'direct_link',
  TextLink = 'textLink',
  Button = 'button',
  Calculator = 'calculator',
  Bubble = 'bubble',
  Shop = 'shop',
  Marketing = 'marketing',
  Pos = 'pos',
  QR = 'qr',
}

export interface IntegrationInfoInterface {
  _id: string;
  installed: boolean;
  enabled: boolean;
  integration: {
    name: string,
    category: IntegrationCategory,
    displayOptions: {
      icon: string,
      title: string,
      order?: number,
    },
  };
}


export interface TerminalInterface {
  _id?: string;
  channelSet?: string;
  business?: string;
  theme?: string;
  checkout?: string;
  name?: string;
  logo?: string;
  currency?: string;
  active?: boolean;
  phoneNumber?: string;
  message?: string;
  locales?: string[];
  defaultLocale?: string;
}

export interface PePosServerProductResponse {
  data: { getProducts: { products: PePosServerProduct[] } }
}

export interface PePosServerProduct { 
  imagesUrl: string[];
  title: string;
  description: string;
  priceAndCurrency: string;
  id: string;
  price: number;
  variants: PePosProductVariantsInterface[];
  currency: string;
}