import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AbstractApiService, ApiErrorType } from '@pe/checkout/api';
import {
  NodePaymentInterface,
  NodePaymentResponseInterface,
  PaymentMethodEnum,
} from '@pe/checkout/types';

@Injectable({
  providedIn: 'any',
})
export class OpenbankApiService extends AbstractApiService {

  optVerify<PaymentResponseDetails>(
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    connectionId: string,
    data: any,
  ): Observable<NodePaymentResponseInterface<PaymentResponseDetails>> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/verify-otp-code`;

    return this.http.post<NodePaymentResponseInterface<PaymentResponseDetails>>(url, data).pipe(
      catchError(err => this.logError(err, flowId, paymentMethod, { url, method: 'POST' }, ApiErrorType.ErrorSubmit))
    );
  }

  updateInfo<PaymentResponseDetails>(
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    connectionId: string,
    paymentId: string,
    nodeData: NodePaymentInterface<PaymentResponseDetails>,
  ): Observable<NodePaymentResponseInterface<PaymentResponseDetails>> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/update-details`;

    return this.http.post<NodePaymentResponseInterface<PaymentResponseDetails>>(
      url,
      { ...nodeData, paymentId },
    ).pipe(
      catchError(err => this.logError(err, flowId, paymentMethod, { url, method: 'POST' }, ApiErrorType.ErrorSubmit)),
    );
  }
}
