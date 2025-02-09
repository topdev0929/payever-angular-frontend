import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  OnInit,
  EventEmitter,
  ViewChild,
} from '@angular/core';

import { ModeEnum } from '@pe/checkout/form-utils';
import { AbstractPaymentContainerComponent, PaymentSubmissionService } from '@pe/checkout/payment';
import {
  FormOptionsInterface,
  RateDataInterface,
} from '@pe/checkout/santander-de-pos/shared';
import { FlowState, PaymentState } from '@pe/checkout/store';
import {
  RateSummaryInterface,
  TimestampEvent,
} from '@pe/checkout/types';
import { PeCurrencyPipe } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import type { FormComponent } from '../form';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeCurrencyPipe, PeDestroyService],
  selector: 'santander-de-pos-rates-container',
  templateUrl: './rates-container.component.html',
  styles: [`.rates-container {
    display: block;
    padding-top: 12px;
  }`],
})
export class RatesContainerComponent extends AbstractPaymentContainerComponent implements OnInit {

  @Input() mode = ModeEnum.Edit;

  @Output() loading: EventEmitter<boolean> = new EventEmitter();
  @Output() selectRate: EventEmitter<RateSummaryInterface> = new EventEmitter();
  @Output() ratesLoading: EventEmitter<boolean> = new EventEmitter();
  @Output() continue: EventEmitter<TimestampEvent> = new EventEmitter();
  @Output() buttonText: EventEmitter<string> = new EventEmitter();
  @Output() requestFlowData: EventEmitter<TimestampEvent> = new EventEmitter();

  // Required for edit mode
  @ViewChild('ratesForm') ratesFormRef: FormComponent;

  public readonly modeEnum = ModeEnum;
  private currencyPipe = this.injector.get(PeCurrencyPipe);
  private submit$ = this.injector.get(PaymentSubmissionService);

  public currency = this.store.selectSnapshot(FlowState.flow).currency;

  get isComfortCardCondition(): boolean {
    const detailsForm = this.store.selectSnapshot(PaymentState.form)?.detailsForm;
    const condition = detailsForm?.condition;
    const options: FormOptionsInterface = this.store
      .selectSnapshot(PaymentState.options);

    return !!options?.conditions.find(c => c.programs.find(program => program.key === condition)
      && c.isComfortCardCondition);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.analyticsFormService.initPaymentMethod(this.paymentMethod);

    this.buttonText.next($localize`:@@payment-santander-de-pos.actions.pay:`);
  }

  public triggerSubmit(): void {
    this.submit$.next();
  }

  onSelectRate(rate: RateDataInterface): void {
    if (this.flow && rate?.raw) {
      const monthlyPaymentStr: string =
        this.currencyPipe.transform(rate.raw.monthlyPayment, this.flow.currency, 'symbol');
      const durationStr: string = rate.raw.duration > 1
        ? $localize`:@@duration.months:`
        : $localize`:@@duration.month:`;

      const rateInfo: RateSummaryInterface = {
        chooseText: null, // Not needed
        totalAmount: rate.total,
        downPayment: rate.downPayment,
      };
      const duration = `${rate.raw.duration} ${durationStr}`;

      let chooseText: string = $localize`:@@payment-santander-de-pos.creditRates.actions.rateChooseSummary:
      ${monthlyPaymentStr}:monthlyPayment:${duration}:duration:`;

      if (this.isComfortCardCondition) {
        chooseText = $localize`:@@payment-santander-de-pos.creditRates.actions.rateChooseComfortCard:
          ${monthlyPaymentStr}:monthlyPayment:`;
      }

      this.selectRate.emit(rateInfo);
      this.buttonText.next(chooseText);

    } else {
      this.selectRate.emit(null);
      this.buttonText.next($localize`:@@payment-santander-de-pos.creditRates.error.ratesListEmpty:`);
    }
  }

  onRatesLoadingError(isError: boolean): void {
    if (isError) {
      this.selectRate.emit(null);
      this.buttonText.next($localize`:@@payment-santander-de-pos.actions.tryAgain:`);
    }
  }

  onSubmitted(): void {
    this.continue.next();
  }

  showFinishModalFromExistingPayment(): void {
    this.continue.next();
  }
}
