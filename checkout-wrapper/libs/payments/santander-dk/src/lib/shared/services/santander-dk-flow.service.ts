import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable } from 'rxjs';

import { BaseNodeFlowService } from '@pe/checkout/node-api';
import { PaymentState } from '@pe/checkout/store';
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
} from '@pe/checkout/types';

import { SantanderDkApiService } from './santander-dk-api.service';

@Injectable()
export class SantanderDkFlowService extends BaseNodeFlowService {

  @SelectSnapshot(PaymentState.paymentPayload) private paymentPayload: NodePaymentInterface<any>;

  private santanderDkApiService = this.injector.get(SantanderDkApiService);

  getCreditProducts<TRates, TParams>(
    params: TParams,
  ): Observable<TRates> {
    return this.santanderDkApiService.getCreditProducts<TRates, TParams>(
      params,
      this.flow.id,
      this.paymentMethod,
      this.flow.connectionId,
    );
  }

  prepareMitIDAuthRedirect(
    params: NodeAuthMitIDParams,
  ): Observable<NodeAuthMitIDRedirectData> {
    return this.santanderDkApiService.prepareMitIDAuthRedirect(
      this.paymentMethod,
      this.flow.connectionId,
      this.paymentPayload,
      params,
    );
  }

  prepareSkatAuthRedirect(
    params: NodeAuthSkatParams,
  ): Observable<NodeAuthSkatRedirectData> {
    return this.santanderDkApiService.prepareSkatAuthRedirect(
      this.paymentMethod,
      this.flow.connectionId,
      this.paymentPayload,
      params,
    );
  }

  prepareBankConsentRedirect(params: NodeBankConsentParams): Observable<NodeBankConsentRedirectData> {
    return this.santanderDkApiService.prepareBankConsentRedirect(
      this.paymentMethod,
      this.flow.connectionId,
      this.paymentPayload,
      params,
    );
  }

  getFormConfig(
    params: NodeDenmarkFormConfigParams,
  ): Observable<NodeDenmarkFormConfigData> {
    return this.santanderDkApiService.getDenmarkFormConfig(
      this.paymentMethod,
      this.flow.connectionId,
      this.paymentPayload,
      params,
    );
  }

  getInsuranceConfig(
    params: NodeDenmarkInsuranceConfigParams,
  ): Observable<NodeDenmarkInsuranceConfigData> {
    return this.santanderDkApiService.getDenmarkInsuranceConfig(
      this.paymentMethod,
      this.flow.connectionId,
      this.paymentPayload,
      params,
    );
  }
}
