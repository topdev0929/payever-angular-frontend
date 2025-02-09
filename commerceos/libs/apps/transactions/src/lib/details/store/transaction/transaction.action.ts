import { ActionTypeEnum } from "../../../shared";

export class PostAction {
  static readonly type = '[Transaction] Post action';
  constructor(
    public orderId: string,
    public action: ActionTypeEnum,
    public payload: unknown,
    public skipRuntimeActionsCheck: boolean = false,
  ) {}
}


export class AddRuntimeAction {
  static readonly type = '[Transaction] Add runtime actions';
  constructor(
    public action: ActionTypeEnum
  ) {}
}

export class DeleteRuntimeAction {
  static readonly type = '[Transaction] Delete runtime actions';
  constructor(
    public action: ActionTypeEnum
  ) {}
}
