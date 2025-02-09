import {
  CreateFlowParamsInterface,
  CreatePaymentCodeParamsInterface,
  FinExpApiCallInterface,
} from '@pe/checkout/api';
import {
  AddressInterface,
  CloneFlowConfig,
  FlowInterface,
} from '@pe/checkout/types';

export class GetFlow {
  static readonly type = '[Flow] Get flow';
  constructor(public flowId: string) {}
}

export class CreateFlow {
  static readonly type = '[Flow] Create flow';
  constructor(public payload?: CreateFlowParamsInterface) {}
}

export class CreateFinexpFlow {
  static readonly type = '[Flow] Create finexp flow';
  constructor(public payload: FinExpApiCallInterface & { channelSetId: string; }) {}
}

export class CloneFlow {
  static readonly type = '[Flow] Clone flow';
  constructor(public payload: CloneFlowConfig) {}
}

export class InitFlow {
  static readonly type = '[Flow] Init flow';
  constructor(public flow: FlowInterface) {}
}

export class SetFlow {
  static readonly type = '[Flow] Set flow';
  constructor(public payload: FlowInterface) {}
}

export class SetClonedFlow {
  static readonly type = '[Flow] Set cloned flow';
  constructor(public payload: FlowInterface) {}
}

export class PatchFlow {
  static readonly type = '[Flow] Patch flow';
  constructor(public payload?: Partial<FlowInterface>) {}
}

export class SetAddress {
  static readonly type = '[Flow] Set address';
  constructor(public payload: AddressInterface) {}
}

export class PatchAddress {
  static readonly type = '[Flow] Patch address';
  constructor(public payload: AddressInterface) {}
}

export class UpdateAddress {
  static readonly type = '[Flow] Update address';
  constructor(public payload: AddressInterface) {}
}

export class GeneratePaymentCode {
  static readonly type = '[Flow] Generate payment code';
  constructor(public payload: CreatePaymentCodeParamsInterface & { channelSetId: string }) {}
}

export class AttachPaymentCode {
  static readonly type = '[Flow] Attach payment code';
  constructor(public payload: { flowId: string; paymentCodeId: string }) {}
}

export class FinishFlow {
  static readonly type = '[Flow] Finish flow';
}
