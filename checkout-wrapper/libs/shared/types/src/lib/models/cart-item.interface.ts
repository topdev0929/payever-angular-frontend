export interface CartItemOptionInterface {
  _id?: string;
  name: string;
  value: string;
}

export interface CartItemInterface {
  productId?: string;
  id?: string; // It's duplicate of uuid buf it's still required (in inventory)
  _id?: string;
  identifier?: string;
  image?: string;
  name?: string;
  options?: CartItemOptionInterface[];
  sku?: string;
  originalPrice?: number; // Price before coupon applied
  price?: number;
  priceNet?: number;
  quantity?: number;
  vat?: number;
  extraData?: {
    updatedAt?: number;
    category?: string;
  };
}

export interface CartItemExInterface extends CartItemInterface {
  _optionsAsLine?: string;
}
