import { PaymentAddressSettingsInterface, PollingConfig } from '@pe/checkout/types';


export const HAS_NODE_FORM_OPTIONS = true;
export const COUNTRY_CODE = 'DE';

export const BILLING_ADDRESS_SETTINGS: PaymentAddressSettingsInterface = {
  phonePattern: '^(?:(?:\\+?49)|0|0049)[1-9]\\d{8,10}$',
  phonePatternCodeRequired: '^\\+49[1-9]\\d{8,10}$',
  codeRequired: true,
  postalCodePattern: '^\\d{5}$',
  countryCode: COUNTRY_CODE,
};

export const POS_DE_POLLING_CONFIG: PollingConfig = {
  pollingInterval: 5_000,
  maxTimeout: 15_000,
};

export const EXCLUDE_ANALYZE_DOCUMENTS = [
  'pdf',
];

export default {
  addressSettings: BILLING_ADDRESS_SETTINGS,
  hasNodeFormOptions: true,
  pollingConfig: POS_DE_POLLING_CONFIG,
};
