import {
  AddressTypeEnum,
  FlowInterface,
  PaymentMethodEnum,
  PaymentMethodVariantEnum,
  SalutationEnum,
} from '@pe/checkout/types';
import { cloneDeep } from '@pe/checkout/utils';

export const flowWithPaymentOptionsFixture: () => FlowInterface = () => cloneDeep<FlowInterface>({
  id: 'd49a2299-ce03-5e35-beab-bbaa3a8aa28e',
  amount: 1000,
  total: 1000,
  apiCall: {
    id: 'efg2459-ce03-5e35-b3ab-2baa3a8aa28e',
  },
  paymentOptions: [
    {
      name: 'zinia_installment.name',
      paymentMethod: PaymentMethodEnum.ZINIA_INSTALLMENT,
      max: 1000,
      min: 540,
      fixedFee: 0,
      variableFee: 0,
      shareBagEnabled: true,
      acceptFee: true,
      settings: null,
      slug: null,
      connections: [
        {
          id: 'zinia_installment:id',
          default: false,
          name: 'zinia_installment',
          merchantCoversFee: true,
          shippingAddressAllowed: true,
          shippingAddressEquality: false,
          version: PaymentMethodVariantEnum.Default,
        },
      ],
    },
    {
      name: 'zinia_bnpl.name',
      paymentMethod: PaymentMethodEnum.ZINIA_BNPL,
      max: 100000,
      min: 540,
      fixedFee: 0,
      variableFee: 0,
      shareBagEnabled: true,
      acceptFee: true,
      settings: null,
      slug: null,
      connections: [
        {
          id: 'cb769cb4-a30b-4876-b56f-fe96775f5372',
          default: false,
          name: 'zinia_bnpl',
          merchantCoversFee: true,
          shippingAddressAllowed: true,
          shippingAddressEquality: false,
          version: PaymentMethodVariantEnum.Default,
        },
      ],
    },
  ],
  connectionId: 'cb769cb4-a30b-4876-b56f-fe96775f5372',
  billingAddress: {
    city: 'SomeCity',
    country: 'DE',
    email: 'customer2000@email.de',
    firstName: 'Test',
    lastName: 'Test',
    phone: '+46731298952',
    salutation: SalutationEnum.SALUTATION_MR,
    fullAddress: 'SomeStreet 2000, SomeCity 12345' + 'DE',
    street: 'SomeStreet 2000',
    streetName: 'SomeStreet',
    streetNumber: '2000',
    type: AddressTypeEnum.BILLING,
    zipCode: '12345',
  },
});

