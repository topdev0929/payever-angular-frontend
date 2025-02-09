import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AbstractApiService, ApiErrorType } from '@pe/checkout/api';
import {
  NodeAuthMitIDParams,
  NodeAuthMitIDRedirectData,
  NodeAuthSkatParams,
  NodeAuthSkatRedirectData,
  NodeBankConsentParams,
  NodeBankConsentRedirectData,
  NodeDenmarkFormConfigData,
  NodeDenmarkFormConfigParams,
  NodeDenmarkInsuranceConfigData,
  NodeDenmarkInsuranceConfigParams,
  NodePaymentInterface,
  PaymentMethodEnum,
} from '@pe/checkout/types';

@Injectable()
export class SantanderDkApiService extends AbstractApiService {

  getCreditProducts<TRates, TParams>(
    params: TParams,
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    connectionId: string,
  ): Observable<TRates> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/get-products-by-connection`;

    return this.http.post<TRates>(url, params).pipe(
      catchError(err => this.logError(err, flowId, paymentMethod, { url, method: 'POST' }, ApiErrorType.ErrorRates))
    );
  }

  prepareMitIDAuthRedirect(
    paymentMethod: PaymentMethodEnum,
    connectionId: string,
    nodeData: NodePaymentInterface<any>,
     params: NodeAuthMitIDParams,
  ): Observable<NodeAuthMitIDRedirectData> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/prepare-application`;
    const data = {
      paymentFlowId: nodeData.payment.flowId,
      address: nodeData.payment.address,
      amount: nodeData.payment.total,
      reference: nodeData.payment.reference,
      productId: params.productId,
      duration: params.duration,
      frontPostBackUrl: params.frontPostBackUrl,
      items: nodeData.paymentItems?.map(a => ({
          id: a.identifier,
          name: a.name,
          quantity: a.quantity,
        })),
    };

    return this.http.post<NodeAuthMitIDRedirectData>(url, data).pipe(
      catchError(err => this.logError(err, nodeData.payment.flowId, paymentMethod, { url, method: 'POST' })),
    );
  }

  prepareSkatAuthRedirect(
    paymentMethod: PaymentMethodEnum,
    connectionId: string,
    nodeData: NodePaymentInterface<any>,
    params: NodeAuthSkatParams,
  ): Observable<NodeAuthSkatRedirectData> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/get-skat-posturl`;
    const data = {
      paymentFlowId: nodeData.payment.flowId,
      address: nodeData.payment.address,
      applicationNumber: params.applicationNumber,
      debtorId: params.debtorId,
      frontPostBackUrl: params.frontPostBackUrl,
    };

    return this.http.post<NodeAuthSkatRedirectData>(url, data).pipe(
      catchError(err => this.logError(err, nodeData.payment.flowId, paymentMethod, { url, method: 'POST' })),
    );
  }

  prepareBankConsentRedirect(
    paymentMethod: PaymentMethodEnum,
    connectionId: string,
    nodeData: NodePaymentInterface<any>,
    params: NodeBankConsentParams,
  ): Observable<NodeBankConsentRedirectData> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/get-bank-consent`;
    const data = {
      debtorId: params.debtorId,
      returnUrl: params.frontPostBackUrl,
    };

    return this.http.post<NodeBankConsentRedirectData>(url, data).pipe(
      catchError(err => this.logError(err, nodeData.payment.flowId, paymentMethod, { url, method: 'POST' })),
    );
  }

  getDenmarkFormConfig(
    paymentMethod: PaymentMethodEnum,
    connectionId: string,
    nodeData: NodePaymentInterface<any>,
    params: NodeDenmarkFormConfigParams,
  ): Observable<NodeDenmarkFormConfigData> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/debtor-process-state`;
    const data = {
      paymentFlowId: nodeData.payment.flowId,
      applicationNumber: params.applicationNumber,
      debtorId: params.debtorId,
    };

    return this.http.post<NodeDenmarkFormConfigData>(url, data).pipe(
      catchError(err => this.logError(err, nodeData.payment.flowId, paymentMethod, { url, method: 'POST' })),
    );
  }

  getDenmarkInsuranceConfig(
    paymentMethod: PaymentMethodEnum,
    connectionId: string,
    nodeData: NodePaymentInterface<any>,
    params: NodeDenmarkInsuranceConfigParams,
  ): Observable<NodeDenmarkInsuranceConfigData> {
    const url = `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/get-insurance-data`;
    const data = {
      paymentFlowId: nodeData.payment.flowId,
      applicationNumber: params.applicationNumber,
      debtorId: params.debtorId,
      cpr: params.cpr,
    };

    return this.http.post<NodeDenmarkInsuranceConfigData>(url, data).pipe(
      catchError(err => this.logError(err, nodeData.payment.flowId, paymentMethod, { url, method: 'POST' })),
    );
  }

  downloadQrCode(
    url: string,
    type: string,
  ): Observable<any> {
    const params = new HttpParams().appendAll({ url, type });

    return this.http.get<string>(
      `${this.env.connect.qr}/api/download/${type}`,
      { params, responseType: 'blob' as any },
    );
  }
}
