export interface PebPaginationParams {
  offset?: number;
  limit?: number;
}

export type PebOrderDirection = 'asc' | 'desc';

export type PebOrderParams = Array<{ field: string, direction: PebOrderDirection }>;

export interface PebFilterParam {
  field?: string;
  fieldCondition: PebFilterConditionType|string;
  value: any;
}

export enum PebFilterConditionType {
  In = 'in',
  Contains = 'contains',
  IContains = 'icontains',
  Or = 'or',
  And = 'and',
  Is = 'is',
}

export type PebFilterParams = PebFilterParam[];

/**
 * Products
 */

export interface PebProductCollection {
  id: string;
  name: string;
  parent?: string;
  image?: string;
  ancestors?: any;
  productCount: number;
}

export interface PebProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  salePrice: string;
  currency: string;
  images: string[];
  imagesUrl: string[];
  collections: PebProductCollection[];
}

export interface PebProductCategory {
  title?: string;
  name?: string;
  id: string;
  description?: string;
  image?: string;
  products?: PebProduct[];
  parent?: {
    id: string;
    title: string;
    description: string;
  };
}
