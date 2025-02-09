import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AbstractApiService, ApiErrorType } from '@pe/checkout/api';
import type {
  NodePaymentInterface,
  NodePaymentResponseInterface,
  NodeSwedenSSNDetails,
  PaymentMethodEnum,
} from '@pe/checkout/types';

import type {
  AuthenticationInitializationResponse,
  AuthenticationStatusResponse,
  SantanderSeApplicationResponse,
} from '../types';

@Injectable()
export class SantanderSeApiService extends AbstractApiService {

  startMobileSigning<PaymentResponseDetails>(
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    connectionId: string,
    paymentId: string,
  ): Observable<NodePaymentResponseInterface<PaymentResponseDetails>> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/start-mobile-signing`;

    return this.http.post<NodePaymentResponseInterface<PaymentResponseDetails>>(url, { paymentId }).pipe(
      catchError(err => this.logError(err, flowId, paymentMethod, { url, method: 'POST' }, ApiErrorType.ErrorSubmit))
    );
  }

  initiateAuthentication(ssn: string, connectionId: string): Observable<AuthenticationInitializationResponse> {
    return this.http.post<AuthenticationInitializationResponse>(
      `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/initiate-authentication`,
      {
        socialSecurityNumber: ssn,
      },
    );
  }

  getAuthenticationStatus(transactionId: string, connectionId: string): Observable<AuthenticationStatusResponse> {
    return this.http.post<AuthenticationStatusResponse>(
      `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/get-authentication-status`,
      {
        transactionId,
      },
    );
  }

  getSwedenSSNDetails(
    paymentMethod: PaymentMethodEnum,
    businessId: string,
    connectionId: string,
    nodeData: NodePaymentInterface<any>,
    ssn: string,
    amount: number
  ): Observable<NodeSwedenSSNDetails> {
    const url = `${this.env.thirdParty.payments}/api/business/${businessId}/connection/${connectionId}/action/get-address-by-ssn`;

    return this.http.post<NodeSwedenSSNDetails>(
      url,
      {
        socialSecurityNumber: ssn,
        amount,
      },
    ).pipe(
      catchError(err => this.logError(err, nodeData.payment.flowId, paymentMethod, { url, method: 'POST' })),
    );
  }

  getApplication(
    paymentMethod: PaymentMethodEnum,
    businessId: string,
    connectionId: string,
    nodeData: NodePaymentInterface<any>,
    inquiryId: string,
  ): Observable<SantanderSeApplicationResponse> {
    const url = `${this.env.thirdParty.payments}/api/business/${businessId}/connection/${connectionId}/action/get-application`;

    return this.http.post<SantanderSeApplicationResponse>(url, { inquiryId }).pipe(
      catchError(err => this.logError(err, nodeData.payment.flowId, paymentMethod, { url, method: 'POST' })),
    );
  }

  postMoreInfo<PaymentResponseDetails>(
    paymentMethod: PaymentMethodEnum,
    connectionId: string,
    paymentId: string,
    nodeData: NodePaymentInterface<PaymentResponseDetails>,
  ): Observable<NodePaymentResponseInterface<PaymentResponseDetails>> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/update-payment-additional-info`;
    const flowId = nodeData.payment.flowId;

    return this.http.post<NodePaymentResponseInterface<PaymentResponseDetails>>(
      url,
      { ...nodeData.paymentDetails, paymentId },
    ).pipe(
      catchError(err => this.logError(err, flowId, paymentMethod, { url, method: 'POST' }, ApiErrorType.ErrorSubmit)),
    );
  }
}
