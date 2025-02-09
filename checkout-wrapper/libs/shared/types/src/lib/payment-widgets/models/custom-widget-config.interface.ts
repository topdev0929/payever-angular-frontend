import { AddressInterface } from '../../models';

import { WidgetConfigInterface } from './config.interface';

export interface CustomWidgetConfigInterface extends WidgetConfigInterface {
  business?: string;
  businessId?: string;
  widgetId?: string;
  amount?: number;
  reference?: string;
  isDebugMode?: boolean;
  shippingOption?: ShippingOption;
  shippingOptions?: ShippingOption[];
  billingAddress?: AddressInterface;
  shippingAddress?: AddressInterface;
  theme?: 'light' | 'dark';
  alignment?: 'left' | 'center' | 'right';
  quoteCallbackUrl?: string;
}

export interface ShippingOption {
  name: string;
  carrier?: string;
  category?: string;
  price?: number;
  taxRate?: number;
  taxAmount?: number;
  details?: ShippingOptionDetails;
}

interface ShippingOptionDetails {
  timeslot: Date;
  pickupLocation: PickupLocation;
}

interface PickupLocation {
  id: string;
  name: string;
  address: string;
}
