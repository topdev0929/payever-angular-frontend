import { CheckoutSettingsInterface } from '@pe/checkout/types';

export const CheckoutSettingsFixture: () => CheckoutSettingsInterface = () => ({
  businessUuid: 'business-uuid',
  currency: 'EUR',
  enableCustomerAccount: true,
  enableDisclaimerPolicy: true,
  enableLegalPolicy: true,
  enablePayeverTerms: true,
  enablePrivacyPolicy: true,
  enableRefundPolicy: true,
  enableShippingPolicy: true,
  languages: [
    {
      active: true,
      isDefault: true,
      code: 'de',
      name: 'Deutsch',
      _id: 'ec9170c9-4d9b-4b59-99cc-f9be53b2c5a2',
    },
    {
      active: false,
      isDefault: false,
      code: 'en',
      name: 'English',
      _id: '82fdc59f-bee2-4ba9-b0f1-52d5d0c25654',
    },
  ],
  testingMode: false,
  version: 'default',
  businessName: 'business-name-de',
  channelType: 'link',
  companyAddress: {
    country: 'DE',
    city: 'company-address-city',
    street: 'company-address-street',
    zipCode: '54321',
  },
  customPolicy: false,
  policyEnabled: true,
});
