import { PaymentAddressSettingsInterface, PollingConfig } from '@pe/checkout/types';


export const HAS_NODE_FORM_OPTIONS = true;

export const BILLING_ADDRESS_SETTINGS: PaymentAddressSettingsInterface = null;

export const DK_POLLING_CONFIG: PollingConfig = {
  pollingInterval: 3_000,
  maxTimeout: 30_000,
};
