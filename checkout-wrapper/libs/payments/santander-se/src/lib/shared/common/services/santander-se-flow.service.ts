import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { iif, Observable, of, throwError } from 'rxjs';
import { catchError, filter, map, mapTo, switchMap } from 'rxjs/operators';

import { BaseNodeFlowService } from '@pe/checkout/node-api';
import { StorageService } from '@pe/checkout/storage';
import {
  FlowState,
  GetApiCallData,
  PatchPaymentDetails,
  PatchPaymentResponse,
  PaymentState,
} from '@pe/checkout/store';
import {
  FlowInterface,
  NodePaymentAddressInterface,
  NodePaymentInterface,
  NodePaymentResponseInterface,
  NodeSwedenSSNDetails,
  PaymentSpecificStatusEnum,
  PollingError,
} from '@pe/checkout/types';
import { POLLING_CONFIG, pollWhile } from '@pe/checkout/utils/poll';

import { SANTANDER_SE_AUTH_STATES } from '../constants';
import {
  AuthenticationError,
  AuthenticationSigningStatus,
  NodePaymentDetailsInterface,
  NodePaymentResponseDetailsInterface,
  SantanderSeApplicationResponse,
} from '../types';

import { SantanderSeApiService } from './santander-se-api.service';

const win = window as any;

@Injectable()
export class SantanderSeFlowService extends BaseNodeFlowService {

  @SelectSnapshot(PaymentState.paymentPayload)
  private paymentPayload: NodePaymentInterface<NodePaymentDetailsInterface>;

  @SelectSnapshot(PaymentState.response)
  private response: NodePaymentResponseInterface<unknown>;

  @SelectSnapshot(FlowState.flow) protected flow: FlowInterface;


  private santanderSeApiService = this.injector.get(SantanderSeApiService);
  private pollingConfig = this.injector.get(POLLING_CONFIG);
  private store = this.injector.get(Store);
  private storage = this.injector.get(StorageService);

  startMobileSigning<NodePaymentResponseDetailsInterface>():
  Observable<NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>>
  {
    return this.santanderSeApiService.startMobileSigning<NodePaymentResponseDetailsInterface>(
      this.flow.id,
      this.paymentMethod,
      this.flow.connectionId,
      this.response.id,
    );
  }

  extendAddressIfNotFilled(address: NodePaymentAddressInterface): void {
    const paymentDetails = this.store.selectSnapshot(PaymentState.details);
    !paymentDetails.address && this.store.dispatch(new PatchPaymentDetails({ address }));
  }

  getSsnFromCache(): Observable<NodeSwedenSSNDetails> {
    return of(this.getDataFromCache('ssn'));
  }

  getSSNDetailsOnce(
    ssn: string,
    amount: number,
    reset = false,
  ): Observable<NodeSwedenSSNDetails> {
    if (reset) {
      this.saveDataToCache(null, 'ssn');
    }

    const cache = this.getDataFromCache('ssn');

    return cache
      ? of(cache)
      : this.getSSNDetails(ssn, amount).pipe(
          map((details) => {
            this.saveDataToCache(details, 'ssn');

            return details;
          }),
        );
  }

  getApplicationFromCache(): Observable<SantanderSeApplicationResponse> {
    return of(this.getDataFromCache('application'));
  }

  getApplication(
    inquiryId: string,
    reset = false,
  ): Observable<SantanderSeApplicationResponse> {
    if (reset) {
      this.saveDataToCache(null, 'application');
    }

    const cache = this.getDataFromCache('application');

    return cache
      ? of(cache)
      : this.getApplicationDetails(inquiryId).pipe(
          map((details) => {
            this.saveDataToCache(details, 'application');

            return details;
          }),
        );
  }

  initiateAuthentication(ssn: string): Observable<any> {
    const source$ = this.santanderSeApiService.initiateAuthentication(ssn, this.flow.connectionId);

    return source$.pipe(
      switchMap(response => response.transactionId ? of(response) : source$),
      switchMap(({ transactionId }) => this.getAuthenticationStatus(transactionId, this.flow.connectionId)),
    );
  }

  getAuthenticationStatus(transactionId: string, connectionId: string): Observable<any> {
    const source$ = this.santanderSeApiService.getAuthenticationStatus(transactionId, connectionId);

    return source$.pipe(
      pollWhile(
        this.pollingConfig,
        (value) => {
          const status = SANTANDER_SE_AUTH_STATES[value.signingStatus];
          if (status !== undefined) {
            return status.action();
          }

          throw new AuthenticationError('invalid_signing_status', `Invalid signing status\n${JSON.stringify(value)}`);
        },
      ),
      filter(value => value.signingStatus === AuthenticationSigningStatus.Completed),
      catchError(error => throwError(error instanceof PollingError && error.code === 'timeout'
        ? new AuthenticationError('signing_timeout', 'Authentication timed out!')
        : error
      )),
    );
  }

  isNeedMoreInfo(paymentResponse: NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>): boolean {
    return (
      paymentResponse?.payment?.specificStatus === PaymentSpecificStatusEnum.NEED_MORE_INFO
    );
  }

  postMoreInfo<PaymentResponseDetails>(): Observable<NodePaymentResponseInterface<PaymentResponseDetails>> {
    const payload = this.store.selectSnapshot(PaymentState.paymentPayload);

    return this.santanderSeApiService.postMoreInfo(
      this.paymentMethod,
      this.flow.connectionId,
      this.response.id,
      payload,
    ).pipe(
      switchMap(response =>
        iif(
          () => !!response.payment.apiCallId,
          this.store.dispatch(new GetApiCallData(response)),
          this.store.dispatch(new PatchPaymentResponse(response)),
        ).pipe(
          mapTo(response),
        )
      ),
    );
  }

  private getSSNDetails(
    ssn: string,
    amount: number
  ): Observable<NodeSwedenSSNDetails> {
    return this.santanderSeApiService.getSwedenSSNDetails(
      this.paymentMethod,
      this.flow.businessId,
      this.flow.connectionId,
      this.paymentPayload,
      ssn,
      amount
    );
  }

  private getApplicationDetails(
    inquiryId: string,
  ): Observable<SantanderSeApplicationResponse> {
    const source$ = this.santanderSeApiService.getApplication(
      this.paymentMethod,
      this.flow.businessId,
      this.flow.connectionId,
      this.paymentPayload,
      inquiryId,
    );

    return source$.pipe(
      pollWhile(
        this.pollingConfig,
        value => !value.salesScoringType,
      ),
      filter(value => !!value.salesScoringType),
    );
  }

  private getDataFromCache(key: string): any {
    const storageKey = `pe_wrapper_santander_se_${this.flow.id}_${key}`;
    let data = win[storageKey];
    try {
      data = JSON.parse(this.storage.get(storageKey));
    } catch (e) {}

    return data;
  }

  private saveDataToCache<T = any>(data: T, key: string): void {
    const storageKey = `pe_wrapper_santander_se_${this.flow.id}_${key}`;
    win[storageKey] = data;
    try {
      this.storage.set(storageKey, JSON.stringify(data));
    } catch (e) { }
  }
}
