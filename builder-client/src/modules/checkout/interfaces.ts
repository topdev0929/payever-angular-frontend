export interface CartInterface {
  items: CartItemInterface[];
  amount: number;
  flowId: string;
  status?: 'pending' | '';
}

export interface CartItemInterface {
  subTitle: string;
  itemId: string;
  image: string;
  title: string;
  sku: string;
  thumbnail: string;
  count: number;
  price: number;
  quantity?: number;
  error?: string;
  extra_data?: {
    updated_at?: number;
  };
}

export interface CartEventInterface {
  items: CartItemInterface[];
  sendEvent: boolean;
}

export interface FlowBodyCartInterface {
  name?: string;
  uuid: string;
  quantity: number;
  price?: number;
}

export interface FlowBodyInterface {
  amount: number;
  x_frame_host?: string;
  currency?: string;
  channel_set_id?: string;
  pos_merchant_mode?: boolean;
  reference?: string;
  cart: FlowBodyCartInterface[];
  shop_url?: string;
}

export interface FlowDataInterface {
  id: string;
  state: 'IN PROGRESS' | 'FINISHED' | 'CANCELED';
  cart: FlowBodyCartInterface[];
  flow_identifier?: string; // PAYEVER_SESSION
  guest_token?: string;
}

export interface CurrencyInterface {
  currency: string;
}
