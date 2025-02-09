import { CheckoutLoader } from './checkout-loader.interface';
import { FlowLoader } from './flow-loader.interface';

export type CheckoutWindow = Window & typeof globalThis & {
  pe_pageCheckoutLoader: CheckoutLoader;
  pe_pageFlowLoader: FlowLoader;
};
