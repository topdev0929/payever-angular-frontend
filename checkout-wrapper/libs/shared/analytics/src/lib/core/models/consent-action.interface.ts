import { PaymentMethodEnum } from '@pe/checkout/types';

import { AnalyticConsentEventEnum, AnalyticConsentStatusEnum } from './analytic-action.enum';

export interface EventConsentInterface {
    action: AnalyticConsentEventEnum;
    value: AnalyticConsentStatusEnum;
    paymentMethod: PaymentMethodEnum;
    form?: string;
    field?: string;
}

export interface ConsentActionsInterface {
    formActions: EventConsentInterface[];
}
