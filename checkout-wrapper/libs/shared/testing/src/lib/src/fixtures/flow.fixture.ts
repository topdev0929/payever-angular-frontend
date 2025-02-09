import { BusinessType, FlowInterface, FlowStateEnum } from '@pe/checkout/types';
import { cloneDeep } from '@pe/checkout/utils';

import { validBillingAddressFixture } from './address.fixture';

export const flowFixture = (businessType = BusinessType.B2B): FlowInterface => cloneDeep({
    id: 'uuid',
    amount: 0,
    currency: 'EUR',
    total: 0,
    cart: [],
    deliveryFee: 0,
    forceLegacyCartStep: true,
    forceLegacyUseInventory: true,
    state: FlowStateEnum.PROGRESS,
    apiCall: {
        ...validBillingAddressFixture(),
        id: 'uuid',
        birthDate: null,
        company: {
            externalId: 'test',
        },
        cancelUrl: null,
        failureUrl: null,
        pendingUrl: null,
        successUrl: null,
    },
    businessId: 'uuid',
    businessName: 'businessName',
    businessCountry: 'DE',
    businessIban: 'DE89370400440532013000',
    businessAddressLine: 'Marthastraße 20, 90482, Nürnberg, DE',
    businessType: businessType,
    channel: 'link',
    channelSetId: 'uuid',
    channelType: 'checkout',
    company: {
        externalId: 'uuid',
        name: 'Test',
    },
    paymentOptions: [],
    }
);
