import { animate, state, style, transition, trigger } from '@angular/animations';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  ContentChildren,
  QueryList,
  ContentChild,
  HostBinding,
  ViewEncapsulation,
  OnDestroy,
  OnInit,
  Inject,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  AfterViewInit,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, of, ReplaySubject, Subject } from 'rxjs';
import { debounceTime, delay, filter, map, takeUntil, tap } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { PeMessageAppService } from '@pe/message/shared';
import { PeChatMessage } from '@pe/shared/chat';

import { PeBooleanInput } from './chat.helpers';
import { ChatScrollService } from './chat.service';
import { PeChatHeaderComponent } from './components';
import { PeChatFormComponent } from './components/chat-form/chat-form.component';
import { PeChatMessageComponent } from './components/chat-message/chat-message.component';
import { ChatIcons } from './enums/chat-icons.enum';
import { ChatScrollPosition } from './interfaces/chat-scroll-position.interface';
import { VirtualForDirective } from './scrolling/virtual-for.directive';
import { VirtualScrollViewportComponent } from './scrolling/virtual-scroll-viewport.component';

@Component({
  selector: 'pe-chat',
  styleUrls: ['./chat.component.scss'],
  templateUrl: './chat.component.html',
  animations: [
    trigger('showBadgeAnimation', [
      state('show', style({
        opacity: 1,
      })),
      state('hidden', style({
        opacity: 0,
      })),
      transition('show => hidden', [
        animate('1s'),
      ]),
      transition('hidden => show', [
        animate('.2s'),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeChatComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  static readonly ngAcceptInputType_scrollBottom: PeBooleanInput;

  protected destroyed$ = new ReplaySubject<boolean>();
  protected _showScrollButton = false;
  stopScroll = false;
  messageScrolled = new Subject();
  showDateTag = false;
  dateTag;

  isLiveChat = this.peMessageAppService.isLiveChat;

  @Input() shown$: Observable<boolean> = of(true);
  noMessagesPlaceholder = 'message-app.chat-room.placeholder.no_chat_rooms';
  @Input() bgColor = '#131414';
  @Input() blurValue = '';
  @Input() messagesBottomColor = '';

  get pinCount(){
    return this.peMessageAppService.selectedChannel.pinnedMessageObj.length;
  }

  @Output() unpinAllMessages = new EventEmitter<void>();

  get scrollBottom() {
    return this._showScrollButton;
  };

  set scrollBottom(value: boolean) {
    this._showScrollButton = value;
  }

  _virtualFor: VirtualForDirective;
  @ViewChild(VirtualScrollViewportComponent) viewport: VirtualScrollViewportComponent;

  @ContentChild(VirtualForDirective) set virtualFor(virtualFor: VirtualForDirective) {
    this._virtualFor = virtualFor;
  }

  get virtualFor() {
    return this._virtualFor;
  }

  @ViewChild('scrollable') scrollable: ElementRef;
  @ViewChild('messageContainer') messageContainer: ElementRef;
  @ContentChildren(PeChatMessageComponent) messages: QueryList<PeChatMessageComponent>;
  @ContentChild(PeChatHeaderComponent) headerForm: PeChatHeaderComponent;
  @ContentChild(PeChatFormComponent) chatForm: PeChatFormComponent;

  @HostBinding('class.show') show = false;
  @HostBinding('class.pe-chat') peChat = true;

  headerFormCaptured = false;
  scrollPosition: ChatScrollPosition = {} as ChatScrollPosition;

  constructor(
    private matIconRegistry: MatIconRegistry,
    private chatService: ChatScrollService,
    private domSanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef,
    private scrollDispatcher: ScrollDispatcher,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    public peMessageAppService: PeMessageAppService,
  ) {
    Object.entries(ChatIcons).forEach(([name, path]) => {
      const cdnNames = ['arrow-down', 'arrow-left', 'sent-tick', 'read-tick', 'close', 'pending'];

      const processedPath = cdnNames.includes(name)
        ? `${this.env.custom.cdn}/icons-messages/chat/${path}`
        : `./assets/icons/${path}`;

      this.matIconRegistry.addSvgIcon(
        name,
        this.domSanitizer.bypassSecurityTrustResourceUrl(processedPath),
      );
    });
    this.messageScrolled.pipe(
      map(() => {
        this.showDateTag = true;
        this.cdr.detectChanges();
      }),
      debounceTime(1000),
      map(() => {
        this.showDateTag = false;
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
    this.chatService.setInputItems$.pipe(
      delay(1),
      filter(items => Boolean(items && this.virtualFor)),
      tap((items) => {
        this.viewport.items$.next(items);
        this.viewport.itemTemplate = this.virtualFor.template;
        this.viewport.attachView(this.virtualFor.viewContainerRef);
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  onScroll($event) {
    const { scrollHeight, scrollTop } = $event.target;
    this.scrollBottom = scrollHeight > scrollTop + document.body.offsetHeight;
  }

  scrollIndexChange() {
    this.chatService.scrollChange$.next();
  }

  ngOnInit() {
    this.shown$.pipe(
      tap((data) => {
        this.show = data;
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.chatService.scrollToMessage$.pipe(
      tap((repliedMessage: PeChatMessage) => {
        this.navigateToMessage(repliedMessage);

      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  firstItemIndexChange(index) {
    if (this.viewport?.items) {
      const firstItemDate = this.viewport.items[index]?.createdAt ?? this.viewport.items[index]?.sentAt;
      this.dateTag = firstItemDate ? this.dateSeparator(firstItemDate) : null;
    }
  }

  private dateSeparator(dateString: Date) {
    const date = new Date(dateString);

    return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  };

  ngAfterViewInit(): void {
    this.scrollDispatcher.scrolled().pipe(
      tap(() => {
        this.messageScrolled.next();
      }),
      map(event => this.viewport.virtualScroll.measureScrollOffset('bottom') < 20),
      tap((event) => {
        this.scrollBottom = !event;
        this.cdr.detectChanges();
      })
      ).subscribe();

      this.scrollDispatcher
      .scrolled()
      .pipe(
        tap(() => this.messageScrolled.next()),
        map(() => this.checkLastMessageScrollOffset()),
        takeUntil(this.destroyed$)
      )
      .subscribe();
  }

  private checkLastMessageScrollOffset() {
    const messagesElems = document.querySelectorAll('.message-container');
    let offset = 0;
    if (messagesElems?.length) {
      const lastElem = messagesElems[messagesElems.length - 1] as HTMLElement;
      offset = lastElem.offsetHeight;
    }

    return this.viewport.virtualScroll.measureScrollOffset('bottom') > offset + 20;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.headerForm && !this.headerFormCaptured) {
      this.headerFormCaptured = true;
      this.headerForm.showPinnedMessage.pipe(
        tap((pinnedMessage: PeChatMessage) => {
          this.navigateToMessage(pinnedMessage);
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    }
  }

  navigateToMessage(message) {
    this.viewport.virtualScroll.scrollToIndex(this.findMessageIndex(message._id, this.viewport.items));
    this.peMessageAppService.triggerMessageHighlight(message);
  }

  backToChat(): void {
    this.peMessageAppService.showPinnedMessageList = false;
    this.cdr.detectChanges();
  }

  unpinAllMessage() {
    this.unpinAllMessages.emit();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  scrollListBottom(): void {
    this.viewport.virtualScroll.scrollTo({ bottom: 0 });
  }

  public findMessageIndex(messageId, messages) {
    let indexFound = 0;
    messages.forEach((element, index) => {
      if (element._id === messageId) {
        indexFound = index;
      }
    });

    return indexFound;
  }
}
