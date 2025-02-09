import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { defer, of } from 'rxjs';

import { AbstractPaymentContainerComponent } from '@pe/checkout/payment';

@Component({
  selector: 'pe-santander-at-instant-inquiry-container',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class InquiryContainerComponent extends AbstractPaymentContainerComponent {
  @Output() continue = new EventEmitter<void>();
  @Output() buttonText = defer(() =>
    of($localize `:@@payment-santander-instant-at.actions.pay:Pay`));

  protected triggerSubmit() {
    this.continue.next();
  }
}
