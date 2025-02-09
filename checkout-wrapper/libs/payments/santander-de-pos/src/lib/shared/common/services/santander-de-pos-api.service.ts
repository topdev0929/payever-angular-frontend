import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AbstractApiService, ApiErrorType } from '@pe/checkout/api';
import {
  AnalyzedDocumentsData,
  AnalyzeDocument,
  NodePaymentResponseInterface,
  PaymentMethodEnum,
  SendDocument,
} from '@pe/checkout/types';

@Injectable({
  providedIn: 'root',
})
export class SantanderDePosApiService extends AbstractApiService {

  postPaymentActionSimple<PaymentResponseDetails>(
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    connectionId: string,
    actionName: string,
    paymentId: string,
  ): Observable<NodePaymentResponseInterface<PaymentResponseDetails>> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/${actionName}`;

    return this.http.post<NodePaymentResponseInterface<PaymentResponseDetails>>(url, { paymentId }).pipe(
      catchError(err => this.logError(err, flowId, paymentMethod, { url, method: 'POST' }, ApiErrorType.ErrorSubmit))
    );
  }

  analyzeDocuments(
    docs: AnalyzeDocument[],
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    connectionId: string
  ): Observable<AnalyzedDocumentsData> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/analyze-document`;
    const payload = {
      images: docs.map(doc => doc.content.replace(`data:image/${doc.type};base64,`, '')),
      mimeType: `image/${docs[0].type}`,
    };

    return this.http.post<AnalyzedDocumentsData>(url, payload).pipe(
      catchError(err => this.logError(err, flowId, paymentMethod, { url, method: 'POST' }, ApiErrorType.ErrorRates))
    );
  }

  sendDocuments(
    paymentId: string,
    documents: SendDocument[],
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    connectionId: string
  ) {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/send-documents`;

    return this.http.post(url, { paymentId, documents }).pipe(
      catchError(err => this.logError(err, flowId, paymentMethod, { url, method: 'POST' }, ApiErrorType.ErrorRates))
    );
  }
}
