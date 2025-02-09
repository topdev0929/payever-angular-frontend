import { Injectable } from "@angular/core";

import { PeChatMessage, PeChatMessageStatus, PeChatMessageType, PeMessageChat } from "@pe/shared/chat";

@Injectable({
  providedIn: 'root',
})
export class PeMessageChatService {

  public isMessageRead(message: PeChatMessage, userId: string) {
    if (!message) {
      return false;
    }
    const { readBy, sender, status, type } = message;

    return (
      sender === userId
      || status === PeChatMessageStatus.READ && (readBy ? readBy.includes(userId) : true)
      || [PeChatMessageType.WelcomeMessage, PeChatMessageType.DateSeparator, PeChatMessageType.Box].includes(type)
    );
  }

  public getLastMessageDate(channel: PeMessageChat) {
    const lastMessage = channel.messages[channel.messages.length - 1];
    const date = lastMessage ? lastMessage.updatedAt ?? lastMessage.sentAt : channel.createdAt;

    return new Date(date).getTime();
  }

  public getDateSeparatorObject(message: PeChatMessage) {
    const dateMessage = new Date(message.sentAt);

    return {
      content: `${dateMessage.getDate()}.${dateMessage.getMonth() + 1}.${dateMessage.getFullYear()}`,
      type: PeChatMessageType.DateSeparator,
    };
  }

}
