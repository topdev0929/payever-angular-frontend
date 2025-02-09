import { PeMessageSettings, PeMessageIntegrationThemeItem, PeMessageSubscription } from '../interfaces';
import { PeMailConfig } from '../interfaces';

export enum MessageActions {
  SetMessageOverlayStatus = '[@pe/message] SetMessageOverlayStatus',
  SetRecipientEmails = '[@pe/message] SetRecipientEmails',
  SetMailConfig = '[@pe/message] SetMailConfig',
  InitMessageSettings = '[@pe/message] init message settings',
  SetCurrentMessageSettings = '[@pe/message] set current message settings',
  SetSubscriptionList = '[@pe/message] set subscription list',
  SetLiveChatBusinessId = '[@pe/message] set live chat business id',
}

export class SetSubscriptionList {
  static readonly type = MessageActions.SetSubscriptionList;

  constructor(public subscriptionList: PeMessageSubscription[]) { }
}

export class SetMessageOverlayStatus {
  static readonly type = MessageActions.SetMessageOverlayStatus;

  constructor(public overlayStatus: string) { }
}

export class InitMessageSettings {
  static readonly type = MessageActions.InitMessageSettings;

  constructor(public settings: PeMessageSettings) { }
}

export class SetCurrentMessageSettings {
  static readonly type = MessageActions.SetCurrentMessageSettings;

  constructor(public currSettings: PeMessageIntegrationThemeItem) { }
}

export class SetRecipientEmails {
  static readonly type = MessageActions.SetRecipientEmails;

  constructor(public recipientEmails: string[]) {}
}

export class SetMailConfig {
  static readonly type = MessageActions.SetMailConfig;

  constructor(public mailConfig: PeMailConfig) {}
}

export class SetLiveChatBusinessId {
  static readonly type = MessageActions.SetLiveChatBusinessId;

  constructor(public businessId: string) {}
}
