import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { TrackingService, ApiErrorType, ErrorDetails } from '@pe/checkout/api';
import { FlowState } from '@pe/checkout/store';
import { FlowInterface, NodePaymentInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common/core';

import {
  RatesCalculationService,
  PaymentDataInterface,
  NodeSetupRateInterface,
  RateDataInterface,
  SetupRateInterface,
} from '../../shared';

@Injectable()
export class RequestDocsService {

  @SelectSnapshot(FlowState.flow) private flow: FlowInterface;

  @SelectSnapshot(FlowState.paymentMethod) private paymentMethod: PaymentMethodEnum;

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private http: HttpClient,
    private ratesCalcService: RatesCalculationService,
    private trackingService: TrackingService
  ) {
  }

  requestDocs(formData: NodeSetupRateInterface): Observable<PaymentDataInterface> {
    return this.ratesCalcService.fetchRealRatesData(formData).pipe(
      switchMap((ratesData) => {
        const paymentData: NodePaymentInterface<RateDataInterface> = {
          payment: ratesData.data.payment,
          paymentDetails: {
            creditAmount: this.flow.total,
            ...ratesData.data.paymentDetails,
            ...formData,
            annualPercentageRate: Number(ratesData.data.paymentDetails.annualPercentageRate ?? 0),
          },
        };

        return this.requestSetupRate(paymentData).pipe(
          switchMap(setupRatesData =>
            this.requestStatusCheck(paymentData).pipe(
              map((checkRate) => {
                const docsData: PaymentDataInterface = {
                  ...ratesData.data.paymentDetails,
                  ...checkRate.paymentDetails,
                  initializeUniqueId: setupRatesData.paymentDetails.initializeUniqueId,
                };

              return docsData;
              }),
            ),
          ),
        );
      }),
    );
  }

  private requestSetupRate(
    formData: NodePaymentInterface<RateDataInterface>,
  ): Observable<NodePaymentInterface<SetupRateInterface>> {
    const url = `${this.env.thirdParty.payments}/api/connection/${this.flow.connectionId}/action/setup-rate`;

    return this.http.post<NodePaymentInterface<SetupRateInterface>>(url, formData).pipe(
      catchError(err => this.logError(
        err,
        { url, method: 'POST' },
        ApiErrorType.ErrorRates,
      )),
    );
  }

  private requestStatusCheck(
    formData: NodePaymentInterface<RateDataInterface>,
  ): Observable<NodePaymentInterface<PaymentDataInterface>> {
    const url = `${this.env.thirdParty.payments}/api/connection/${this.flow.connectionId}/action/check-state`;

    return this.http.post<NodePaymentInterface<PaymentDataInterface>>(url, formData).pipe(
      catchError(err => this.logError(
        err,
        { url, method: 'POST' },
        ApiErrorType.ErrorRates,
      )),
    );
  }

  private logError<T>(
    err: T,
    details: ErrorDetails,
    type: ApiErrorType = null,
  ): Observable<T> {
    this.trackingService.doEmitApiError(this.flow.id, this.paymentMethod, type || ApiErrorType.ErrorEvent, details);

    return throwError(err);
  }
}
