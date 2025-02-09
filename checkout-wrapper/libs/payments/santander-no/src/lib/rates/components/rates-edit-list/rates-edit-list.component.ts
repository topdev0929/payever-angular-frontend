import { CurrencyPipe, PercentPipe } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  OnInit,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AnalyticFormStatusEnum, AnalyticsFormService } from '@pe/checkout/analytics';
import { TrackingService } from '@pe/checkout/api';
import { DetailInterface, RateDetailInterface, RateUtilsService } from '@pe/checkout/rates';
import { FlowExtraDurationType, PaymentMethodEnum } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import {
  BaseRateComponent,
  ProductTypeEnum,
  RateInterface,
  RateToggleType,
  SelectedInterface,
  SelectedRateDataInterface,
} from '../../../shared';

const ANALYTICS_FORM_NAME = 'FORM_RATE_SELECT';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-no-rates-edit-list',
  providers: [CurrencyPipe, PercentPipe, PeDestroyService],
  templateUrl: './rates-edit-list.component.html',
})
export class RatesEditListComponent extends BaseRateComponent implements OnInit, OnDestroy {

  readonly RateToggleType: typeof RateToggleType = RateToggleType;

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
      this.fetchRates();
    }
  }

  @Input('creditType') set setCreditType(creditType: ProductTypeEnum) {
    const currentCreditType: ProductTypeEnum = this.creditType;
    this.creditType = creditType;
    if (currentCreditType && creditType && currentCreditType !== creditType) {
      this.fetchRates();
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
  creditType: ProductTypeEnum;
  doSelectRate$: BehaviorSubject<string> = new BehaviorSubject(null);
  rates: RateInterface[] = [];
  transformedRates: RateDetailInterface[] = [];
  selectedRate: RateInterface = null;
  isLoadingRates$: Observable<boolean> = null;
  ratesLoadError: string = null;
  selectedToggle: RateToggleType = null;
  details: DetailInterface[];
  onlyDuration: FlowExtraDurationType;

  protected lastRequestRateSub: Subscription = null;
  protected localeConstantsService: LocaleConstantsService = this.injector.get(LocaleConstantsService);
  protected trackingService: TrackingService = this.injector.get(TrackingService);
  private rateUtilsService: RateUtilsService<RateInterface> = this.injector.get(RateUtilsService);
  private analyticsFormService = this.injector.get(AnalyticsFormService);

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
    this.ratesLoadError = null;
    if (this.lastRequestRateSub) {
      this.lastRequestRateSub.unsubscribe();
    }
    this.lastRequestRateSub = this.ratesCalculationService.fetchRatesOnce(
        this.flowId,
        this.paymentMethod,
        this.total,
        this.creditType,
      ).pipe(
      takeUntil(this.destroy$)
    ).subscribe((data: any) => {
      this.hasFetchError.next(false);
      this.rates = this.onlyDuration
        ? this.rateUtilsService.ratesFilter(data, 'duration', this.onlyDuration)
        : data || [];
      this.selectRateOnInit();
      this.updateVisibleRates();
      this.cdr.detectChanges();
      this.ratesLoaded.emit();
    }, (err: any) => {
      this.hasFetchError.next(true);
      this.ratesLoadError = err.message
        || $localize `:@@santander-no.credit_rates.error.cant_request:`;
      this.rates = [];
      this.updateVisibleRates();
      this.cdr.detectChanges();
      this.ratesLoaded.emit();
    });
  }

  updateVisibleRates(): void {
    const filteredRates: RateInterface[] = this.rates.filter((rate) => {
      if (this.selectedToggle === RateToggleType.BuyNowPayLater) {
        return !rate.isFixedAmount;
      } else if (this.selectedToggle === RateToggleType.PartPayment) {
        return rate.isFixedAmount;
      }

      return true;
    });

    // Force hide to redraw to fix dropdown icon problem in Safari
    this.transformedRates = null;
    this.cdr.detectChanges();

    this.transformedRates = filteredRates.map<RateDetailInterface>(rate =>
      !rate.isFixedAmount ? this.transformRateBNPL(rate) : this.transformRatePartPayment(rate));
    const isRateInSelectedToggle = !!(this.selectedRate
      && filteredRates.find(rate => this.makeRateId(rate) === this.makeRateId(this.selectedRate)));
    if (!this.selectedRate || !isRateInSelectedToggle) {
      const firstNotBnpl: RateInterface = filteredRates.find(a => a.isFixedAmount);
      const selected: RateInterface = firstNotBnpl || filteredRates[0];
      this.rateSelected(selected ? this.makeRateId(selected) : null);
    }
    this.updateDetails();
    this.cdr.detectChanges();
  }

  rateSelected(id: string): void {
    const selectedRate: RateInterface = this.rates.find(rate => this.makeRateId(rate) === id);
    if (selectedRate) {
      this.selected.emit({
        rate: selectedRate,
        data: {
          campaignCode: selectedRate.campaignCode,
          monthlyAmount: selectedRate.monthlyAmount,
        },
      });
      this.setToggleByRate(selectedRate);
    } else {
      this.selected.emit({
        rate: null,
        data: {
          campaignCode: null,
          monthlyAmount: null,
        },
      });
    }
    this.selectedRate = selectedRate;
    this.updateDetails();
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
    return {
      id: this.makeRateId(rate),
      title: rate.description,
      lines: [], // [ rate.title ]
    } as RateDetailInterface;
  }

  transformRatePartPayment(rate: RateInterface): RateDetailInterface {
    const durationStr: string = rate.duration > 1
      ? $localize `:@@santander-no.duration.count_months:${rate.duration}:count:`
      : $localize `:@@santander-no.duration.one_month:${rate.duration}:count:`;

    return {
      id: this.makeRateId(rate),
      title: $localize `:@@santander-no.credit_rates.rate_title_pp:${this.toPrice(rate.monthlyAmount)}:monthly_amount:`,
      lines: [$localize `:@@santander-no.credit_rates.rate_line1_pp:${durationStr}:duration:`],
    } as RateDetailInterface;
  }

  updateDetails(): void {
    const rate = this.selectedRate;
    if (!rate?.isFixedAmount) {
      this.details = [];
    } else {
      this.details = [
        {
          title: $localize `:@@santander-no.credit_rates.rate_param.effective_rate:`,
          value: rate ? this.toPercent(rate.effectiveRate) : null,
        }, {
          title: $localize `:@@santander-no.credit_rates.rate_param.credit_price_with_currency:`,
          value: rate ? this.toPriceNumber(rate.creditPurchase - this.total) : null,
        }, {
          title: $localize `:@@santander-no.credit_rates.rate_param.credit_purchase_with_currency:`,
          value: rate ? this.toPriceNumber(rate.creditPurchase) : null,
        },
      ];
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
        const firstNotBnpl: RateInterface = this.rates.find(a => a.isFixedAmount);
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
      this.toggleChanged(!selectedRate.isFixedAmount ? RateToggleType.BuyNowPayLater : RateToggleType.PartPayment);
    }
  }

  private toPercent(value: number): string { // Copied from @pe/checkout/payment-widgets-sdk
    return this.percentPipe.transform(value / 100, '1.0-2');
  }

  private toPrice(value: number): string { // Copied from @pe/checkout/payment-widgets-sdk
    return this.currencyPipe.transform(value, this.currency, 'symbol-narrow', (value % 1 === 0) ? '1.0-2' : '1.2-2');
  }

  private toPriceNumber(value: number): string { // Copied from @pe/checkout/payment-widgets-sdk
    const price = this.toPrice(value) || '';

    return price.replace(/[^\d\s,.-]/g, '').trim();
  }
}
