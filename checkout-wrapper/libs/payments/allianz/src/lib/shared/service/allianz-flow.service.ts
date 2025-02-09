import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { BaseNodeFlowService } from '@pe/checkout/node-api';
import { PatchPaymentResponse, PaymentState } from '@pe/checkout/store';
import { NodePaymentResponseInterface } from '@pe/checkout/types';

import { AllianzApiService } from './allianz-api.service';

@Injectable()
export class AllianzFlowService extends BaseNodeFlowService {
  private allianzApiService = this.injector.get(AllianzApiService);
  private store = this.injector.get(Store);

  getPayment<PaymentResponseDetails>(): Observable<NodePaymentResponseInterface<PaymentResponseDetails>> {
    const paymentResponse
      = this.store.selectSnapshot<NodePaymentResponseInterface<PaymentResponseDetails>>(PaymentState.response);

    return this.allianzApiService.getPayment(
      this.flow.connectionId,
      paymentResponse.id,
    ).pipe(
      switchMap(response =>
        this.store.dispatch(new PatchPaymentResponse(response)),
      ),
    );
  }

}
