import { CommonModule, PercentPipe } from '@angular/common';
import {
  Component,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  inject,
  OnInit,
} from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { ViewSelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Select } from '@ngxs/store';
import {
  Observable,
  ReplaySubject,
  Subject,
  merge,
  of,
} from 'rxjs';
import {
  catchError,
  filter,
  map,
  scan,
  shareReplay,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { FinishModule } from '@pe/checkout/finish';
import { CompositeForm } from '@pe/checkout/forms';
import { RateDetailInterface, RatesModule } from '@pe/checkout/rates';
import { FlowState, ParamsState } from '@pe/checkout/store';
import { DetailInterface, FlowInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { PeCurrencyPipe } from '@pe/checkout/utils';
import { PeDestroyService } from '@pe/destroy';

import { FinishComponent, RatesFormValue } from '../../../shared';
import { RateInterface } from '../../models';
import { RatesService } from '../../services';

export interface RateParams {
  amount: number;
}

interface ViewModel {
  rates: RateDetailInterface[];
  initialRateId: string;
  details: DetailInterface[];
  flow: FlowInterface;
}

@Component({
  selector: 'rates-form',
  templateUrl: './rates-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RatesModule,
    FinishModule,
    FinishComponent,
  ],
  providers: [
    PeCurrencyPipe,
    PercentPipe,
    PeDestroyService,
  ],
})
export class RatesFormComponent
  extends CompositeForm<RatesFormValue>
  implements OnInit {

  private readonly ratesService = inject(RatesService);
  private readonly currencyPipe = inject(PeCurrencyPipe);
  private readonly percentPipe = inject(PercentPipe);

  @Select(FlowState.flow)
  private readonly flow$!: Observable<FlowInterface>;

  @ViewSelectSnapshot(FlowState.paymentMethod)
  protected readonly paymentMethod: PaymentMethodEnum;

  @ViewSelectSnapshot(ParamsState.merchantMode)
  protected readonly merchantMode: boolean;

  @ViewSelectSnapshot(ParamsState.embeddedMode)
  protected readonly embeddedMode: boolean;

  protected readonly formGroup = this.fb.group({
    duration: this.fb.control<number>(null, Validators.required),
    interest: this.fb.control<number>(null, Validators.required),
  });

  @Output() fetchRates = new EventEmitter<void>();

  @Output() selectRate = new EventEmitter<RateInterface>();

  public errorMessage: string;

  public readonly doSelectRate$ = new Subject<string>();
  private selectRateSubject$ = new ReplaySubject<number>(1);
  private ratesSubject$ = new Subject();
  private rates$ = merge(
    this.flow$,
    this.ratesSubject$,
  ).pipe(
    switchMap(() => this.ratesService.getRates().pipe(
      tap((rates) => {
        const id = String(this.formGroup.get('duration').value
          ?? (rates[0].duration));

        this.selectRateSubject$.next(Number(id));
      }),
      catchError((error) => {
        this.errorMessage = error.message ?? error.error ?? error;

        return of([]);
      }),
    )),
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
      withLatestFrom(this.flow$),
      map(([rate, { currency }]) => ([
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
          value: this.currencyPipe.transform(rate.interest, currency),
        },
        {
          title: $localize `:@@credit_rates.rate_param.total:`,
          value: this.currencyPipe.transform(rate.totalCreditCost, currency),
        },
        {
          title: $localize `:@@credit_rates.rate_param.last_rate:`,
          value: this.currencyPipe.transform(rate.lastMonthPayment, currency),
        },
      ])),
    )),
  );

  public vm$ = merge(
    this.rates$.pipe(
      withLatestFrom(this.flow$),
      map(([rates, { currency }]) => ({
        rates: rates.map<RateDetailInterface>((rate) => {
          const rateValue = this.currencyPipe.transform(rate.monthlyPayment, currency);

          return {
            id: String(rate.duration),
            title: $localize `:@@credit_rates.rate_title:${rateValue}:rate:${rate.duration}:duration:`,
          } as RateDetailInterface;
        }),
        initialRateId: this.formGroup.get('duration').value?.toString()
          ?? rates[0]?.duration?.toString(),
      })),
    ),
    this.details$.pipe(
      map(details => ({ details })),
    ),
    this.flow$.pipe(
      map(flow => ({ flow })),
    ),
  ).pipe(
    scan((acc, value) => ({ ...acc, ...value }), {} as ViewModel),
  );

  override ngOnInit(): void {
    super.ngOnInit();

    this.selectRateSubject$.pipe(
      switchMap(id => this.rates$.pipe(
        tap((rates) => {
          const rate = rates.find(rate => rate.duration === Number(id));

          rate && this.formGroup.setValue({
            duration: rate.duration,
            interest: rate.interest,
          });
        }),
      )),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  protected rateSelected(id: string): void {
    this.selectRateSubject$.next(Number(id));
  }

  protected tryAgain(): void {
    this.errorMessage = null;
    this.ratesSubject$.next();
  }
}
