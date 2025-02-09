import { SectionType } from '@pe/checkout/types';

import { CheckoutParamHandler } from '../param-handler.type';

export const forceShowOrderStep: CheckoutParamHandler =
  (panels, params, flow, value) => {
    if (params.forceHidePreviousSteps) {
      return panels;
    }

    let passedOpenStep: boolean;

    return panels.map((p) => {
      if (!passedOpenStep && (p.name === SectionType.Order)) {
        passedOpenStep = true;
      }

      return {
        ...p,
        hidden: !passedOpenStep,
        hiddenByState: !passedOpenStep,
      };
    });
  };
