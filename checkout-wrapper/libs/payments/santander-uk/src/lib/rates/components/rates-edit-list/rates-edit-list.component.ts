import { PercentPipe } from '@angular/common';
import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject, ReplaySubject, merge, of } from 'rxjs';
import {
  catchError,
  filter,
  map,
  scan,
  shareReplay,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { AbstractRatesContainerComponent } from '@pe/checkout/payment';
import { RateDetailInterface, RateUtilsService } from '@pe/checkout/rates';
import { FlowExtraDurationType, PaymentMethodEnum } from '@pe/checkout/types';
import { PeDestroyService } from '@pe/destroy';

import { RateInterface, SelectedRateDataInterface } from '../../../shared';
import { RatesCalculationService } from '../../services';

export interface SelectedInterface {
  rate: RateInterface;
  data: SelectedRateDataInterface;
}

interface ViewModel {
  rates: RateDetailInterface[];
  isLoadingRates: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PercentPipe, PeDestroyService],
  selector: 'santander-uk-rates-edit-list',
  templateUrl: './rates-edit-list.component.html',
})
export class RatesEditListComponent extends AbstractRatesContainerComponent {

  @Input() extraDuration: FlowExtraDurationType;

  @Input() flowId: string;

  @Input() paymentMethod: PaymentMethodEnum;

  @Input() initialData: SelectedRateDataInterface;

  @Input() set total(total: number) {
    const currentTotal: number = this._total;
    this._total = total;
    if (currentTotal && total && currentTotal !== total) {
      this.fetchRatesSubject$.next();
    }
  }

  @Input() set deposit(deposit: number) {
    const currentDeposit: number = this._deposit;
    this._deposit = deposit;
    if (currentDeposit !== deposit) {
      this.fetchRatesSubject$.next();
    }
  }

  @Input() set currency(currency: string) {
    const currentCurrency: string = this._currency;
    this._currency = currency;
    if (currentCurrency && currency && currentCurrency !== currency) {
      this.fetchRatesSubject$.next();
    }
  }

  @Output() ratesLoaded = new EventEmitter<void>();

  @Output() fetchingRates = new EventEmitter<boolean>();

  @Output() hasFetchError = new EventEmitter<boolean>();

  private rateUtilsService: RateUtilsService<RateInterface> = this.injector.get(RateUtilsService);
  private ratesCalculationService = this.injector.get(RatesCalculationService);

  public doSelectRate$ = new BehaviorSubject<string>(null);
  public selectedRate: RateInterface;
  private _total: number;
  private _deposit: number;
  private _currency: string;

  private selectRateSubject$ = new ReplaySubject<string>(1);
  private fetchRatesSubject$ = new ReplaySubject<void>(1);
  private fetchRates$ = this.fetchRatesSubject$.pipe(
    switchMap(() =>
      this.ratesCalculationService.fetchRatesOnce(
        this.flowId,
        this.paymentMethod,
        this._total,
        this._deposit,
      ).pipe(
        catchError(() => {
          this.hasFetchError.next(true);
          this.ratesLoaded.emit();

          return of([]);
        }),
        map(rates => this.rateUtilsService.ratesFilter(rates, 'duration', this.extraDuration)),
        tap((rates) => {
          this.selectRateOnInit(rates);
          this.ratesLoaded.emit();
        }),
      ),
    ),
    shareReplay(1),
  );

  @Output() selected = this.selectRateSubject$.pipe(
    withLatestFrom(this.fetchRates$),
    map(([duration, rates]) => {
      const rate = rates.find(rate => rate.duration === Number(duration));
      this.selectedRate = rate;

      return {
        rate,
        data: {
          duration: rate?.duration,
          interestRate: rate?.interestRate,
          flatRate: rate?.specificData?.flatRate,
          monthlyPayment: rate?.monthlyPayment,
          firstMonthPayment: rate?.specificData?.firstMonthPayment,
          lastMonthPayment: rate?.lastMonthPayment,
          interest: rate?.interest,
          totalCreditCost: rate?.totalCreditCost,
        },
      };
    }),
  );

  public vm$ = merge(
    this.fetchRates$.pipe(
      map(rates => ({ rates: rates.map(rate => this.transformRate(rate)) })),
    ),
    this.ratesCalculationService.isLoading$.pipe(
      tap(isLoadingRates => this.fetchingRates.emit(isLoadingRates)),
      map(isLoadingRates => ({ isLoadingRates })),
    ),
  ).pipe(
    scan((acc, curr) => ({ ...acc, ...curr }), {} as ViewModel),
    filter(({ rates }) => !!rates),
  );

  public rateSelected(id: string): void {
    this.selectRateSubject$.next(id);
  }

  public makeRateId(rate: RateInterface): string {
    return rate ? rate.duration.toString() : null;
  }

  private transformRate(rate: RateInterface): RateDetailInterface {
    return {
      id: this.makeRateId(rate),
      listTitle: $localize `:@@payment-santander-uk.credit_rates.rate_list_title:\
        ${this.currencyPipe.transform(rate.monthlyPayment, this._currency, 'symbol')}:monthlyPayment:\
        ${rate.duration}:duration:\
        ${this.percentPipe.transform(rate.annualPercentageRate* 0.01, '1.0-2')}:apr:`,
      title: $localize `:@@payment-santander-uk.credit_rates.rate_title:\
        ${this.currencyPipe.transform(rate.monthlyPayment, this._currency, 'symbol')}:monthlyPayment:\
        ${rate.duration}:duration:`,
      lines: [
        $localize `:@@payment-santander-uk.credit_rates.rate_line:\
          ${this.percentPipe.transform(rate.annualPercentageRate* 0.01, '1.0-2')}:apr:`,
        ],
    } as RateDetailInterface;
  }

  private selectRateOnInit(rates: RateInterface[]): void {
    if (rates.length) {
      const initialRate = rates.find(rate => this.initialData?.duration?.toString() === rate.duration.toString());
      if (this.selectedRate) {
        this.doSelectRate$.next(this.makeRateId(this.selectedRate));
      } else if (initialRate) {
        this.selectedRate = initialRate;
        this.doSelectRate$.next(this.makeRateId(this.selectedRate));
      } else if (rates[0]) {
        this.selectedRate = rates[0];
        this.doSelectRate$.next(this.makeRateId(this.selectedRate));
      } else {
        this.rateSelected(null);
      }
    } else {
      this.rateSelected(null);
    }
  }
}
