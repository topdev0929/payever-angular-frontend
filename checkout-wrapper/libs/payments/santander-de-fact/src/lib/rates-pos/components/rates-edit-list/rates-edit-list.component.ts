import { PercentPipe } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  Injector,
} from '@angular/core';
import { BehaviorSubject, ReplaySubject, Subject, merge, of } from 'rxjs';
import {
  catchError,
  filter,
  map,
  scan,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';

import { AbstractRatesContainerComponent } from '@pe/checkout/payment';
import { RateDetailInterface, RateUtilsService, DetailInterface } from '@pe/checkout/rates';
import { FlowExtraDurationType, PaymentMethodEnum } from '@pe/checkout/types';
import { PeCurrencyPipe } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { RateInterface, RatesCalculationService } from '../../../shared';

export interface RateParams {
  amount: number;
}

interface ViewModel {
  rates: RateDetailInterface[];
  details: DetailInterface[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'santander-de-fact-rates-edit-list',
  providers: [ PeCurrencyPipe, PercentPipe, PeDestroyService ],
  templateUrl: './rates-edit-list.component.html',
})
export class RatesEditListComponent extends AbstractRatesContainerComponent {

  @Input() set params(params: RateParams) {
    this.paramsSubject$.next(params);
  }

  @Input() initialRate: Partial<RateInterface>;

  @Input() flowId: string; // Only for statistic

  @Input() paymentMethod: PaymentMethodEnum; // Only for statistic

  @Input() currency: string;

  @Input() extraDuration: FlowExtraDurationType;

  @Output() fetchRates = new EventEmitter<void>();

  @Output() selectRate = new EventEmitter<RateInterface>();

  public errorMessage: string;
  public readonly doSelectRate$ = new Subject<string>();

  private selectRateSubject$ = new ReplaySubject<number>(1);
  private paramsSubject$ = new BehaviorSubject<RateParams>(null);
  private rates$ = this.paramsSubject$.pipe(
    switchMap(() => this.ratesCalculationService.fetchRates().pipe(
      catchError((error) => {
        this.errorMessage =error.message;
        this.cdr.markForCheck();

        return of([]);
      }),
      map(rates => this.extraDuration
        ? this.rateUtilsService.ratesFilter(rates, 'duration', this.extraDuration)
        : rates
      ),
    )),
    tap((rates) => {
      const duration = this.initialRate.duration ?? rates[0]?.duration;
      if (duration) {
        this.initialRate = rates.find(rate => rate.duration === duration);
        this.selectRateSubject$.next(duration);
        this.doSelectRate$.next(String(duration));
      }
    }),
    shareReplay(1),
  );

  private details$ = this.selectRateSubject$.pipe(
    filter(value => !!value),
    switchMap(duration => this.rates$.pipe(
      map((rates) => {
        const rate = rates.find(rate => rate.duration === duration);
        this.selectRate.emit(rate);

        return rate;
      }),
      filter(value => !!value),
      map(rate => ([
        {
          title: $localize `:@@credit_rates.rate_param.nominal_interest_rate:`,
          value: this.percentPipe.transform(rate.interestRate / 100, '1.0-2'),
        },
        {
          title: $localize `:@@credit_rates.rate_param.annual_percentage_rate:`,
          value: this.percentPipe.transform(rate.annualPercentageRate / 100, '1.0-2'),
        },
        {
          title: $localize `:@@credit_rates.rate_param.total_interest:`,
          value: this.currencyPipe.transform(rate.interest, this.currency),
        },
        {
          title: $localize `:@@credit_rates.rate_param.total:`,
          value: this.currencyPipe.transform(rate.totalCreditCost, this.currency),
        },
        {
          title: $localize `:@@credit_rates.rate_param.last_rate:`,
          value: this.currencyPipe.transform(rate.lastMonthPayment, this.currency),
        },
      ])),
    )),
  );

  public vm$ = merge(
    this.rates$.pipe(
      map(rates => ({
        rates: rates.map<RateDetailInterface>((rate) => {
          const rateValue = this.currencyPipe.transform(rate.monthlyPayment, this.currency);

          return {
            id: String(rate.duration),
            title: $localize `:@@credit_rates.rate_title:${rateValue}:rate:${rate.duration}:duration:`,
          } as RateDetailInterface;
        }),
      })),
    ),
    this.details$.pipe(
      map(details => ({ details })),
    ),
  ).pipe(
    scan((acc, value) => ({ ...acc, ...value }), {} as ViewModel),
  );

  public get initialRateId(): string {
    return this.initialRate?.duration ? String(this.initialRate.duration) : null;
  }

  constructor(
    protected injector: Injector,
    private rateUtilsService: RateUtilsService<RateInterface>,
    private ratesCalculationService: RatesCalculationService,
  ) {
    super(injector);
  }

  rateSelected(id: string): void {
    this.selectRateSubject$.next(Number(id));
  }

  tryAgain(): void {
    this.errorMessage = null;
    this.cdr.markForCheck();
    this.paramsSubject$.next(this.paramsSubject$.getValue());
  }
}
