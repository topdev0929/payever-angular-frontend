import {
  AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input,
  OnInit,
} from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { BehaviorSubject, Observable, zip } from 'rxjs';
import { filter, take, takeUntil, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { TranslateService } from '@pe/i18n-core';
import { MediaService } from '@pe/media';

import {
  PeChatAttachMenuItem, PeChatChannelMenuItem, PeChatMessage, PeChatMessageStatus, PeChatMessageType,
  PeChatService,
} from '@pe/chat';
import { EnvironmentConfigInterface, EnvService, MessageBus, PeDestroyService, PE_ENV } from '@pe/common';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PeContextMenuService } from '@pe/ui';

import {
  PeMessageApiService,
  PeMessageChatRoomListService,
  PeMessageChatRoomService,
  PeMessageService,
  PeMessageChatBoxService,
  PeMessageThemeService,
  PeMessageGuardService,
} from '../../services';
import { PeMessageChannelType, PeMessageChatType, PeMessageGuardRoles } from '../../enums';
import { PeMessageChat, PeMessageSettingsThemeItem } from '../../interfaces';

import { PeMessageProductListComponent } from '../message-product-list';
import { PeMessageChatRoomSettingsComponent } from '../message-chat-room-settings';
import { switchMap } from 'rxjs/internal/operators';

@Component({
  selector: 'pe-message-chat-room',
  templateUrl: './message-chat-room.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeMessageChatRoomComponent implements OnInit, AfterViewInit {

  @Input() theme = 'dark';
  @Input() mobileView = false;
  @Input() isLiveChat = false;
  @Input() isEmbedChat = false;

  shownBs: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  shown$: Observable<boolean> = this.shownBs.asObservable();

  peChatMessageType = PeChatMessageType;

  activeChannel!: PeChatChannelMenuItem;
  appsMenuItems: PeChatChannelMenuItem[] = [];
  attachMenuItems = [
    PeChatAttachMenuItem.App,
    PeChatAttachMenuItem.PhotoOrVideo,
    PeChatAttachMenuItem.Product,
    PeChatAttachMenuItem.Box
  ];
  messageList: PeChatMessage[] = [];
  timeInfo: any = {};
  avatar?: string;
  messageTitle?: string;

  appsImages = {
    'whatsapp': [
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/whatsapp-1.png`,
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/whatsapp-2.png`,
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/whatsapp-3.png`,
    ],
    'facebook-messenger':[
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

  messagesBottomColor = '';
  messagesTopColor = '';
  messageAppColor = '';
  accentColor = '';
  bgChatColor = '';
  get unreadMessages(): Observable<any> {
    return this.peMessageChatRoomListService.unreadInFolder$.pipe(
      map((value: number) => {
        return value > 99 ? '99+' : value.toString();
      }),
    );
  }
  smallBoxUrlItems = this.peMessageChatBoxService.smallBoxUrls();

  constructor(
    private destroyed$: PeDestroyService,
    public peMessageService: PeMessageService,
    public peMessageChatRoomListService: PeMessageChatRoomListService,
    public peMessageChatRoomService: PeMessageChatRoomService,
    public peMessageThemeService: PeMessageThemeService,
    private changeDetectorRef: ChangeDetectorRef,
    private peMessageGuardService: PeMessageGuardService,
    private peChatService: PeChatService,
    private peContextMenuService: PeContextMenuService,
    private peMessageApiService: PeMessageApiService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private mediaService: MediaService,
    private messageBus: MessageBus,
    public router: Router,
    private peMessageChatBoxService: PeMessageChatBoxService,
    @Inject(PE_ENV) public environmentConfigInterface: EnvironmentConfigInterface,
  ) {
  }

  ngOnInit(): void {
    if (this.peMessageService.isLiveChat) {
      this.peMessageService.currSettings$.pipe(
        filter((themeItem: PeMessageSettingsThemeItem) => themeItem._id !== undefined),
        tap((themeItem: PeMessageSettingsThemeItem) => {
          this.bgChatColor = themeItem.settings?.bgChatColor || '';
          this.accentColor = themeItem.settings?.accentColor || '';
          this.messageAppColor = themeItem.settings?.messageAppColor || '';
          this.messagesBottomColor = themeItem.settings?.messagesBottomColor || '';
          this.messagesTopColor = themeItem.settings?.messagesTopColor || '';

          this.changeDetectorRef.detectChanges();
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    }

    if (this.peMessageGuardService.isAllowByRoles([PeMessageGuardRoles.Admin])) {
      this.peMessageChatRoomService.newMessage$.pipe(
        tap((message: PeChatMessage) => {
          this.messageList.push(message);

          this.changeDetectorRef.detectChanges();
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    }

    this.peMessageChatRoomListService.activeChat$.pipe(
      tap(activeChat => {
        if (activeChat?.type === PeMessageChatType.Channel) {
          this.messageTitle = activeChat.title;
          if (this.peMessageChatRoomListService.activeChat?.photo) {
            this.avatar = `${this.environmentConfigInterface.custom.storage}/miscellaneous/${this.peMessageChatRoomListService.activeChat ?.photo}`;
          } else {
            this.avatar = '';
          }
        }
        this.timeInfo.lastSeen = activeChat?.lastSeen ?? '';
        this.timeInfo.currentlyAnswering = activeChat?.updatedAt ?? '';
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    if (this.peChatService.socket) {
      this.peChatService.socket.on('messages.ws-client.message.posted', (message: PeChatMessage) => {
        if (this.peMessageChatRoomListService.activeChat?._id === message.chat) {
          const userId = this.peMessageService.activeUser?._id || '';
          const isCurrentUserSender = userId === message.sender;
          this.messageList.push(this.messageTransform(Object.assign({}, message), isCurrentUserSender));
          if (this.peMessageService.activeUser._id !== message.sender) {
            this.updateMessageStatus(message);

            message.status = PeChatMessageStatus.READ;
          }
        }

        const foundChat = this.peMessageChatRoomListService.chatList.find(chat => chat._id === message.chat);
        if (foundChat) {
          foundChat.lastMessages?.push(message);
          foundChat.updatedAt = message.sentAt;
        }

        this.peMessageChatRoomListService.sortChatList();

        this.changeDetectorRef.detectChanges();
      });
    }

    this.handleActiveChat();
  }

  ngAfterViewInit(): void {
    this.peMessageChatRoomListService.activeChat$.pipe(
      tap(activeChat => {
        if (activeChat) this.shownBs.next(true);
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  messageAccentColor(message: any) : string {
    const amt = this.peMessageThemeService.setTheme(this.messagesBottomColor) === 'dark' ? 80 : -60;

    return message.isCurrentUserSender ? this.peMessageThemeService.adjustBrightness(this.messagesBottomColor, amt) : this.accentColor;
  }

  appsMenuItem(item: { app: string, image: string }): void {
    const foundApp = this.peMessageService.subscriptionList.find(s => s.integration.name === item.app);

    let action;

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
    }

    const event = {
      type: 'template',
      components: [{
        type: 'header',
        parameters: [{
          type: 'image',
          image: {
            link: item.image,
          },
          action: action,
        }],
      }],
    };

    this.peMessageChatRoomService.sendMessage(event);
  }

  smallBoxItem(item: { text: string, url: string, icon: string }): void {
    const event = {
      interactive: {
        action: item.url,
        defaultLanguage: 'en',
        icon: item.icon === null ? undefined : item.icon,
        marked: false,
        translations: {
          en: item.text
        },
      },
      message: item.text,
      type: 'box',
    }

    this.peMessageChatRoomService.sendMessage(event);
  }

  largeBoxItem(item: { image: File, text: string }): void {
    this.peMessageApiService.postImage(item.image).subscribe(event => {
      if (event.type === HttpEventType.Response) {
        const message = {
          interactive: {
            image: this.mediaService.getMediaUrl(event.body.blobName, 'miscellaneous'),
            defaultLanguage: 'en',
            translations: {
              en: item.text,
            },
          },
          message: item.text,
          type: 'box',
        };

        this.peMessageChatRoomService.sendMessage(message);
      }
    });
  }

  attachMenuItem(item: PeChatAttachMenuItem): void {
    if (item === PeChatAttachMenuItem.Product) {
      this.openProductListOverlay();
    }
  }

  channelMenuItem(item: PeChatChannelMenuItem): void {
    this.activeChannel = item;

    const chat = this.peMessageChatRoomListService.chatList.find(c => c.contact === this.peMessageChatRoomListService.activeChat?.contact);

    if (chat?.integrationName === item as string) {
      this.peMessageChatRoomListService.activeChat = chat;
    }
  }

  openMessageContextMenu(event: MouseEvent, message: PeChatMessage): void {
    event.preventDefault();
    event.stopPropagation();

    const data = {
      title: 'Options',
      list: [
        { label: 'Delete', value: 'delete', red: true },
      ],
    };

    const config = {
      data,
      panelClass: 'pe-message-chat-room-context-menu',
      theme: this.theme,
    };

    const dialogRef = this.peContextMenuService.open(event, config);

    dialogRef.afterClosed.pipe(
      take(1),
      tap((res) => {
        const chat = this.peMessageChatRoomListService.activeChat as PeMessageChat;

        if (res === 'delete') {
          this.deleteMessage(chat, message);
        }
      }),
    ).subscribe();
  }

  private deleteMessage(chat: PeMessageChat, message: PeChatMessage): void {
    this.peChatService.socket.emit('messages.ws-client.message.delete', { _id: message._id, deleteForEveryone: true });

    chat?.lastMessages?.splice(chat?.lastMessages?.findIndex(m => m._id === message._id), 1);
    this.peMessageChatRoomListService.detectChangeStream$.next();

    this.messageList.splice(this.messageList.findIndex(m => m._id === message._id), 1);
    this.changeDetectorRef.detectChanges();
  }

  onAvatarInHeader(): void {
    const peOverlayConfig: PeOverlayConfig = {
      data: {
        theme: this.theme,
      },
      hasBackdrop: true,
      headerConfig: {
        title: this.peMessageChatRoomListService.activeChat?.title as string,
        theme: this.theme,
        backBtnTitle: this.translateService.translate('message-app.sidebar.cancel'),
        backBtnCallback: () => {
          this.peOverlayWidgetService.close();
        },
        doneBtnTitle: this.translateService.translate('message-app.sidebar.done'),
        doneBtnCallback: () => {
          this.peOverlayWidgetService.close();
        },
      },
      panelClass: 'pe-message-chat-room-settings-overlay',
      component: PeMessageChatRoomSettingsComponent,
    };

    if (
      this.peMessageGuardService.isAllowByRoles([PeMessageGuardRoles.Merchant, PeMessageGuardRoles.Admin])
      && !this.peMessageService.isLiveChat
    ) {
      this.peOverlayWidgetService.open(peOverlayConfig);
    }
  }

  temporarySolution(): boolean {

    const activeChat = this.peMessageChatRoomListService.activeChat;

    if (this.peMessageGuardService.isAllowByRoles([PeMessageGuardRoles.Admin])) {
      return activeChat?.template ? true : false;
    }

    if (activeChat?.template) {
      return false;
    }

    if (activeChat?.type === PeMessageChatType.Channel && activeChat?.subType !== PeMessageChannelType.Public) {
      return activeChat?.members?.find((member: any) => member.user === this.peMessageService.activeUser._id) ? true : false;
    }

    return true;
  }

  markedBox(event: any, message: PeChatMessage): void {
    if (event.blank || this.peMessageService.isLiveChat || !this.peMessageService.isEmbedChat) {
      window.open(event.url);
    } else {
      this.router.navigateByUrl(event.url);
    }

    if (message.type === 'box') {
      message.interactive.marked = true;
      this.peMessageApiService.postChatMessageMarked(message.chat, message._id, true).pipe(take(1)).subscribe();
    }
  }

  deleteBox(message: PeChatMessage): void {
    const index = this.messageList.findIndex(m => m._id === message._id);

    this.messageList.splice(index, 1);

    this.peMessageApiService.deleteChatMessage(message.chat, message._id).pipe(take(1)).subscribe();
  }

  private getChatMessageList(chatId: string): void {
    this.peMessageApiService.getChatMessageList(chatId).pipe(
      tap(messages => {
        const userId = this.peMessageService.activeUser?._id || '';
        this.messageList = messages.map((message: PeChatMessage) => {
          const isCurrentUserSender = userId === message.sender;
          if (message.sender !== this.peMessageService.activeUser._id && message.status !== 'read') {
            this.updateMessageStatus(message);
          }
          return this.messageTransform(message, isCurrentUserSender);
        });

        this.changeDetectorRef.detectChanges();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  private handleActiveChat(): void {
    this.peMessageChatRoomListService.activeChat$.pipe(
      tap((chat: PeMessageChat | null) => {
        // this.messageListLoading = false;
        if (chat?._id) {
          this.appsMenuItems = this.peMessageChatRoomService.channelMenuItems;

          if (chat.integrationName) {
            const channel = chat.integrationName as string;
            this.activeChannel = channel as PeChatChannelMenuItem;
          }

          if (this.peMessageService.isLiveChat) {
            this.refreshMessages(chat);
          } else {
            this.selectEndpointToReceiveFreshMessage(chat).pipe(
              tap((res: any) => {
                this.refreshMessages(res.chatListItem, res.messages);
              }),
              takeUntil(this.destroyed$),
            ).subscribe();
          }
        } else {
          const key = 'message-app.chat-room.placeholder.no_chat_rooms';

          this.peMessageChatRoomService.noMessagesPlaceholder = this.translateService.translate(key);

          this.messageList = [];
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  private selectEndpointToReceiveFreshMessage(chat: PeMessageChat): Observable<any> {
    switch (chat.type) {
      case PeMessageChatType.Channel:
      case PeMessageChatType.IntegrationChannel:
      case PeMessageChatType.AppChannel:
        return this.peMessageApiService.getChannel(chat._id as string).pipe(
          switchMap((chatListItem: PeMessageChat) => {
            return this.peMessageApiService.getChatMessageList(chat._id as string).pipe(
              map((messages: PeChatMessage[]) => ({ chatListItem, messages })),
            );
          }));

      case PeMessageChatType.Group:
        return this.peMessageApiService.getGroup(chat._id as string).pipe(
          map((chatListItem: PeMessageChat) => ({ chatListItem })),
        );

      case PeMessageChatType.Chat:
      default:
        return this.peMessageApiService.getChat(chat._id as string).pipe(
          map((chatListItem: PeMessageChat) => ({ chatListItem })),
        );
    }
  }

  private refreshMessages(chat: PeMessageChat, appMessages?: PeChatMessage[]): void {
    const messages = appMessages || chat?.lastMessages || chat?.messages;

    const userId = this.peMessageService.activeUser?._id || '';
    this.messageList = messages?.filter(message => {
      return !message.deletedForUsers.includes(userId);
    }).map((message: PeChatMessage) => {
      const isCurrentUserSender = userId === message.sender;
      if (this.peMessageService.activeUser) {
        if (message.sender !== this.peMessageService.activeUser._id && message.status !== 'read') {
          this.updateMessageStatus(message);
        }
      }

      return this.messageTransform(message, isCurrentUserSender);
    }) ?? [];

    const channelMember = chat.members?.find((member: any) => member.user === this.peMessageService.activeUser._id);
    const isChannelAdmin = channelMember?.role === 'admin';

    switch (chat.type) {
      case PeMessageChatType.Channel:
        const key = isChannelAdmin ? 'message-app.chat-room.placeholder.no_messages' : '';
        this.peMessageChatRoomService.noMessagesPlaceholder = this.translateService.translate(key);
        break;
      case PeMessageChatType.Chat:
        this.peMessageChatRoomService.noMessagesPlaceholder = '';
        break;
    }

    this.changeDetectorRef.detectChanges();
  }

  private messageTransform(message: PeChatMessage, isCurrentUserSender: boolean): PeChatMessage {
    const user = this.peMessageService.userList ? this.peMessageService.userList.find((u) => u._id === message.sender)?.userAccount : null;
    const contact = this.peMessageService.contactList ? this.peMessageService.contactList.find((c) => c._id === message.sender) : null;
    const activeChat = this.peMessageChatRoomListService.activeChat;

    const name = [];

    if (user?.firstName) { name.push(user.firstName); }
    if (user?.lastName) { name.push(user.lastName); }

    message.avatar = contact?.avatar;
    message.reply = message.sender === this.peMessageService.activeUser?._id ? false : true;

    if (this.peMessageService.isLiveChat) {
      message.name = message.sender === this.peMessageService.activeUser?._id
        ? 'Visitor'
        : this.peMessageChatRoomListService.chatList.find(chat => chat._id === message.chat)?.title;
    } else {
      message.name = name.length ? name.join(' ') : contact?.name;
    }
    message.isCurrentUserSender = isCurrentUserSender;

    if (message.type === 'box' && message.interactive?.action) {
      message.content = message.interactive.translations[message.interactive.defaultLanguage] ?? message.content;
      message.interactive.action = this.peMessageChatBoxService.linkNormalise(message.interactive.action);
    }

    if (
      activeChat?.type === PeMessageChatType.Channel
    && activeChat.signed
    && message.type === PeChatMessageType.Text
  ) {
      message.sign = message.name;
    }

    return message;
  }

  private openProductListOverlay(): void {
    const onSaveSubject$ = new BehaviorSubject<string[]>(['init']);
    const peOverlayConfig: PeOverlayConfig = {
      data: {
        theme: this.theme,
      },
      hasBackdrop: true,
      headerConfig: {
        title: this.translateService.translate('message-app.chat-room.products'),
        theme: this.theme,
        removeContentPadding: true,
        hideHeader: true,
        onSaveSubject$,
      },
      panelClass: 'pe-message-products-overlay',
      component: PeMessageProductListComponent,
    };

    this.peOverlayWidgetService.open(peOverlayConfig);

    onSaveSubject$.pipe(
      filter(data => !!data && data[0] !== 'init'),
      take(1),
      tap((productIds: string[]) => {
        if (productIds.length) {
          const body = {
            productIds: productIds,
            type: this.activeChannel,
          };
          this.peMessageApiService.getProductCheckoutLink(body).pipe(
            take(1),
            tap(data => { this.peMessageChatRoomService.sendMessage({ message: data.link }); }),
          ).subscribe();
        }

        this.peOverlayWidgetService.close();
      })
    ).subscribe();
  }

  private updateMessageStatus(message: PeChatMessage): void {
    const foundChat = this.peMessageChatRoomListService.chatList.find(c => c._id === message.chat);
    if (foundChat) {
      const foundMessage = foundChat.lastMessages?.find(m => m._id === message._id);
      if (foundMessage) {
        foundMessage.status = PeChatMessageStatus.READ;
      }
    }

    this.peChatService.socket.emit('messages.ws-client.message.mark-read', message._id);

    this.peMessageChatRoomListService.detectChangeStream$.next();
  }

  clickOnHideChat(): void {
    this.peMessageService.liveChatBubbleClickedStream$.next(false);
  }
}
