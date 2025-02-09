export interface ShippingOptionDeliveryTypeInterface {
  _id: string;
  name: string;
  title: string;
  price: number;
  deliveryTimeDays: number;
}
// Data from server

export interface ShippingResponseMethodInterface {
  business: any;
  icon: string;
  integration: string;
  integrationSubscriptionId: string;
  name: string;
  rate: number;
}

export interface ShippingResponseInterface {
  shippingOrderId: string;
  methods: ShippingResponseMethodInterface[];
}

// Normalized data

export interface ShippingOptionSaveDataInterface { // Subset of FlowInterface
                                                   // shipping_category: string; // integration, custom
                                                   // shipping_option_name: string; // default
  shippingMethodName: string; // dhl, freeShipping
  shippingFee: number;
}

export interface NormilizedShippingOptionInterface {
  title: string;
  deliveryTimeDays: number;
  price: number;
  saveData: ShippingOptionSaveDataInterface;
}

export interface NormilizedShippingInterface {
  icon: string;
  title: string;
  description: string;
  options?: NormilizedShippingOptionInterface[];

  shippingOrderId: string;
  integrationSubscriptionId: string;
  saveData?: ShippingOptionSaveDataInterface;
}

// Data to send

export enum WeightUnitEnum {
  kg = 'kg'
}

export enum DimensionUnitEnum {
  cm = 'cm'
}

export interface ShippingCartProduct {
  // uuid - left for compatibility
  uuid: string;
  productId: string;
  quantity: number;
  name: string;
  image: string;
  currency: string;
  price: number;
  weight: number;
  width: number;
  length: number;
  height: number;
  weightUnit: WeightUnitEnum;
  dimensionUnit: DimensionUnitEnum;
}

export interface ShippingAddressInterface {
  name: string;
  streetName: string;
  streetNumber: string;
  city: string;
  stateProvinceCode: string;
  zipCode: string;
  countryCode: string;
  phone: string;
}
