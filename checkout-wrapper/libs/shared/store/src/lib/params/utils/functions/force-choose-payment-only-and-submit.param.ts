import { SectionType } from '@pe/checkout/types';

import { CheckoutParamHandler } from '../param-handler.type';

export const forceChoosePaymentOnlyAndSubmit: CheckoutParamHandler =
  (panels, params, flow, value) => panels.map(p => ({
    ...p,
    hiddenByState: ![SectionType.ChoosePayment, SectionType.Payment].includes(p.name),
  }));
