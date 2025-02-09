import { Injectable } from '@angular/core';

import {
  PeChatMessage,
  PeChatMessageType,
} from '@pe/shared/chat';

@Injectable()
export class PeMessageVirtualService {

  private getMessageDate(message: PeChatMessage): Date {
    return new Date(message.sentAt);
  }

  private getDateSeparator(message: PeChatMessage) {
    const dateMessage: Date = this.getMessageDate(message);

    return {
      content: `${dateMessage.getDate()}.${dateMessage.getMonth() + 1}.${dateMessage.getFullYear()}`,
      type: PeChatMessageType.DateSeparator,
    };
  }

  private isVirtualServiceMessage(messageType: PeChatMessageType): boolean {
    return [PeChatMessageType.DateSeparator, PeChatMessageType.WelcomeMessage].includes(messageType);
  }
}
