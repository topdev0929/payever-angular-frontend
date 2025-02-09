import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'pe-payment-option',
  templateUrl: 'payment-option.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PaymentOptionComponent {
  private uuid: string;
  @Input() iconPng: string;
  @Input() title: string;
  @Input() linkTitle: string;
  @Input() hasSwitch: boolean;
  @Input() switchOn: boolean;
  @Output('onSwitchToggle') switchToggleEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output('onLinkClick') linkClickEvent: EventEmitter<Event> = new EventEmitter<Event>();

  constructor() {
    this.uuid = uuid() + '-switch';
  }

  onSwitchToggle(e: Event) {
    this.switchToggleEvent.emit( (<HTMLInputElement>e.target).checked );
  }

  onLinkBtnClick(e: Event) {
    this.linkClickEvent.emit(e)
  }
}


