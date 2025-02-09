import { MessageType } from '../enums';

import { CommonMessage } from './common-message.interface';

export interface RemoveBankMessage extends CommonMessage {
  type: MessageType.Remove;
}
