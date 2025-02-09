import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AbstractApiService, ApiErrorType } from '@pe/checkout/api';
import { NodePaymentResponseInterface, PaymentMethodEnum } from '@pe/checkout/types';

import { SendDocument, WebIDIdentMode } from '../types';

@Injectable()
export class SantanderDeApiService extends AbstractApiService {
  sendDocuments(
    docs: SendDocument[],
    paymentId: string,
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    connectionId: string
  ): Observable<any> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/send-documents`;
    const documents = docs.map((d => ({
      ...d,
      file: d.file.split(';base64,')[1],
    })));

    return this.http.post(url, { paymentId, documents }).pipe(
      catchError(err => this.logError(err, flowId, paymentMethod, { url, method: 'POST' }, ApiErrorType.ErrorRates))
    );
  }

  getWebIDIdentificationURL<PaymentResponseDetails>(
    identMode: WebIDIdentMode,
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    connectionId: string,
    paymentId: string,
  ): Observable<NodePaymentResponseInterface<PaymentResponseDetails>>{
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/start-identification`;

    return this.http.post<NodePaymentResponseInterface<PaymentResponseDetails>>(url, { paymentId, identMode }).pipe(
      catchError(err => this.logError(err, flowId, paymentMethod, { url, method: 'POST' }, ApiErrorType.ErrorSubmit))
    );
  }
}