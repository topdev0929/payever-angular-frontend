import { PebWebsocketData } from '@pe/builder/api';


export class PebUpdateElementAction {
  static readonly type = '[Peb/API] Update Elements';

  constructor(public payload: PebWebsocketData) {
  }
}

export class PebDeleteElementAction {
  static readonly type = '[Peb/API] Delete Elements';
}

export class PebDropFileAction {
  static readonly type = '[PEB/Editor] Drop File';

  constructor(public event: DragEvent) {
  }
}
