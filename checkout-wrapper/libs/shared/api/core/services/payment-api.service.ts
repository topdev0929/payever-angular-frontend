import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { of, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import {
  FlowInterface,
  NodePaymentResponseInterface,
  PaymentMethodEnum,
  NodeApiCallInterface,
  NodeShopUrlsInterface,
  TransactionDetailInterface,
  PaymentTerms,
} from '@pe/checkout/types';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common/core';

import { ApiErrorType } from '../enums';
import { ErrorDetails } from '../interfaces';
import { TrackingService } from '../services';

@Injectable({
  providedIn: 'any',
})
export class NodeApiService {

  constructor(
    private httpClient: HttpClient,
    private trackingService: TrackingService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {
  }

  editTransaction(
    paymentMethod: PaymentMethodEnum,
    businessId: string,
    paymentId: string,
    flowId: string,
    payload: any,
  ): Observable<TransactionDetailInterface> {
    const url = `${this.env.backend.transactions}/api/business/${businessId}/${paymentId}/action/edit`;

    return this.httpClient.post<TransactionDetailInterface>(
      url,
      payload,
    ).pipe(
      catchError(err => this.logError(
        err,
        flowId,
        paymentMethod,
        { url, method: 'POST' },
        ApiErrorType.ErrorSubmit,
      )),
    );
  }

  submitPayment<PaymentResponseDetails>(
    connectionId: string,
    encryptedData: string,
  ) {
    return this.httpClient.post<NodePaymentResponseInterface<PaymentResponseDetails>>(
      `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/pay`,
      { encryptedData },
    );
  }

  getApplicationData<TData>(
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    connectionId: string,
    paymentId: string,
  ): Observable<TData> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/application-data`;

    return this.httpClient.post<TData>(url, { paymentId }).pipe(
      catchError(err => this.logError(err, flowId, paymentMethod, { url, method: 'POST' }, ApiErrorType.ErrorEvent))
    );
  }

  getCreditRates<TRates, TParams>(
    params: TParams,
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    connectionId: string,
  ): Observable<TRates> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/calculate-rates`;

    return this.httpClient.post<TRates>(url, params).pipe(
      catchError(err => this.logError(err, flowId, paymentMethod, { url, method: 'POST' }, ApiErrorType.ErrorRates))
    );
  }

  updatePayment<PaymentResponseDetails>(
    connectionId: string,
    paymentId: string,
  ): Observable<NodePaymentResponseInterface<PaymentResponseDetails>> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/update-status`;

    return this.httpClient.post<NodePaymentResponseInterface<PaymentResponseDetails>>(url, { paymentId });
  }

  requestPayment<PaymentResponseDetails>(
    connectionId: string,
    paymentId: string,
  ): Observable<NodePaymentResponseInterface<PaymentResponseDetails>> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/get-payment`;

    return this.httpClient.post<NodePaymentResponseInterface<PaymentResponseDetails>>(url, { paymentId });
  }

  getTerms<T extends PaymentTerms>(
    connectionId: string,
  ) {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/get-terms`;

    return this.httpClient.post<T>(url, {});
  }

  getApiCallData(flowId: string): Observable<NodeApiCallInterface> {
    const url = `${this.env.backend.checkout}/api/flow/v1/${flowId}/callbacks`;

    return this.httpClient.get<NodeApiCallInterface>(url);
  }

  getShopUrls(flow: FlowInterface): Observable<NodeShopUrlsInterface> {
    // This method has special logic to get urls that we pass to backend into create payment request for backend.
    // The are used to redirect user back to shop.
    const def: NodeShopUrlsInterface = {
      successUrl: flow?.apiCall?.customerRedirectUrl || flow?.apiCall?.successUrl,
      failureUrl: flow?.apiCall?.customerRedirectUrl || flow?.apiCall?.failureUrl,
      pendingUrl: flow?.apiCall?.customerRedirectUrl || flow?.apiCall?.pendingUrl,
      cancelUrl: flow?.apiCall?.customerRedirectUrl || flow?.apiCall?.cancelUrl,
    };
    if (flow?.apiCall.id) {
      return this.getApiCallData(flow?.id).pipe(
        catchError(() => of(null)),
        map(apiCall => ({
            successUrl: apiCall?.customerRedirectUrl || apiCall?.successUrl || def.successUrl,
            failureUrl: apiCall?.customerRedirectUrl || apiCall?.failureUrl || def.failureUrl,
            pendingUrl: apiCall?.customerRedirectUrl || apiCall?.pendingUrl || def.pendingUrl,
            cancelUrl: apiCall?.customerRedirectUrl || apiCall?.cancelUrl || def.cancelUrl,
        })),
      );
    }

    return of(def);
  }

  private logError<T>(
    err: T,
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    details: ErrorDetails,
    type: ApiErrorType = null
  ): Observable<T> {
    this.trackingService?.doEmitApiError(flowId, paymentMethod, type || ApiErrorType.ErrorEvent, details);

    return throwError(err);
  }
}
