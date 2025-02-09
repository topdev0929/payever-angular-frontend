export interface ProductItemsResponse {
  collection: Product[];
  filter: any;
  order: any;
  pagination: Pagination;
  serialization: any;
}

export interface Pagination {
  page: number;
  page_count: number;
  per_page: number;
  item_count: number;
}

export interface Product {
  business: any;
  categories: any[];
  created_at: string;
  deleted_at: string;
  description: string;
  hidden: boolean;
  id: string;
  import: any;
  medias: Media[];
  parameters: any;
  primary_media: Media;
  quantity: number;
  shipping: {
    type: string;
    price: number;
  };
  stores: any[];
  title: string;
  type: string;
  updated_at: string;
  uuid: string;
  variants: ProductVariant[];
  vat: number;
}

export interface ProductVariant {
  uuid?: string;
  id?: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  sku: string;
  barcode?: string;
  quantity?: number;
  medias?: Media[];
}

export interface Media {
  uuid: string;
  name: string;
  description: string;
  provider_name: string;
  provider_status: string;
  provider_reference: string;
  provider_metadata: {
    filename: string;
  };
  context: string;
  content_type: string;
  created_at: string;
  updated_at: string;
  sources: {
    customer_shop_grid: MediaSource;
    customer_shop_list: MediaSource;
    reference: MediaSource;
  };
}

export interface MediaSource {
  format: string;
  url: string;
  alt: string;
  title: string;
  width: number;
  height: number;
}
