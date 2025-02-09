import { SectionType } from '@pe/checkout/types';

import { CheckoutParamHandler } from '../param-handler.type';

export const forceHidePreviousSteps: CheckoutParamHandler =
  (panels, params, flow) => {
    let passedOpenStep: boolean;

    return panels.map((p) => {
      // Choose payment step should always be visible
      if (!passedOpenStep && (p.opened || p.name === SectionType.ChoosePayment)) {
        passedOpenStep = true;
      }

      return {
        ...p,
        hidden: !passedOpenStep,
        hiddenByState: !passedOpenStep,
      };
    });
  };
