import { Injectable, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';

import { BaseNodeFlowService } from '@pe/checkout/node-api';
import { GetApiCallData, PatchPaymentResponse, PaymentState, SetPaymentComplete } from '@pe/checkout/store';
import {
  NodePaymentResponseInterface,
  PaymentMethodEnum,
} from '@pe/checkout/types';

import { ZiniaBnplApiService } from './zinia-bnpl-api.service';

@Injectable()
export class ZiniaBnplFlowService extends BaseNodeFlowService {
  private readonly ziniaBNPLApiService = inject(ZiniaBnplApiService);
  private readonly store = inject(Store);

  optVerify<PaymentResponseDetails>(
    flowId: string, paymentMethod: PaymentMethodEnum, data: any
  ): Observable<NodePaymentResponseInterface<PaymentResponseDetails>> {
    return this.ziniaBNPLApiService.optVerify<PaymentResponseDetails>(
      flowId,
      paymentMethod,
      this.flow.connectionId,
      data
    ).pipe(
      switchMap(response => response.payment?.apiCallId
          ? this.store.dispatch(new GetApiCallData(response))
          : this.store.dispatch(new PatchPaymentResponse(response))
      ),
      map(() => this.store.selectSnapshot<NodePaymentResponseInterface<PaymentResponseDetails>>(PaymentState.response))
    );
  }

  updateInfo<PaymentResponseDetails>(): Observable<NodePaymentResponseInterface<PaymentResponseDetails>> {
    return this.store.selectOnce(PaymentState.response).pipe(
      withLatestFrom(this.store.selectOnce(PaymentState.paymentPayload)),
      switchMap(([resp, paymentPayload]) => this.ziniaBNPLApiService.updateInfo(
        this.flow.id,
        this.paymentMethod,
        this.flow.connectionId,
        resp.id,
        paymentPayload,
      ).pipe(
        switchMap(response => response.payment.apiCallId
          ? this.store.dispatch([new PatchPaymentResponse(response), new GetApiCallData(response)])
          : this.store.dispatch(new PatchPaymentResponse(response))
        ),
        switchMap(() => this.store.dispatch(new SetPaymentComplete())),
        map(() => this.store.selectSnapshot(PaymentState.response)),
      ))
    );
  }
}
