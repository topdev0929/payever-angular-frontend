import { Inject, Injectable } from '@angular/core';
import * as uuid from 'uuid';

import { PE_ENV } from '@pe/common';
import { PeMessageService, PeMessageAppService } from '@pe/message/shared';
import { PeChatChannelMenuItem, PeChatMessage, PeChatMessageType } from '@pe/shared/chat';

import { PeMessageChatRoomService } from './message-chat-room.service';

@Injectable()
export class PeMessageAppsService {
  private appsImages = {
    whatsapp: [
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/whatsapp-1.png`,
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/whatsapp-2.png`,
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/whatsapp-3.png`,
    ],
    'facebook-messenger': [
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/fb-messenger-1.png`,
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/fb-messenger-2.png`,
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/fb-messenger-3.png`,
    ],
    'live-chat': [
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/live-chat-1.png`,
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/live-chat-2.png`,
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/live-chat-3.png`,
    ],
    'instagram-messenger': [
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/instagram-1.png`,
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/instagram-2.png`,
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/instagram-3.png`,
    ],
  };

  get images(): any {
    return this.appsImages;
  }

  constructor(
    public peMessageService: PeMessageService,
    public peMessageChatRoomService: PeMessageChatRoomService,
    private peMessageAppService: PeMessageAppService,
    @Inject(PE_ENV) public environmentConfigInterface: any,
  ) { }

  appsMenuItem(item: { app: string; image: string }): void {
    const foundApp = this.peMessageService.subscriptionList.find(s => s.integration.name === item.app);

    let action, provider;

    switch (item.app) {
      case PeChatChannelMenuItem.FacebookMessenger: {
        if (foundApp) {
          action = `https://facebook.com/${foundApp.info?.pageId}`;
        }
        break;
      }
      case PeChatChannelMenuItem.WhatsApp: {
        if (foundApp) {
          action = `https://wa.me/${foundApp.info?.phoneNumber}`;
        }
        break;
      }
      case PeChatChannelMenuItem.Instagram: {
        if (foundApp) {
          action = `https://www.instagram.com/${foundApp.info?.username}`;
        }
        break;
      }
      case PeChatChannelMenuItem.LiveChat: {
        if (foundApp) {
          action = foundApp.info?.authorizationId ?? foundApp.authorizationId;
          provider = { name: PeChatChannelMenuItem.LiveChat };
        }
        break;
      }
    }

    const event = {
      type: PeChatMessageType.Template,
      components: [
        {
          type: 'header',
          parameters: [
            {
              type: 'image',
              image: {
                link: item.image,
                provider,
              },
              action: action,
            },
          ],
        },
      ],
    };

    const { selectedChannel, userId } = this.peMessageAppService;

    const wsMessage: PeChatMessage = {
      ...event,
      contentPayload: uuid.v4(),
      chat: selectedChannel._id,
      sentAt: new Date(),
      sender: userId,
    };

    this.peMessageAppService.sendMessage(wsMessage);
  }
}
