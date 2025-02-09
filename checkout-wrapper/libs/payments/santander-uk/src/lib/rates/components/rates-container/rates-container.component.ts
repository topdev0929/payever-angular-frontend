import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';

import { PaymentSubmissionService } from '@pe/checkout/payment';
import {
  RateSummaryInterface,
  TimestampEvent,
} from '@pe/checkout/types';
import { PeCurrencyPipe } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import {
  BaseContainerComponent,
  FormInterface,
  RateInterface,
} from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
  selector: 'santander-uk-inquiry-container',
  templateUrl: './rates-container.component.html',
  styles: [`
    iframe {
      height: 112px;
      border: none;
      width: 100%;
    }
  `],
})
export class RatesContainerComponent
  extends BaseContainerComponent
  implements OnInit {

  @Input() showCloseButton: boolean;

  @Output() selectRate = new EventEmitter<RateSummaryInterface>();
  @Output() ratesLoading = new EventEmitter<boolean>();
  @Output() continue = new EventEmitter<TimestampEvent>();
  @Output() buttonText = new EventEmitter<string>();

  protected currencyPipe = this.injector.get(PeCurrencyPipe);
  private submit$ = this.injector.get(PaymentSubmissionService);

  ngOnInit(): void {
    this.buttonText.next($localize `:@@payment-santander-uk.actions.pay:`);
  }

  triggerSubmit(): void {
    this.submit$.next();
  }

  onSelectRate(rate: RateInterface): void {
    if (this.flow && rate) {
      const monthlyPaymentStr: string = this.currencyPipe.transform(rate.monthlyPayment, this.flow.currency, 'symbol');
      const durationStr: string = rate.duration > 1
        ? $localize `:@@payment-santander-uk.credit_rates.months:`
        : $localize `:@@payment-santander-uk.credit_rates.month:`;
      const duration = `${rate.duration} ${durationStr}`;
      const downPayment = rate.specificData?.downPayment;
      const rateInfo: RateSummaryInterface = {
        chooseText: null, // Not needed
        totalAmount: rate.totalCreditCost,
        downPayment,
      };

      let chooseText: string = null;
      chooseText = $localize `:@@payment-santander-uk.credit_rates.actions.rate_choose_summary:\
        ${monthlyPaymentStr}:monthlyPayment:\
        ${duration}:duration:`;

      this.nodeFlowService.assignPaymentDetails(
        { rate },
      );

      this.selectRate.emit(rateInfo);
      this.buttonText.next(chooseText);
    } else {
      this.selectRate.emit(null);
      this.buttonText.next($localize `:@@payment-santander-uk.credit_rates.error.rates_list_empty:`);
    }
  }

  onRatesLoadingError(isError: boolean): void {
    if (isError) {
      this.selectRate.emit(null);
      this.buttonText.next($localize `:@@payment-santander-uk.actions.try_again:`);
    }
  }

  onSend(formData: FormInterface): void {
    this.sendPaymentData(formData);
    this.continue.next();
  }

  protected sendPaymentData(formData: FormInterface): void {
    const { _deposit_view, ...nodePaymentDetails } = formData;
    this.nodeFlowService.setPaymentDetails(nodePaymentDetails);
  }
}
