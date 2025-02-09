import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { MessageService } from '@pe/message/shared';
import { LinkDataInterface, PeChatMessage } from '@pe/shared/chat';

@Component({
  selector: 'pe-chat-message-text',
  templateUrl: './chat-message-text.component.html',
  styleUrls: ['./chat-message-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeChatMessageTextComponent {
  _message: string;

  @Input()
  set message(msg: string) {
    if (msg !== "{#empty#}"){
      this._message = this.replaceNewLine(msg);
    }
  }

  get message() {
    return this._message;
  }

  image: HTMLImageElement;

  _urlContent: LinkDataInterface;
  @Input()
  set urlContent(data: LinkDataInterface) {
    this._urlContent = data;
    if (this.img && !this.image) {
      this.image = this.img.nativeElement;

      this.image.onload = () => {
        this.messageService.contetChangedScroll$.next();
      };
    }
  }

  @Input() messageObj: PeChatMessage;

  @Input() blurValue = '';

  @Output() showReplied = new EventEmitter<{event: MouseEvent, data: PeChatMessage}>();

  @HostBinding('class.pe-chat-message-text') peChatMessageText = true;

  @ViewChild('image')
  public img: ElementRef;

  constructor(
    protected domSanitizer: DomSanitizer,
    private messageService: MessageService
    ) { }

  get previewImage(): SafeStyle {
    const attachment = this.messageObj.replyData?.attachments?.find(item => item.url);

    return attachment ? this.domSanitizer.bypassSecurityTrustStyle(`url(${attachment.url})`) : null;
  }

  replaceNewLine(msg: string) {
    return msg.replace(new RegExp('\r?\n', 'g'), '<br>');
  }

  showRepliedMessage(event) {
    this.showReplied.emit({
      event,
      data: this.messageObj.replyData,
    });
  }
}
