import { Component, ElementRef, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'pe-notification2-wrapper',
  templateUrl: './notification2-wrapper.component.html',
  styleUrls: ['./notification2-wrapper.component.scss'],
})
export class Notification2WrapperComponent {
  @ViewChild('placeholder', { read: ViewContainerRef, static: true }) placeholder: any;

  constructor(private element: ElementRef) {
    element.nativeElement.classList.add('pe-bootstrap', 'notify2-list', 'notify2-fixed');
  }
}
