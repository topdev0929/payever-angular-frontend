import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { PaymentOptionsListItem } from './payment-options-list.interface';

@Component({
  selector: 'pe-payment-options-list',
  templateUrl: 'payment-options-list.component.html',
  styleUrls: ['payment-options-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class PaymentOptionsListComponent {
  @Input() itemsList: PaymentOptionsListItem[];
  @Output('selectItemEvent') selectItemEvent: EventEmitter<PaymentOptionsListItem> = new EventEmitter();

  onSelect(item: PaymentOptionsListItem) {
    this.selectItemEvent.emit(item);
  }
}


