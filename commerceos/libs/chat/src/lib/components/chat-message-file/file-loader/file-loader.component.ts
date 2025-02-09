import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { PeChatMessageFileInterface } from '@pe/shared/chat';

@Component({
  selector: 'pe-chat-message-file-loader',
  templateUrl: 'file-loader.component.html',
  styleUrls: ['file-loader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeChatMessageFileLoaderComponent {
  @Input() file: PeChatMessageFileInterface;
  @Output() requestDownload = new EventEmitter();

}
