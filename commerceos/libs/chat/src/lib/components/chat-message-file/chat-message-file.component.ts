import { ChangeDetectionStrategy, Component, Injector, Input } from '@angular/core';

import { PeChatMessage, PeChatMessageAttachment, PeChatMessageFileInterface } from '@pe/shared/chat';

import { PeChatMessageFile } from './chat-message-file.class';

@Component({
  selector: 'pe-chat-message-file',
  styleUrls: ['./chat-message-file.component.scss'],
  templateUrl: './chat-message-file.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeChatMessageFileComponent {
  public groupFiles: PeChatMessageFileInterface[] = [];

  @Input() reply: boolean;
  @Input() notReply: boolean;
  @Input() message: string;
  @Input() messageObj: PeChatMessage;
  @Input() accentColor: string;
  @Input() sender: string;
  @Input() date: Date;
  @Input() dateFormat = 'shortTime';

  @Input() set files(attachments: PeChatMessageAttachment[]) {
    this.groupFiles = (attachments || []).map(this.initFile);
  }

  constructor(private injector: Injector) { }

  private readonly initFile = (attachment: PeChatMessageAttachment): PeChatMessageFileInterface => {
    const file = new PeChatMessageFile(attachment, this.injector);

    return file;
  };

  public isNotMedia(): boolean {
    return this.groupFiles.some(file => !file.isMedia);
  }
}
