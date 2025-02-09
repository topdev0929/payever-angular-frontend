import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs/index';
import { filter, take, tap } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n-core';
import { ConfirmActionDialogComponent } from '@pe/confirm-action-dialog';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA, PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PeAuthService } from '@pe/auth';

import { PeMessageChatAction, PeMessageChatType } from '../../enums';
import { PeMessageChatRoomListService } from '../../services';
import { PeMessageChannelMember } from '../../interfaces';

import { PeMessageAddAdminsComponent } from './message-add-admins';
import { PeMessageInviteLinkComponent } from './message-invite-link';
import { PeMessageAdditionalChannelSettingsComponent } from './message-additional-channel-settings';
import { PeMessageEditInfoComponent } from './message-edit-info';
import { PeMessagePermissionsComponent } from './message-permissions';

@Component({
  selector: 'pe-message-chat-room-settings',
  templateUrl: './message-chat-room-settings.component.html',
  styleUrls: ['./message-chat-room-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeMessageChatRoomSettingsComponent implements OnInit {

  actions!: PeMessageChatAction[];
  activeChat = this.peMessageChatRoomListService.activeChat;
  subscribers: any;
  admins: any;
  peMessageChatAction = PeMessageChatAction;

  currentOverlayConfig?: any;
  currentOverlayData?: any;

  constructor(
    public peMessageChatRoomListService: PeMessageChatRoomListService,
    private translateService: TranslateService,
    private peAuthService: PeAuthService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    public dialog: MatDialog,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
  ) {
  }

  ngOnInit(): void {
    if (this.activeChat?.type === PeMessageChatType.Channel) {
      this.actions = [
        PeMessageChatAction.Add,
        PeMessageChatAction.Link,
        PeMessageChatAction.Edit,
        PeMessageChatAction.Delete,
        PeMessageChatAction.More,
      ];
    }

    this.subscribers = this.activeChat?.members?.filter(member => member.role === 'member')
      .map(member => this.peMessageChatRoomListService.getMember(member.user));
    this.admins = this.activeChat?.members?.filter(member => member.role === 'admin')
      .map(member => this.peMessageChatRoomListService.getMember(member.user, member));

  }

  pushAction(action: PeMessageChatAction): void {
    switch (action) {
      case PeMessageChatAction.Add:
        this.addChannelMembers();
        break;
      case PeMessageChatAction.Link:
        this.inviteLink();
        break;
      case PeMessageChatAction.Edit:
        this.editChannel();
        break;
      case PeMessageChatAction.Delete:
        this.deleteChannel();
        break;
      case PeMessageChatAction.More:
        this.additionalSettings();
        break;
    }
  }

  addChannelMembers(): void {
    this.peOverlayWidgetService.close();

    const onCloseSubject$ = new Subject<any>();
    const peOverlayConfig: PeOverlayConfig = {
      data: {
        onCloseSubject$,
        channel: this.activeChat,
        theme: this.peOverlayData.theme,
      },
      hasBackdrop: true,
      headerConfig: {
        title: this.translateService.translate('message-app.sidebar.add'),
        theme: this.peOverlayData.theme,
        backBtnTitle: this.translateService.translate('message-app.sidebar.cancel'),
        backBtnCallback: () => {
          this.peOverlayWidgetService.close();
        },
        doneBtnTitle: this.translateService.translate('message-app.sidebar.done'),
        doneBtnCallback: () => {},
      },
      panelClass: 'pe-message-add-admins-overlay',
      component: PeMessageAddAdminsComponent,
    };

    this.peOverlayWidgetService.open(peOverlayConfig);

    onCloseSubject$.pipe(
      filter(close => !!close),
      take(1),
      tap(() => {
        this.peOverlayWidgetService.close();
      }),
    ).subscribe();
  }

  inviteLink(): void {
    this.peOverlayWidgetService.close();

    const onCloseSubject$ = new Subject<any>();
    const peOverlayConfig: PeOverlayConfig = {
      data: {
        onCloseSubject$,
        channel: this.activeChat,
        theme: this.peOverlayData.theme,
      },
      hasBackdrop: true,
      headerConfig: {
        title: this.translateService.translate('message-app.channel.settings.invite-link'),
        theme: this.peOverlayData.theme,
        backBtnTitle: this.translateService.translate('message-app.sidebar.cancel'),
        backBtnCallback: () => {
          this.peOverlayWidgetService.close();
        },
        doneBtnTitle: this.translateService.translate('message-app.sidebar.done'),
        doneBtnCallback: () => {},
      },
      panelClass: 'pe-message-invite-link-overlay',
      component: PeMessageInviteLinkComponent,
    };

    this.peOverlayWidgetService.open(peOverlayConfig);

    onCloseSubject$.pipe(
      filter(close => !!close),
      take(1),
      tap(() => {
        this.peOverlayWidgetService.close();
      }),
    ).subscribe();
  }

  editChannel(): void {
    this.peOverlayWidgetService.close();

    const onCloseSubject$ = new Subject<any>();
    const peOverlayConfig: PeOverlayConfig = {
      data: {
        onCloseSubject$,
        channel: this.activeChat,
        theme: this.peOverlayData.theme,
      },
      hasBackdrop: true,
      headerConfig: {
        title: this.activeChat?.title ?? this.translateService.translate('message-app.channel.overlay.title'),
        theme: this.peOverlayData.theme,
        backBtnTitle: this.translateService.translate('message-app.sidebar.cancel'),
        backBtnCallback: () => {
          this.peOverlayWidgetService.close();
        },
        doneBtnTitle: this.translateService.translate('message-app.sidebar.done'),
        doneBtnCallback: () => {
          this.peOverlayWidgetService.close();
        },
      },
      panelClass: 'pe-message-edit-channel-overlay',
      component: PeMessageEditInfoComponent,
    };

    this.peOverlayWidgetService.open(peOverlayConfig);

    onCloseSubject$.pipe(
      filter(close => !!close),
      take(1),
      tap(() => {
        this.peOverlayWidgetService.close();
      }),
    ).subscribe();
  }

  additionalSettings(): void {
    this.peOverlayWidgetService.close();

    const onCloseSubject$ = new Subject<any>();
    const peOverlayConfig: PeOverlayConfig = {
      data: {
        onCloseSubject$,
        channel: this.activeChat,
        members: [...this.admins, ...this.subscribers],
        theme: this.peOverlayData.theme,
      },
      hasBackdrop: true,
      headerConfig: {
        hideHeader: true,
        removeContentPadding: true,
        title: this.translateService.translate('message-app.channel.settings.more'),
        theme: this.peOverlayData.theme,
      },
      panelClass: 'pe-message-add-admins-overlay',
      component: PeMessageAdditionalChannelSettingsComponent,
    };

    this.peOverlayWidgetService.open(peOverlayConfig);

    onCloseSubject$.pipe(
      filter(close => !!close),
      take(1),
      tap(() => {
        this.peOverlayWidgetService.close();
      }),
    ).subscribe();
  }

  permissionMember(member: PeMessageChannelMember): void {
    this.peOverlayWidgetService.close();

    const onCloseSubject$ = new Subject<any>();
    const peOverlayConfig: PeOverlayConfig = {
      data: {
        onCloseSubject$,
        member,
        owner: member._id === this.peAuthService.getUserData().uuid,
        channel: this.activeChat,
        theme: this.peOverlayData.theme,
      },
      hasBackdrop: true,
      headerConfig: {
        title: member.title,
        theme: this.peOverlayData.theme,
        backBtnTitle: this.translateService.translate('message-app.sidebar.cancel'),
        backBtnCallback: () => {
          this.peOverlayWidgetService.close();
        },
        doneBtnTitle: this.translateService.translate('message-app.sidebar.done'),
        doneBtnCallback: () => {
          this.peOverlayWidgetService.close();
        },
      },
      panelClass: 'pe-message-permission-overlay',
      component: PeMessagePermissionsComponent,
    };

    this.peOverlayWidgetService.open(peOverlayConfig);

    onCloseSubject$.pipe(
      filter(close => !!close),
      take(1),
      tap(() => {
        this.peOverlayWidgetService.close();
      }),
    ).subscribe();
  }

  private deleteChannel(): void {
    const config = {
      data: {
        theme: this.peOverlayData.theme,
        title: this.translateService.translate('message-app.channel.settings.are-you-sure'),
        subtitle: this.translateService.translate('message-app.channel.settings.delete-text'),
        cancelButtonTitle: this.translateService.translate('message-app.channel.settings.go-back'),
        confirmButtonTitle: this.translateService.translate('message-app.channel.settings.delete'),
      },
      panelClass: 'dialog-delete-channel',
    };
    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, config);
    dialogRef.afterClosed().subscribe((del: boolean | undefined) => {
      if (del) {
        this.peMessageChatRoomListService.deleteChat(this.activeChat?._id);
        this.peOverlayWidgetService.close();
      }
    });
  }

}