import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  Renderer2,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import {
  NavbarControlInterface,
  TextControlInterface
} from '@pe/forms-core/form-core/components/info-box/navbar-control.interface';

const isTouchDevice: () => boolean = require('is-touch-device');

@Component({
  // tslint:disable-next-line component-selector
  selector: 'pe-channel-settings-box',
  templateUrl: './channel-settings-box.component.html',
  styleUrls: ['./channel-settings-box.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ChannelSettingsBoxComponent implements AfterViewInit {

  @Input() allowSettingsManualScroll: boolean = true;
  @Input() boxTitle: string;
  @Input() backgroundColor: string;
  @Output() clickedButton = new EventEmitter();
  @ViewChild('scrollingWrapper') scrollingWrapper: ElementRef;
  @ViewChild('scrollingContent', { static: true }) scrollingContent: ElementRef;
  @ViewChild('scrollingToolbar', { read: ElementRef, static: true }) scrollingToolbar: ElementRef;

  settingsScroll$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  isScrolling: boolean = false;
  modalHeaderControls: NavbarControlInterface[];

  private startSwipeValue: number = 0;
  private swipeValue: number = 0;

  constructor(private activatedRoute: ActivatedRoute,
              private renderer: Renderer2,
  ) {
  }

  get maxPanValue(): number {
    return this.scrollingToolbar.nativeElement.scrollWidth
      + 24 // margin
      - this.scrollingToolbar.nativeElement.offsetWidth;
  }

  ngOnInit(): void {
    this.modalHeaderControls = [
      {
        classes: '',
        position: 'center',
        type: 'text',
        text: this.boxTitle
      } as TextControlInterface
    ];
  }

  ngAfterViewInit(): void {
    // tslint:disable:max-line-length
    // DOMMouseScroll
    const handler = (event: WheelEvent) => { // Scroll on notebook horizontal touchpad

      event.stopPropagation();
      event.preventDefault();

      const isMouseWheel: boolean = Math.abs(event.deltaY) > 20;

      if (isMouseWheel) {
        // Mouse wheel scroll up, content scrolled to the right
        const scrollingValue: number = 40;
        if ((event.deltaY || event['detail'] || event['wheelDelta'] || event.clientY) < 0) { // 'detail' for FF, wheelDelta for IE
          this.swipeValue += scrollingValue; // + 22; // TODO 22 - margin, find another way
        } else if (event.deltaY) {
          // mouse wheel scroll down, content scrolled to the left
          this.swipeValue -= scrollingValue;
        }
      } else {
        // Scroll horiz via touchpad when mouse cursor is on the block
        const k: number = event.deltaX > 0 ? 1 : -1;
        this.swipeValue += event.deltaX;
      }

      if (this.swipeValue >= 0) {
        this.swipeValue = 0;
      } else if (this.swipeValue < -1 * this.maxPanValue) {
        this.swipeValue = -1 * this.maxPanValue;
      }
      this.renderer.setStyle(this.scrollingWrapper.nativeElement, 'transform', `translateX(${this.swipeValue}px)`);
    };

    this.scrollingContent.nativeElement.addEventListener('mousewheel', handler);
    this.scrollingContent.nativeElement.addEventListener('DOMMouseScroll', handler);
  }

  isTouchDevice(): boolean {
    return isTouchDevice();
  }

  onPanStart(): void {
    this.isScrolling = true;
  }

  onPan(data: { deltaX: number, distance: number; }) {

    if ( !this.allowSettingsManualScroll ) {
      return;
    }
    this.settingsScroll$.next(true);

    const k: number = data.deltaX > 0 ? 1 : -1;
    this.swipeValue = this.startSwipeValue + data.deltaX; // k * data.distance;

    if (k > 0 && this.swipeValue >= 0) {
      this.swipeValue = 0;
    } else if (k < 0 && this.swipeValue < -1 * this.maxPanValue) {
      this.swipeValue = -1 * this.maxPanValue;
    }

    this.renderer.setStyle(this.scrollingWrapper.nativeElement, 'transform', `translateX(${this.swipeValue}px)`);
  }

  onPanEnd(data: any): void {
    this.isScrolling = false;
    this.startSwipeValue = this.swipeValue;
    this.settingsScroll$.next(false);
  }
}
