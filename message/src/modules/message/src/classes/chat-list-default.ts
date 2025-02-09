import { ChatListAbstract } from './chat-list-abstract';
import { PeMessageChat } from '../interfaces/message-chat.interface';
import { PeMessageChatRoomListService } from '../services/message-chat-room-list.service';

export class ChatListDefault extends ChatListAbstract{
  constructor(chatList: PeMessageChat[]) {
    super(chatList);
  }

  countUnreadMessages(): number {
    let unread = 0;
    this.chatList.forEach(chat => {
      unread += chat.lastMessages?.length ? chat.lastMessages.filter((m: any) => m.status !== 'read').length : 0;
    });

    return unread;
  }

  normalizeChatList(chatRoomListService: PeMessageChatRoomListService): PeMessageChat[] {
    return this.chatList.filter(chat => !chat.app).map(chat => {
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
    return this.chatList.length ? this.chatList[0] : null;
  }

}
