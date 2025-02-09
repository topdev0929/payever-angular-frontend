import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n';
import { PeMessageAppService, PeMessageForwardChatData } from '@pe/message/shared';
import { OverlayHeaderConfig, PE_OVERLAY_DATA, PeOverlayRef } from '@pe/overlay-widget';
import { PeMessageChat, PeMessageChatType, PeMessageIntegration, PeMessageChannelRoles } from '@pe/shared/chat';

import { EMPTY_MSG_TEMPLATE_CONTENT } from '../../constants';
import { PeMessageConversationService } from '../../services';

@Component({
  selector: 'pe-message-forward-form',
  templateUrl: './message-forward-form.component.html',
  styleUrls: ['./message-forward-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageForwardFormComponent {

  public readonly forwardConversationList = new FormGroup({
    searchFilter: new FormControl(['']),
  });

  public readonly filteredChatList$ = combineLatest([
    this.forwardConversationList.controls.searchFilter.valueChanges.pipe(startWith('')),
    this.peMessageAppService.getChannelsToShow(),
  ]).pipe(
    map(([filter, conversationList]) => conversationList.reduce((conversationList, conversation) => {
        this.isForm(conversation)
        && conversation.title.toLocaleLowerCase().includes(filter.toLocaleLowerCase())
        && conversationList.push(conversation);

      return conversationList;
    }, [])));

  constructor(
    @Inject(PE_OVERLAY_DATA) public peOverlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: PeMessageForwardChatData,
    private peOverlayRef: PeOverlayRef,
    public translateService: TranslateService,
    private peMessageConversationService: PeMessageConversationService,
    private peMessageAppService: PeMessageAppService
  ) { }

  private get currentUserId(): string {
    return this.peMessageConversationService.currentUserId;
  }

  private isForm(chat: PeMessageChat): boolean {
    return this.checkType(chat)
      ? false
      : this.liveChatCheck(chat);
  }

  private liveChatCheck(chat): boolean {
    if (this.peOverlayData.isLiveChat) {
      return chat.type !== PeMessageChatType.IntegrationChannel
    }
    if (this.isGroup(chat) || this.isChannel(chat)) {
      return this.isMemberHasRight(chat);
    }

    return true;
  }

  private checkType(chat): boolean {
    return chat.integrationName === PeMessageIntegration.Email
      || chat.template
      || chat.type === PeMessageChatType.AppChannel
      || chat.app;
  }

  private isGroup(chat): boolean {
    return chat.type === PeMessageChatType.Group;
  }

  private isChannel(chat): boolean {
    return chat.type === PeMessageChatType.Channel;
  }

  private isMemberHasRight(chat, permission = 'sendMessages'): boolean {
    const member = chat?.members?.find((member: any) => member?.user === this.currentUserId);

    return member?.role === PeMessageChannelRoles.Admin || chat?.permissions?.[permission];
  }

  private getLastMessageContent(chat: PeMessageChat): string | null {
    if (chat.messages?.length) {
      const filteredMessages = chat.messages.filter((message) => {
        return !message.deletedForUsers?.includes(this.currentUserId);
      });
      const length = filteredMessages.length;
      const lastMessage = filteredMessages[length - 1];

      if (lastMessage?.content &&
        lastMessage.type !== 'template' &&
        lastMessage.content !== EMPTY_MSG_TEMPLATE_CONTENT
      ) {
        return lastMessage.content.length > 22 ? lastMessage.content.slice(0, 22) + '…' : lastMessage.content;
      }
    }

    return null;
  }

  public resetSearch() {
    this.forwardConversationList.get('searchFilter').setValue('');
  }

  public closeModal() {
    this.peOverlayRef.close();
  }

  public forwardMessage(chat: PeMessageChat): void {
    this.peOverlayData.onChatSelectSubject$.next(chat);
  }
}
