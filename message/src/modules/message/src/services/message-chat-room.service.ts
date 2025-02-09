import { Injectable } from '@angular/core';
import { take, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { PeChatChannelMenuItem, PeChatMessage, PeChatService } from '@pe/chat';

import { PeMessageGuardRoles } from '../enums/message-guards.enum';

import { PeMessageApiService } from './message-api.service';
import { PeMessageChatRoomListService } from './message-chat-room-list.service';
import { PeMessageGuardService } from './message-guard.service';

@Injectable()
export class PeMessageChatRoomService {

  newMessage$ = new Subject<PeChatMessage>();
  noMessagesPlaceholder!: string;

  channelMenuItems: PeChatChannelMenuItem[] = [];

  constructor(
    private peChatService: PeChatService,
    private peMessageApiService: PeMessageApiService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private peMessageGuardService: PeMessageGuardService,
  ) { }

  sendMessage(event: any): void {
    const message = {
      type: event.type ?? 'text',
      content: event.message,
      components: event?.components,
      interactive: event?.interactive,
    };

    const activeChat = this.peMessageChatRoomListService.activeChat;

    if (this.peMessageGuardService.isAllowByRoles([PeMessageGuardRoles.Admin]) && activeChat?.template) {
      this.peMessageApiService.postMessageTemplate(activeChat?.template, message).pipe(
        take(1),
        tap((data: PeChatMessage) => {
          this.newMessage$.next(data);
        }),
      ).subscribe();
    } else {
      this.peChatService.socket.emit('messages.ws-client.message.send', {
        ...message,
        ...{ sentAt: new Date(), chat: activeChat?._id },
      });
    }
  }

}
