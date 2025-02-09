import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, combineLatest, of } from 'rxjs';
import { catchError, distinctUntilChanged, exhaustMap, filter, map, shareReplay } from 'rxjs/operators';

import { FlowState, ParamsState, PaymentState } from '@pe/checkout/store';
import { DateUtilService } from '@pe/checkout/utils/date';

import { FormValue, RateInterface, RatesDataInterface } from '../types';

import { GetRatesParamsInterface } from './rates-calculation-api.service';
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
    shareReplay(1),
  );

  protected params$ = this.formData$.pipe(
    filter(value => !!value?.detailsForm),
  ).pipe(
    map(data => ({
      customer: {},
      ...data,
    })),
    map(({
      ratesForm: {
        desiredInstalment,
      },
      detailsForm: {
        dayOfFirstInstalment,
        condition,
        customer,
        weekOfDelivery,
        downPayment,
      },
      customer: {
        personalForm,
      },
    }) => {
      const personalDateOfBirth = customer?.personalDateOfBirth ?? personalForm?.personalDateOfBirth;

      return {
        desiredInstalment,
        dayOfFirstInstalment,
        ...condition && { condition },
        dateOfBirth: personalDateOfBirth
          ? this.dateUtilService.fixDate(personalDateOfBirth)
          : null,
        profession: customer?.profession ?? personalForm?.profession,
        downPayment,
        weekOfDelivery,
        amount: this.flow.total,
        cpi: false,
      } as GetRatesParamsInterface;
    }),
    distinctUntilChanged((prev, curr) => (
      prev?.dayOfFirstInstalment === curr.dayOfFirstInstalment
      && prev?.amount === curr.amount
      && prev?.condition === curr.condition
      && prev?.cpi === curr.cpi
      && prev?.dateOfBirth === curr.dateOfBirth
      && prev?.profession === curr.profession
      && prev?.downPayment === curr.downPayment
      && prev?.weekOfDelivery === curr.weekOfDelivery
      && prev?.desiredInstalment === curr.desiredInstalment
    )),
    filter(params => !!params?.condition),
    shareReplay(1),
  );

  public rates$ = this.params$.pipe(
    exhaustMap(params => this.ratesCalculationService.fetchRates(
      this.flow.id,
      params,
    ).pipe(
      catchError(() => of([])),
    )),
    shareReplay(1),
  );

  public cpiRates$ = this.params$.pipe(
    exhaustMap(params => this.ratesCalculationService.fetchRates(
      this.flow.id,
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
