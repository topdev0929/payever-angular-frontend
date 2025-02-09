import { Component, ElementRef, EventEmitter, Input, Output, OnInit, OnDestroy, HostListener } from '@angular/core';
import { NotificationItemConfig, NotificationItemDefaultConfig } from '../notification.config';

@Component({
  selector: 'pe-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss']
})
export class NotificationItemComponent implements OnInit, OnDestroy {
  @Input('config') set configInput(config: NotificationItemConfig) {
    this.config = Object.assign({}, NotificationItemDefaultConfig, config);
  }
  @Input() isStandalone: boolean;
  public config: NotificationItemConfig;
  @Output() public close: EventEmitter<any> = new EventEmitter();
  @Output() public clicked: EventEmitter<any> = new EventEmitter<NotificationItemComponent>();
  inClassShown: boolean = false;

  private timer: any;

  constructor( private elementRef: ElementRef ) {}

  ngOnInit(): void {
    if (!this.config || this.isStandalone) { return; }
    if (this.config.timeOut !== 0) {
      this.startTimeOut();
    }

    setTimeout(() => this.inClassShown = true, 0);
  }

  setConfig(config: NotificationItemConfig): void {
    this.config = config;
  }

  @HostListener('mouseenter')
  onEnter(): void {
    if (this.config && this.config.timeOut !== 0) {
      clearTimeout(this.timer);
    }
  }

  @HostListener('mouseleave')
  onLeave(): void {
    if (this.config && this.config.timeOut !== 0) {
      this.startTimeOut();
    }
  }

  onCloseClick(event: Event): void {
    event.stopPropagation();
    this.remove();
  }

  onClick(): void {
    this.clicked.emit(this);
  }

  ngOnDestroy(): void {
    if (this.config.timeOut !== 0) {
      clearTimeout(this.timer);
    }
  }

  private remove(): void {
    this.close.emit();
  }

  private startTimeOut(): void {
    this.timer = setTimeout(() => this.remove(), this.config.timeOut);
  }
}
