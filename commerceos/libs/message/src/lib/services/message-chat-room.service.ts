import { Injectable } from '@angular/core';
import { SafeStyle } from '@angular/platform-browser';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import * as uuid from 'uuid';

import { PebEnvService } from '@pe/builder/core';
import { MetaService } from '@pe/chat';
import { TranslateService } from '@pe/i18n-core';
import {
  PeLiveChatEnum,
  PeMessageChatType,
  PeMessageGuardRoles,
  PeMessageChatInvitation,
  PeMessageWS,
  PeMessageApiService,
  PeMessageGuardService,
  PeMessageWebSocketService,
  PeMessageService,
  PeMessageChatRoomListService,
} from '@pe/message/shared';
import {
  PeChatMessage,
  PeChatChannelMenuItem,
  PeChatMessageType,
  PeMessageUser,
  PeChatMessageStatus,
} from '@pe/shared/chat';

import { EMPTY_MSG_TEMPLATE_CONTENT } from '../constants';

import { PeMessageConversationService } from './conversation.service';
import { PeMessageThemeService } from './message-theme.service';

@Injectable()
export class PeMessageChatRoomService {

  newMessage$ = new Subject<PeChatMessage>();
  channelMenuItems$ = new BehaviorSubject<PeChatChannelMenuItem[]>([]);
  noMessagesPlaceholder = this.translateService.translate('message-app.chat-room.placeholder.no_chat_rooms');
  groupNumber = 1;

  constructor(
    private peMessageApiService: PeMessageApiService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private peMessageGuardService: PeMessageGuardService,
    private translateService: TranslateService,
    private peMessageWebSocketService: PeMessageWebSocketService,
    private peMessageConversationService: PeMessageConversationService,
    private envService: PebEnvService,
    private peMessageThemeService: PeMessageThemeService,
    private peMessageService: PeMessageService,
    private metaService: MetaService,

    ) { }

  private getChatMemberUsernames(): string[] {
    const usernames = this.peMessageChatRoomListService.activeChat?.membersInfo?.map(
      (member: { user: PeMessageUser }) =>
        [member?.user?.userAccount?.firstName, member?.user?.userAccount?.lastName].join(' ')
    );

    return usernames ?? [];
  }


  public messageTransformSend(message: PeChatMessage): any {
    const { activeChat } = this.peMessageChatRoomListService;
    const userUserList = this.peMessageService.userList?.find(u => u?._id === message?.sender)?.userAccount;
    const userActiveChat = activeChat?.membersInfo?.find(u => u?.user?._id === message?.sender)?.user?.userAccount;
    const userContact = this.peMessageService.contactList?.find(c => c?._id === message?.sender);
    const user = userUserList || userActiveChat || activeChat?.contact || {};
    const type = message.attachments?.length > 0 ? PeChatMessageType.Attachment : message.type;
    const content = message.content === EMPTY_MSG_TEMPLATE_CONTENT ? '' : message.content;
    let name: string;
    let avatar: SafeStyle = user?.logo;

    if (this.peMessageService.isLiveChat || this.peMessageChatRoomListService.activeChat?.markConversation) {
      const title = this.peMessageChatRoomListService.chatList.find(chat => chat._id === message.chat)?.title;
      if (message.reply) {
        name = PeLiveChatEnum.Visitor;
      } else if (new RegExp(`\\/live-chat|${PeLiveChatEnum.LiveChat}`).test(title)) {
        name = PeLiveChatEnum.Merchant;
      } else {
        name = title;
      }
      avatar = this.peMessageChatRoomListService.activeChat.avatar;
    } else {
      if (user?.firstName || user?.lastName) {
        name = `${user?.firstName + ' '}${user?.lastName}`;
      } else if (/\/live-chat/.test(userContact?.name)) {
        name = PeLiveChatEnum.Visitor;
      } else {
        name = userContact?.name;
      }
    }
    const newMsg = {
      ...message,
      name,
      type,
      avatar,
      chatMemberUsernames: this.getChatMemberUsernames(),
      content: type === 'box' && message.interactive?.action
        ? message.interactive.translations[message.interactive.defaultLanguage] ?? message.content
        : content,
      reply: message.sender === this.peMessageService.activeUser?._id,
    };

    this.peMessageThemeService.setMessageTheme(newMsg);

    this.metaService.prepareDataUrl(newMsg);

    return newMsg;
  }

  sendMessage(event: any, activeChat = this.peMessageChatRoomListService.activeChat): void {
    if (!event) { return; }

    const message: PeMessageWS = {
      type: event.type ?? 'text',
      content: event.message,
      components: event?.components,
      interactive: event?.interactive,
      replyTo: event.replyTo,
      _id: uuid.v4(),
    };

    if (event.attachments) {
      message.attachments = event.attachments;
    }

    if (
      this.peMessageGuardService.isAllowByRoles([PeMessageGuardRoles.Admin])
      && (activeChat?.template || activeChat?.type === PeMessageChatType.AppChannel)
    ) {
      this.peMessageApiService.postMessageTemplate(activeChat?._id, message).pipe(
        take(1),
        tap((data: PeChatMessage) => {
          this.newMessage$.next(data);
        }),
      ).subscribe();
    } else {
      const sendDate = new Date();

      this.messageTransformSend({
        "_id": message._id,
        "attachments": message.attachments ?? [],
        "content": event.message,
        "contentPayload": null,
        "data": {},
        "selected": false,
        "editedAt": null,
        "replyTo": message.replyTo ?? null,
        "replyToContent": message.replyTo ? event.replyMessage : null,
        "sender": event.sender,
        "status": PeChatMessageStatus.SEND,
        "type": message.type as PeChatMessageType,
        "createdAt": null,
        "updatedAt": null,
        ...{ sentAt: sendDate, chat: activeChat?._id },
      });

      this.peMessageWebSocketService.typingStoppedMessage(activeChat?._id);
    }

    const activeChatMessage = this.peMessageConversationService.conversationList$.value
      .find(conversation => conversation.id === this.peMessageChatRoomListService.activeChat._id)?.data;

    if (activeChatMessage) {
      activeChatMessage.replyToMessage = null;
      activeChatMessage.forwardMessageData = null;
    }
    this.newMessage$.next({});
  }

  getOldMessages(uniqId, activeChat, skip?) {
    this.peMessageWebSocketService.getOldMessages(
      { _id: uniqId, chat: activeChat._id, limit: 50, skip: skip }
    );
  }

  public isDefaultChat(chat = this.peMessageChatRoomListService.activeChat): boolean {
    return chat.title === `${this.envService.businessData.name} / Support Channel`;
  }

  getInvitationCode(chatId: string, invitation?: PeMessageChatInvitation): Observable<any> {
    const invitationBody = invitation
      ?? { expiresAt: new Date(new Date().setDate(new Date().getDate() + 1)).toString() };

    return this.peMessageApiService.postChatInvites(chatId, invitationBody as PeMessageChatInvitation);
  }
}
