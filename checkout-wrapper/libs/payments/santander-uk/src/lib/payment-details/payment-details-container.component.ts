import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';

import { BaseContainerComponent } from '../shared';


@Component({
  selector: 'payment-details-container',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDetailsContainerComponent
  extends BaseContainerComponent
  implements OnInit {

  @Output() continue = new EventEmitter<void>();

  ngOnInit(): void {
    this.continue.emit();
  }
}
