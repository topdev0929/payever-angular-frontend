import { SectionType } from '@pe/checkout/types';

import { CheckoutParamHandler } from '../param-handler.type';

export const forceNoOrder: CheckoutParamHandler =
  (panels, params, flow, value) => panels.map(p => ({
    ...p,
    hiddenByState: !!flow.amount && p.name === SectionType.Order,
  }));
