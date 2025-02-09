import { ChannelSetDeviceSettingsInterface } from '@pe/checkout/api';
import { PaymentMethodEnum } from '@pe/checkout/types';

export class ClearState {
  static readonly type = '[Checkout] Clear state';
}

export class SetLockedUi {
  static readonly type = '[Checkout] Set Lock UI';
  constructor(public lockedUi: boolean) {}
}

export class SetPaymentComplete {
  static readonly type = '[Checkout] Set payment complete';
  constructor(
    public payload?: boolean,
    public readonly action?: unknown,
  ) {}
}

export class HidePayment {
  static readonly type = '[Checkout] Hide payment';
  constructor(public payload: PaymentMethodEnum[] | PaymentMethodEnum) {}
}

export class SetChannelSetSettings {
  static readonly type = '[Checkout] Set channel set settings';
  constructor(public channelSetSettings: ChannelSetDeviceSettingsInterface) {}
}

export class SetPrevAction {
  static readonly type = '[Checkout] Set prev action';
  constructor(public action: InstanceType<any>) {}
}

