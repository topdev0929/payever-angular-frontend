import { MessageType } from '../enums';

import { ChooseBankMessage } from './choose-bank-message.interface';
import { RemoveBankMessage } from './remove-bank-message.interface';

export interface CommonMessage {
  source: 'ivy';
  type: MessageType;
}

export type IframeMessage = ChooseBankMessage
  | RemoveBankMessage;


export function isChooseMessage(message: IframeMessage): message is ChooseBankMessage {
  return message.type === MessageType.Choose;
}

export function isRemoveMessage(message: IframeMessage): message is RemoveBankMessage {
  return message.type === MessageType.Remove;
}
