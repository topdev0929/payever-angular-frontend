import {
  Output,
  Component,
  OnInit,
  OnDestroy,
  EventEmitter,
  HostListener,
  HostBinding,
  ElementRef,
  ComponentFactoryResolver,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

import { NotificationConfig } from '../notification.config';

@Component({
  selector: 'pe-notification.notify',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  @ViewChild('DynamicComponentPlaceholder', { read: ViewContainerRef, static: true }) DynamicComponentPlaceholder: ViewContainerRef;
  @Output() public close = new EventEmitter();
  public config: NotificationConfig;
  dynamicComponentRef: any;

  @HostBinding('class.notify-warning')
  hasIcon: boolean = false;

  @HostBinding('class.in')
  inAnimate: boolean = false;

  private timer: any;

  constructor(
    private elementRef: ElementRef,
    private componentFactoryResolver: ComponentFactoryResolver ) {}

  setConfig(config: NotificationConfig): void {
    this.config = config;
  }

  ngOnInit(): void {

    if (!this.config) {
      return;
    }

    if (this.config.timeOut !== 0) {
      this.startTimeOut();
    }

    if (this.config.icon) {
      this.hasIcon = true;
    }

    setTimeout(() => this.inAnimate = true, 0);

    this.elementRef.nativeElement.classList.add( this.config.style );

    if( this.config.dynamicComponent ) {
      let componentFactory = this.componentFactoryResolver.resolveComponentFactory( this.config.dynamicComponent );
      this.dynamicComponentRef = this.DynamicComponentPlaceholder.createComponent(componentFactory);
    }
  }

  private startTimeOut(): void {
    this.timer = setTimeout(() => this.remove(), this.config.timeOut);
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

  onCloseClick(): void {
    this.remove();
  }

  private remove() {
    this.close.emit();
  }

  ngOnDestroy(): void {
    if (this.config.timeOut !== 0) {
      clearTimeout(this.timer);
    }
  }
}
