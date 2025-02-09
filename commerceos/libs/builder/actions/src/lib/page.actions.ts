import { PebWebsocketData } from '@pe/builder/api';


export class PebPageAction {
  static readonly type = '[PEB/Page] WebSocket';

  constructor(public payload: PebWebsocketData) {
  }
}
