export enum AppInstanceEnum {
  Shop = 'shop',
  Marketing = 'marketing',
  Pos = 'pos',
  Builder = 'builder',
}

export enum ProductTypes {
  Digital = 'digital',
  Physical = 'physical',
  Service = 'service',
}

export enum ChannelTypes {
  Pos = 'pos',
  Shop = 'shop',
  Market = 'market',
  Facebook = 'facebook',
  Mobilede = 'mobilede',
  Ebay = 'ebay',
  Autoscout24 = 'autoscout24',
  Amazon = 'amazon',
}

export enum ProgramInterval {
  Day = 'day',
  Week = 'week',
  Month = 'month',
  Year = 'year',
}

export enum ProgramType {
  Fixed = 'fixed',
}

export interface ProgramEntity {
  _id?: string;
  name: string;
  interval: ProgramInterval;
  billingPeriod: number;
  products: [];
  channelSet: string[];
  shortName?: string;
  price?: number;
  planType: ProgramType;
  subscribersTotal?: number;
  theme: string;
  business: ProgramBusiness;
}
export interface ProgramBusiness {
  _id: string;
  currency: string;
  name: string;
}

export interface ProgramProduct {
  _id: string;
  businessUuid: string;
  price: number;
  title: string;
  business: ProgramBusiness;
  interval: ProgramInterval;
  billingPeriod: number;
}

export interface PaginationCamelCase {
  page: number;
  pageCount?: number;
  perPage: number;
  itemCount?: number;
}

export interface PaginationInfoCamelCase {
  pagination: PaginationCamelCase;
}

export interface CollectionsLoadedInterface {
  info: PaginationInfoCamelCase;
  collections: Collection[];
}

export interface ProductModel {
  id?: string;
  businessUuid: string;
  title: string;
  description: string;
  onSales: boolean;
  price: number;
  salePrice: number;
  available?: boolean;
  // type: string;
  active: boolean;
  channelSets: ChannelSetInterface[];
  categories: Category[];
  collections: Collection[];
  images: string[];
}

export interface ChannelSetInterface {
  id: string | number;
  type: ChannelTypes | AppInstanceEnum;
  name?: string;
}

export interface Category {
  title: string;
  id?: string;
  slug?: string;
  businessUuid?: string;
}

export interface Collection {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  channelSets: string[];
  parent?: string;
  activeSince: Date;
  activeTill?: Date;
  children?: any[];
  automaticFillConditions?: {
    strict: boolean;
    filters: FormattedFilter[];
  };
  productCount?: number;
}

export interface FormattedFilter {
  field: string;
  fieldType: 'string' | 'number';
  fieldCondition: string;
  value: string;
  valueIn?: string;
}
