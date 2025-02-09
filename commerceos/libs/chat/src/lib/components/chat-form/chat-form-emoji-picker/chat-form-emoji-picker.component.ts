import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject, Observable, Subscription, timer } from 'rxjs';
@Component({
  selector: 'pe-chat-form-emoji-picker',
  styleUrls: ['./chat-form-emoji-picker.component.scss'],
  templateUrl: './chat-form-emoji-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void <=> *', animate('300ms')),
    ]),
  ],
})
export class PeChatFormEmojiPickerComponent implements OnDestroy, OnInit {
  @Input() messageAppColor = '';
  @Input() accentColor = '';
  @Input() isLiveChat = false;
  @Input() blurMode = '';

  @Output() addEmoji = new EventEmitter();
  @ViewChild('emojiPickerContainer') emojiPickerContainer: ElementRef;
  @ViewChild('emojiPickerButton') emojiPickerButton: ElementRef;

  private openByClick = false;
  private closeTimer: Subscription;
  private emojiMenuOpenSubject = new BehaviorSubject<boolean>(false);
  public emojiMenuOpen$: Observable<boolean> = this.emojiMenuOpenSubject.asObservable();

  constructor(
    private elementRef: ElementRef,
  ) { }

  ngOnInit(): void {
    const root = this.elementRef.nativeElement.getRootNode();
    root.addEventListener('click', (event: MouseEvent) => this.onRoodClick(event));
  }

  toggleEmojiMenu() {
    this.emojiMenuOpenSubject.next(!this.emojiMenuOpenSubject.value);
  }

  showEmojiMenu() {
    this.emojiMenuOpenSubject.next(true);
  }

  openEmojiBackdrop() {
    this.openByClick = true;
    this.emojiMenuOpenSubject.next(true);
    this.cancelCloseTimer();
  }

  closeEmojiMenu() {
    this.emojiMenuOpenSubject.next(false);
    this.openByClick = false;
  }

  onAddEmoji(event: { emoji: string }) {
    this.addEmoji.emit({ emoji: event.emoji });
  }

  startCloseTimer() {
    if (!this.openByClick) {
      this.closeTimer = timer(600).subscribe(() => {
        this.emojiMenuOpenSubject.next(false);
      });
    }
  }

  cancelCloseTimer() {
    if (this.closeTimer) {
      this.closeTimer.unsubscribe();
      this.closeTimer = null;
    }
  }

  ngOnDestroy() {
    this.cancelCloseTimer();
  }

  showEmoji = (emoji: string) => {
    return emoji !== '263A-FE0F';
  };

  private onRoodClick(event: MouseEvent) {
    if (this.emojiPickerContainer && this.emojiPickerButton) {
      const emojiPickerContainer = this.emojiPickerContainer.nativeElement;
      const emojiPickerButton = this.emojiPickerButton.nativeElement;
      if (!emojiPickerContainer.contains(event.target) && !emojiPickerButton.contains(event.target)) {
        this.closeEmojiMenu();
      }
    }
  }
}
