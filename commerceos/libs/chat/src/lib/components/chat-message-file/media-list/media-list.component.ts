import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { PeChatMessageFileInterface } from '@pe/shared/chat';

@Component({
  selector: 'pe-chat-message-media-list',
  templateUrl: 'media-list.component.html',
  styleUrls: ['media-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeChatMessageMediaListComponent {
  @Input() files: PeChatMessageFileInterface[] = [];

  public get isSingleFile(): boolean {
    return this.files.length === 1;
  }

  public get isFileList(): boolean {
    return this.files.length > 1;
  }

  public trackBy(file: PeChatMessageFileInterface, index: number) {
    return file._id;
  }
}
