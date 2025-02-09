import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import cloneDeep from 'lodash/cloneDeep';
import { BehaviorSubject, forkJoin, merge, Observable, of, Subject } from 'rxjs';
import {
  filter,
  map,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { CosEnvService } from '@pe/base';
import {
  AppType,
  EnvironmentConfigInterface,
  getAbbreviation,
  PeDestroyService,
  PeGridItem,
  PeGridItemType,
  PE_ENV, APP_TYPE, MessageBus,
} from '@pe/common';
import {
  ConfirmScreenService,
  Headings,
  PeConfirmationScreenIconInterface,
  PeConfirmationScreenIconTypesEnum,
} from '@pe/confirmation-screen';
import { DockerItemInterface, DockerState } from '@pe/docker';
import { MoveIntoFolderEvent, PeMoveToFolderItem } from '@pe/folders';
import { PeGridItemsActions, PeGridMenuItem, PeGridService, PeGridSidenavService } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import {
  MessageBusEvents,
  PeMessageConversationListActionsEnum,
  PeMessageGuardRoles,
  PeMessageSidenavsEnum,
  PeMessageWebSocketEvents,
  PeMessageConversationLocationInterface,
  PeMessageApiService,
  PeMessageChatRoomListService,
  PeMessageGuardService,
  PeMessageService,
  PeMessageWebSocketService,
  PeMessageAppService,
} from '@pe/message/shared';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import {
  PeMessageChat,
  PeMessageChatType,
  PeMessageChatTypingUser,
  PeMessageColors,
  PeMessageChatUserTyping,
} from '@pe/shared/chat';
import { SnackbarConfig, SnackbarService } from '@pe/snackbar';


import {
  PeMessageConversationService,
  PeMessageInvitationApiService,
  PeMessageThemeService,
  CosMessageBus,
  PeMessageLiveChatService,
} from '../../services';
import { PeCreatingChatFormComponent } from '../chat';
import {
  PE_MESSAGE_CONVERSATION_LIST_MENU,
  PE_MESSAGE_CONVERSATION_MENU,
} from '../conversation-list';

@Component({
  selector: 'pe-message-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService, PeGridService],
})
export class PeMessageConversationsComponent implements OnInit, OnDestroy, AfterViewInit {
  @SelectSnapshot(DockerState.dockerItems) private dockerItems: DockerItemInterface[];

  @ViewChild('deleteForEveryOneTemplate', { static: true }) deleteForEveryOneTemplateRef;
  @Input() isEmbedChat = false;
  @Input() isLiveChat = false;
  @Input() blurMode = false;

  public mobileView = false;
  public sidenavName = PeMessageSidenavsEnum.ConversationList;

  readonly conversations$ = this.peMessageAppService.getChannelsToShow();
  private conversations: PeMessageChat[];
  public readonly isLoading$ = new BehaviorSubject<boolean>(true);
  public readonly isEmpty$ = new BehaviorSubject<boolean>(true);
  public readonly typingMembers$ = new BehaviorSubject<PeMessageChatUserTyping>(null);
  public readonly conversationListMenu = !this.isEmbedMode
    ? PE_MESSAGE_CONVERSATION_LIST_MENU
    : null;

  public readonly conversationContextMenu = !this.isEmbedMode
    ? PE_MESSAGE_CONVERSATION_MENU
    : null;

  private readonly messagesSettingsListener$ =  this.peGridSidenavService.toggleOpenStatus$.pipe(
    takeUntil(this.destroy$),
    tap((open: boolean) => {
      !this.isLiveChat && this.pePlatformHeaderService.assignConfig({
        leftSectionItems: window.innerWidth <= 720 && !open ? [] : [{
          title: this.translateService.translate('message-app.message-interface.settings'),
          class: 'settings',
          onClick: () => {
            this.messageBus.emit(MessageBusEvents.OpenSetting, '');
          },
        }],
      } as PePlatformHeaderConfig);
    })
  )

  private readonly toggleSidenavStatus$ = this.peGridSidenavService
    .getSidenavOpenStatus(PeMessageSidenavsEnum.ConversationList)
    .pipe(
      tap((active: boolean) => {
        const { isEmbedChat, isLiveChat } = this.peMessageService;
        !isLiveChat && this.pePlatformHeaderService.toggleSidenavActive(PeMessageSidenavsEnum.ConversationList, active);
        active && !isLiveChat
          && this.pePlatformHeaderService.toggleSidenavActive(PeMessageSidenavsEnum.Folders, false);
        active && !isEmbedChat && !isLiveChat && this.addMobileHeader();
        !active && !isLiveChat
          && this.pePlatformHeaderService.removeSidenav(PeMessageSidenavsEnum.Folders);
        this.cdr.detectChanges();
      }));

  get colors() {
    return this.peMessageThemeService.colors;
  }

  set colors(value: PeMessageColors) {
    this.peMessageThemeService.colors = value;
  }

  constructor(
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private store: Store,
    @Inject(APP_TYPE) private appType: AppType,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private confirmScreenService: ConfirmScreenService,
    private peMessageThemeService: PeMessageThemeService,
    private cosEnvService: CosEnvService,
    private peGridSidenavService: PeGridSidenavService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    @Optional() private pePlatformHeaderService: PePlatformHeaderService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
    private peMessageApiService: PeMessageApiService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private peMessageConversationService: PeMessageConversationService,
    private peMessageGuardService: PeMessageGuardService,
    private peMessageInvitationApiService: PeMessageInvitationApiService,
    private peMessageService: PeMessageService,
    private peMessageWebSocketService: PeMessageWebSocketService,
    private peMessageLiveChatService: PeMessageLiveChatService,
    @Inject(MessageBus) private messageBus: CosMessageBus<MessageBusEvents>,
    private peMessageAppService: PeMessageAppService,
  ) {
    (window as any)?.PayeverStatic?.IconLoader?.loadIcons([
      'widgets',
    ]);

    (window as any)?.PayeverStatic?.SvgIconsLoader?.loadIcons([
      'file-14',
      'social-whatsapp-12',
      'social-telegram-18',
      'social-instagram-12',
    ]);
  }

  public get closeOnResize(): boolean {
    return !!this.peMessageConversationService.activeConversation$.value;
  }

  private get isEmbedMode(): boolean {
    return this.peMessageService.isLiveChat || this.peMessageService.isEmbedChat;
  }

  ngOnDestroy(): void {
    if (this.peMessageChatRoomListService.activeChat) {
      this.peMessageWebSocketService.leaveChat(this.peMessageChatRoomListService.activeChat._id);
    }
    this.peMessageChatRoomListService.destroy();
    this.peMessageConversationService.destroy();
    this.pePlatformHeaderService.removeSidenav(PeMessageSidenavsEnum.ConversationList);
    this.peMessageConversationService.removeConversationIdFromLs();
  }

  ngOnInit(): void {
    this.conversations$.pipe(
        tap((items)=> {
          this.isLoading$.next(items === undefined);
          this.isEmpty$.next(items === undefined || items.length === 0);
          if (items) {
            const { checkForInvitation$ } = this.peMessageConversationService;
            !checkForInvitation$.value && checkForInvitation$.next(true);
            if (this.conversations?.length !== items.length) {
              items.map((chat) => {
                if (chat.unreadCount === undefined) {
                  this.peMessageWebSocketService.chatRoomJoin(chat._id);
                  this.peMessageWebSocketService.emitMessageUnreadCount({ chatId: chat._id });
                }
              });
            }
            this.conversations = items;
          }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
    const { isEmbedChat, isLiveChat } = this.peMessageService;
    this.mobileView = isEmbedChat || isLiveChat;
    !isEmbedChat && !isLiveChat && this.addMobileHeader(PeMessageSidenavsEnum.ConversationList);
    const menuItem = PE_MESSAGE_CONVERSATION_LIST_MENU.items
      .find(menuItem => menuItem.value === PeMessageConversationListActionsEnum.CreateMailMessage);
    if (menuItem) {
      menuItem.hidden = this.cosEnvService.isPersonalMode;
    }

    const checkForInvitation$ = !isLiveChat ? this.checkForInvitation() : of(null);

    merge(
      checkForInvitation$,
      this.toggleSidenavStatus$,
      this.messagesSettingsListener$,
      this.handleTypingMessage(),
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  ngAfterViewInit(): void {
    (window.innerWidth <= 720 || this.isEmbedChat || this.isLiveChat)
      && this.peMessageAppService.selectedChannel
      && this.peGridSidenavService.sidenavOpenStatus[PeMessageSidenavsEnum.ConversationList].next(false);
  }

  public actionClick(conversation: PeGridItem<PeMessageChat>) {
    this.selectConversation(conversation);
  }

  private selectConversation(conversation: PeGridItem<PeMessageChat>) {
    (window.innerWidth <= 720 || this.isEmbedChat || this.isLiveChat) && this.peGridSidenavService
      .sidenavOpenStatus[PeMessageSidenavsEnum.ConversationList].next(false);

    this.isLiveChat && this.peMessageLiveChatService.onSelectChat(conversation.id);
  }

  private addMobileHeader(sidenavName?: string): void {
    this.pePlatformHeaderService.assignSidenavItem({
      name: sidenavName ?? PeMessageSidenavsEnum.Folders,
      active: sidenavName
        ? this.peGridSidenavService.getSidenavOpenStatus(sidenavName).value
        : this.peGridSidenavService.toggleOpenStatus$.value,
      item: {
        title: this.translateService.translate(sidenavName ?? PeMessageSidenavsEnum.Folders),
        iconType: 'vector',
        icon: '#icon-arrow-left-48',
        iconDimensions: {
          width: '12px',
          height: '20px',
        },
        onClick: () => {
          this.peMessageAppService.clearSelectedChannel();
          this.peGridSidenavService.toggleViewSidebar(sidenavName);
          this.peMessageConversationService.forgetCurrentConversation();
        },
      },
    });
  }

  private checkForInvitation(): Observable<any> {
    const { invitationKey, invitationPublicKey } = this.activatedRoute.snapshot.queryParams;
    const notificationConfig: SnackbarConfig = {
      content: '',
      duration: 5000,
      iconColor: '#00B640',
      iconId: 'icon-commerceos-success',
      iconSize: 24,
    };

    const translate = (translationKey: string, conversationTitle?: string) => this.translateService
      .translate(translationKey)
      .replace('{channelTitle}', conversationTitle);

    const checkForInvitationParams$ = () => this.peMessageConversationService.checkForInvitation$
      .pipe(filter(Boolean), take(1), filter(() => invitationKey || invitationPublicKey));

    const checkForMessageFirstStart$ = () => this.store.select(DockerState.dockerItems)
      .pipe(
        map(dockerItems => dockerItems.find(dockerItem => dockerItem.code === AppType.Message)),
        filter(message => message?.setupStatus === 'completed'));

    const getInvitationConversationInfo$ = () => invitationPublicKey
      ? this.peMessageInvitationApiService.getPublicConversationInfoBySlug(invitationPublicKey)
      : this.peMessageInvitationApiService.getConversationInfoByInviteCode(invitationKey)
        .pipe(map(({ messaging: { _id, photo, title } }) => ({ _id, photo, title })));

    const joinToInvitationConversation$ = () => invitationPublicKey
      ? this.peMessageInvitationApiService.joinToPublicConversationByInviteCode(invitationPublicKey)
      : this.peMessageInvitationApiService.joinToConversationByInviteCode(invitationKey);

    const showCancelledNotification$ = (conversationId: string, conversationTitle: string) => {
      notificationConfig
        .content = translate('message-app.invitation.notification.already_a_member', conversationTitle);
      this.snackbarService.toggle(true, notificationConfig);

      return of(false);
    };

    const showConfirmationDialog$ = (conversationPhoto: string, conversationTitle: string) => {
      const icon: PeConfirmationScreenIconInterface = conversationPhoto
        ? {
          iconType: PeConfirmationScreenIconTypesEnum.Image,
          path: `${this.env.custom.storage}/message/${conversationPhoto}`,
        }
        : {
          iconType: PeConfirmationScreenIconTypesEnum.Abbreviation,
          path: getAbbreviation(conversationTitle),
        };
      const confirmationConfig: Headings = {
        icon,
        title: translate('message-app.invitation.confirmation.title', conversationTitle),
        subtitle: translate('message-app.invitation.confirmation.subtitle', conversationTitle),
        declineBtnText: translate('message-app.invitation.actions.cancel'),
        confirmBtnText: translate('message-app.invitation.actions.join'),
        confirmBtnType: 'confirm',
      };

      return this.confirmScreenService.show(confirmationConfig, true);
    };

    return checkForMessageFirstStart$()
      .pipe(
        switchMap(checkForInvitationParams$),
        switchMap(getInvitationConversationInfo$),
        switchMap(({ _id, photo, title }) => this.conversations.some(conversation => conversation._id === _id)
          ? showCancelledNotification$(_id, title)
          : showConfirmationDialog$(photo, title)),
        tap(() => {
          this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: {} });
        }),
        take(1),
        filter(Boolean),
        switchMap(joinToInvitationConversation$),
        tap(() => {
          this.peMessageAppService.initMessages();
          if (this.peMessageAppService.selectedChannel) {
            const { title } = this.peMessageAppService.selectedChannel;
            notificationConfig.content = translate('message-app.invitation.notification.succesfully_joined', title);
            this.snackbarService.toggle(true, notificationConfig);
          }
        }));
  }

  public filterConversationList(filter: string): void {
    this.peMessageAppService.searchChannel(filter);
  }

  public dropIntoFolder(gridItem: PeGridItem): PeMoveToFolderItem[] {
    return [gridItem];
  }

  public conversationListMenuSelected(menuItem: PeGridMenuItem): void {
    if (menuItem.value === PeMessageConversationListActionsEnum.CreateChannel) {
      this.openChannelEditor();
    }
    if (menuItem.value === PeMessageConversationListActionsEnum.CreateDirectChat) {
      this.openContactsApp();
    }
  }

  public addConversationToFolder({ folder, moveItems }: MoveIntoFolderEvent) {
    const gridItemsToAdd = moveItems
      .filter(({ data: { locations }, type }) => type === PeGridItemType.Item && !locations
        .some(({ folderId }) => folderId === folder._id));
    const gridItemsToAdd$ = gridItemsToAdd
      .map(({ data, id }) => this.peMessageApiService.addLocation(id, data, folder._id));

    gridItemsToAdd$.length && forkJoin(gridItemsToAdd$)
      .pipe(
        tap((locationsOfAddedConversations: PeMessageConversationLocationInterface[]) => {
          locationsOfAddedConversations.forEach((location) => {
            const gridItem = gridItemsToAdd.find(gridItem => gridItem.id === location.itemId);
            const gridItemToUpdate = cloneDeep(gridItem);
            gridItemToUpdate.data.locations.push(location);
            this.store.dispatch(new PeGridItemsActions.EditItem(gridItemToUpdate as any, this.appType));
          });
        }))
      .subscribe();
  }

  private openContactsApp(): void {
    const app = this.dockerItems?.find(item => item.code === AppType.Contacts);
    if (app?.installed) {
      this.router.navigateByUrl(`${this.router.url}/contacts/${PeMessageChatType.Chat}`);
    } else {
      this.snackbarService.toggle(true, {
        content: this.translateService.translate('message-app.sidebar.contact_isnt_installed'),
        iconColor: '#E2BB0B',
        duration: 2500,
      });
    }
  }

  private openChannelEditor(): void {
    if (
      this.peMessageService.isEmbedChat
      && this.peMessageGuardService.isAllowByRoles([PeMessageGuardRoles.Admin])
    ) {
      const onCloseSubject$ = new Subject<any>();
      const peOverlayConfig: PeOverlayConfig = {
        data: {
          onCloseSubject$,
        },
        hasBackdrop: true,
        headerConfig: {
          hideHeader: true,
          removeContentPadding: true,
          title: this.translateService.translate('message-app.channel.overlay.title'),
        },
        panelClass: 'pe-message-channel-form-overlay',
        component: PeCreatingChatFormComponent,
      };

      this.peOverlayWidgetService.open(peOverlayConfig);

      onCloseSubject$
        .pipe(
          filter(Boolean),
          take(1),
          tap(() => {
            this.peOverlayWidgetService.close();
            window.innerWidth <= 720
              && this.peGridSidenavService.sidenavOpenStatus[PeMessageSidenavsEnum.ConversationList].next(false);
          }))
        .subscribe();
    } else {
      this.router.navigateByUrl(`${this.router.url}/channel`);
    }
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
          this.cdr.detectChanges();
        }),
      );
  }

  bottomReached(){
    this.peMessageAppService.loadMoreChannels();
  }
}
