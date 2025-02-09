import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

import { PluginEventsService } from '@pe/checkout/plugins';
import {
  AddressSsnInterface,
  FlowCloneReason,
  FlowInterface,
  CheckoutBaseSettingsInterface,
  NodeApiCallInterface,
  PaymentExternalCodeInterface,
  PaymentMethodEnum,
} from '@pe/checkout/types';
import { PaymentHelperService } from '@pe/checkout/utils';
import { camelCase } from '@pe/checkout/utils/camelcase';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common/core';

import { PAYMENTS_NO_EXTERNAL_CODE } from '../constants';
import { ApiErrorType } from '../enums';
import {
  ChannelSetDeviceSettingsInterface,
  CreateFinExpResponseInterface,
  CreatePaymentCodeParamsInterface,
  ErrorDetails,
  FinExpApiCallInterface,
  LegalDocumentEnum,
} from '../interfaces';

import { TrackingService } from './tracking.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {

  private static currentPaymentForAnalytics: {[key: string]: PaymentMethodEnum } = {};
  private readonly paymentsNoExternalCode: PaymentMethodEnum[] = PAYMENTS_NO_EXTERNAL_CODE;

  private checkoutBackend = this.env.backend.checkout;

  constructor(
    @Inject(LOCALE_ID) private localeId: string,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private trackingService: TrackingService,
    private httpClient: HttpClient,
    private pluginEventsService: PluginEventsService,
    private paymentHelperService: PaymentHelperService,
  ) {}

  _getFlow(flowId: string): Observable<FlowInterface> {
    return this.httpClient.get<FlowInterface>(this.getFlowUrl(flowId)).pipe(
      map(flow => this.cleanNullPaymentOptions(flow)),
      map(a => this.saveCurrentPaymentForAnalytics(a)),
      catchError(err => this.logError(err, flowId, { url: this.getFlowUrl(flowId), method: 'GET' }))
    );
  }

  getFormOptions<T>(
    flowId: string,
    connectionId: string,
  ): Observable<T> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/values`;

    return this.httpClient.post<T>(url, {}).pipe(
      catchError(err => this.logError(err, flowId, { url, method: 'POST' }))
    );
  }

  attachPaymentExternalCodeToFlow(flowId: string, codeId: string): Observable<void> {
    const url = `${this.env.backend.devicePayments}/api/v1/code/assign-payment-flow/${codeId}`;

    return this.httpClient.post<void>(url, {
      paymentFlowId: flowId,
    }).pipe(
      catchError(err => this.logError(err, flowId, { url, method: 'POST' }))
    );
  }

  getPaymentExternalCodeByFlowId(flowId: string): Observable<PaymentExternalCodeInterface> {
    const url = `${this.env.backend.devicePayments}/api/v1/code?flow.id=${flowId}&rand=${this.getRand()}`;

    return this.httpClient.get<PaymentExternalCodeInterface>(url).pipe(
      catchError(err => this.logError(err, flowId, { url, method: 'POST' }))
    );
  }

  getPaymentExternalCodeById(id: string): Observable<PaymentExternalCodeInterface> {
    return this.httpClient.get<PaymentExternalCodeInterface>(
      `${this.env.backend.devicePayments}/api/v1/code?_id=${id}&rand=${this.getRand()}`
    );
  }

  createPaymentCode(
    channelSetId: string,
    params: CreatePaymentCodeParamsInterface = {},
  ): Observable<PaymentExternalCodeInterface> {
    return this.httpClient.post<PaymentExternalCodeInterface>(
      `${this.env.backend.devicePayments}/api/v1/code/${channelSetId}`, params
    );
  }

  getChannelSetDeviceSettings(channelSetId: string): Observable<ChannelSetDeviceSettingsInterface> {
    return this.httpClient.get<ChannelSetDeviceSettingsInterface>(
      `${this.env.backend.devicePayments}/api/v1/${channelSetId}/channelset-settings?rand=${this.getRand()}`
    );
  }

  _cloneFlow(
    flowId: string,
    reason: FlowCloneReason,
  ): Observable<FlowInterface> {

    this.pluginEventsService.emitBeforeFlowClone(flowId);

    return this.httpClient.post<FlowInterface>(this.getCloneFlowUrl(flowId), null).pipe(
      mergeMap((clonedFlow) => {
        this.pluginEventsService.emitAfterFlowClone(flowId, clonedFlow.id);

        const { paymentMethod } = clonedFlow.paymentOptions
          .find(p => p.connections.find(c => c.id === clonedFlow.connectionId))
          || {};

        if (reason) {
          this.trackingService?.doEmitFlowCloned(flowId, paymentMethod, reason);
        }

        return (
          (!this.paymentsNoExternalCode.includes(paymentMethod) && this.paymentHelperService.isPos(clonedFlow))
            ? this.getPaymentExternalCodeByFlowId(flowId)
            : of(null)
          ).pipe(
            catchError(() => of(null)),
            mergeMap((code: PaymentExternalCodeInterface) => {
              if (code?._id) {
                return this.attachPaymentExternalCodeToFlow(clonedFlow.id, code._id).pipe(map(() => clonedFlow));
              }

              return of(clonedFlow);
            }),
            // We have to request again because of bug at Backend
            // (`values` is empty even when payment is selected)
            mergeMap(() => this._getFlow(clonedFlow.id)),
          );
      }),
      map(flow => this.cleanNullPaymentOptions(flow)),
      map(a => this.saveCurrentPaymentForAnalytics(a)),
      catchError(err => this.logError(err, flowId, { url: this.getCloneFlowUrl(flowId), method: 'POST' }))
    );
  }

  _createFlow(data: FlowInterface): Observable<FlowInterface> {
    const payload = camelCase(data);

    return this.httpClient.post<FlowInterface>(this.getCreateFlowCheckoutUrl(), payload).pipe(
      map(flow => this.cleanNullPaymentOptions(flow)),
      map(a => this.saveCurrentPaymentForAnalytics(a)),
    );
  }

  _createFinExpFlow(channelSetId: string, data: FinExpApiCallInterface): Observable<FlowInterface> {
    const payload = camelCase({
      channelSetId,
      ...data,
    });

    return this.httpClient.post<CreateFinExpResponseInterface>(
      this.getCreateFlowCheckoutUrl(),
      payload,
    ).pipe(
      map(flow => this.cleanNullPaymentOptions(flow)),
      map(a => this.saveCurrentPaymentForAnalytics(a)),
    );
  }

  _patchFlow(flowId: string, data: FlowInterface): Observable<FlowInterface> {
    const payload = camelCase(data);

    return this.httpClient.patch(this.getFlowUrl(flowId), payload).pipe(
      map(flow => this.cleanNullPaymentOptions(flow)),
      map(a => this.saveCurrentPaymentForAnalytics(a)),
      catchError(err => this.logError(err, flowId, { url: this.getFlowUrl(flowId), method: 'PATCH' })),
    );
  }

  _finishFlow(flowId: string): Observable<FlowInterface> {
    return this.httpClient.patch(this.getFinishFlowUrl(flowId), {}).pipe(
      map(flow => this.cleanNullPaymentOptions(flow)),
      map(a => this.saveCurrentPaymentForAnalytics(a)),
      catchError(err => this.logError(err, flowId, { url: this.getFinishFlowUrl(flowId), method: 'PATCH' }))
    );
  }

  getLegalDocument(businessUuid: string, type: LegalDocumentEnum): Observable<{content: string}> {
    const locale: string = this.localeId.split('-')[0] || 'en';

    return this.httpClient.get<{content: string}>(
      `${this.env.backend.users}/api/business/${businessUuid}/legal-document/${type}?locale=${locale}&rand=${this.getRand()}`
    );
  }

  getFlowSettingsFull(channelSetId: string): Observable<any> {
    return this.httpClient.get(`${this.env.backend.checkout}/api/checkout/channel-set/${channelSetId}/full-settings`,);
  }

  getFlowSettingsBase(channelSetId: string): Observable<CheckoutBaseSettingsInterface> {
    return this.httpClient.get<CheckoutBaseSettingsInterface>(
      `${this.env.backend.checkout}/api/checkout/channel-set/${channelSetId}/base-settings`,
    );
  }

  resolveSsnSeAddress(flowId: string, ssn: string): Observable<AddressSsnInterface> {
    const requestParams = new HttpParams().append('ssn', ssn);

    return this.httpClient.get<AddressSsnInterface>(
      `${this.env.backend.payments}/santander-se/${flowId}/resolve-ssn-address`,
      { params: requestParams }
    );
  }

  getApiCallData(apiCallId: string): Observable<NodeApiCallInterface> {
    const url = `${this.env.backend.checkout}/api/flow/v1/${apiCallId}/callbacks`;

    return this.httpClient.get<NodeApiCallInterface>(url);
  }

  private logError<T>(err: T, flowId: string, details: ErrorDetails, type: ApiErrorType = null): Observable<T> {
    // Have to always use same payment because storing that info is not performed by architecture of current service
    const analytics = ApiService.currentPaymentForAnalytics;
    if (analytics[flowId]) {
      this.trackingService?.doEmitApiError(flowId, analytics[flowId], type || ApiErrorType.ErrorEvent, details);
    }

    return throwError(err);
  }

  private getCreateFlowCheckoutUrl(): string {
    return `${this.checkoutBackend}/api/flow/v1`;
  }

  private getUpdateFlowAuthorizationUrl(flowId: string): string {
    return `${this.checkoutBackend}/api/flow/v1/${flowId}/authorization`;
  }

  private getFlowUrl(flowId: string): string {
    return `${this.checkoutBackend}/api/flow/v1/${flowId}`;
  }

  private getFinishFlowUrl(flowId: string): string {
    return `${this.checkoutBackend}/api/flow/v1/${flowId}/mark-as-finished`;
  }

  private getCloneFlowUrl(flowId: string): string {
    return `${this.checkoutBackend}/api/flow/v1/${flowId}/clone`;
  }

  private getRand(): string {
    // Safari doesn't react to no-cache headers and caching some requests randomly, without showing them in Network tab
    return Math.random().toString(10).slice(-8);
  }

  private saveCurrentPaymentForAnalytics(flow: FlowInterface): FlowInterface {
    const analytics = ApiService.currentPaymentForAnalytics;
    analytics[flow.id] = flow.paymentOptions.find(p =>
      p.connections.find(c => c.id === flow.connectionId))?.paymentMethod;

    return flow;
  }

  /**@deprecated
   * Remove once BE cleans up null values
   */
  private cleanNullPaymentOptions(flow: FlowInterface): FlowInterface {
    return {
      ...flow,
      paymentOptions: flow.paymentOptions.filter(p => !!p),
    };
  }
}
