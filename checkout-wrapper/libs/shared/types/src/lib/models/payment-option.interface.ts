import { PaymentMethodEnum, PaymentMethodVariantEnum } from '../enums';

export interface PaymentOptionSettingsInterface {
  isDownPaymentAllowed?: boolean;
  public_key?: string;
}

export interface ViewPaymentOption extends Omit<PaymentOptionInterface, 'connections'> {
  id: string;
  merchantCoversFee: boolean;
  version: PaymentMethodVariantEnum;
  label: string;
  showFee: boolean;
}

export interface PaymentOptionInterface {
  connections: PaymentOptionConnectionInterface[];
  acceptFee: boolean;
  fixedFee: number;
  // id: number;
  imagePrimaryFilename?: string;
  imageSecondaryFilename?: string;
  max: number;
  min: number;
  name: string;
  paymentMethod: PaymentMethodEnum;
  settings: PaymentOptionSettingsInterface;
  slug: string;
  variableFee: number;
  shareBagEnabled?: boolean;
  connectionName?: string;

}

export interface ShippingAddressSettings {
  shippingAddressAllowed: boolean;
}

export interface PaymentOptionConnectionInterface extends ShippingAddressSettings {
  id: string;
  merchantCoversFee: boolean;
  version?: PaymentMethodVariantEnum;
  name?: string;
  default?: boolean;

  min?: number;
  max?: number;
}

export interface DeviceRestrictionInterface {
  mobile: {
    os: string[],
    browser: string
  },
  desktop: {
    os: string[],
    browser: string
  }
}
