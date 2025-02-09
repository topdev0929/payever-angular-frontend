import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, take, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

import { PeChatService } from '@pe/chat';
import { MenuSidebarFooterData, PeDestroyService, PeDragDropService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PeContextMenuService } from '@pe/ui';

import {
  PeMessageApiService,
  PeMessageChatRoomListService,
  PeMessageChatRoomService,
  PeMessageNavService,
  PeMessageService,
  PeMessageGuardService,
} from '../../services';
import { PeMessageChat, PeMessageContact, PeMessageSettingsThemeItem } from '../../interfaces';
import { PeMessageContextMenu, PeMessageIntegration, PeMessageGuardRoles } from '../../enums';
import { PeMessageChatRoomFormComponent } from '../message-chat-room-form';
import { PeMessageFolderTreeComponent } from '../message-folder-tree';

import { PeMessageChatType } from '../../enums/message-chat-type.enum';
import { PeMessageChannelFormComponent } from '../channel/message-channel-form/message-channel-form.component';

@Component({
  selector: 'pe-message-chat-room-list',
  templateUrl: './message-chat-room-list.component.html',
  styleUrls: ['./message-chat-room-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
})
export class PeMessageChatRoomListComponent implements OnInit {

  @Input() theme = 'dark';
  @Input() isLiveChat = false;

  @HostBinding('class.pe-message-chat-room-list') peMessageChatRoomList = true;

  sidebarMenuItems = [
    {
      title: this.translateService.translate('message-app.sidebar.contact'),
      onClick: () => {
        this.openChatRoomFormOverlay();
      },
    },
  ];

  messageAppColor = '';
  accentColor = '';
  hovered = -1;
  peMessageIntegration = PeMessageIntegration;
  searchControl = new FormControl();
  menuData: MenuSidebarFooterData = {
    headItem: { title: this.translateService.translate('message-app.sidebar.add_new') },
    menuItems: this.sidebarMenuItems,
  };

  constructor(
    public peMessageChatRoomListService: PeMessageChatRoomListService,
    private changeDetectorRef: ChangeDetectorRef,
    private peChatService: PeChatService,
    private peContextMenuService: PeContextMenuService,
    private peDragDropService: PeDragDropService,
    private peMessageService: PeMessageService,
    private peMessageApiService: PeMessageApiService,
    private peMessageNavService: PeMessageNavService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private peMessageChatRoomService: PeMessageChatRoomService,
    private peMessageGuardService: PeMessageGuardService,
    private translateService: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private destroyed$: PeDestroyService,
  ) {
  }

  ngOnInit(): void {
    if (
      (
        this.peMessageGuardService.isAllowByRoles([PeMessageGuardRoles.Merchant, PeMessageGuardRoles.Admin])
        && !this.peMessageService.isLiveChat
        && !this.peMessageService.isEmbedChat
      ) || (this.peMessageService.isEmbedChat && this.peMessageGuardService.isAllowByRoles([PeMessageGuardRoles.Admin]))
    ) {
      this.sidebarMenuItems.push({
        title: this.translateService.translate('message-app.sidebar.channel'),
        onClick: () => {
          this.openChannelFormOverlay();
        },
      });
    }

    if (this.peMessageService.isLiveChat) {
      this.peMessageService.currSettings$.pipe(
        filter((themeItem: PeMessageSettingsThemeItem) => themeItem._id !== undefined),
        tap((themeItem: PeMessageSettingsThemeItem) => {
          this.messageAppColor = themeItem.settings?.messageAppColor || '';
          this.accentColor = themeItem.settings?.accentColor || '';

          this.changeDetectorRef.detectChanges();
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    }

    if (this.peChatService.socket) {
      this.peChatService.socket.on('messages.ws-client.chat.created', (chat: PeMessageChat) => {
        this.peMessageChatRoomListService.getContactAvatar(chat, (avatar: any) => {
          chat.avatar = avatar;
        });
        chat.initials = this.peMessageChatRoomListService.getContactInitials(chat);

        this.peMessageChatRoomListService.chatList.push(chat);
        this.peMessageChatRoomListService.sortChatList();

        this.peChatService.socket.emit('messages.ws-client.chat-room.join', chat._id);

        this.selectEndpointToReceiveFreshMessage(chat).pipe(
          take(1),
          tap((data: PeMessageChat) => {
            const foundChat = this.peMessageChatRoomListService.chatList.find(c => c._id === data._id);

            if (foundChat) {
              foundChat.lastMessages = data.lastMessages;
            }

            this.peMessageChatRoomListService.detectChangeStream$.next();
          }),
        ).subscribe();

      });

      this.peChatService.socket.on('messages.ws-client.contact.created', (contact: PeMessageContact) => {
        this.peMessageService.contactList.push(contact);

        this.changeDetectorRef.markForCheck();
      });

      this.peChatService.socket.on('messages.ws-client.message.posted', () => {
        this.changeDetectorRef.markForCheck();
      });

      this.peChatService.socket.on('messages.ws-client.message.deleted', () => {
        this.changeDetectorRef.markForCheck();
      });
    }

    this.handleActiveChat();
  }

  private selectEndpointToReceiveFreshMessage(chat: PeMessageChat): Observable<any> {
    switch (chat.type) {
      case PeMessageChatType.Channel:
      case PeMessageChatType.IntegrationChannel:
      case PeMessageChatType.AppChannel:
        return this.peMessageApiService.getChannel(chat._id as string);

      case PeMessageChatType.Group:
        return this.peMessageApiService.getGroup(chat._id as string);

      case PeMessageChatType.Chat:
      default:
        return this.peMessageApiService.getChat(chat._id as string);
    }
  }

  dragStart(chat: PeMessageChat): void {
    this.peDragDropService.setDragItem(chat);
  }

  getLastMessageIcon(chat: PeMessageChat): boolean {
    if (chat.lastMessages?.length) {
      const length = chat.lastMessages.length;
      const lastMessage = chat.lastMessages[length - 1];

      return lastMessage.attachments.length ? true : false;
    }

    return false;
  }

  getLastMessageContent(chat: PeMessageChat): string | null {
    if (chat.lastMessages?.length) {
      const userId = this.peMessageService.activeUser._id;
      const filteredMessages = chat.lastMessages.filter(message => {
        return !message.deletedForUsers?.includes(userId)
      });
      const length = filteredMessages.length;
      const lastMessage = filteredMessages[length - 1];
      // const content = lastMessage.content.replace(/<a href=\\"/, '');

      if (lastMessage && lastMessage.type !== 'template') {
        return lastMessage.content.length > 22 ? lastMessage.content.slice(0, 22) + '…' : lastMessage.content;
      }
    }

    return null;
  }

  getNumberUnreadMessages(chat: PeMessageChat): number | null {
    return chat.lastMessages?.length
      ? chat.lastMessages.filter(m => m.sender !== this.peMessageService.activeUser._id && m.status !== 'read').length
      : null;
  }

  openContextMenu(event: MouseEvent, chat: PeMessageChat): void {
    event?.preventDefault();
    event?.stopPropagation();

    const contextMenu = {
      title: this.translateService.translate('message-app.sidebar.options'),
      list: [
        { label: this.translateService.translate('message-app.sidebar.move_to') + '...', value: PeMessageContextMenu.Move },
        { label: this.translateService.translate('message-app.sidebar.delete'), value: PeMessageContextMenu.Delete, red: true },
      ],
    };

    const config = {
      theme: this.theme,
      panelClass: 'pe-message-room-list-context-menu',
      data: contextMenu,
    };

    this.peContextMenuService.open(event, config).afterClosed.pipe(
      tap((e: PeMessageContextMenu) => {
        switch (e) {
          case PeMessageContextMenu.Move:
            this.openFolderTreeOverlay(e, chat);
            break;
          case PeMessageContextMenu.Delete:
            this.peMessageChatRoomListService.deleteChat(chat._id);
            break;
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  private createChat(chat: PeMessageChat, message: string): void {
    const sameChat = this.peMessageChatRoomListService.chatList.find(c => {
      return c.contact === chat.contact && c.integrationName === chat.integrationName
    });

    if (sameChat) {
      this.peMessageChatRoomListService.activeChat = sameChat;
      this.peChatService.socket.emit('messages.ws-client.chat-room.join', sameChat._id);
      this.peMessageChatRoomService.sendMessage({ message: message });
    } else {
      this.peMessageApiService.postChat(chat).pipe(
        tap(response => {
          this.peMessageChatRoomListService.sortChatList();
          this.peMessageChatRoomListService.activeChat = response;
          this.peChatService.socket.emit('messages.ws-client.chat-room.join', response._id);
          this.peMessageChatRoomService.sendMessage({ message: message });
        }),
        takeUntil(this.destroyed$)
      ).subscribe();
    }
  }

  private handleActiveChat(): void {
    this.peMessageChatRoomListService.detectChangeStream$.pipe(
      tap(() => {
        setTimeout(() => this.changeDetectorRef.detectChanges());
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  public openChatRoomFormOverlay(): void {
    const onCloseSubject$ = new BehaviorSubject<any>(null);
    const peOverlayConfig: PeOverlayConfig = {
      data: {
        sender: `${this.peMessageService.activeUser.userAccount.firstName} ${this.peMessageService.activeUser.userAccount.lastName}`,
        contactList: this.peMessageService.contactList,
        onCloseSubject$,
      },
      hasBackdrop: true,
      headerConfig: {
        hideHeader: true,
        removeContentPadding: true,
        title: this.translateService.translate('message-app.sidebar.new_chat_message'),
        theme: this.theme,
      },
      panelClass: 'pe-message-chat-overlay',
      component: PeMessageChatRoomFormComponent,
    };

    this.peOverlayWidgetService.open(peOverlayConfig);

    onCloseSubject$.pipe(
      filter(close => !!close),
      take(1),
      tap((data) => {
        if (data.content && data.contact && data.integrationName) {
          const chat = {
            title: this.peMessageService.contactList.find(contact => contact._id === data.contact)?.name ?? '',
            integrationName: data.integrationName,
            contact: data.contact
          };

          this.createChat(chat, data.content);
        }

        this.peOverlayWidgetService.close();
      }),
    ).subscribe();
  }

  private openChannelFormOverlay(): void {
    if (
      this.peMessageService.isEmbedChat
      && this.peMessageGuardService.isAllowByRoles([PeMessageGuardRoles.Admin])
    ) {
      const onCloseSubject$ = new Subject<any>();
      const peOverlayConfig: PeOverlayConfig = {
        data: {
          onCloseSubject$,
          theme: this.theme,
        },
        hasBackdrop: true,
        headerConfig: {
          hideHeader: true,
          removeContentPadding: true,
          title: this.translateService.translate('message-app.channel.overlay.title'),
          theme: this.theme,
        },
        panelClass: 'pe-message-channel-form-overlay',
        component: PeMessageChannelFormComponent,
      };

      this.peOverlayWidgetService.open(peOverlayConfig);

      onCloseSubject$.pipe(
        filter(close => !!close),
        take(1),
        tap(() => {
          this.peMessageApiService.getAppsChannelList().pipe(
            takeUntil(this.destroyed$),
          ).subscribe();

          this.peOverlayWidgetService.close();
        }),
      ).subscribe();
    } else {
      this.router.navigate(['channel'], { relativeTo: this.route });
    }
  }

  private openFolderTreeOverlay(event: PeMessageContextMenu, chat: PeMessageChat): void {
    const onSaveSubject$ = new BehaviorSubject<string>('');
    const peOverlayConfig: PeOverlayConfig = {
      data: {
        folderTree: this.peMessageNavService.folderTree,
        theme: this.theme,
      },
      hasBackdrop: true,
      headerConfig: {
        title: this.translateService.translate('message-app.sidebar.move_to'),
        backBtnTitle: this.translateService.translate('message-app.sidebar.close'),
        backBtnCallback: () => {
          this.peOverlayWidgetService.close();
        },
        doneBtnTitle: this.translateService.translate('message-app.sidebar.save'),
        doneBtnCallback: () => {
          const folderId = onSaveSubject$.value;

          this.moveChatToFolder(chat._id as string, folderId);

          this.peOverlayWidgetService.close();
        },
        theme: this.theme,
        onSave$: onSaveSubject$.asObservable(),
        onSaveSubject$,
      },
      component: PeMessageFolderTreeComponent,
    };

    this.peOverlayWidgetService.open(peOverlayConfig);
  }

  private moveChatToFolder(chatId: string, folderId: string): void {
    this.peMessageApiService.patchFolderItem(chatId, { parentFolder: folderId }).pipe(
      tap(() => {
        const index = this.peMessageChatRoomListService.chatList.findIndex(chat => chat._id === chatId);
        this.peMessageChatRoomListService.chatList.splice(index, 1);
        this.peMessageChatRoomListService.sortChatList();
        this.peMessageChatRoomListService.activeChat = this.peMessageChatRoomListService.chatList.length
          ? this.peMessageChatRoomListService.chatList[0]
          : null;

        this.changeDetectorRef.detectChanges();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  trackOption(index: number, option: PeMessageChat): PeMessageChat {
    return option;
  }
}
