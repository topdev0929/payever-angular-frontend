import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AbstractApiService } from '@pe/checkout/api';
import { NodePaymentResponseInterface } from '@pe/checkout/types';

@Injectable()
export class BfsApiService extends AbstractApiService {
  getPayment<PaymentResponseDetails>(
    connectionId: string,
    paymentId: string,
  ): Observable<NodePaymentResponseInterface<PaymentResponseDetails>> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/get-payment`;

    return this.http.post<NodePaymentResponseInterface<PaymentResponseDetails>>(url, { paymentId });
  }

}
