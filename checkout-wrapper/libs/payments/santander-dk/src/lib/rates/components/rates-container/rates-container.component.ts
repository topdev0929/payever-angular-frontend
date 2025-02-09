import { Component, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';
import { Subject } from 'rxjs';

import { ApiService, TrackingService } from '@pe/checkout/api';
import { AbstractContainerComponent, PaymentSubmissionService } from '@pe/checkout/payment';
import { FinanceTypeEnum, RateSummaryInterface, TimestampEvent } from '@pe/checkout/types';
import { LocaleConstantsService, PeCurrencyPipe } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { FormValue, RateInterface } from '../../../shared';
import { getPaymentPeriod } from '../../utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ PeCurrencyPipe, PeDestroyService ],
  selector: 'santander-dk-rates-container',
  templateUrl: './rates-container.component.html',
})
export class RatesContainerComponent extends AbstractContainerComponent {

  @Output() selectRate: EventEmitter<RateSummaryInterface> = new EventEmitter();
  @Output() continue: EventEmitter<TimestampEvent> = new EventEmitter();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();
  @Output() helpText: EventEmitter<string> = new EventEmitter();
  @Output() panelOpened: EventEmitter<number> = new EventEmitter();
  @Output() ratesLoading: EventEmitter<boolean> = new EventEmitter();

  doSubmit$: Subject<void> = new Subject();

  protected apiService = this.injector.get(ApiService);
  protected currencyPipe = this.injector.get(PeCurrencyPipe);
  protected localeConstantsService = this.injector.get(LocaleConstantsService);
  private submit$ = this.injector.get(PaymentSubmissionService);
  private trackingService = this.injector.get(TrackingService);

  triggerSubmit(): void {
    this.submit$.next();
  }

  onSelectRate(rate: RateInterface): void {
    if (this.flow && rate) {
      const months = getPaymentPeriod(rate);
      const monthlyCostStr = this.currencyPipe.transform(
        rate.result.monthlyPayment,
        this.flow.currency,
        'symbol',
      );

      const establishmentFeeStr = this.currencyPipe.transform(
        rate.parameters.establishmentFee,
        this.flow.currency,
        'symbol',
      );

      const paymentFreeDurationStr = months > 1
        ? $localize `:@@santander-dk.duration.count_months:${rate.result.paymentFreeDuration}:count:`
        : $localize `:@@santander-dk.duration.one_month:${rate.result.paymentFreeDuration}:count:`;

      const durationStr = months > 1
        ? $localize `:@@santander-dk.duration.count_months:${months}:count:`
        : $localize `:@@santander-dk.duration.one_month:${months}:count:`;

      const rateInfo: RateSummaryInterface = {
        chooseText: null, // Not needed
        totalAmount: rate.result.totalLoanAmount,
        downPayment: 0,
      };

      this.nodeFlowService.assignPaymentDetails({ rate });

      const chooseText = this.flow.financeType === FinanceTypeEnum.FINANCE_CALCULATOR
        ? $localize `:@@santander-dk.credit_rates.actions.rate_choose_summary_finance_calc:\
          ${monthlyCostStr}:monthlyCost:\
          ${durationStr}:duration:`
        : $localize `:@@santander-dk.credit_rates.actions.rate_choose_summary:\
          ${monthlyCostStr}:monthlyCost:\
          ${durationStr}:duration:`;

      const helpText = $localize `:@@santander-dk.credit_rates.rate_help_text:\
        ${paymentFreeDurationStr}:payment_free_duration:\
        ${establishmentFeeStr}:establishment_fee:`;

      this.selectRate.emit(rateInfo);
      this.buttonText.next(chooseText);
      this.helpText.next(rate.payLaterType ? helpText : null);
    } else {
      this.selectRate.emit(null);
      this.buttonText.next(null);
      this.helpText.next(null);
    }
  }

  onSubmitted(formData: FormValue): void {
    this.trackingService?.doEmitRateStepPassed(this.flow.id, this.paymentMethod);
    this.continue.next();
  }
}
