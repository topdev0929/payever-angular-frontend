import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject } from 'rxjs';

import { PeMessageChat } from '@pe/shared/chat';
import { BusinessState } from '@pe/user';

import { PeMessageConversationComponent } from './conversation/conversation.component';

@Component({
  selector: 'pe-message-conversation-list',
  templateUrl: './conversation-list.component.html',
  styleUrls: ['./conversation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageConversationListComponent {

  @SelectSnapshot(BusinessState.businessUuid) businessId: string;

  @Input() isLoading = false;
  @Input() isLiveChat = false;
  @Input() set conversationList(conversationList) {
    this.conversationList$.next(conversationList?.filter(c =>
      (
        c?.permissions?.live
        || c.websocketType === 'live-chat'
      ) && (
        c.business === this.businessId
        || !c.business
        || !this.businessId
      ) || !this.isLiveChat
    ));
  }

  @ContentChild(
    TemplateRef,
    { static: false },
  ) public conversationTemplate: TemplateRef<PeMessageConversationComponent>;

  public readonly conversationList$ = new BehaviorSubject<PeMessageChat[]>([]);
}
