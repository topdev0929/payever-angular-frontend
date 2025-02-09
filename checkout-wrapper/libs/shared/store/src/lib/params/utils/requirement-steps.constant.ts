import { isAddressFilled } from '@pe/checkout/api';
import {
  AccordionPanelInterface,
  CheckoutStateParamsInterface,
  FinanceTypeEnum,
  FlowInterface,
  CheckoutSettingsInterface,
  SectionType,
} from '@pe/checkout/types';

import { isPanelHiddenForChannel } from '../utils';

type PanelRequirementStep = {
  shouldHide: (
    flow: FlowInterface,
    params: CheckoutStateParamsInterface,
    settings: CheckoutSettingsInterface,
    panels: AccordionPanelInterface[]
  ) => boolean;
  shouldSkip?: (
    flow: FlowInterface,
  ) => boolean;
}

export const PANEL_REQUIREMENT_STEPS: { [panelName in SectionType]?: PanelRequirementStep } = {
  address: {
    shouldHide: (flow, params, settings) => {
      const isFilled = isAddressFilled(flow.billingAddress);
      const isSsnFilled = !!flow.billingAddress?.socialSecurityNumber;

      return isPanelHiddenForChannel(settings, SectionType.Address) && isFilled && !isSsnFilled
        || isFinanceCalculator(flow, params);
    },
    shouldSkip: flow => isAddressFilled(flow.billingAddress),
  },
  order: {
    shouldHide: (flow, params, settings) => {
      const isHidden = !!flow.amount
        && !!flow.reference
        && !params.forceShowOrderStep
        && !flow.forceLegacyUseInventory;

      if (flow.forceLegacyUseInventory) {
        params.forceShowOrderStep = true;
      }

      return isPanelHiddenForChannel(settings, SectionType.Order)
        && isHidden
          || isFinanceCalculator(flow, params);
    },
    shouldSkip: flow => !!flow.amount && !!flow.reference,
  },
  shipping: {
    shouldHide: (flow, params, settings) => isPanelHiddenForChannel(settings, SectionType.Shipping)
      || !!flow.amount
        && !flow.cart?.length
        && !params.forceUseCard,
  },
  user: {
    shouldHide: (flow, params) => isAddressFilled(flow.billingAddress)
      && !flow.billingAddress?.socialSecurityNumber
      && !!flow.billingAddress?.email
      || isFinanceCalculator(flow, params),
  },
  coupons: {
    shouldHide: (flow, params, settings) => isFinanceCalculator(flow, params)
      || isPanelHiddenForChannel(settings, SectionType.Coupons),
  },
  editPayment: {
    shouldHide: (flow, params, settings) => isFinanceCalculator(flow, params)
      || isPanelHiddenForChannel(settings, SectionType.EditPayment),
  },
  send_to_device: {
    shouldHide: (flow, params, settings) => isFinanceCalculator(flow, params)
      || isPanelHiddenForChannel(settings, SectionType.SendToDevice),
  },

  // TODO: Check if these are deprecated
  expressChoosePayment: {
    shouldHide: (flow, params, settings) => isFinanceCalculator(flow, params)
      || isPanelHiddenForChannel(settings, SectionType.ExpressChoosePayment),
  },
  expressPayment: {
    shouldHide: (flow, params, settings) => isFinanceCalculator(flow, params)
      || isPanelHiddenForChannel(settings, SectionType.ExpressPayment),
  },
};


function isFinanceCalculator(flow: FlowInterface, params: CheckoutStateParamsInterface): boolean {
  return !params.editMode && flow.financeType === FinanceTypeEnum.FINANCE_CALCULATOR;
}
