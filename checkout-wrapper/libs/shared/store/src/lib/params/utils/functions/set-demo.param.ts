import { SectionType } from '@pe/checkout/types';

import { CheckoutParamHandler } from '../param-handler.type';

export const setDemo: CheckoutParamHandler =
  (panels, params, flow, value) => panels.map(p => ({
    ...p,
    hiddenByState: p.name !== SectionType.ChoosePayment,
  }));
