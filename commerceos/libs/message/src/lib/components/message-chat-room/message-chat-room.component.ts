import { Clipboard } from '@angular/cdk/clipboard';
import { HttpEventType } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { BehaviorSubject, merge, Observable, of, Subject, EMPTY, from } from 'rxjs';
import { filter, map, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';
import * as uuid from 'uuid';

import { ApiService } from '@pe/api';
import { ChatScrollService, PeChatComponent } from '@pe/chat';
import {
  PE_ENV,
  PeDestroyService,
} from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { PeGridItemsActions } from '@pe/grid';
import { LocaleConstantsService } from '@pe/i18n';
import { TranslateService } from '@pe/i18n-core';
import { MediaService } from '@pe/media';
import {
  PeMessageChatRoomContextMenu,
  PeMessageChatType,
  PeMessageWebSocketEvents,
  PeMessageIntegrationThemeItem,
  PeMessageContext,
  PeMessageApiService,
  PeMessageChatRoomListService,
  PeMessageService,
  PeMessageWebSocketService,
  PeMessageAppApiService,
  PeMessageAppService,
} from '@pe/message/shared';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import {
  ChatHeaderSelectedActionEnum,
  FileUploadTypes,
  PeChatAttachFileUpload,
  PeChatAttachMenu,
  PeChatAttachMenuItem,
  PeChatChannelMenuItem,
  PeChatMessage,
  PeChatMessageStatus,
  PeChatMessageType,
  PeMessageChannelMember,
  PeMessageChat,
  PeMessageChatDraft,
  PeMessageColors,
  PeMessageConversationMemberAddMethod,
  PeMessageIntegration,
  PeMessageChatUserTyping,
  PeMessageChatTypingUser,
} from '@pe/shared/chat';
import { UserAccountInterface } from '@pe/shared/user';

import { messageContextMenu } from '../../constants';
import {
  PeMessageAppsService,
  PeMessageChatBoxService,
  PeMessageChatRoomService,
  PeMessageIntegrationService,
  PeMessageLiveChatService,
  PeMessageChatContextMenuService,
  PeMessageConversationService,
  PeMessageFileUploadService,
  PeMessageThemeService,
  MessageChatDialogService,
} from '../../services';
import { PeMessageChatRoomSettingsComponent, PeMessagePermissionsComponent } from '../message-chat-room-settings';
import { PeMessageForwardFormComponent } from '../message-forward';
import { PePinOverlayComponent } from '../pin-overlay';

@Component({
  selector: 'pe-message-chat-room',
  templateUrl: './message-chat-room.component.html',
  styleUrls: ['./message-chat-room.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService, ChatScrollService],
  animations: [],
})
export class PeMessageChatRoomComponent implements OnInit, AfterViewInit, OnDestroy {
  public readonly isLoading$ = new BehaviorSubject<boolean>(true);
  readonly messages$ = this.peMessageAppService.getMessagesToShow();
  public selectedChannel: PeMessageChat;
  public readonly typingMembers$ = new BehaviorSubject<PeMessageChatUserTyping>(null);

  @Input() mobileView = false;
  @Input() isLiveChat = this.peMessageAppService.isLiveChat;
  @Input() isEmbedChat = false;
  @Input() colors: PeMessageColors;

  @ViewChild('deleteForEveryOneTemplate', { static: true }) deleteMessageEveryoneRef;
  @ViewChild(PeChatComponent) chatComponent!: PeChatComponent;

  @Output() activatedChat = new EventEmitter<boolean>();

  clipboardContent$: Observable<any>;
  shownBs: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  shown$: Observable<boolean> = this.shownBs.asObservable();
  readStatus = PeChatMessageStatus.READ;
  replyMessage: PeChatMessage;
  messageToHighlight: any;
  peChatMessageType = PeChatMessageType;
  selectedMessages: PeChatMessage[] = [];
  selectedText = '';
  dragDimensions: DOMRect;
  smallBoxUrlItems = this.peMessageChatBoxService.smallBoxUrls();
  messageIntegration = PeMessageIntegration;
  draftMessage: PeChatMessage;
  editMessageData: PeChatMessage;
  forwardMessageData: PeChatMessage[];
  public dropFiles;
  appsImages = this.peMessageAppsService.images;
  public readonly channelMenuItems$ = this.peMessageChatRoomService.channelMenuItems$;
  public readonly setCursorFocus$ = new Subject<any>();
  public currentLanguage = this.localeConstantsService.getLang();

  activeChannel!: PeChatChannelMenuItem | PeMessageIntegration;
  scrollBottom = true;
  lastMessageSent: string;

  get attachMenuItems() {
    return [
      PeChatAttachMenuItem.App,
      PeChatAttachMenuItem.PhotoOrVideo,
      PeChatAttachMenuItem.File,
      // ...
      // this.peMessageChatRoomListService.hasPermission(PeMessageChannelPermissionsEnum.SendMedia)
      //   ? [PeChatAttachMenuItem.PhotoOrVideo, PeChatAttachMenuItem.File]
      //   : []
      // ,
      PeChatAttachMenuItem.Product,
      PeChatAttachMenuItem.Box,
    ];
  }

  messageFullTrigger = false;

  get unreadMessages(): Observable<any> {
    return this.peMessageChatRoomListService.unreadInFolder$.pipe(
      map((value: number) => {
        return value > 99 ? '99+' : value.toString();
      }),
    );
  }

  deleteMessageEveryone: { canDisplay: boolean; value: boolean } = { canDisplay: false, value: false };

  constructor(
    private apiService: ApiService,
    private clipboard: Clipboard,
    private localeConstantsService: LocaleConstantsService,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private ref: ElementRef,
    private router: Router,
    private store: Store,
    public dialog: MatDialog,
    @Inject(PE_ENV) public environmentConfigInterface: any,
    private confirmScreenService: ConfirmScreenService,
    private mediaService: MediaService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
    private peContextMenuService: PeMessageChatContextMenuService,
    private peMessageApiService: PeMessageApiService,
    private peMessageAppsService: PeMessageAppsService,
    private peMessageChatBoxService: PeMessageChatBoxService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private peMessageChatRoomService: PeMessageChatRoomService,
    private peMessageConversationService: PeMessageConversationService,
    private peMessageIntegrationService: PeMessageIntegrationService,
    private peMessageLiveChatService: PeMessageLiveChatService,
    private peMessageWebSocketService: PeMessageWebSocketService,
    private chatScrollService: ChatScrollService,
    private peMessageService: PeMessageService,
    private peMessageFileUploadService: PeMessageFileUploadService,
    private peMessageThemeService: PeMessageThemeService,
    private messageChatDialogService: MessageChatDialogService,
    private peMessageAppService: PeMessageAppService,
    private peMessageAppApiService: PeMessageAppApiService,
  ) {
  }

  public get channelMenuItems(): any {
    return this.peMessageChatRoomService?.channelMenuItems$;
  }

  public get noMessagesPlaceholder(): any {
    return this.isLiveChat ? null : this.peMessageChatRoomService.noMessagesPlaceholder;
  }

  ngOnInit(): void {
    this.peMessageAppService.selectedChannel$.pipe(
      tap((selectedChannel) => {
        const activeBusinessId = this.peMessageApiService.businessId;

        this.selectedChannel = activeBusinessId === selectedChannel?.businessId ? selectedChannel?.channel : null;
      }),
      takeUntil(this.destroy$),
    ).subscribe();
    this.messages$.pipe(
      tap((items)=>{
        this.isLoading$.next(items === undefined);
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    merge(
      ...this.initFlow(),
      this.peMessageChatRoomListService.initAddingMembersInfoToConversation$,
      this.handleTypingMessage(),
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  initFlow() {
    const initFlow$ = [];
    if (this.peMessageAppService.isLiveChat) {
      initFlow$.push(this.peMessageIntegrationService.currSettings$
        .pipe(
          filter((themeItem: PeMessageIntegrationThemeItem) => themeItem._id !== undefined),
          tap((themeItem: PeMessageIntegrationThemeItem) => {
            this.peMessageThemeService.setColors(themeItem.settings);
            this.changeDetectorRef.detectChanges();
          }),
        ),
      );
      this.currentLanguage = this.localeConstantsService.getLang();
    } else {
      initFlow$.push(this.apiService.getUserAccount()
        .pipe(
          tap((user: UserAccountInterface) => {
            this.currentLanguage = user?.language ?? this.localeConstantsService.getLang();
          }),
        ));
    }

    return initFlow$;
  }

  getTypingMembers(item: PeMessageChat): PeMessageChatTypingUser[] {
    const typingMembersObj = this.typingMembers$.getValue();
    if (item._id === typingMembersObj?._id) {
      return typingMembersObj.typingMembers.filter(a => a.user !== this.peMessageAppService.userId);
    }
  }

  handleTypingMessage() {
    return this.peMessageWebSocketService
      .handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_TYPING)
      .pipe(
        filter(chat => !!chat),
        tap((chat: PeMessageChatUserTyping) => {
          this.typingMembers$.next(chat);
          this.changeDetectorRef.detectChanges();
        }),
      );
  }

  getClipboardPromise(): Promise<any> {
    return navigator.clipboard.readText().then(text => text);
  }

  backArrowClick(): void {
    this.peMessageConversationService.forgetCurrentConversation();
  }

  unpinAllMessages() {
    const headings: Headings = {
      title: this.translateService.translate('message-app.unpin_all_overlay.title'),
      subtitle: this.translateService.translate('message-app.unpin_all_overlay.subtitle'),
      declineBtnText: this.translateService.translate('message-app.unpin_all_overlay.cancel'),
      confirmBtnText: this.translateService.translate('message-app.unpin_all_overlay.unpin_all'),
    };
    this.confirmScreenService.show(headings, true).pipe(
      tap((val) => {
        if (val) {
          const conversationsService = this.peMessageAppService;
          conversationsService.selectedChannel?.pinnedMessageObj?.forEach((value) => {
            conversationsService.unpinMessage(value, true);
          });
          conversationsService.showPinnedMessageList$.next(false);
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngAfterViewInit(): void {
    this.dragDimensions = this.ref.nativeElement.getBoundingClientRect();
  }

  messageAccentColor(message: PeChatMessage): string {
    return this.isLiveChat ? this.peMessageThemeService.messageAccentColor(message) : null;
  }

  onDragOver($event) {
    $event?.preventDefault();
    this.dragDimensions = this.ref.nativeElement.getBoundingClientRect();
    this.isForm() && (this.dropFiles = $event);
  };

  unpinMessage(message: PeChatMessage) {
    const headings: Headings = {
      title: this.translateService.translate('unpin-overlay.title'),
      subtitle: this.translateService.translate('unpin-overlay.subtitle'),
      declineBtnText: this.translateService.translate('unpin-overlay.cancel'),
      confirmBtnText: this.translateService.translate('unpin-overlay.unpin'),
    };
    this.confirmScreenService.show(headings, true).pipe(
      filter(res => res),
      take(1),
      tap(() => {
        this.peMessageAppService.unpinMessage(message, true);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onDragLeave($event) {
    $event?.preventDefault();
    const { pageX, pageY } = $event;
    const { left, top, right, bottom } = this.ref.nativeElement.getBoundingClientRect();
    if (left > pageX || pageX > right || top > pageY || pageY > bottom) { this.dropFiles = null; }
  }

  public setCursorFocus(): void {
    // ({}) using for @Input set. Dont remove it!
    this.setCursorFocus$.next({});
  }

  appsMenuItem(item: { app: string; image: string }): void {
    this.peMessageAppsService.appsMenuItem(item);
  }

  smallBoxItem(item: { text: string; url: string; icon: string }): void {
    const interactive = {
      action: item.url,
      defaultLanguage: 'en',
      icon: item.icon ?? undefined,
      marked: false,
      translations: {
        en: item.text,
      },
    };

    this.sendBoxMessage(interactive, item.text);
  }

  largeBoxItem(item: { image: File; text: string }): void {
    this.peMessageApiService.postMedia(item.image, FileUploadTypes.Image).subscribe((event) => {
      if (event.type === HttpEventType.Response) {
        const interactive ={
          image: this.mediaService.getMediaUrl(event.body.blobName, 'message'),
          defaultLanguage: 'en',
          translations: {
            en: item.text,
          },
        };
        this.sendBoxMessage(interactive, item.text);
      }
    });
  }

  sendBoxMessage(interactive, text) {
    const event: PeChatMessage = {
      interactive,
      chat: this.peMessageAppService.selectedChannel._id,
      sender: this.peMessageAppService.userId,
      content: text,
      sentAt: new Date(),
      type: PeChatMessageType.Box,
      contentPayload: uuid.v4(),
    };

    this.peMessageAppService.sendMessage(event);
  }

  draft({ chatId, draftMessage }: PeMessageChatDraft): void {
    const chat = chatId && this.peMessageConversationService.conversationList$.value.find(
      conversation => conversation.id === chatId
    )?.data || this.peMessageChatRoomListService.activeChat;

    const activeChat = Object.assign({}, chat);

    if (this.editMessageData|| this.isLiveChat) {
      return;
    }
    const isNewMessageToDraft = draftMessage && draftMessage !== '';
    const activeChatAction = activeChat.draft
      ? this.peMessageChatRoomListService.deleteDraftMessage(activeChat, activeChat.draft)
      : EMPTY;
    const draftAction$ = isNewMessageToDraft
      ? this.peMessageChatRoomListService.postDraftMessage(activeChat, draftMessage)
      : activeChatAction;
    (isNewMessageToDraft || !!activeChat.draft) && draftAction$
      .pipe(
        take(1),
        tap((message) => {
          activeChat.draft = message ?? null;
          const conversation = this.peMessageConversationService.conversationToGridItemMapper([activeChat])[0];
          this.store.dispatch(new PeGridItemsActions.EditItem(conversation, 'message'));
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  selectedActions(action) {
    switch (action) {
      case ChatHeaderSelectedActionEnum.Forward:
        this.openForwardFormOverlay(this.selectedMessages);
        break;
      case ChatHeaderSelectedActionEnum.Delete:
        this.showConfirmationDialog(this.selectedMessages);
        break;
      default:
        this.clearSelectedMessages();
        break;
    }
  }

  clearSelectedMessages() {
    this.selectedMessages = [];
    this.changeDetectorRef.detectChanges();
  }

  attachMenuItem(item: PeChatAttachMenu): void {
    switch (item.type) {
      case PeChatAttachMenuItem.Product:
        this.router.navigate(['products'], { relativeTo: this.activatedRoute });
        break;
      case PeChatAttachMenuItem.PhotoOrVideo:
      case PeChatAttachMenuItem.File:
        if (item.data) {
        this.peMessageFileUploadService.attachFileUpload(
          item.data as PeChatAttachFileUpload,
          this.peMessageAppService.userId);
        }
        break;
    }
  }

  channelMenuItem(item: PeChatChannelMenuItem): void {
    this.activeChannel = item;

    const chat = this.peMessageChatRoomListService.chatList.find(
      c => c.contact === this.peMessageChatRoomListService.activeChat?.contact,
    );

    if (chat?.integrationName === (item as string)) {
      this.peMessageChatRoomListService.activeChat = chat;
    }
  }

  openMessageContextMenu(event: MouseEvent, message: PeChatMessage): void {
    if (this.isLiveChat) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    if (message.type === PeChatMessageType.Box) {
      return;
    }

    const selectedText = window.getSelection().toString();
    const isSelectedZone = window.getSelection().anchorNode?.parentNode === event.target;
    const isMessagePinned = !!message.pinId;
    const seenList = message.readBy || [];

    if ([PeChatMessageType.DateSeparator, PeChatMessageType.WelcomeMessage].includes(message.type)) {
      return;
    }

    let contextMenu: PeMessageContext;

    if (this.selectedMessages.length > 0 && !this.isMessageSelected(message)) {
      contextMenu = {
        title: 'message-app.chat-room.context-menu.title',
        list: [{
          label: 'message-app.chat-room.context-menu.items.select',
          value: PeMessageChatRoomContextMenu.Select,
        }],
      };
    } else {
      contextMenu = messageContextMenu(
        this.isMessageSelected(message),
        message.sender === this.peMessageAppService.userId && !message.forwardFrom,
        selectedText && isSelectedZone,
        isMessagePinned,
        seenList,
        !this.peMessageAppService.showPinnedMessageList,
      );
    }

    if (message.type === PeChatMessageType.Event) {
      contextMenu.list.splice(0, 2);
    }

    const config = {
      data: contextMenu,
      panelClass: 'pe-message-chat-room-context-menu',
    };

    const dialogRef = this.peContextMenuService.open(event, config);

    dialogRef.afterClosed
      .pipe(
        take(1),
        tap((res) => {
          const chat = this.peMessageChatRoomListService.activeChat;

          switch (res) {
            case PeMessageChatRoomContextMenu.Edit:
              this.editMessage(chat, message);
              break;
            case PeMessageChatRoomContextMenu.GoToMessage:
              this.goToMessage(message);
              break;
            case PeMessageChatRoomContextMenu.Forward:
              this.openForwardFormOverlay([message]);
              break;
            case PeMessageChatRoomContextMenu.ForwardSelected:
              this.openForwardFormOverlay([...this.selectedMessages]);
              break;
            case PeMessageChatRoomContextMenu.Select:
              this.selectMessage(message);
              break;
            case PeMessageChatRoomContextMenu.Copy:
              this.selectedText = selectedText && isSelectedZone ? selectedText : this.getCopyText(message);
              this.clipboard.copy(this.selectedText);
              break;
            case PeMessageChatRoomContextMenu.CopySelected:
              this.selectedText = this.selectedMessages?.map(message => this.getCopyText(message)).join('\r\n\r\n');
              this.clipboard.copy(this.selectedText);
              break;
            case PeMessageChatRoomContextMenu.ClearSelection:
              this.clearSelectedMessages();
              break;
            case PeMessageChatRoomContextMenu.Reply:
              this.replyingMessage(message);
              break;
            case PeMessageChatRoomContextMenu.Pin:
              this.openPinDialog(message);
              break;
            case PeMessageChatRoomContextMenu.Unpin:
              this.unpinMessage(message);
              break;
            case PeMessageChatRoomContextMenu.Delete: {
              const messagesToDelete = this.selectedMessages.length ? this.selectedMessages : [message];
              this.showConfirmationDialog(messagesToDelete);
              break;
            }
          }
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  private getCopyText(message: PeChatMessage): string {
    let textParts = [];

    if (message.content) {
      textParts.push(message.content);
    }

    if (!message.content && message.attachments?.length) {
      textParts.push('[File]');
    }

    textParts = textParts.filter(x => x !== '');

    return textParts.join('\r\n').trim();
  }

  openPinDialog(message) {
    let name = null;
    const activeChatType = this.peMessageChatRoomListService?.activeChat?.type;
    if (
      activeChatType === PeMessageChatType.Chat ||
      activeChatType === PeMessageChatType.DirectChat
    ) {
      name = message.name;
    }

    const dialogRef = this.dialog.open(PePinOverlayComponent, {
      maxWidth: '100%',
      panelClass: 'pe-message-pin-overlay',
      backdropClass: 'pe-message-pin-overlay-backdrop',
      data: { name: name },
    });

    dialogRef.afterClosed().pipe(
      take(1),
      switchMap((result) => {
        if (result === null) {
          return of(null);
        }

        this.peMessageAppApiService.postPinMessage(message).pipe(
          takeUntil(this.destroy$),
        ).subscribe();

        return of(null);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  openChatFormContextMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const data = {
      title: this.translateService.translate('message-app.chat-room.context-menu.title'),
      list: [
        {
          label: this.translateService.translate('message-app.chat-room.context-menu.items.paste'),
          value: PeMessageChatRoomContextMenu.Paste,
        },
      ],
    };

    const config = {
      data,
      panelClass: 'pe-message-chat-form-context-menu',
    };

    const dialogRef = this.peContextMenuService.open(event, config);

    this.clipboardContent$ = from(this.getClipboardPromise());

    dialogRef.afterClosed
      .pipe(
        take(1),
        withLatestFrom(this.clipboardContent$),
        tap(([type, clipBoardText]) => {
          this.selectedText = clipBoardText;
          if (type === PeMessageChatRoomContextMenu.Paste) {
            const textarea = event.target as HTMLTextAreaElement;
            this.messageFullTrigger = !!textarea.value;
            this.changeDetectorRef.detectChanges();
            if (textarea.setRangeText) {
              textarea.setRangeText(this.selectedText);
            } else {
              textarea.focus();
              document.execCommand('insertText', false, this.selectedText);
            }
            this.draft({ draftMessage: textarea.value });
            this.messageFullTrigger = !!this.selectedText;
            this.setCursorFocus();
            this.changeDetectorRef.markForCheck();
          }
        }),
      )
      .subscribe();
  }

  selectMessage(message) {
    if (!this.isMessageSelected(message)) {
      this.selectedMessages.push(message);
    } else {
      this.selectedMessages = this.selectedMessages.filter(sM => sM._id !== message._id);
    }

    this.changeDetectorRef.markForCheck();
  }

  public isMessageSelected(message: PeChatMessage) {
    return this.selectedMessages.some(item => item._id === message._id);
  }

  showConfirmationDialog(messages: PeChatMessage[]) {
    const currentUserId = this.peMessageAppService.userId;
    this.deleteMessageEveryone = { canDisplay: !messages.some(m => m.sender !== currentUserId), value: false };

    const headings: Headings = {
      title: messages.length > 1
        ? this.translateService.translate('message-app.message-overlay.delete_multiple.title')
        : this.translateService.translate('message-app.message-overlay.delete.title'),
      subtitle: messages.length > 1
        ? this.translateService.translate('message-app.message-overlay.delete_multiple.label')
        : this.translateService.translate('message-app.message-overlay.delete.label'),
      declineBtnText: this.translateService.translate('message-app.message-overlay.delete.decline'),
      confirmBtnText: this.translateService.translate('message-app.message-overlay.delete.confirm'),
      customMiddleTemplate: this.deleteMessageEveryone.canDisplay ? this.deleteMessageEveryoneRef : null,
    };

    this.confirmScreenService.show(headings, true).pipe(
      tap((val) => {
        if (val) {
          messages.map(message =>
            this.peMessageAppService.deleteMessage(message, this.deleteMessageEveryone.value));
          this.messageChatDialogService.setDeleteEveryone(false);
          this.clearSelectedMessages();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private editMessage(chat: PeMessageChat, message: PeChatMessage): void {
    this.editMessageData = { ...message };
    this.changeDetectorRef.detectChanges();
  }

  goToMessage(message) {
    this.messageToHighlight = message;
    this.changeDetectorRef.detectChanges();
  }

  editMessageCancelled(): void {
    this.editMessageData = null;
    this.changeDetectorRef.detectChanges();
  }

  forwardMessageCancelled(): void {
    if (this.forwardMessageData?.length) {
      this.forwardMessageData = [];
      this.changeDetectorRef.detectChanges();
      this.clearSelectedMessages();
    }
  }

  public openChangeRecipientOverlay(): void {
    this.openForwardFormOverlay(this.forwardMessageData, true);
  }

  private openForwardFormOverlay(messages: PeChatMessage[], messagesAlreadyInit?: boolean): void {
    const onChatSelectSubject$ = new Subject<PeMessageChat>();
    const closeForm = () => {
      this.peOverlayWidgetService.close();
      onChatSelectSubject$.unsubscribe();
    };
    const peOverlayConfig: PeOverlayConfig = {
      component: PeMessageForwardFormComponent,
      backdropClick: closeForm,
      data: {
        onChatSelectSubject$,
        isLiveChat: this.isLiveChat,
      },
      hasBackdrop: true,
      headerConfig: {
        backBtnCallback: closeForm,
        backBtnTitle: this.translateService.translate('message-app.chat.forward.cancel'),
        removeContentPadding: true,
        title: this.translateService.translate('message-app.chat.forward.title'),
      },
      panelClass: 'pe-message-forward-form-overlay',
    };

    this.peOverlayWidgetService.open(peOverlayConfig);

    onChatSelectSubject$
      .pipe(
        tap((chat: PeMessageChat) => {
          this.peMessageAppService.setMessagesToShowBasedOnChannel(chat);
          this.forwardMessageData = messages;
          this.changeDetectorRef.detectChanges();
          closeForm();
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  onAvatarInHeader(): void {
    if (this.isLiveChat || this.isEmbedChat) {
      return;
    }

    const closeForm = () => {
      this.peOverlayWidgetService.close();
    };

    const peOverlayConfig: PeOverlayConfig = {
      component: PeMessageChatRoomSettingsComponent,
      hasBackdrop: true,
      headerConfig: {
        backBtnCallback: closeForm,
        backBtnTitle: this.translateService.translate('message-app.sidebar.cancel'),
        doneBtnCallback: closeForm,
        doneBtnTitle: this.translateService.translate('message-app.sidebar.done'),
        title: this.peMessageAppService.selectedChannel?.title,
      },
      panelClass: 'pe-message-chat-room-settings-overlay',
    };

    this.peOverlayWidgetService.open(peOverlayConfig);
  }

  isForm(): boolean {
    const activeChat = this.peMessageChatRoomListService.activeChat;

    if (this.peMessageAppService.isLiveChat &&
      this.peMessageAppService.liveChatActiveChannelId !== this.peMessageAppService.selectedChannel._id) {
        return false;
      }
    if (
      activeChat?.integrationName === PeMessageIntegration.Email
      || activeChat?.template
      || activeChat?.type === PeMessageChatType.AppChannel
      || activeChat?.app
      || activeChat?.isReadonly
    ) {
      return false;
    }

    if (this.isLiveChat) {
      return !(activeChat?.type === PeMessageChatType.Channel && activeChat?.usedInWidget);
    }

    if (this.isGroup(activeChat) || this.isChannel(activeChat)) {
      return this.peMessageChatRoomListService.hasPermission();
    }

    return true;
  }

  isGroup(activeChat) {
    return activeChat?.type === PeMessageChatType.Group;
  }

  isChannel(activeChat) {
    return activeChat?.type === PeMessageChatType.Channel;
  }

  isOwner(activeChat) {
    const currentUserId = this.peMessageAppService.userId;

    return !!activeChat?.members?.find(member =>
      member.owner === PeMessageConversationMemberAddMethod.Owner && member.user === currentUserId
    );
  }

  isEmail() {
    return this.peMessageChatRoomListService.activeChat?.integrationName === PeMessageIntegration.Email;
  }

  markedBox(event: any, message: PeChatMessage): void {
    const linkNormalised = this.peMessageChatBoxService.linkNormalise(event.url);
    if (linkNormalised !== "") {
      if (event.blank || this.peMessageService.isLiveChat) {
        (window as any).open(linkNormalised, "_blank");
      } else {
        this.router.navigate([linkNormalised], { queryParams: { fromTODO: true } }).then();
      }
    }

    if (message.type === 'box') {
      message.interactive.marked = true;
      this.peMessageApiService.postChatMessageMarked(message.chat, message._id, true).pipe(take(1)).subscribe();
    }
  }

  public getAvatarForCurrentUser(chat: PeMessageChat) {
    const currentUserId = this.peMessageAppService.selectedChannel;
    const avatar = chat?.membersInfo?.find(member => member.user._id === currentUserId)?.user?.userAccount?.logo;

    return avatar && this.mediaService.getMediaUrl(avatar, 'images');
  }

  public getAvatarFromDirect(chat: PeMessageChat): string {
    if (PeMessageChatType.DirectChat === chat?.type) {
      const currentUserId = this.peMessageAppService.selectedChannel;
      const avatar = chat.membersInfo?.find(member => member.user._id !== currentUserId)?.user?.userAccount?.logo;

      return avatar && this.mediaService.getMediaUrl(avatar, 'images');
    }

    return '';
  }

  templateAction(data): void {
    if (data.provider === PeChatChannelMenuItem.LiveChat) {
      this.peMessageLiveChatService.onSelectChat();
    }
  }


  replyingMessage(message: PeChatMessage) {
    this.replyMessage = message;
    this.setCursorFocus$.next({});
    this.changeDetectorRef.markForCheck();
  }

  cancelReplyMessage(event) {
    this.replyMessage = null;
    const replyChat = this.peMessageConversationService.conversationList$.value
      .find(conversation => conversation.id === this.peMessageChatRoomListService.activeChat?._id);
    if (!replyChat?.data) {
      return;
    }
    replyChat.data.replyToMessage = null;
    this.changeDetectorRef.detectChanges();
  }

  private memberPermissions(member: PeMessageChannelMember): void {
    const { activeChat } = this.peMessageChatRoomListService;
    const isCurrentMemberOwner = activeChat.members.some((activeChatMember) => {
      return activeChatMember.user === member._id
        && activeChatMember.addMethod === PeMessageConversationMemberAddMethod.Owner;
    });
    const currentUserId = this.peMessageAppService.userId;
    const onSaveSubject$ = new BehaviorSubject<boolean>(false);
    const closeForm = () => {
      onSaveSubject$.next(true);
    };
    const peOverlayConfig: PeOverlayConfig = {
      backdropClick: closeForm,
      component: PeMessagePermissionsComponent,
      data: {
        member,
        isNotEditable: member._id === currentUserId || isCurrentMemberOwner,
        channel: activeChat,
      },
      hasBackdrop: true,
      headerConfig: {
        backBtnCallback: closeForm,
        backBtnTitle: this.translateService.translate('message-app.sidebar.cancel'),
        doneBtnTitle: this.translateService.translate('message-app.sidebar.done'),
        onSaveSubject$,
        title: member.title,
      },
      panelClass: 'pe-message-permission-overlay',
    };

    this.peOverlayWidgetService.open(peOverlayConfig);

    onSaveSubject$
      .pipe(
        filter(Boolean),
        take(1),
        tap(this.closeForm),
        takeUntil(this.destroy$))
      .subscribe();
  }

  private closeForm = (): void => {
    this.peOverlayWidgetService.close();
  };

  public getMember(senderId: string): void {
    if (this.peMessageChatRoomListService.activeChat &&
      !this.peMessageChatRoomListService.activeChat.membersInfo) {
      return;
    }

    const memberInfo = this.peMessageChatRoomListService.activeChat.membersInfo.find(a => a.user._id === senderId);
    const member = this.peMessageChatRoomListService.getMember(memberInfo);
    this.memberPermissions(member);
  }

  ngOnDestroy() {
    if (this.peMessageChatRoomListService.activeChat) {
      this.peMessageWebSocketService.leaveChat(this.peMessageChatRoomListService.activeChat._id);
    }
  }

  showRepliedMessage(res) {
    this.chatScrollService.scrollToMessage$.next(res);
  }

  public toggleButtonChanged($event) {
    this.deleteMessageEveryone.value = $event;
  }
}
