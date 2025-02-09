import { CheckoutParamHandler } from '../param-handler.type';
import { openNextStep } from '../step.utils';

export const openNextStepOnInit: CheckoutParamHandler =
  (panels, params, flow, value) => {
    // We use it only for flow restore
    delete params.openNextStepOnInit;

    return openNextStep(panels);
  };
