import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, takeUntil, tap } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV, PeDestroyService } from '@pe/common';
import { MediaService } from '@pe/media';
import { PeMessageAppService } from '@pe/message/shared';
import { PeChatMessage, PeChatMessageType } from '@pe/shared/chat';
import { PeUser, UserState } from '@pe/user';

import { convertToBoolProperty } from '../../chat.helpers';


@Component({
  selector: 'pe-chat-message',
  styleUrls: ['./chat-message.component.scss'],
  templateUrl: './chat-message.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeChatMessageComponent implements OnChanges, OnInit {
  @SelectSnapshot(UserState.user) userData: PeUser;

  private currentLang: string;

  @HostBinding('class.pe-chat-message') peChatMessage = true;
  @HostBinding('class.selected-messages-mode') get isSelectedMode(): boolean {
    return !!this.selectedMessages;
  }

  @HostBinding('class.is-pin-layer') get isPinLayer(): boolean {
    return this.peMessageAppService.showPinnedMessageList;
  }

  @HostBinding('class.reply')
  get reply(): boolean {
    return this._reply;
  }

  @HostBinding('class.not-reply')
  get notReply(): boolean {
    return !this.reply;
  }

  avatar: SafeStyle;
  msg: string;

  peChatMessageType = PeChatMessageType;
  messageHeaderTypes = [
    PeChatMessageType.Text,
    PeChatMessageType.Default,
    PeChatMessageType.Link,
    PeChatMessageType.Attachment,
  ];

  private LastTimeMsgWasVisible: {
    id: string;
    time: number;
  };

  protected _reply = false;
  protected _messageObj;

  public chatMemberUsernames: string[] = [];
  private triggerHighlight$ = new BehaviorSubject<boolean>(false);

  @Input() id: string;
  @Input() blurValue = '';
  @Input() accentColor = '';
  @Input() accentMessageColor = '';
  @Input() messagesBottomColor = '';
  @Input() type: PeChatMessageType;
  @Input() chatIntegrationType: any;
  @Input() currentLanguage = 'en';
  @Input() showAuthor: boolean;
  @Input() isLiveChat: boolean;
  @Input() dateFormat: string;
  @Input() status: string;
  @Input() selectedMessages = 0;
  @Input() selected: boolean;
  @Input() isPointer = false;
  @Input() pinnedMessages: PeChatMessage[];

  public urlForData = "";

  @Input()
  set messageObj(value: PeChatMessage) {
    this.urlForData = null;
    const sign = value.sign ? `<span class="sign">${value.sign}</span>` : '';
    this.msg = this.isValidUrl(value.content)
      ? this.linksTransform(value.content)
      : value.content ?? this.getFromTranslation(this.currentLanguage, value);
    this.msg += sign;
    this._reply = convertToBoolProperty(value.reply);
    this._messageObj = { ...value };
    this.chatMemberUsernames = value.chatMemberUsernames;
    this.avatar = value.senderObj?.logo
      ? this.domSanitizer.bypassSecurityTrustUrl(this.mediaService.getMediaUrl(value.senderObj.logo, 'images'))
      : null;
  }

  get messageObj(): PeChatMessage {

    return this._messageObj;
  }

  get showTime(): boolean{
    return !this.messageObj.interactive && this.messageObj.type !== this.peChatMessageType.Event
      || this.messageObj.type === this.peChatMessageType.Box;
  }

  @Output() markedBox = new EventEmitter();
  @Output() deleteBox = new EventEmitter();
  @Output() messageContextMenu = new EventEmitter<any>();
  @Output() template = new EventEmitter<any>();
  @Output() selectMessage = new EventEmitter<boolean>();
  @Output() showReplied = new EventEmitter<string>();
  @Output() updateMessageContent = new EventEmitter<string>();
  @Output() replyingMessage = new EventEmitter<PeChatMessage>();
  @Output() getMemberById = new EventEmitter<string>();

  get previewImage(): SafeStyle {
    return this.domSanitizer.bypassSecurityTrustStyle(
      `url('${this.environmentConfig.custom.cdn}/icons-messages/whatsapp-4.svg')`,
    );
  }

  get backDropFilterBlur() {
    return `blur(${this.blurValue})`;
  }

  //need to keep it in function to unload init
  get offsetMC() {
    return this.el.nativeElement.getBoundingClientRect().top;
  }

  constructor(
    protected domSanitizer: DomSanitizer,
    private el: ElementRef,
    private mediaService: MediaService,
    @Inject(PE_ENV) private environmentConfig: EnvironmentConfigInterface,
    private peMessageAppService: PeMessageAppService,
    private readonly destroy$: PeDestroyService,
  ) {
    this.currentLang = this.userData?.language ?? 'en';
  }

  ngOnInit(): void {
    this.triggerHighlight$.pipe(
      distinctUntilChanged(),
      filter(item => item),
      debounceTime(1000),
      tap(()=> {
        this.peMessageAppService.triggerMessageHighlight(this.messageObj, false);
        this.triggerHighlight$.next(false);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.messageObj?.currentValue?.highlightMessageTrigger ){
      this.triggerHighlight$.next(true);
    }
  }

  private extractHost(url: string): string {
    return (url.indexOf('//') > -1 ? url.split('/')[2] : url.split('/')[0]).split(':')[0].split('?')[0];
  }

  private linksTransform(message: string): string {
    const regex =
      /((http|https):\/\/)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.,~#?&//=]*)/gi;

    return message.replace(regex, (url) => {
      const hasSingleDot = new RegExp('[^\\.]\\.[^\\.]').test(url);
      if (!hasSingleDot) {
        return url;
      }
      const href = url.includes('http') ? url : `http://${url}`;

      return `<a href="${href}" target="_blank">${url}</a>`;
    });
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
    } catch (e) {
      return false;
    }

    return true;
  }

  public onClick(url: string): void {
    if (url) {
      const extractedHost = this.extractHost(url);
      const currentHost = window.location.hostname;

      let redirectTo: { url: string; blank: boolean };

      if (extractedHost === currentHost || !this.isValidUrl(url) || url.startsWith('/')) {
        redirectTo = {
          url: url.replace(/(^\w+:|^)\/\//, '').replace(!this.isValidUrl(url) ? '' : extractedHost, ''),
          blank: false,
        };
      } else {
        redirectTo = {
          url,
          blank: true,
        };
      }

      this.markedBox.emit(redirectTo);
    } else if (this.selectedMessages > 0 && this.type !== PeChatMessageType.Box) {
      this.selectMessage.emit(true);
    }
  }

  public templateAction(data): void {
    this.template.emit(data);
  }

  public getFromTranslation(lang: string, value: PeChatMessage): string {
    if (value?.interactive) {
      const { translations } = value?.interactive;

      return (translations?.[lang]) ?? (lang !== 'en' ? this.getFromTranslation('en', value) : '');
    }

    return '';
  }

  public removeBox(event: MouseEvent): void {
    event.preventDefault();
    this.deleteBox.emit();
  }

  timeClick(event) {
    event.stopPropagation();
    if (this.type !== PeChatMessageType.Box && !this.isLiveChat) {
      this.selectMessage.emit(event);
    }
  }

  replyMessage() {
    this.replyingMessage.emit(this.messageObj);
  }

  showRepliedMessage(res) {
    if (this.selectedMessages === 0) {
      res.event.stopPropagation();
      this.showReplied.emit(res.data);
    }
  }

  showPinIcon() {
    return this.pinnedMessages.find(pM => pM._id === this.messageObj._id);
  }

  public getMember(): void {
    this.getMemberById.emit(this.messageObj.sender);
  }

  shouldSetDynamicBgColor(type: PeChatMessageType) {
    return type !== PeChatMessageType.DateSeparator && type !== PeChatMessageType.Event;
  }

  get canReply() {
    return this.isLiveChat && (!!this.messageObj.mentions || !!this.messageObj.authId)
     || !this.isLiveChat;
  }
}
