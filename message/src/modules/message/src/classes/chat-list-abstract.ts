import { PeMessageChat } from '../interfaces/message-chat.interface';
import { PeMessageChatRoomListService } from '../services/message-chat-room-list.service';

export abstract class ChatListAbstract {
  chatList: PeMessageChat[];

  constructor(chatList: PeMessageChat[]) {
    this.chatList = chatList;
  }

  abstract activeChat(): PeMessageChat | null;
}
