import {
  AccordionPanelInterface,
  CheckoutStateParamsInterface,
  FlowInterface,
  PaymentMethodEnum,
} from '@pe/checkout/types';


export type CheckoutParamHandler = (
  panels: AccordionPanelInterface[],
  params: CheckoutStateParamsInterface,
  flow: FlowInterface,
  value: boolean | PaymentMethodEnum,
) => AccordionPanelInterface[];
