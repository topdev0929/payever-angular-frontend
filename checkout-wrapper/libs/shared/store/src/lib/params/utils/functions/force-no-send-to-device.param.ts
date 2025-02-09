import { SectionType } from '@pe/checkout/types';

import { CheckoutParamHandler } from '../param-handler.type';
import { hidePanelsByState } from '../step.utils';

export const forceNoSendToDevice: CheckoutParamHandler =
  (panels, params, flow, value) => hidePanelsByState(panels, SectionType.SendToDevice);
