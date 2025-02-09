import { FlowInterface } from './flow.interface';

export interface PaymentExternalCodeInterface {
  _id?: string;
  checkoutId?: string;
  code?: string;
  terminalId?: string;
  status?: string;
  flow?: FlowInterface;
}
