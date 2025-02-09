import { AccordionPanelInterface, SectionType } from '@pe/checkout/types';

import { CheckoutParamHandler } from '../param-handler.type';

const EDIT_PAYMENT_STEPS: AccordionPanelInterface[] = [
  {
    name: SectionType.Order,
    steps: ['checkout-main-order'],
  },
  {
    name: SectionType.Address,
    steps: ['checkout-main-address'],
  },
  {
    name: SectionType.EditPayment,
    steps: ['checkout-main-edit-payment-method'],
    opened: true,
    step: 'checkout-main-edit-payment-method',
  },
];

export const editMode: CheckoutParamHandler =
  (panels, params, flow, value) => EDIT_PAYMENT_STEPS;
