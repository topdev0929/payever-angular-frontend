import { PebWebsocketResponseMessage } from '@pe/builder/api';

export class PebGetVersionsAction {
  static readonly type ='[Peb/API] Get Versions';

  constructor(public payload: { themeId: string }) {
  }
}

export class PebPublishAction {
  static readonly type = '[Peb/API] Publish';

  constructor(public payload: { themeId: string }) {
  }
}

export class PebPublishedAction {
  static readonly type = '[Peb/API] Published';

  constructor(public payload: PebWebsocketResponseMessage) {
  }
}
