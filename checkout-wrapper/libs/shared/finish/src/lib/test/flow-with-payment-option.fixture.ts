import { flowFixture } from '@pe/checkout/testing';
import { FlowInterface, PaymentMethodEnum, SalutationEnum } from '@pe/checkout/types';
import { cloneDeep } from '@pe/checkout/utils';

export const flowWithPaymentOptionsFixture: () => FlowInterface = () =>
  cloneDeep<FlowInterface>({
    ...flowFixture(),
    channel: 'pos',
    reference: 'reference',
    billingAddress: {
      salutation: SalutationEnum.SALUTATION_MR,
      firstName: 'First Name',
      lastName: 'Last Name',
      street: 'St. Test',
      country: 'DE',
      city: 'Berlin',
      zipCode: '50000',
    },
    connectionId: 'insb5f52-7859-4ba0-a20f-d271200be4db',
    paymentOptions: [
      {
        connections: [
          {
            id: 'insb5f52-7859-4ba0-a20f-d271200be4db',
            merchantCoversFee: false,
            shippingAddressAllowed: false,
            shippingAddressEquality: false,
          },
        ],
        name: 'SANTANDER_POS_INSTALLMENT',
        slug: 'SANTANDER_POS_INSTALLMENT',
        settings: null,
        min: 0,
        max: 100000,
        fixedFee: 0,
        variableFee: 0,
        acceptFee: true,
        paymentMethod: PaymentMethodEnum.SANTANDER_POS_INSTALLMENT,
      },
    ],
    apiCall: {
      cancelUrl: 'https://payever-cancel-url',
    },
    shopUrl: 'https://payever-shop-url.com',
  });
