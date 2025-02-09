import { Inject, Injectable } from '@angular/core';
import { merge } from 'rxjs';
import { filter, take, takeUntil, tap } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV, PeDestroyService } from '@pe/common';
import { PeChatMessage, PeMessageChat } from '@pe/shared/chat';

import { PeMessageWebSocketEvents, PeMessageWebsocketType } from '../../enums';
import { PeMessageWebSocketService } from '../../services';

import { PeMessageAppService } from './messageApp.service';

@Injectable({
  providedIn: 'root',
})
export class PeMessageWebSocketListenerService {
  constructor(
    private peMessageAppService: PeMessageAppService,
    private destroy$: PeDestroyService,
    private peMessageWebSocketService: PeMessageWebSocketService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {}

  initWebSocket(type: PeMessageWebsocketType, token: string, businessId?: string,): void {
    let uri;
    let params;
    switch (type) {
      case PeMessageWebsocketType.Regular:
        uri = `${this.env.backend.message}/chat`;
        params = { token };
        break;
        case PeMessageWebsocketType.Widget:
          uri = `${this.env.backend.message}/widget`;
          params =  { businessId, token };
          break;
      case PeMessageWebsocketType.LiveChat:
        uri = `${this.env.backend?.messenger ?? this.env.thirdParty?.messenger}/live-chat`;
        params = { businessId, token };
        break;
      default:
        break;
    }
    this.peMessageWebSocketService?.init(uri, params, type)?.pipe(
        filter(data => data),
        tap((init) => {
          if (init.eventName === 'authenticated') {
            if (type === PeMessageWebsocketType.Regular) {
              this.peMessageAppService.userId = init._id;
            }
            else if (type === PeMessageWebsocketType.Widget) {
              this.peMessageAppService.setMessages(init.integrationChannels);
            }
            else if (type === PeMessageWebsocketType.LiveChat) {
              this.peMessageAppService.liveChatActiveChannelId = init.chat._id;
              this.peMessageAppService.userId = init.contact._id;
            }
          }
          if (type !== PeMessageWebsocketType.Widget) {
            merge(
              this.receiveMessage(),
              this.unreadCount(),
              this.scrollRequest(),
              this.updateMessage(),
              this.deleteMessage(),
              this.pinMessage(),
              this.unpinMessage(),
              this.onlineCount(),
              this.deleteChannel(),
            ).pipe(takeUntil(this.destroy$)).subscribe();
          }
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  private receiveMessage() {
    return this.peMessageWebSocketService.handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_POSTED).pipe(
      tap((item) => {
        if (item.sender !== this.peMessageAppService.userId) {
          this.peMessageAppService.sendMessage(item);
        }
        else {
          this.peMessageAppService.editMessage(item, true);
        }
      }),
    );
  }

  private unreadCount() {
    return this.peMessageWebSocketService.handleSubjectObservable(PeMessageWebSocketEvents.CHAT_UNREAD_MESSAGE).pipe(
      tap((item) => {
        this.peMessageAppService
          .getMessages()
          .pipe(
            take(1),
            tap((messages) => {
              const chatIndex = messages?.findIndex(message => message._id === item.chatId);
              const updatedMessages = [...messages];
              updatedMessages[chatIndex] = {
                ...updatedMessages[chatIndex],
                unreadCount: item.unread === '99+' ? 99 : +item.unread,
              };
              this.peMessageAppService.setMessages(updatedMessages);
            }),
            takeUntil(this.destroy$),
          )
          .subscribe();
      }),
    );
  }

  private scrollRequest() {
    return this.peMessageWebSocketService
      .handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_SCROLL_RESPONSE)
      .pipe(
        tap((response) => {
          const { chat, messages } = response;
          this.peMessageAppService
            .getMessages()
            .pipe(
              take(1),
              tap((messagesData) => {
                const chatIndex = messagesData.findIndex(item => item._id === chat);
                const updatedMessages = [...messagesData];
                updatedMessages[chatIndex] = {
                  ...updatedMessages[chatIndex],
                  messages: [...messages.reverse(), ...updatedMessages[chatIndex].messages],
                };
                this.peMessageAppService.setMessages(updatedMessages);
              }),
              takeUntil(this.destroy$),
            )
            .subscribe();
        }),
      );
  }

  private updateMessage() {
    return this.peMessageWebSocketService.handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_UPDATED).pipe(
      tap((updatedMessage: PeChatMessage) => {
        this.peMessageAppService
          .getMessages()
          .pipe(
            take(1),
            tap((messagesData) => {
              const chatIndex = messagesData.findIndex(item => item._id === updatedMessage.chat);
              const updatedMessages = [...messagesData];
              const messageIndex = updatedMessages[chatIndex].messages.findIndex(
                item => item._id === updatedMessage._id,
              );
              updatedMessages[chatIndex].messages[messageIndex] = updatedMessage;
              this.peMessageAppService.setMessages(updatedMessages);
            }),
            takeUntil(this.destroy$),
          )
          .subscribe();
      }),
    );
  }

  private deleteMessage() {
    return this.peMessageWebSocketService
      .handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_DELETED)
      .pipe(tap(message => this.peMessageAppService.deleteMessage(message)));
  }

  private pinMessage() {
    return this.peMessageWebSocketService
      .handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_PINNED)
      .pipe(
        tap(pinnedObj =>
          this.peMessageAppService.pinMessage({ ...pinnedObj.message, pinId: pinnedObj.pinned._id }),
        ),
      );
  }

  private unpinMessage() {
    return this.peMessageWebSocketService
      .handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_UNPINNED)
      .pipe(
        tap(pinnedObj =>
          this.peMessageAppService.unpinMessage(
            { chat: pinnedObj.chat._id, _id: pinnedObj.pinned.messageId },
            false,
          ),
        ),
      );
  }

  private onlineCount() {
    return this.peMessageWebSocketService.handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_ONLINE).pipe(
      tap((onlineMembersObj) => {
        this.peMessageAppService
        .getMessages().pipe(
          take(1),
          tap((messagesData) => {
            const chatIndex = messagesData.findIndex(item => item._id === onlineMembersObj._id);
            if (chatIndex < 0) {
              return;
            }
            const updatedMessages = [...messagesData];
            const onlineMembers = onlineMembersObj.onlineMembers.map(onlineMember => onlineMember.user);
            updatedMessages[chatIndex].members = updatedMessages[chatIndex].members.map((member) => {
              let updatedMember = member;
              if (member.lastActivity === 'online') {
                updatedMember = { ...member, lastActivity: new Date().toISOString() };
              }
              if (onlineMembers.includes(member.user._id)) {
                updatedMember = { ...member, lastActivity: 'online' };
              }

              return updatedMember;
            });
              updatedMessages[chatIndex] = {
                ...updatedMessages[chatIndex],
                ...onlineMembersObj,
               };
              this.peMessageAppService.setMessages(updatedMessages);
            }),
            takeUntil(this.destroy$),
          )
          .subscribe();
      }),
    );
  }

  private deleteChannel() {
    return this.peMessageWebSocketService.handleSubjectObservable(PeMessageWebSocketEvents.CHAT_DELETED).pipe(
      tap((channel: PeMessageChat) => {
        this.peMessageAppService
          .getMessages()
          .pipe(
            take(1),
            tap((messages) => {
              const chatIndex = messages.findIndex(item => item._id === channel._id);
              const updatedMessages = [...messages];
              updatedMessages.splice(chatIndex, 1);
              this.peMessageAppService.setMessages(updatedMessages);
            }),
            takeUntil(this.destroy$),
          )
          .subscribe();
      }),
    );
  }
}

