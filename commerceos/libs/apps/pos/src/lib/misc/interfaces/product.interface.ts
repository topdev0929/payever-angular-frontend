export interface PePosProductInterface {
  image: string;
  name: string;
  description: string;
  priceAndCurrency: string;
  id: string;
  price: number;
  currency: string;
  variants?: PePosProductVariantsInterface[];
}

export interface PePosProductVariantsInterface {
  id: string;
  title: string;
  options: OptionsContainer[];
  description: string;
  price: number;
  sku: string;
}

export interface Option {
  value: string;
}

export interface OptionsContainer {
  options: Option[];
}
