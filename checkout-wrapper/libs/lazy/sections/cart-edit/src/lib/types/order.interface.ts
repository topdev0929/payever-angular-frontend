export interface OrderInterface {
  hasCartItems?: boolean;
  isPosOrder?: boolean;
  orderTotal?: number;
  subtotalOriginal?: number;
  subtotalWithDiscount?: number;
  discount?: number;
  taxValue?: number;
}
