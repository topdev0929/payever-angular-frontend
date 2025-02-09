import { PaymentAddressSettingsInterface } from '@pe/checkout/types';

export interface PaymentSettings {
  hasNodeOptions: boolean;
  addressSettings: PaymentAddressSettingsInterface;
}
