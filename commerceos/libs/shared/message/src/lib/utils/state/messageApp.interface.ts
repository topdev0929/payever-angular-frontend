import { PeChatMessage, PeMessageChat } from '@pe/shared/chat';

export interface MessageStateInterface {
  messages: PeMessageChat[];
  channelsToShow: PeMessageChat[];
  messagesToShow: PeChatMessage[];
}
