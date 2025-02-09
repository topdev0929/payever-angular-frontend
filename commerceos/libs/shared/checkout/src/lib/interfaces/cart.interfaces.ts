export interface ContextCart {
  count: number;
  product: PeProductInterface | null;
  variant?: PeProductVariantsInterface | null;
}

export interface PeElementContext<T> {
  data?: T;
}

export interface PeProductInterface {
  image: string;
  name: string;
  description: string;
  priceAndCurrency: string,
  id: string;
  price: number;
  currency: string;
  variants?: PeProductVariantsInterface[];
}

export interface PeProductVariantsInterface {
  id: string;
  title: string;
  options: OptionsContainer[];
  description: string;
  price: number;
  sku: string
}

export interface Option {
  value: string;
}

export interface OptionsContainer {
  options: Option[];
}
