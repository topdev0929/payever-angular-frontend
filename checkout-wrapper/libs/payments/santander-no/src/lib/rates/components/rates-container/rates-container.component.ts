import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  Output,
  OnInit,
} from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';

import { PaymentSubmissionService } from '@pe/checkout/payment';
import { ForceOpenFinishStep } from '@pe/checkout/store';
import {
  FinanceTypeEnum,
  RateSummaryInterface,
  TimestampEvent,
  FlowStateEnum,
  PaymentSpecificStatusEnum,
  ResponseErrorsInterface,
  NodeShopUrlsInterface,
} from '@pe/checkout/types';
import { LocaleConstantsService, PeCurrencyPipe } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import {
  BaseContainerComponent,
  RateInterface,
  NodePaymentResponseDetailsInterface,
  RatesFormInterface,
} from '../../../shared';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeCurrencyPipe, PeDestroyService],
  selector: 'santander-no-rates-container',
  templateUrl: './rates-container.component.html',
})
export class RatesContainerComponent extends BaseContainerComponent implements OnInit {

  @Input() sendPaymentOnSubmit = true;

  @Output() selectRate = new EventEmitter<RateSummaryInterface>();

  @Output() continue = new EventEmitter<TimestampEvent>();

  @Output() buttonText = new EventEmitter<string>();

  isSendingPayment = false;
  errorMessage: string;

  protected currencyPipe = this.injector.get(PeCurrencyPipe);
  protected localeConstantsService = this.injector.get(LocaleConstantsService);
  private submit$ = this.injector.get(PaymentSubmissionService);

  ngOnInit() {
    super.ngOnInit();
    this.trackingService.doEmitPaymentStepReached(this.flow.id, this.paymentMethod, 0);

    if (this.isNeedMoreInfo()) {
      this.nodeResult = null;
    }
  }

  triggerSubmit(): void {
    this.submit$.next();
  }

  onSelectRate(rate: RateInterface): void {
    if (this.flow && rate) {
      const monthlyAmountStr: string = this.currencyPipe.transform(
        rate.monthlyAmount,
        this.flow.currency,
        'symbol-narrow'
      );
      const durationStr: string = rate.duration > 1
        ? $localize`:@@santander-no.duration.count_months:${rate.duration}:count:`
        : $localize`:@@santander-no.duration.one_month:${rate.duration}:count:`;

      const rateInfo: RateSummaryInterface = {
        chooseText: null, // Not needed
        totalAmount: rate.creditPurchase,
        downPayment: 0,
      };

      let chooseText: string = null;
      if (!rate.isFixedAmount) {
        chooseText = rate.description;
      } else {
        chooseText = this.flow.financeType === FinanceTypeEnum.FINANCE_CALCULATOR
          ? $localize`:@@santander-no.credit_rates.actions.rate_choose_summary_finance_calc:\
            ${monthlyAmountStr}:monthly_amount:\
            ${durationStr}:duration:`
          : $localize`:@@santander-no.credit_rates.actions.rate_choose_summary:\
            ${monthlyAmountStr}:monthly_amount:\
            ${durationStr}:duration:`;
      }

      this.selectRate.emit(rateInfo);
      this.buttonText.next(chooseText);
    }
  }

  onRatesLoadingError(isError: boolean): void {
    if (isError) {
      this.selectRate.emit(null);
      this.buttonText.next($localize`:@@santander-no.action.try_again:`);
    }
  }

  isFlowHasPayment(): boolean {
    return Boolean(this.flow && this.nodeFlowService.getFinalResponse<any>());
  }

  isFlowHasPaymentOrFinished(): boolean {
    return this.isFlowHasPayment()
      || Boolean(this.flow
        && [FlowStateEnum.FINISH, FlowStateEnum.CANCEL].indexOf(this.flow.state) >= 0);
  }

  onSubmitted(formData: RatesFormInterface): void {
    if (this.sendPaymentOnSubmit) {
      this.sendPaymentData(formData).pipe(
        take(1),
        switchMap(() => this.postPayment()),
      ).subscribe();
    } else {
      // For payment widgets in shop
      this.trackingService?.doEmitRateStepPassed(this.flow.id, this.paymentMethod);
      this.continue.next();
    }
  }

  protected sendPaymentData(formData: unknown): Observable<NodeShopUrlsInterface> {
    return this.nodeFlowService.assignPaymentDetails(formData).pipe(
      switchMap(() => this.preparePayment()),
    );
  }

  protected onPostPaymentSuccess(): void {
    if (this.isNeedMoreInfo()) {
      this.continue.next();
    }

  }

  protected postPayment(): Observable<any> {
    if (this.isSendingPayment) {
      return EMPTY;
    }

    this.errors = null;
    this.errorMessage = null;
    this.isSendingPayment = true;
    this.onLoading.next(true);
    this.store.dispatch(new ForceOpenFinishStep());
    this.cdr.detectChanges();

    return this.nodeFlowService.postPayment<NodePaymentResponseDetailsInterface>().pipe(
        tap((nodePaymentResponse) => {
          if (nodePaymentResponse) {
            this.nodeResult = nodePaymentResponse;
            this.trackingService?.doEmitRateStepPassed(this.flow.id, this.paymentMethod);
            if (
              nodePaymentResponse.payment?.specificStatus ===
              PaymentSpecificStatusEnum.STATUS_APPROVED &&
              nodePaymentResponse.paymentDetails?.applicantSignReferenceUrl
            ) {
              window.top.location.href =
                nodePaymentResponse.paymentDetails.applicantSignReferenceUrl;
            } else {
              this.isSendingPayment = false;
              this.onLoading.next(false);
              this.cdr.detectChanges();
              this.onPostPaymentSuccess();
            }
          }
        },
        (response: ResponseErrorsInterface) => {
          this.errors = response.errors;
          this.isSendingPayment = false;
          this.onLoading.next(false);
          const errorTexts = Object.values(response.errors || {});
          this.errorMessage =
            errorTexts?.length > 0 ? errorTexts.join(', ') : response.message;
          this.cdr.detectChanges();
        },
      ),
    );
  }
}
