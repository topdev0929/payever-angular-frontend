import { Inject, Injectable } from '@angular/core';

import { PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import {
  PeMessageWebsocketType,
  PeMessageChatRoomListService,
  PeMessageService,

} from '@pe/message/shared';
import {
  PeChatChannelMenuItem,
  PeChatMessage,
  PeChatMessageType,
  PeMessageChat,
} from '@pe/shared/chat';


import { PeLiveChatSessionService } from './live-chat-session.service';

@Injectable()
export class PeMessageLiveChatService {
  get storedBusinessId(): string {
    return localStorage.getItem('pe-live-chat-business-id');
  }

  set storedBusinessId(value: string) {
    if (!value) {
      localStorage.removeItem('pe-live-chat-business-id');

      return;
    }
    localStorage.setItem('pe-live-chat-business-id', value);
  }

  get isIframe() {
    return window.location !== window.parent.location;
  }

  private authResponse: { chat; contact; token };

  constructor(
    private peMessageService: PeMessageService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    @Inject(PE_ENV) public environmentConfigInterface: any,
    private translateService: TranslateService,
    private liveChatSessionService: PeLiveChatSessionService,
  ) { }

  onSelectChat(conversationId?: string): void {
    const activeChat = this.liveChatSessionService.getActiveChatId(this.storedBusinessId);
    const hasOnlyOneConversations = this.getConversationLength() === 1;
    const target = conversationId && this.peMessageChatRoomListService.chatList.find(c => c._id === conversationId)
      || hasOnlyOneConversations && this.peMessageChatRoomListService.chatList[0];

    if (!hasOnlyOneConversations && !target
      || !this.authResponse?.chat
      || target && this.isReadOnlyByBanners(target)
      || conversationId && activeChat && activeChat !== conversationId
    ) { return; }

    const contact = { ...this.authResponse.contact };
    const chat: PeMessageChat = this.authResponse.chat;

    contact.name = contact.name || this.translateService.translate('message-app.contact');
    chat.members = chat.members || [];
    chat.members.push({ ...contact, user: contact._id });
    const targetMessages = target?.messages || [];

    chat.messages = chat.messages || (
      chat?.lastMessages?.length > 0
        ? [...targetMessages, ...chat.lastMessages]
        : targetMessages
    );
    chat.activeUser = contact;
    chat.websocketType = PeMessageWebsocketType.LiveChat;

    chat.title = target?.title || this.translateService.translate('message-app.contact');

    chat.initials =
      this.peMessageChatRoomListService.getContactInitials(chat) ||
      this.peMessageChatRoomListService.activeChat?.initials || 'LC';

    chat.business = this.storedBusinessId;

    this.peMessageChatRoomListService.activeChat = chat;
    this.peMessageService.activeUser = { _id: contact._id, contact } as any;
    this.liveChatSessionService.setActiveChatId(this.storedBusinessId, conversationId);
  }

  messagesListBannerFilter(messages: PeChatMessage[], filterFn: (name: PeChatChannelMenuItem) => boolean): boolean {
    return messages?.filter(Boolean)
      .some(m => m.type === PeChatMessageType.Template &&
        m.components?.some(
          c => c.parameters?.some(
            p => filterFn(p.image.provider.name)
          ))
      );
  }

  private getConversationLength() {
    return this.peMessageChatRoomListService.chatList?.length || 0;
  }

  // TODO: replace with a flag from BE
  private isReadOnlyByBanners(conversation: PeMessageChat) {
    const hasLiveBanner = this.messagesListBannerFilter(conversation?.messages,
      name => name === PeChatChannelMenuItem.LiveChat);
    const hasOtherBanners = this.messagesListBannerFilter(conversation?.messages,
      name => name !== PeChatChannelMenuItem.LiveChat);

    return hasOtherBanners || !hasLiveBanner;
  }

  private replaceConversationById(conversationId: string, chat: PeMessageChat) {
    this.peMessageChatRoomListService.chatList = this.peMessageChatRoomListService.chatList.map(
      (c) => {
        if (c._id !== conversationId) { return c; }

        return {
          ...chat,
          messages: c.messages,
          lastMessages: c.lastMessages,
        };
      }
    );
  }
}
