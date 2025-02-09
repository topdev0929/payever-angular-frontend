import { CheckoutStateParamsInterface } from '@pe/checkout/types';

export class SetParams {
  static readonly type = '[Params] Set params';
  constructor(public payload: CheckoutStateParamsInterface) {}
}

export class PatchParams {
  static readonly type = '[Params] Patch params';
  constructor(public payload: CheckoutStateParamsInterface) {}
}
