import { Injector } from '@angular/core';
import { Params } from '@angular/router';
import { Store } from '@ngxs/store';
import dayjs from 'dayjs';
import { MD5 } from 'object-hash';
import { Observable, throwError } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

import {
  ApiErrorType,
  ErrorDetails,
  TrackingService,
} from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { FlowState } from '@pe/checkout/store';
import {
  FlowInterface,
  PaymentMethodEnum,
  PaymentOptionInterface,
} from '@pe/checkout/types';

import { RateCalculateParamsInterface, RateInterface, RatesMinMaxInterface } from '../types';

export interface BaseRatesCalculationServiceInterface<TPaymentDataInterface> {
  fetchRates(
    flow: FlowInterface,
    formData: TPaymentDataInterface
  ): Observable<RateInterface[]>;

  fetchRatesHash(flow: FlowInterface, formData: TPaymentDataInterface): string;

  // For custom rate:

  fetchRatesMinMax(
    flow: FlowInterface,
    formData: TPaymentDataInterface
  ): Observable<RatesMinMaxInterface>;

  fetchRatesMinMaxHash(
    flow: FlowInterface,
    formData: TPaymentDataInterface
  ): string;
}

/**
 * Main goal - fetch rates from api according to the current flow and form data.
 */
export abstract class BaseRatesCalculationService<TPaymentDataInterface>
  implements BaseRatesCalculationServiceInterface<TPaymentDataInterface>
{
  abstract readonly paymentMethod: PaymentMethodEnum;

  private nodeFlowService: NodeFlowService = this.injector.get(NodeFlowService);
  private trackingService: TrackingService = this.injector.get(TrackingService);
  private store = this.injector.get(Store);

  private cache: { [key: string]: any } = {};

  constructor(protected injector: Injector) { }

  fetchRates(
    flow: FlowInterface,
    formData: TPaymentDataInterface
  ): Observable<RateInterface[]> {
    // T extends BaseRateInterface
    return this.getRates(
      flow,
      this.getUrlParams(flow, formData),
      this.fetchRatesHash(flow, formData)
    );
  }

  fetchRatesHash(flow: FlowInterface, formData: TPaymentDataInterface): string {
    const json: string =
      JSON.stringify(this.getUrlParams(flow, formData)) + this.paymentMethod;

    return MD5(json);
  }

  fetchRatesMinMax(
    flow: FlowInterface,
    formData: TPaymentDataInterface
  ): Observable<RatesMinMaxInterface> {
    // T extends BaseRateInterface
    return this.getRates(
      flow,
      this.getUrlParamsMinMax(flow, formData),
      this.fetchRatesMinMaxHash(flow, formData)
    ).pipe(
      map((rates: RateInterface[]) => {
        if (!rates?.length) {
          return {};
        }

        const data: RatesMinMaxInterface = {};
        data.installmentMin = (
          rates.reduce((left: RateInterface, right: RateInterface) =>
            left.monthlyPayment < right.monthlyPayment ? left : right
          ) || ({} as any)
        ).monthlyPayment;
        data.installmentMax = (
          rates.reduce((left: RateInterface, right: RateInterface) =>
            left.monthlyPayment > right.monthlyPayment ? left : right
          ) || ({} as any)
        ).monthlyPayment;
        data.durationMin = (
          rates.reduce((left: RateInterface, right: RateInterface) =>
            left.duration < right.duration ? left : right
          ) || ({} as any)
        ).duration;
        data.durationMax = (
          rates.reduce((left: RateInterface, right: RateInterface) =>
            left.duration > right.duration ? left : right
          ) || ({} as any)
        ).duration;

        return data;
      })
    );
  }

  fetchRatesMinMaxHash(
    flow: FlowInterface,
    formData: TPaymentDataInterface
  ): string {
    const json: string =
      JSON.stringify(this.getUrlParamsMinMax(flow, formData)) +
      this.paymentMethod;

    return MD5(json);
  }

  protected abstract getUrlParams(
    flow: FlowInterface,
    formData: TPaymentDataInterface
  ): Params;

  protected getUrlParamsMinMax(
    // Redeclared only when needed
    flow: FlowInterface,
    formData: TPaymentDataInterface
  ): Params {
    return this.getUrlParams(flow, formData);
  }

  protected requestCalculatedData(
    flowId: string,
    paymentOption: PaymentOptionInterface,
    params: Params
  ): Observable<RateInterface[]> {
    return this.nodeFlowService.getCreditRates<RateInterface[], RateCalculateParamsInterface>(
      {
        amount: params.amount,
        freelance: Boolean(Number(params.freelancer)),
        cpi: params.cpi,
        dayOfFirstInstallment: params.creditDueDate,
        downPayment: params.downPayment,
        ...(params.dateOfBirth && { dateOfBirth: dayjs(params.dateOfBirth).toDate() }),
        ...(params.employment && { employment: params.employment }),
      },
    ).pipe(
      catchError(err =>
        this.logError(
          err,
          flowId,
          paymentOption.paymentMethod,
          { url: '/calculate-rates', method: 'POST' },
          ApiErrorType.ErrorRates
        )
      )
    );
  }

  private getRates(
    flow: FlowInterface,
    params: Params,
    hash: string
  ): Observable<RateInterface[]> {
    if (this.cache[hash]) {
      return this.cache[hash];
    }
    const paymentOption = this.store.selectSnapshot(FlowState.paymentOption);
    this.cache[hash] = this.requestCalculatedData(
      flow.id,
      paymentOption,
      params
    ).pipe(shareReplay());

    return this.cache[hash];
  }

  private logError<T>(
    err: T,
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    details: ErrorDetails,
    type: ApiErrorType = null
  ): Observable<T> {
    this.trackingService.doEmitApiError(
      flowId,
      paymentMethod,
      type || ApiErrorType.ErrorEvent,
      details
    );

    return throwError(err);
  }
}
