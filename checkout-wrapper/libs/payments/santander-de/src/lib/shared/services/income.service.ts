import { Injectable } from '@angular/core'; import { Store } from '@ngxs/store';
import { Observable, combineLatest, of } from 'rxjs';
import { catchError, distinctUntilChanged, exhaustMap, filter, map, shareReplay } from 'rxjs/operators';

import { FlowState, ParamsState, PaymentState } from '@pe/checkout/store';
import { DateUtilService } from '@pe/checkout/utils/date';

import { FormValue, PaymentDataInterface, RateInterface, RatesDataInterface } from '../types';

import { RatesCalculationService } from './rates-calculation.service';

@Injectable()
export class IncomeService {
  protected readonly flow = this.store.selectSnapshot(FlowState.flow);
  protected readonly merchantMode = this.store.selectSnapshot(ParamsState.merchantMode);
  protected readonly paymentMethod = this.store.selectSnapshot(FlowState.paymentMethod);

  constructor(
    private store: Store,
    private ratesCalculationService: RatesCalculationService,
    private dateUtilService: DateUtilService
  ) {
  }

  protected formData$: Observable<FormValue> = this.store.select(PaymentState.form).pipe(
    filter(v => !!v),
    shareReplay(1),
  );

  protected params$ = this.formData$.pipe(
    map(data => ({
      customer: {},
      ratesForm: {},
      ...data,
    })),
    map(({
      ratesForm: {
        credit_due_date,
        down_payment,
        commodity_group,
      },
      customer: {
        personalForm,
      },
    }): PaymentDataInterface => {
      const personalDateOfBirth = personalForm?.personalDateOfBirth;
      const employment = personalForm?.employment;
      const freelancer = personalForm?.freelancer;

      return {
        credit_due_date,
        down_payment,
        commodity_group,
        dateOfBirth: personalDateOfBirth
          ? this.dateUtilService.fixDate(personalDateOfBirth)
          : null,
        freelancer,
        employment,
        amount: this.flow.total,
        cpi: false,
      };
    }),
    distinctUntilChanged((prev, curr) => (
      prev?.amount === curr.amount
      && prev?.cpi === curr.cpi
      && prev?.dateOfBirth === curr.dateOfBirth
      && prev?.employment === curr.employment
      && prev?.down_payment === curr.down_payment
      && prev?.commodity_group === curr.commodity_group
    )),
    shareReplay(1),
  );

  public rates$ = this.params$.pipe(
    exhaustMap(params => this.ratesCalculationService.fetchRates(
      this.flow,
      params,
    ).pipe(
      catchError(() => of([])),
    )),
    shareReplay(1),
  );

  public cpiRates$ = this.params$.pipe(
    exhaustMap(params => this.ratesCalculationService.fetchRates(
      this.flow,
      {
        ...params,
        cpi: true,
      },
    ).pipe(
      catchError(() => of([])),
    )),
    shareReplay(1),
  );

  public cpiTariff$ = this.cpiRates$.pipe(
    map((rates: RateInterface[]) => !rates.length ? null : rates[0].specificData.rsvTariff)
  );

  public ratesData$: Observable<RatesDataInterface> = combineLatest([
    this.rates$,
    this.cpiRates$,
  ]).pipe(
    map(([rates, cpiRates]) => ({ rates, cpiRates })),
  );
}
