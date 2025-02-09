import { AddressTypeEnum, CustomWidgetConfigInterface } from '@pe/checkout/types';
import { cloneDeep } from '@pe/checkout/utils';

export const widgetConfigFixture: () => CustomWidgetConfigInterface = () => cloneDeep<CustomWidgetConfigInterface>({
  business: 'config-business',
  businessId: 'config-businessId',
  widgetId: 'config-widgetId',
  amount: 100.50,
  reference: 'config-reference',
  isDebugMode: false,
  shippingOption: {
    name: 'config-shippingOption-name',
    price: 105.50,
  },
  shippingOptions: [],
  billingAddress: {
    organizationName: 'payever-billing',
    email: 'payever-test@payever.org',
    fullAddress: '123 Main st, Berlin, DE',
    id: 'billing-address-id',
    type: AddressTypeEnum.BILLING,
    region: 'DE',
  },
  shippingAddress: {
    organizationName: 'payever-shipping',
    email: 'payever-test@payever.org',
    fullAddress: '123 Main st, Berlin, DE',
    id: 'billing-address-id',
    type: AddressTypeEnum.SHIPPING,
    region: 'DE',
  },
  theme: 'light',
  alignment: 'left',
  quoteCallbackUrl: 'config-quoteCallbackUrl',
  successUrl: 'https://config-payever-success-url.com',
  cancelUrl: 'https://config-payever-cancel-url.com',
  failureUrl: 'https://config-payever-failure-url.com',
});
