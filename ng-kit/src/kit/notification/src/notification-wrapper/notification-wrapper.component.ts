import { Component, ElementRef, HostBinding, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { PositionType } from '../notification.config';

@Component({
  selector: 'pe-notification-wrapper',
  templateUrl: './notification-wrapper.component.html',
  styleUrls: ['./notification-wrapper.component.scss']
})
export class NotificationWrapperComponent {
  @ViewChild('placeholder', { read: ViewContainerRef, static: true }) placeholder: any;

  @HostBinding('attr.data-position')
  @Input() position: PositionType;

  constructor(private element: ElementRef) {
    element.nativeElement.classList.add('pe-bootstrap');
  }
}
