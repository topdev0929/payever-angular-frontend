import {
  Output, Input, Component, ElementRef, OnInit, OnDestroy, EventEmitter, HostListener, HostBinding,
  AfterViewInit
} from '@angular/core';
import {Notification2Config} from '../notification2.config';

declare const $: any;

@Component({
  selector: 'pe-notification2.notify2',
  templateUrl: './notification2.component.html'
})
export class Notification2Component implements OnInit, AfterViewInit, OnDestroy {

  public config: Notification2Config;

  @Input() timeN: string;
  @Input() titleN: string;
  @Input() descriptionN: string;
  @Input() iconN: string;
  @Input() timeOut: number;
  @Input() openURL: string;
  @Input() openText: string;
  @Input() skipText: string;
  @Input() headerText: string;
  @Input() headerImg: string;
  @Input() settings: boolean;

  @Output() public close: EventEmitter <string> = new EventEmitter();
  @Output() public open: EventEmitter <string> = new EventEmitter();
  @Output() public skip: EventEmitter <string> = new EventEmitter();
  @Output() onSettings: EventEmitter <string> = new EventEmitter();

  private timer: any;

  constructor(private elementRef: ElementRef) {
  }

  @HostBinding('class.in')
  inAnimate: boolean = false;

  setConfig(config: Notification2Config) {
    this.config = config;
  }

  ngOnInit(): void {
    if (!this.config) {
      return;
    } else {
      this.timeN = this.config.timeN;
      this.titleN = this.config.titleN;
      this.descriptionN = this.config.descriptionN;
      this.iconN = this.config.iconN;
      this.timeOut = this.config.timeOut;
      this.openURL = this.config.openURL;
      this.openText = this.config.openText;
      this.skipText = this.config.skipText;
      this.headerText = this.config.headerText;
      this.headerImg = this.config.headerImg;
      this.settings = this.config.settings;
    }

    if (this.timeOut !== 0) {
      this.startTimeOut();
    }
    setTimeout(() => this.inAnimate = true, 0);
  }

  ngAfterViewInit() {
    let _that = this.elementRef.nativeElement;
    $(_that).on('drag', '.notify2-text, .notify2-img', function( e: any ) {
      if (e.orientation === 'horizontal' ) {
        if (e.direction === -1 ) {
          $(_that).addClass('notify2-swiped');
        }
        else {
          $(_that).removeClass('notify2-swiped');
        }
      }
    });
  }

  @HostListener('mouseenter')
  onEnter(): void {
    if (this.config && this.timeOut !== 0) {
      clearTimeout(this.timer);
    }
  }

  @HostListener('mouseleave')
  onLeave(): void {
    if (this.config && this.timeOut !== 0) {
      this.startTimeOut();
    }
  }

  onOpenClick(u: string): void {
    this.open.emit();
    window.location.href = u;
  }

  onCloseClick(): void {
    this.skip.emit();
  }

  onSettingsClick(): void {
    this.onSettings.emit('complete');
  }

  ngOnDestroy(): void {
    if (this.timeOut !== 0) {
      clearTimeout(this.timer);
    }
  }

  private startTimeOut(): void {
    this.timer = setTimeout(() => this.remove(), this.timeOut);
  }

  private remove(): void {
    let _that = this;
    $(this.elementRef.nativeElement).fadeTo( 300 , 0, function(th: any = _that) {
      th.close.emit();
      $(this).remove();
    });
  }

}
