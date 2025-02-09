import {
    NodePaymentResponseInterface,
    PaymentMethodEnum,
    PaymentSpecificStatusEnum,
    PaymentStatusEnum,
} from '@pe/checkout/types';

export const nodeResultFixture: () => NodePaymentResponseInterface<any> = () => ({
    createdAt: '',
    id: '',
    payment: {
        deliveryFee: 100,
        paymentFee: 10,
        amount: 100,
        address: {},
        apiCallId: 'apiCallId',
        businessId: 'businessId',
        businessName: 'businessName',
        channel: 'channel',
        channelSetId: 'channelSetId',
        currency: 'currency',
        customerEmail: 'customerEmail',
        customerName: 'customerName',
        downPayment: 100,
        paymentType: PaymentMethodEnum.BFS_B2B_BNPL,
        reference: 'reference',
        shippingAddress: {},
        specificStatus: PaymentSpecificStatusEnum.STATUS_SANTANDER_DECISION_NEXT_WORKING_DAY,
        status: PaymentStatusEnum.STATUS_REFUNDED,
        total: 1000,
    },
    paymentItems: [],
    paymentDetails: {
      clickAndCollect: false,
    },
    _apiCall: {
      id: '',
      successUrl: 'url',
    },
});
