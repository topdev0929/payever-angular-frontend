import { PercentPipe } from '@angular/common';
import { Component, ChangeDetectionStrategy, Input, Output, OnInit, EventEmitter, OnDestroy } from '@angular/core';
import dayjs from 'dayjs';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AnalyticFormStatusEnum, AnalyticsFormService } from '@pe/checkout/analytics';
import { TrackingService } from '@pe/checkout/api';
import { DetailInterface, RateDetailInterface, RateUtilsService } from '@pe/checkout/rates';
import { FlowExtraDurationType, PaymentMethodEnum } from '@pe/checkout/types';
import { LocaleConstantsService, PeCurrencyPipe } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { BaseRateComponent, RateInterface, SelectedRateDataInterface } from '../../../shared';

export enum RateToggleType {
  PartPayment = 'PartPayment',
  BuyNowPayLater = 'BuyNowPayLater'
}

export interface SelectedInterface {
  rate: RateInterface;
  data: SelectedRateDataInterface;
}

const ANALYTICS_FORM_NAME = 'FORM_RATE_SELECT';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-se-rates-edit-list',
  providers: [ PeCurrencyPipe, PercentPipe, PeDestroyService ],
  templateUrl: './rates-edit-list.component.html',
  styleUrls: ['./rates-edit-list.component.scss'],
})
export class RatesEditListComponent extends BaseRateComponent implements OnInit, OnDestroy {

  readonly RateToggleType = RateToggleType;

  @Input() flowId: string;
  @Input() paymentMethod: PaymentMethodEnum;
  @Input() initialData: SelectedRateDataInterface;
  @Input('total') set setTotal(total: number) {
    const currentTotal: number = this.total;
    this.total = total;
    if (currentTotal && total && currentTotal !== total) {
      this.fetchRates();
    }
  }

  @Input('currency') set setCurrenct(currency: string) {
    const currentCurrency: string = this.currency;
    this.currency = currency;
    if (currentCurrency && currency && currentCurrency !== currency) {
      this.fetchRates ();
    }
  }

  @Input() set extraDuration(duration: FlowExtraDurationType) {
    this.onlyDuration = duration;
  }

  @Output() ratesLoaded: EventEmitter<void> = new EventEmitter();
  @Output() fetchingRates: EventEmitter<boolean> = new EventEmitter();
  @Output() hasFetchError: EventEmitter<boolean> = new EventEmitter();
  @Output() selected: EventEmitter<SelectedInterface> = new EventEmitter();

  total: number;
  currency: string;
  doSelectRate$: BehaviorSubject<string> = new BehaviorSubject(null);
  rates: RateInterface[] = [];
  transformedRates: RateDetailInterface[] = [];
  selectedRate: RateInterface = null;
  isLoadingRates$: Observable<boolean> = null;
  ratesLoadError: string = null;
  selectedToggle: RateToggleType = null;
  onlyDuration: FlowExtraDurationType;
  details: DetailInterface[];

  protected lastRequestRateSub: Subscription = null;
  protected localeConstantsService: LocaleConstantsService = this.injector.get(LocaleConstantsService);
  protected trackingService: TrackingService = this.injector.get(TrackingService);
  private rateUtilsService: RateUtilsService<RateInterface> = this.injector.get(RateUtilsService);
  private analyticsFormService = this.injector.get(AnalyticsFormService);

  get translations(): { [key: string]: string } {
    return {
      duration: this.selectedRate?.months === 1
        ? $localize `:@@santander-se.duration.one_month:${this.selectedRate?.months}:count:`
        : $localize `:@@santander-se.duration.count_months:${this.selectedRate?.months}:count:`,
    };
  }

  ngOnInit(): void {
    this.analyticsFormService.emitEventFormItself(ANALYTICS_FORM_NAME, AnalyticFormStatusEnum.OPEN);

    this.isLoadingRates$ = this.ratesCalculationService.isLoading$;
    this.isLoadingRates$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((loading) => {
      this.fetchingRates.next(loading);
    });

    this.fetchRates();
  }

  ngOnDestroy(): void {
    this.analyticsFormService.emitEventFormItself(ANALYTICS_FORM_NAME, AnalyticFormStatusEnum.CLOSED);
  }

  fetchRates(): void {
    if (this.lastRequestRateSub) {
      this.lastRequestRateSub.unsubscribe();
    }
    this.lastRequestRateSub = this.ratesCalculationService.fetchRatesOnce(
      this.flowId, this.paymentMethod, this.total
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe((data) => {
      this.hasFetchError.next(false);

      this.selected.emit({
        rate: null,
        data: {},
      });
      this.rates = this.onlyDuration
        ? this.rateUtilsService.ratesFilter(data, 'months', this.onlyDuration)
        : data;
      this.selectRateOnInit();
      this.ratesLoaded.emit();
      this.cdr.detectChanges();
    }, (err) => {
      this.hasFetchError.next(true);
      this.ratesLoadError = err.message;
      this.rates = [];
      this.updateVisibleRates();
      this.ratesLoaded.emit();
      this.cdr.detectChanges();
    });
  }

  updateVisibleRates(): void {
    const filteredRates: RateInterface[] = this.rates.filter((rate) => {
      if (this.selectedToggle === RateToggleType.BuyNowPayLater) {
        return rate.payLaterType;
      } else if (this.selectedToggle === RateToggleType.PartPayment) {
        return !rate.payLaterType;
      }

      return true;
    });

    this.transformedRates = filteredRates.map<RateDetailInterface>(rate =>
      rate.payLaterType
        ? this.transformRateBNPL(rate)
        : this.transformRatePartPayment(rate)
    );
    const isRateInSelectedToggle = !!(this.selectedRate
      && filteredRates.find(rate => rate.code === this.selectedRate.code));
    if (!this.selectedRate || !isRateInSelectedToggle) {
      const firstNotBnpl: RateInterface = filteredRates.find(a => !a.payLaterType);
      const selected: RateInterface = firstNotBnpl || filteredRates[0];
      this.rateSelected(selected ? this.makeRateId(selected) : null);
    }
  }

  rateSelected(id: string): void {
    const selectedRate: RateInterface = this.rates.find(rate => this.makeRateId(rate) === id);
    if (selectedRate) {
      this.selected.emit({
        rate: selectedRate,
        data: {
          campaignCode: selectedRate.code,
        },
      });
      this.setToggleByRate(selectedRate);
    } else {
      this.selected.emit({
        rate: null,
        data: {
          campaignCode: null,
        },
      });
    }
    this.selectedRate = selectedRate;
    this.updateDetails();
  }

  makeRateId(rate: RateInterface): string {
    return rate ? rate.code : null;
  }

  toggleChanged(selectedToggle: RateToggleType): void {
    if (selectedToggle && this.selectedToggle !== selectedToggle) {
      if (this.selectedToggle) {
        // Skip initial toggle
        this.trackingService.doEmitRateSelected(this.flowId, this.paymentMethod, null);
      }
      this.selectedToggle = selectedToggle;
      this.updateVisibleRates();
    }
  }

  transformRateBNPL(rate: RateInterface): RateDetailInterface {
    const moment = dayjs().add(rate.months, 'months');
    const month: string = moment.locale(this.localeConstantsService.getLang()).format('MMMM').toLowerCase();

    return {
      id: this.makeRateId(rate),
      title: $localize `:@@santander-se.credit_rates.rate_title_bnpl:\
        ${this.currencyPipe.transform(rate.totalCost, this.currency, 'symbol-narrow')}:totalCost:\
        ${month}:monthName:`,
      lines: [
        $localize `:@@santander-se.credit_rates.rate_line1_bnpl:\
          ${rate.months}:months:`,
      ],
    } as RateDetailInterface;
  }

  transformRatePartPayment(rate: RateInterface): RateDetailInterface {
    return {
      id: this.makeRateId(rate),
      title: $localize `:@@santander-se.credit_rates.rate_title_pp:\
        ${this.currencyPipe.transform(rate?.monthlyCost, this.currency, 'symbol-narrow')}:monthlyCost:`,
      lines: [
        $localize `:@@santander-se.credit_rates.rate_line1_pp:\
          ${this.currencyPipe.transform(rate?.totalCost, this.currency, 'symbol-narrow')}:totalCost:`,
      ],
    } as RateDetailInterface;
  }

  private updateDetails(): void {
    const rate = this.selectedRate;
    if (!rate) {
      return;
    }

    this.details = [
      {
        title: $localize `:@@santander-se.credit_rates.rate_param.startup_fee:`,
        value: rate ? this.currencyPipe.transform(rate.startupFee, this.currency) : null,
      },
      {
        title: $localize `:@@santander-se.credit_rates.rate_param.interest_rate:`,
        value: rate ? this.percentPipe.transform(rate.baseInterestRate / 100, '1.0-2') : null,
      },
      {
        title: $localize `:@@santander-se.credit_rates.rate_param.total_cost:`,
        value: rate ? this.currencyPipe.transform(rate.totalCost, this.currency) : null,
      },
      {
        title: $localize `:@@santander-se.credit_rates.rate_param.effective_interest:`,
        value: rate ? this.percentPipe.transform(rate.effectiveInterest / 100, '1.0-2') : null,
      },
    ];

    if (rate.payLaterType) {
      this.details.unshift({
        title: $localize `:@@santander-se.credit_rates.rate_param.administration_fee:`,
        value: rate ? this.currencyPipe.transform(rate.billingFee, this.currency) : null,
      });
    }

    if (!rate.payLaterType) {
      this.details.splice(2, 0, {
        title: $localize `:@@santander-se.credit_rates.rate_param.billing_fee:`,
        value: rate ? this.currencyPipe.transform(rate.billingFee, this.currency) : null,
      });

      this.details.splice(-1, 0, {
        title: $localize `:@@santander-se.credit_rates.rate_param.terms_on_month:`,
        value: rate.months === 1
          ? $localize `:@@santander-se.duration.one_month:${rate.months}:count:`
          : $localize `:@@santander-se.duration.count_months:${rate.months}:count:`,
      });
    }
  }

  private selectRateOnInit(): void {
    if (this.rates.length) {
      const initialRate: RateInterface = this.getRateByFormData(this.initialData, this.rates);
      if (this.selectedRate) {
        this.doSelectRate$.next(this.makeRateId(this.selectedRate));
      } else if (initialRate) {
        this.selectedRate = initialRate;
        this.doSelectRate$.next(this.makeRateId(initialRate));
      } else if (this.rates[0]) {
        const firstNotBnpl: RateInterface = this.rates.find(a => !a.payLaterType);
        this.selectedRate = firstNotBnpl || this.rates[0];
        this.doSelectRate$.next(this.makeRateId(this.selectedRate));
      } else {
        this.rateSelected(null);
      }
      this.setToggleByRate(this.selectedRate);
    } else {
      this.rateSelected(null);
    }
  }

  private setToggleByRate(selectedRate: RateInterface): void {
    if (selectedRate) {
      this.toggleChanged(selectedRate.payLaterType ? RateToggleType.BuyNowPayLater : RateToggleType.PartPayment);
    }
  }
}
