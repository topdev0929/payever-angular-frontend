import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { BaseNodeFlowService } from '@pe/checkout/node-api';
import { PatchPaymentResponse, PaymentState } from '@pe/checkout/store';
import { NodePaymentResponseInterface } from '@pe/checkout/types';

import { BfsApiService } from './bfs-api.service';

@Injectable()
export class BfsFlowService extends BaseNodeFlowService {
  private bfsApiService = this.injector.get(BfsApiService);
  private store = this.injector.get(Store);

  getPayment<PaymentResponseDetails>(): Observable<NodePaymentResponseInterface<PaymentResponseDetails>> {
    const paymentResponse
      = this.store.selectSnapshot<NodePaymentResponseInterface<PaymentResponseDetails>>(PaymentState.response);

    return this.bfsApiService.getPayment(
      this.flow.connectionId,
      paymentResponse.id,
    ).pipe(
      switchMap(response =>
        this.store.dispatch(new PatchPaymentResponse(response)),
      ),
    );
  }

}
