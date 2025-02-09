import { 
    NodePaymentResponseInterface,
    PaymentMethodEnum,
    PaymentSpecificStatusEnum,
    PaymentStatusEnum,
} from '@pe/checkout/types';
import { cloneDeep } from '@pe/checkout/utils';

export const nodeResultFixture: () => NodePaymentResponseInterface<any> = () => cloneDeep({
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
        paymentType: PaymentMethodEnum.SANTANDER_INSTALLMENT_AT,
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