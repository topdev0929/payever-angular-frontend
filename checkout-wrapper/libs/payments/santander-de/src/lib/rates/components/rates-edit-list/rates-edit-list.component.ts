import { CurrencyPipe, PercentPipe } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnDestroy,
  OnInit,
  Injector,
} from '@angular/core';
import { Store } from '@ngxs/store';
import dayjs from 'dayjs';
import { Observable, combineLatest } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';

import { AnalyticFormStatusEnum, AnalyticsFormService } from '@pe/checkout/analytics';
import { DATE_SETTINGS } from '@pe/checkout/forms/date';
import { AbstractRatesContainerComponent } from '@pe/checkout/payment';
import { DetailInterface, RateDetailInterface } from '@pe/checkout/rates';
import { PaymentState } from '@pe/checkout/store';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { FormValue, RateInterface, RatesFormValue } from '../../../shared';

const ANALYTICS_FORM_NAME = 'FORM_RATE_SELECT';

@Component({
  selector: 'santander-de-rates-edit-list',
  providers: [CurrencyPipe, PercentPipe, PeDestroyService],
  templateUrl: './rates-edit-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatesEditListComponent extends AbstractRatesContainerComponent implements OnInit, OnDestroy {
  private store = this.injector.get(Store);

  @Input() set rates(rates: RateInterface[]) {
    this._rates = (rates || []).map(rate => ({
      ...rate,
      id: String(rate.duration),
    }));
    this.transformedRates = this.transformRates(this._rates);
  }

  get rates(): RateInterface[] {
    return this._rates;
  }

  @Input() initialRate!: RateInterface;

  @Input() flowId: string; // Only for statistic
  @Input() paymentMethod: PaymentMethodEnum; // Only for statistic
  @Input() isLoading: boolean;
  @Input() currency: string;

  @Output() selectRate: EventEmitter<RateInterface> = new EventEmitter();

  transformedRates: RateDetailInterface[] = [];
  selectedRate: RateInterface;
  initial = true;

  private _rates: RateInterface[] = [];

  constructor(
    injector: Injector,
    private analyticsFormService: AnalyticsFormService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.analyticsFormService.emitEventFormItself(ANALYTICS_FORM_NAME, AnalyticFormStatusEnum.OPEN);
  }

  ngOnDestroy(): void {
    this.analyticsFormService.emitEventFormItself(ANALYTICS_FORM_NAME, AnalyticFormStatusEnum.CLOSED);
  }

  selectRateByDuration(id: string): void {
    const redrawRequired = !this.selectedRate;
    this.selectedRate = this.rates.find(rate => String(rate.duration) === id);
    this.selectRate.emit(this.initial ? this.initialRate : this.selectedRate);
    if (redrawRequired) {
      this.cdr.detectChanges();
    }
    this.initial = false;
  }

  details$: Observable<DetailInterface[]> = combineLatest([
    this.selectRate.pipe(
      startWith(this.initialRate)
    ),
    this.store.select<FormValue>(PaymentState.form).pipe(
      map(formData => formData?.ratesForm?.credit_due_date),
      distinctUntilChanged(),
    ),
  ]).pipe(
    map(([_, dayOfFirstInstalment]) => {
      const rate = this.selectedRate;

      return [
        {
          title: $localize`:@@santander-de.credit_rates.rate_param.rate_pa:`,
          value: rate ? this.percentPipe.transform(rate.interestRate / 100, '1.0-2') : null,
        },
        {
          title: $localize`:@@santander-de.credit_rates.rate_param.interest_rate:`,
          value: rate ? this.percentPipe.transform(rate.annualPercentageRate / 100, '1.0-2') : null,
        },
        {
          title: $localize`:@@santander-de.credit_rates.rate_param.bank_interest:`,
          value: rate ? this.currencyPipe.transform(rate.interest, this.currency) : null,
        },
        {
          title: $localize`:@@santander-de.credit_rates.rate_param.total_amount:`,
          value: rate ? this.currencyPipe.transform(rate.totalCreditCost, this.currency) : null,
        },
        {
          title: $localize`:@@payment-santander-de-pos.creditRates.rateParam.firstRateOn:`,
          value: rate ? this.firstRateOn(
            new Date(rate.dateOfFirstInstalment).toISOString(),
            dayOfFirstInstalment)
            : null,
        },
      ];
    })
  );

  private firstRateOn(
    date: string,
    dayOfFirstInstalment: RatesFormValue['credit_due_date']
  ): string {
    let dateOfFirstInstalment = dayjs(date);
    const dayInMonth = Number(dateOfFirstInstalment.format('D'));

    if (dayInMonth > Number(dayOfFirstInstalment)) {
      dateOfFirstInstalment = dateOfFirstInstalment.add(1, 'M');
    }

    return dateOfFirstInstalment
      .set('D', Number(dayOfFirstInstalment))
      .format(DATE_SETTINGS.fullDate.format);
  }

  private transformRates(rates: RateInterface[]): RateDetailInterface[] {
    return rates.map<RateDetailInterface>((rate) => {
      const transformedRate: RateDetailInterface = {
        id: String(rate.duration),
        title: $localize `:@@santander-de.credit_rates.rate_title:${this.currencyPipeTransform(rate.monthlyPayment)}:rate:${rate.duration}:duration:`,
        lines: [],
      };

      return transformedRate;
    });
  }

  private currencyPipeTransform(value: number): string {
    return `<span>${
      this.currencyPipe.transform(value, this.currency, 'symbol', '1.2-2')
      }</span>`;
  }
}
