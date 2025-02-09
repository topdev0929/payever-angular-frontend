import { ConnectPayloadInterface, MessageNameEnum } from './notification.interfaces';

export class Connect {
  static readonly type = MessageNameEnum.EVENT_CONNECTION;

  constructor(public event: MessageNameEnum, public data: ConnectPayloadInterface) {
  }
}

export class Delete {
  static readonly type = MessageNameEnum.DELETE_NOTIFICATION;

  constructor(public from: string, public message: string) {
  }
}

export class Fetch {
  static readonly type = MessageNameEnum.GET_NOTIFICATIONS;

  constructor(public event: MessageNameEnum, public data: ConnectPayloadInterface) {
  }
}
