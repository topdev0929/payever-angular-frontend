import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { BaseNodeFlowService, NodeFlowService } from '@pe/checkout/node-api';
import { ParamsState, PaymentState } from '@pe/checkout/store';
import {
  NodePaymentResponseInterface,
  PaymentSpecificStatusEnum,
  PaymentStatusEnum,
  PollingConfig,
  PollingError,
} from '@pe/checkout/types';
import { pollWhile } from '@pe/checkout/utils/poll';

import { PaymentDataCustomerInterface } from '../types';

import { SantanderDeApiService } from './api.service';

export enum UpdatePaymentModeEnum {
  WaitingForSigningURL,
  ProcessingSigning
}

@Injectable()
export class SantanderDeFlowService extends BaseNodeFlowService {
  private apiService = this.injector.get(SantanderDeApiService);
  private nodeFlowService = this.injector.get(NodeFlowService);
  private store = this.injector.get(Store);

  sendDocuments(
    docs: Parameters<typeof this.apiService.sendDocuments>[0],
  ) {

    return this.apiService.sendDocuments(
      docs,
      this.response.id,
      this.flow.id,
      this.paymentMethod,
      this.flow.connectionId,
    );
  }

  getWebIDIdentificationURL(
    identMode: Parameters<typeof this.apiService.getWebIDIdentificationURL>[0],
  ): Observable<NodePaymentResponseInterface<{ customerSigningLink: string }>> {

    return this.apiService.getWebIDIdentificationURL<{ customerSigningLink: string }>(
      identMode,
      this.flow.id,
      this.paymentMethod,
      this.flow.connectionId,
      this.response.id,
    );
  }

  runUpdatePaymentWithTimeout(mode: UpdatePaymentModeEnum, pollingConfig: PollingConfig)
    : Observable<{
      isUpdatePaymentTimeout: boolean,
      isCheckStatusProcessing: boolean,
      isWaitingForSignUrl: boolean,
      isProcessingSigning: boolean,
    }> {
    const done = () => (
      mode === UpdatePaymentModeEnum.ProcessingSigning
      && this.isSigned()
    ) || (
        mode === UpdatePaymentModeEnum.WaitingForSigningURL
        && this.checkSigningURL()
      );

    const mapReturnValue = () => ({
      isUpdatePaymentTimeout: false,
      isCheckStatusProcessing: !done(),
      isWaitingForSignUrl: mode === UpdatePaymentModeEnum.WaitingForSigningURL
        && !done(),
      isProcessingSigning: mode === UpdatePaymentModeEnum.ProcessingSigning
        && !done(),
    });

    if (done() || (!this.response?.id && this.store.selectSnapshot(PaymentState.error))) {
      return of(mapReturnValue());
    }

    return this.nodeFlowService.updatePayment<PaymentDataCustomerInterface>().pipe(
      pollWhile(
        pollingConfig,
        () => !done()
      ),
      map(() => mapReturnValue()),
      catchError(error =>
        error instanceof PollingError && error.code === 'timeout'
          ? of({
            isUpdatePaymentTimeout: true,
            isCheckStatusProcessing: false,
            isWaitingForSignUrl: false,
            isProcessingSigning: false,
          })
          : throwError(error)
      ),
    );
  }

  public isSigned(): boolean {
    // we temporarily assume it's signed when redirected to frontend-success-url
    // see: CWF-2725
    const params = this.store.selectSnapshot(ParamsState.params);

    return params.processed
      && !params.redirectToPaymentQueryParams?.['identification-failed'];

    // const response = this.response;

    // return response?.payment?.specificStatus === PaymentSpecificStatusEnum.STATUS_SIGNED;
  }

  private checkSigningURL(): boolean {
    const response = this.response;

    return response && (response.payment.status !== PaymentStatusEnum.STATUS_IN_PROCESS
      || response.payment.specificStatus === PaymentSpecificStatusEnum.STATUS_GENEHMIGT);
  }

  private get response() {
    return this.nodeFlowService.getFinalResponse();
  }
}
