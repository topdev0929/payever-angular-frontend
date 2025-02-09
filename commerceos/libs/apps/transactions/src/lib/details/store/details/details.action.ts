import { ActionInterface, DetailInterface } from "../../../shared";

export class GetDetails {
  static readonly type = '[Transaction] Get transaction details';
  static readonly bypassCache = 'bypassCache';

  constructor(
    public orderId: string,
    public bypassCacheFlag?: 'bypassCache',
  ) {}
}

export class SetDetails {
  static readonly type = '[Transaction] Set transaction details';
  constructor(public details: DetailInterface) {}
}

export class GetActions {
  static readonly type = '[Transaction] Get transaction actions';
  constructor(public orderId: string) {}
}

export class SetActions {
  static readonly type = '[Transaction] Set transaction actions';
  constructor(public actions: ActionInterface[]) {}
}
