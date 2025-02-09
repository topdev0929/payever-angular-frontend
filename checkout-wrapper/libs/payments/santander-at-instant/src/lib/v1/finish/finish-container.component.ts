import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
} from '@angular/core';
import { tap } from 'rxjs/operators';

import { AbstractFinishContainerComponent } from '@pe/checkout/finish';

import { FinishComponent, PaymentResponse } from '../../shared';

@Component({
  selector: 'pe-santander-at-instant-finish-container',
  templateUrl: './finish-container.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [FinishComponent],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent<PaymentResponse>
  implements OnInit {

  @Input() asSinglePayment = false;

  override showFinishModalFromExistingPayment(): void {
    super.showFinishModalFromExistingPayment();

    if (this.paymentResponse) {
      this.nodeFlowService.updatePayment<PaymentResponse>().pipe(
        tap((response) => {
          this.paymentResponse = response;
          this.cdr.detectChanges();
        }, (err) => {
          this.errorMessage = err.message || $localize `:@@error.unknown_error:`;
          this.cdr.detectChanges();
        }),
      ).subscribe();
    }
  }
}
