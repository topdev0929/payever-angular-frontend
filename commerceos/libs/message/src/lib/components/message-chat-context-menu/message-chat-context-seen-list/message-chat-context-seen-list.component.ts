import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';

import { PeDestroyService } from '@pe/common';
import { PeMessageAppService } from '@pe/message/shared';
import { PeChatMemberService, PeChatMessage } from '@pe/shared/chat';


@Component({
  selector: 'pe-message-chat-context-seen-list',
  templateUrl: './message-chat-context-seen-list.html',
  styleUrls: ['./message-chat-context-seen-list.scss'],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageChatContextSeenListComponent implements OnInit {
  @Input() seenList: string[];
  members: PeChatMessage[];

  constructor(
      private peChatMessageService: PeChatMemberService,
      private peMessageAppService: PeMessageAppService,
    ) {}

  ngOnInit() {
    this.members = this.peChatMessageService.mapMemberToChat(
      this.peMessageAppService?.selectedChannel?.members
        .filter(member => this.seenList.includes(member?.user?._id))
    );
  }
}
