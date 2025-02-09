import {
  CheckoutBaseSettingsInterface,
  CheckoutSettingsInterface,
  CheckoutUISettingsInterface,
} from '@pe/checkout/types';

export class GetSettings {
  static readonly bypassCache = 'bypassCache';
  static readonly type = '[Settings] Get settings';
  constructor(
    public channelSetId: string,
    public bypassCacheFlag?: 'bypassCache',
  ) {}
}

export class InitSettings {
  static readonly type = '[Settings] Init settings';
  constructor(public settings: CheckoutSettingsInterface) {}
}

export class SetSettings {
  static readonly type = '[Settings] Set settings';
  constructor(public payload: CheckoutSettingsInterface) {}
}

export class SetUiSettings {
  static readonly type = '[Settings] Set ui settings';
  constructor(public payload: CheckoutUISettingsInterface) {}
}

export class SetBaseSettings {
  static readonly type = '[Settings] Set base settings';
  constructor(public payload: CheckoutBaseSettingsInterface) {}
}
