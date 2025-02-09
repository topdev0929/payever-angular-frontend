import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
} from '@angular/core';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { AbstractFinishContainerComponent } from '@pe/checkout/finish';
import { PaymentState } from '@pe/checkout/store';

import { NodePaymentDetailsResponseInterface } from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'paypal-finish-container',
  templateUrl: './finish-container.component.html',
  styleUrls: ['./finish-container.component.scss'],
})
export class FinishContainerComponent
  extends AbstractFinishContainerComponent<NodePaymentDetailsResponseInterface>
  implements OnInit {

  @Input() asSinglePayment = false;

  public processed = this.activatedRoute.snapshot.queryParams.processed;

  ngOnInit(): void {
    super.ngOnInit();

    this.store.select(PaymentState.error).pipe(
      filter(v => Boolean(v)),
      tap((error) => {
        if (error.code === 409) {
          const reference = `<strong>${this.flow?.reference}</strong>`;
          this.errorMessage = $localize `:@@payment-paypal.errors.duplicate_invoice:${reference}:reference:`;
        }
        this.cdr.markForCheck();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  showFinishModalFromExistingPayment(): void {
    if (!this.paymentResponse) {
      this.errorMessage = this.store.selectSnapshot(PaymentState.error).message;
      this.cdr.markForCheck();
    }

    if (!this.errorMessage) {
      this.nodeFlowService.updatePayment<NodePaymentDetailsResponseInterface>().subscribe((payment) => {
        this.paymentResponse = this.nodeFlowService.getFinalResponse<NodePaymentDetailsResponseInterface>();
        this.processed = false;
        this.cdr.markForCheck();
      }, (err) => {
        this.errorMessage = err.message || 'Unknown error';
        this.processed = false;
        this.cdr.markForCheck();
      });
    }
  }
}
