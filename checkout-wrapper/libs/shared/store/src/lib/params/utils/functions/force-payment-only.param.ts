import { SectionType } from '@pe/checkout/types';

import { CheckoutParamHandler } from '../param-handler.type';
import { hidePanelsByState } from '../step.utils';

export const forcePaymentOnly: CheckoutParamHandler =
  (panels, params, flow, value) => hidePanelsByState(panels, SectionType.Payment);
