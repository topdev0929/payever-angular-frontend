import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  Injector,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngxs/store';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';

import { APP_TYPE, AppType, PeDestroyService } from '@pe/common';
import { PeGridMenuService, PeGridSidenavService, PeGridState } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { PeMessageConversationActionsEnum, PeMessageSidenavsEnum, PeMessageAppService } from '@pe/message/shared';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import {
  MessageChatEvents,
  PeMessageChannelMemberByCategory,
  PeMessageChat,
  PeMessageColors,
} from '@pe/shared/chat';
import { WindowService } from '@pe/window';

import {
  PeMessageConversationService,
  PeMessageThemeService,
  MessageChatDialogService,
} from '../../../services';
import { PeMessageFolderTreeComponent } from '../../message-folder-tree';

import { PE_MESSAGE_CONVERSATION_MENU } from './conversation-menu.constant';



interface CurrentChatsDraft {
  message: string;
  id: string;
}

@Component({
  selector: 'pe-message-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageConversationComponent implements OnInit {
  public isMobile = false;
  private readonly itemContextMenu = PE_MESSAGE_CONVERSATION_MENU;
  public conversation: PeMessageChat = null;
  @ViewChild('deleteForEveryOneTemplate', { static: true }) deleteForEveryOneTemplateRef;

  @Input() typingMembers: PeMessageChannelMemberByCategory[];
  @Input() isLiveChat = false;
  @Input() item: PeMessageChat;
  @Input() isConversationActive: boolean;


  get colors() { return this.peMessageThemeService.colors; }
  set colors(value: PeMessageColors) { this.peMessageThemeService.colors = value; }

  constructor(
    protected injector: Injector,
    private peMessageConversationService: PeMessageConversationService,
    private peMessageThemeService: PeMessageThemeService,
    private peGridMenuService: PeGridMenuService,
    private readonly destroy$: PeDestroyService,
    private peMessageAppService: PeMessageAppService,
    private store: Store,
    @Inject(APP_TYPE) private appType: AppType,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private messageChatDialogService: MessageChatDialogService,
    private peGridSidenavService: PeGridSidenavService,
    private windowService: WindowService,
  ) { }

  get messagePreview() {
    let preview: { isFile: boolean, content: string};
    if (sessionStorage.getItem('current_chats_draft')) {
      const currentChatsDraft = (JSON.parse(sessionStorage.getItem('current_chats_draft')) as CurrentChatsDraft[])
        .find(draft => draft.id === this.conversation._id);
        if (currentChatsDraft?.message) {
          preview =
          {
            isFile: false,
            content: `${this.translateService.translate('message-app.sidebar.draft')} ${currentChatsDraft?.message}`,
          };

          return preview;
        }
    }
    if (this.item.messages && this.item.messages.length !== 0) {
      let lastMessage = this.conversation.messages[this.conversation.messages.length -1];
      if (Object.values(MessageChatEvents).includes(lastMessage.eventName)){
        lastMessage = this.peMessageAppService.convertVirtualMessages(lastMessage);
      }
      preview = {
        isFile: lastMessage.attachments && lastMessage.attachments.length !== 0,
        content: lastMessage?.content || "",
      };
    }

    return preview;
  }

  get datePreview(): string {
    let datePreview;
    if (this.item?.messages && this.item?.messages.length !== 0) {
      const lastMessage = this.conversation.messages[this.conversation.messages.length -1];
      const { updatedAt, sentAt } = lastMessage;

      datePreview = moment(updatedAt?? sentAt).isSame(new Date(), "day") ?
          moment(updatedAt?? sentAt).format("HH:mm") : moment(updatedAt?? sentAt).format("DD.MM.YYYY");
    }
    else {
      datePreview = moment(this.conversation.createdAt).format("DD.MM.YYYY");
    }

    return datePreview;
  }

  ngOnInit(): void {
    this.conversation = this.item;
    this.windowService.isMobile$.pipe(
      tap((isMobile: boolean) =>{
         this.isMobile = isMobile;
      }),
      takeUntil(this.destroy$)
    ).subscribe();

  }

  public showTag(activeUser, messages, isUnreadedMessage): boolean {
    return this.peMessageConversationService.taggedMessage(activeUser, messages)
      || this.peMessageConversationService.userIsTagged(activeUser, messages, isUnreadedMessage);
  }

  public setConversationAsActive(): void {
    this.peMessageAppService.setMessagesToShowBasedOnChannel(this.item);
    (window.innerWidth <= 720 || this.isLiveChat) && this.peGridSidenavService
    .sidenavOpenStatus[PeMessageSidenavsEnum.ConversationList].next(false);
  }

  openContextMenuItem(event: PointerEvent): void {
    const contextMenuEvent$ = this.peGridMenuService.openContextMenu(
      event,
      this.itemContextMenu(this.conversation, { ...this.peMessageAppService.selectedFolder }),
    );

    contextMenuEvent$
      .pipe(
        filter(menuItem => !!menuItem),
        tap((menuItem: {label: string, value: PeMessageConversationActionsEnum} ) => {
          switch (menuItem.value) {
            case PeMessageConversationActionsEnum.AddToFolder:
              this.openAddToFolder();
              break;
            case PeMessageConversationActionsEnum.ExcludeFromFolder:
              this.peMessageAppService.removeChannelFromFolder(this.conversation);
              break;
            case PeMessageConversationActionsEnum.LeaveChat:
              this.messageChatDialogService.deleteLeaveChatDialog(
                this.conversation,
                this.peMessageAppService.userId,
                this.deleteForEveryOneTemplateRef,
              );
              break;
            default:
              break;
          }
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  openAddToFolder(){
    const onSaveSubject$ = new BehaviorSubject<string>('');
    this.store.select(PeGridState.folders(this.appType))
      .pipe(map(tree => tree.filter((folder: any) => folder.scope !== 'default')))
      .subscribe(
        (data) => {
          const peOverlayConfig: PeOverlayConfig = {
            data: {
              folderTree: data,
            },
            hasBackdrop: true,
            headerConfig: {
              title: this.translateService.translate('add-to-folder-overlay.title'),
              backBtnTitle: this.translateService.translate('add-to-folder-overlay.close'),
              backBtnCallback: () => {
                this.peOverlayWidgetService.close();
              },
              doneBtnTitle: this.translateService.translate('add-to-folder-overlay.save'),
              doneBtnCallback: () => {
                this.peMessageAppService.changeChannelFolder(this.conversation, onSaveSubject$.value );
                this.peOverlayWidgetService.close();
              },
              removeContentPadding: false,
              onSave$: onSaveSubject$.asObservable(),
              onSaveSubject$,
            },
            component: PeMessageFolderTreeComponent,
          };
          this.peOverlayWidgetService.open(peOverlayConfig);
        },
      );
  }
}
