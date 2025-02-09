import { PeMessageChat } from '../interfaces/message-chat.interface';
import { PeMessageChatRoomListService } from '../services/message-chat-room-list.service';
import { ChatListDefault } from './chat-list-default';

export class ChatListApp extends ChatListDefault {
  app: string;

  constructor(chatList: PeMessageChat[], app: string) {
    super(chatList);

    this.app = app;
  }

  normalizeChatList(chatRoomListService: PeMessageChatRoomListService): PeMessageChat[] {
    return this.chatList.filter(chat => (chat.app && this.app === chat.app) || !chat.app).map(chat => {

      chatRoomListService.getContactAvatar(chat, (avatar: any) => {
        chat.avatar = avatar;
      });
      chat.initials = chatRoomListService.getContactInitials(chat);
      chat.lastMessages?.forEach((msg: any) => {
        msg.type = msg.type ?? (msg.attachments?.length > 0 ? 'file' : 'default');
      });

      return chat;
    }).sort((a: any, b: any) => +new Date(b.updatedAt) - +new Date(a.updatedAt));;
  }

  activeChat(): PeMessageChat | null {
    const foundChat = this.chatList.find((chat: PeMessageChat) => chat.app === this.app) as PeMessageChat;

    return foundChat ? foundChat : this.chatList.length ? this.chatList[0] : null;
  }
}
