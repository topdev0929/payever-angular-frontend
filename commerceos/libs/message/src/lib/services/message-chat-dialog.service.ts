import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, take, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';
import { PeMessageAppService, PeMessageChatRoomListService } from '@pe/message/shared';
import { PeMessageChat } from '@pe/shared/chat';

@Injectable()
export class MessageChatDialogService {

  private readonly deleteEveryOneStatusSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private translateService: TranslateService,
    private confirmScreenService: ConfirmScreenService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private readonly destroy$: PeDestroyService,
    private peMessageAppService: PeMessageAppService,
  ) { }

  setDeleteEveryone(status: boolean): void {
    this.deleteEveryOneStatusSubject.next(status);
  }

  deleteLeaveChatDialog(channel: PeMessageChat, userId: string, templateRef: TemplateRef<any> = null): void {
    const isAdmin =  channel.members.some(member => member.role === 'admin' && member.user._id === userId);
    const config: Headings = {
      confirmBtnText: this.translateService.translate('message-app.sidebar.leave'),
      declineBtnText: this.translateService.translate('message-app.sidebar.cancel'),
      subtitle: this.translateService.translate(
        'message-app.sidebar.leave_chat_dialog', { channelLabel: channel.title }),
      description: this.translateService.translate('message-app.sidebar.action_cannot_undone'),
      title: this.translateService.translate('message-app.channel.settings.are-you-sure'),
      customMiddleTemplate: isAdmin && templateRef,
    };
    this.confirmScreenService
      .show(config, true)
      .pipe(
        take(1),
        filter(Boolean),
        tap(() => {
          this.peMessageAppService.leaveFromChannel(channel, this.deleteEveryOneStatusSubject.getValue());
          this.setDeleteEveryone(false);
        }),
        takeUntil(this.destroy$),
      ).subscribe();
  }
}
