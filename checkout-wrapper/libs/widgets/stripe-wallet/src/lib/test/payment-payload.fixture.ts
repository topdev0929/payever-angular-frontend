import { flowFixture } from '@pe/checkout/testing';
import { PaymentPayload } from '@pe/checkout/types';
import { cloneDeep } from '@pe/checkout/utils';

import { widgetConfigFixture } from './widget-config.fixture';

export const paymentPayloadFixture: () => PaymentPayload = () => cloneDeep<PaymentPayload>({
  payment: {
    flowId: flowFixture().id,
    amount: flowFixture().amount,
    channelSetId: flowFixture().channelSetId,
    currency: flowFixture().currency,
    deliveryFee: widgetConfigFixture().shippingOption.price,
    businessId: widgetConfigFixture().businessId,
    businessName: flowFixture().businessName,
    channel: flowFixture().channelType,
    reference: widgetConfigFixture().reference,
    total: flowFixture().amount + widgetConfigFixture().shippingOption.price,
    billingAddress: widgetConfigFixture().billingAddress,
    shippingAddress: widgetConfigFixture().shippingAddress,
    shippingOption: widgetConfigFixture().shippingOption,
    apiCallId: flowFixture().apiCall.id,
  },
  paymentDetails: {
    frontendFailureUrl: window.location.href,
    frontendCancelUrl: widgetConfigFixture().cancelUrl,
    frontendFinishUrl: widgetConfigFixture().successUrl,
    quoteCallbackUrl: widgetConfigFixture().quoteCallbackUrl,
  },
  paymentItems: widgetConfigFixture().cart,
});
