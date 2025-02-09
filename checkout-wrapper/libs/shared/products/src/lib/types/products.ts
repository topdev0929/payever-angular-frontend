export enum ProductTypes {
  Digital = 'digital',
  Physical = 'physical',
  Service = 'service'
}

export interface ProductInventoryInterface {
  sku: string;
  inventory: number;
  inventoryTrackingEnabled: boolean;
  barcode: string;
  onSales: boolean;
}

export interface ProductInterface extends ProductInventoryInterface {
  [key: string]: any;
  id?: string;
  title: string;
  description: string;
  price: number;
  salePrice: number;
  vatRate: number;
  images: string[];
  type: ProductTypes;
  active: boolean;
  variants: ProductVariantInterface[];
  shipping: ShippingSection;
}

interface MainSection {
  images?: string[];
  description: string;
  price: number;
  salePrice: number;
  isSale: boolean;
}

export interface ProductVariantInterface extends MainSection, ProductInventoryInterface {
  id: string;
  options?: {
    _id?: string;
    name: string;
    value: string;
  }[];
}

interface ShippingSection {
  free?: boolean;
  general?: boolean;
  weight: string;
  width: string;
  length: string;
  height: string;
}
