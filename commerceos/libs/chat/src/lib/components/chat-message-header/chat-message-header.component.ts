import { Component, Input, Output, EventEmitter } from '@angular/core';

import { PeMessageAppService } from '@pe/message/shared';
import { PeChatMessage } from '@pe/shared/chat';

@Component({
  selector: 'pe-chat-message-header',
  templateUrl: './chat-message-header.component.html',
  styleUrls: ['./chat-message-header.component.scss'],
})
export class ChatMessageHeaderComponent {

  public userId = this.peMessageAppService.userId;

  constructor(private peMessageAppService: PeMessageAppService){}

  @Input() messageObj: PeChatMessage;
  @Output() emitGetMember = new EventEmitter<boolean>();

  getMember(){
    this.emitGetMember.emit(true);
  }

  get statusIcon(): string {
    if (this.messageObj.status === 'read') {
      return 'read-tick';
    }
    if (this.messageObj.status === 'sent') {
      return 'sent-tick';
    }

    return 'pending';
  }
}
