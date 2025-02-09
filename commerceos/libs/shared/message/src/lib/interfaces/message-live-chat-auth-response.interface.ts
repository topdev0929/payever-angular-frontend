import { PeMessageChat, PeMessageContact } from '@pe/shared/chat';

export interface PeMessageLiveChatAuthResponseInterface {
  contact: PeMessageContact;
  chat: PeMessageChat;
  token?: string
}
