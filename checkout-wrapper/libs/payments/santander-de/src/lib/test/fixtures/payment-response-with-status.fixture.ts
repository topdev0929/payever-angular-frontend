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
      currency: 'EUR',
      customerEmail: 'customer2000@email.de',
      customerName: 'Test Test',
      downPayment: 0,
      paymentType: PaymentMethodEnum.SANTANDER_INSTALLMENT,
      reference: 'yg52047459426',
      specificStatus,
      status,
      total: 350,
    },

    paymentDetails: {
      orderId: 'c795b5b4-9a6b-4f13-997a-c76e6515e1e2',
      redirectUrl: 'https://linkup.stg.cf.zinia.com/c795b5b4-9a6b-4f13-997a-c76e6515e1e2?documentCountry=DE',
      expirationTime: '2023-11-15T17:20:38.218Z',
      usageText: '',
      verifyType: 'otp',
      advertisingAccepted: true,
      conditionsAccepted: true, 'finalizeUniqueId': 'c795b5b4-9a6b-4f13-997a-c76e6515e1e2',
      receiptUniqueId: null,
      reservationUniqueId: 'c795b5b4-9a6b-4f13-997a-c76e6515e1e2',
      shopUserSession: null,
    },
    paymentItems: [],
    options: {
      merchantCoversFee: true,
      shopRedirectEnabled: false,
    },
  });
