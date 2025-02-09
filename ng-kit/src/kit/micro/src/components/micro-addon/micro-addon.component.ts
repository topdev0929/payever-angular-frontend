import {
  Component,
  ElementRef,
  HostBinding,
  OnChanges,
  OnInit,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  SimpleChange,
  AfterViewInit
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbstractComponent } from '../../../../common/src/components';

import { MicroMessage } from '../../types';
import { MessageBusService } from '../../services/message-bus.service';

@Component({
  selector: 'pe-micro-addon',
  templateUrl: 'micro-addon.component.html'
})
export class MicroAddonComponent extends AbstractComponent implements OnInit, OnChanges, AfterViewInit {

  iframeSrc: SafeUrl;

  @HostBinding('class.fullscreen') get isFullscreen(): boolean {
    return this.isInFullscreen;
  }

  set isFullscreen(isFullscreen: boolean) {
    this.isInFullscreen = isFullscreen;
  }

  @HostBinding('class.addon-hidden') isForceHidden: boolean = false;
  @HostBinding('class.pe-micro-addon') hostClass: boolean = true;

  @Input('url') set setIframeSrc(url: string) {
    this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  @Input('bindings') bindings: MicroMessage[];
  @Input('isReady') isReady: boolean = false;
  @Input('isFitToOffsetSize') isFitToOffsetSize: boolean = false;

  @Input('borderTopLeftRadius') borderTopLeftRadius: number = 0;
  @Input('borderTopRightRadius') borderTopRightRadius: number = 0;
  @Input('borderBottomLeftRadius') borderBottomLeftRadius: number = 0;
  @Input('borderBottomRightRadius') borderBottomRightRadius: number = 0;

  @Output() message: EventEmitter<MicroMessage> = new EventEmitter<MicroMessage>();
  @Output() load: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('iframe', { static: true }) iframe: ElementRef;
  @ViewChild('iframeWrapper', { static: true }) iframeWrapper: ElementRef;

  @Input('forceHeight') set setForceHeight(height: number) {
    if (height > 0 && this.iframeWrapper && this.iframeWrapper.nativeElement) {
      this.iframeWrapper.nativeElement.style.height = `${height}px`;
    }
  }
  @Input('forceMaxHeight') set setForceMaxHeight(height: number) {
    if (height > 0 && this.iframeWrapper && this.iframeWrapper.nativeElement) {
      this.iframeWrapper.nativeElement.style.maxHeight = `${height}px`;
    }
  }
  @Input('isForceHidden') set setIsForceHidden(hidden: boolean) {
    this.isForceHidden = hidden;
  }

  private isInFullscreen: boolean = false;

  constructor(
    private sanitizer: DomSanitizer,
    private messageBusService: MessageBusService
  ) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const isReadyChange: SimpleChange = changes['isReady'];
    const bindingsChange: SimpleChange = changes['bindings'];

    const bindings = bindingsChange && bindingsChange.currentValue || this.bindings;

    if (isReadyChange && !isReadyChange.previousValue && isReadyChange.currentValue) {
      this.sendBindings(bindings);
    } else if (bindingsChange && this.isReady) {
      this.sendBindings(bindings);
    }
  }

  ngOnInit(): void {
    this.messageBusService.observe().pipe(
      takeUntil(this.destroyed$))
      .subscribe((message: MicroMessage) => this.message.emit(message));

    this.messageBusService.observe('fullscreen', 'on').pipe(
      takeUntil(this.destroyed$))
      .subscribe(() => this.isFullscreen = true);

    this.messageBusService.observe('fullscreen', 'off').pipe(
      takeUntil(this.destroyed$))
      .subscribe(() => this.isFullscreen = false);
  }

  ngAfterViewInit(): void {
    fromEvent(this.iframe.nativeElement, 'load')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.load.emit();
      });
  }

  protected sendBindings(bindings: MicroMessage[]): void {
    if (this.isReady) {
      bindings.map((binding: MicroMessage) => {
        this.sendToIframe(binding);
      });
    }
  }

  protected sendToIframe(message: MicroMessage): void {
    this.messageBusService.send(this.iframe.nativeElement.contentWindow, message.channel, message.event, message.data);
  }

}
