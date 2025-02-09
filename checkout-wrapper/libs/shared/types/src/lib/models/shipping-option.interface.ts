import { ShippingOptionEnum } from '../enums';

export interface ShippingOptionInterface {
  category: string;
  code: string;
  currency: string;
  delivery_time: string;
  id: number;
  name: string;
  option_name: string;
  price: number;
  type: ShippingOptionEnum;
}
