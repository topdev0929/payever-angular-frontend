import { ChatListAbstract } from './chat-list-abstract';
import { ChatListApp } from './chat-list-app';
import { PeMessageChat } from '../interfaces/message-chat.interface';
import { ChatListActiveId } from './chat-list-active-id';
import { ChatListDefault } from './chat-list-default';
import { PeMessageChatRoomListService } from '../services/message-chat-room-list.service';

export class ChatListFacade extends ChatListAbstract {
  chatListInstance!: ChatListDefault;

  constructor(chatList: PeMessageChat[], app?: string, activeChatId?: string) {
    super(chatList);

    if (app) {
      this.chatListInstance = new ChatListApp(chatList, app);
    } else if (activeChatId) {
      this.chatListInstance = new ChatListActiveId(chatList, activeChatId);
    } else {
      this.chatListInstance = new ChatListDefault(chatList);
    }
  }

  countUnreadMessages(): number {
    return this.chatListInstance.countUnreadMessages();
  }

  normalizeChatList(chatRoomListService: PeMessageChatRoomListService): PeMessageChat[] {
    return this.chatListInstance.normalizeChatList(chatRoomListService);
  }

  activeChat(): PeMessageChat | null {
    return this.chatListInstance.activeChat();
  }
}
