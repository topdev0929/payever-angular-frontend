export interface OrderInterface {
  hasCartItems?: boolean;
  isPosOrder?: boolean;
  orderTotal?: number;
  shippingPrice?: number;
  subtotal?: number;
  taxValue?: number;
}
