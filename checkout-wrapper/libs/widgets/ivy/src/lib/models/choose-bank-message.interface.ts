import { MessageType } from '../enums';

import { CommonMessage } from './common-message.interface';

export interface ChooseBankMessage extends CommonMessage {
  colors: IframeDataColors;
  consent: boolean;
  displayName: string;
  groupId: string;
  logo: string;
  type: MessageType.Choose;
}

export interface IframeDataColors {
  bgDark: string;
  bgLight: string;
  textDark: string;
  textLight: string;
}
