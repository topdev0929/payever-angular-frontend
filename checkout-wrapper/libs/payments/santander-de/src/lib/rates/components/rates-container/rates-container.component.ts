import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  OnInit,
} from '@angular/core';

import { TrackingService } from '@pe/checkout/api';
import { AbstractPaymentContainerComponent, PaymentSubmissionService } from '@pe/checkout/payment';
import { RateSummaryInterface, TimestampEvent } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'santander-de-rates-container',
  templateUrl: './rates-container.component.html',
  providers: [PeDestroyService],
})
export class RatesContainerComponent extends AbstractPaymentContainerComponent implements OnInit {

  @Output() selectRate = new EventEmitter<RateSummaryInterface>();
  @Output() continue = new EventEmitter<TimestampEvent>();
  @Output() buttonText = new EventEmitter<string>();

  private submit$ = this.injector.get(PaymentSubmissionService);
  private trackingService = this.injector.get(TrackingService);

  ngOnInit(): void {
    this.buttonText.emit($localize `:@@actions.continue:`);
    super.ngOnInit();
  }

  public triggerSubmit(): void {
    this.submit$.next();
  }

  protected onSelectRate(rate: RateSummaryInterface): void {
    this.selectRate.emit(rate);
  }

  protected onSubmitted(): void {
    this.trackingService?.doEmitRateStepPassed(this.flow.id, this.paymentMethod);
    this.continue.next();
  }
}
