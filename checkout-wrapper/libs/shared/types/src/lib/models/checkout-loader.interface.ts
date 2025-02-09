import {
  FlowInterface,
  CheckoutBaseSettingsInterface,
  CheckoutSettingsInterface,
  CheckoutUISettingsInterface,
} from './flow.interface';

export interface CheckoutLoader {
  checkoutData: CheckoutSettingsInterface;
  checkoutDataUI: CheckoutUISettingsInterface;
  checkoutDataBase: CheckoutBaseSettingsInterface;
  channelSetId: string;
  flowId: string;
  flowData: FlowInterface;
  successCallback: (flow: FlowInterface | CheckoutSettingsInterface) => void;
  errorCallback: () => void;
}
