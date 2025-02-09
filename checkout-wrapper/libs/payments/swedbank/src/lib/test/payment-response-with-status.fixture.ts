import {
  NodePaymentResponseInterface,
  PaymentMethodEnum,
  PaymentSpecificStatusEnum,
  PaymentStatusEnum,
} from '@pe/checkout/types';

export const PaymentResponseWithStatus:
  (status: PaymentStatusEnum, specificStatus: PaymentSpecificStatusEnum) => NodePaymentResponseInterface<any> =
  (status: PaymentStatusEnum, specificStatus: PaymentSpecificStatusEnum) => ({
    id: 'id',
    createdAt: new Date().toString(),
    payment: {
      channel: 'link',
      shippingAddress: null,
      deliveryFee: 0,
      paymentFee: 0,
      amount: 350,
      address: {
        city: 'SomeCity',
        country: 'DE',
        email: 'customer2000@email.de',
        firstName: 'Test',
        lastName: 'Test',
        phone: '+491711238496',
        salutation: 'SALUTATION_MR',
        street: 'SomeStreet 2000',
        streetName: 'SomeStreet',
        streetNumber: '2000',
        zipCode: '12345',
      },
      apiCallId: 'api-call-id',
      businessId: 'business-id',
      businessName: 'DE',
      channelSetId: 'ca0331c6-172d-4f69-916b-c06bb6fd4fb5',
      currency: 'USD',
      customerEmail: 'customer2000@email.de',
      customerName: 'Test Test',
      downPayment: 0,
      paymentType: PaymentMethodEnum.SWEDBANK_CREDITCARD,
      reference: 'yg52047459426',
      specificStatus,
      status,
      total: 350,
    },
    paymentDetails: {
      scriptUrl: 'scriptUrl',
    },
    paymentItems: [],
    options: {
      merchantCoversFee: true,
      shopRedirectEnabled: false,
    },
  });
