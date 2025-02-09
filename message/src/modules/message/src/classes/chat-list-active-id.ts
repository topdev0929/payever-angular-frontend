import { PeMessageChat } from '../interfaces/message-chat.interface';
import { ChatListDefault } from './chat-list-default';

export class ChatListActiveId extends ChatListDefault {
  activeChatId: string;

  constructor(chatList: PeMessageChat[], activeChatId: string) {
    super(chatList);

    this.activeChatId = activeChatId;
  }

  activeChat(): PeMessageChat | null {
    return this.chatList.length ?
      (this.chatList.find((chat: PeMessageChat) => chat._id === this.activeChatId) ?? this.chatList[0]) : null;
  }
}
