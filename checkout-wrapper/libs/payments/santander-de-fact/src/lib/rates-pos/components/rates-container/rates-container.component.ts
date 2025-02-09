import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  Output,
  OnInit,
} from '@angular/core';
import { EMPTY } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';

import { ApiService } from '@pe/checkout/api';
import { ModeEnum } from '@pe/checkout/form-utils';
import {
  AbstractChoosePaymentContainerInterface,
  AbstractContainerComponent,
  PaymentSubmissionService,
} from '@pe/checkout/payment';
import { ThreatMetrixService } from '@pe/checkout/tmetrix';
import { RateSummaryInterface, TimestampEvent } from '@pe/checkout/types';
import { PeCurrencyPipe } from '@pe/checkout/utils';
import { prepareData } from '@pe/checkout/utils/prepare-data';
import { PeDestroyService } from '@pe/destroy';

import { RateInterface } from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ PeCurrencyPipe, PeDestroyService ],
  selector: 'santander-de-fact-rates-container',
  templateUrl: './rates-container.component.html',
})
export class RatesContainerComponent
  extends AbstractContainerComponent
  implements OnInit, AbstractChoosePaymentContainerInterface {

  @Input() mode = ModeEnum.View;

  @Input() requestsDocsByRequest = false;

  @Output() selectRate: EventEmitter<RateSummaryInterface> = new EventEmitter();

  @Output() ratesLoading: EventEmitter<boolean> = new EventEmitter();

  @Output() buttonText: EventEmitter<string> = new EventEmitter();

  @Output() continue = new EventEmitter<TimestampEvent>();

  protected apiService = this.injector.get(ApiService);
  protected currencyPipe = this.injector.get(PeCurrencyPipe);
  protected threatMetrixService = this.injector.get(ThreatMetrixService);
  private submit$ = this.injector.get(PaymentSubmissionService);

  ngOnInit(): void {
    this.analyticsFormService.initPaymentMethod(this.paymentMethod);

    this.threatMetrixService.nodeInitFor(
      this.flow.id,
      this.flow.connectionId,
      this.paymentMethod,
    ).pipe(
      catchError(() => EMPTY),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  public triggerSubmit(): void {
    this.submit$.next();
  }

  public onSelectRate(rate: RateInterface): void {
    if (rate) {
      const monthlyRateStr = this.currencyPipe.transform(rate.monthlyPayment, this.flow.currency, 'symbol');

      const durationStr = rate.duration > 1
        ? $localize `:@@credit_rates.months:`
        : $localize `:@@credit_rates.month:`;

      const chooseText = $localize `:@@credit_rates.action.rate_choose_summary:${monthlyRateStr}:total:${rate.duration}:duration:${durationStr}:months:`;
      const rateInfo: RateSummaryInterface = {
        chooseText: null, // Not needed
        totalAmount: rate.totalCreditCost,
        downPayment: 0,
      };

      this.selectRate.emit(rateInfo);
      this.buttonText.next(chooseText);
    } else {
      const chooseText = $localize `:@@credit_rates.action.select_rate:`;
      const rateInfo: RateSummaryInterface = {
        chooseText: null, // Not needed
        totalAmount: null,
        downPayment: 0,
      };

      this.selectRate.emit(rateInfo);
      this.buttonText.next(chooseText);
    }
  }

  public submit(formData: any): void {
    this.nodeFlowService.assignPaymentDetails(prepareData(formData));
    this.continue.emit();
  }
}
