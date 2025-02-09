import { PebWebsocketEventType } from '@pe/builder/api';
import { pebGenerateId } from '@pe/builder/core';

export class PebWebsocketAction {
  static readonly type = '[PEB/Editor] WS';

  constructor(
    public event: PebWebsocketEventType.JsonPatch,
    public data: any,
    public id = pebGenerateId(),
  ) {
  }
}

