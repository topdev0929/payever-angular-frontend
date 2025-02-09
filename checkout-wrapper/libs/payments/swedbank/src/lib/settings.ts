import { CountryCode } from 'libphonenumber-js/types';

import { PaymentAddressSettingsInterface, PaymentMethodEnum } from '@pe/checkout/types';

export const HAS_FORM_OPTIONS = false;
export const HAS_NODE_FORM_OPTIONS = false;
export const BILLING_ADDRESS_SETTINGS: PaymentAddressSettingsInterface = null;
export const ALLOWED_COUNTRIES: {
  [key in PaymentMethodEnum]?: CountryCode[];
} = {
  [PaymentMethodEnum.SWEDBANK_CREDITCARD]: ['SE'],
  [PaymentMethodEnum.SWEDBANK_INVOICE]: ['SE'],
  [PaymentMethodEnum.SWEDBANK_VIPPS]: ['NO'],
  [PaymentMethodEnum.SWEDBANK_MOBILE_PAY]: ['DK', 'FI'],
  [PaymentMethodEnum.SWEDBANK_SWISH]: ['SE'],
  [PaymentMethodEnum.SWEDBANK_TRUSTLY]: ['NO', 'SE', 'FI'],
};
