import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import { TransferHttpService } from '@gorniv/ngx-universal';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PebAppType } from '@pe/builder-core';
import { CreateFlowService } from '@pe/checkout-sdk/sdk/api';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';

import { ClientLauncherService } from '../../../app/services';
import { TRANSFER_HTTP_SERVICE } from '../inject-tokens';
import { CurrencyInterface, FlowBodyInterface, FlowDataInterface } from '../interfaces';

export class CheckoutApiService {
  private httpService: TransferHttpService | HttpClient = this.transferHttpService || this.http;

  constructor(
    private configService: EnvironmentConfigService,
    private createFlowService: CreateFlowService,
    private clientLauncherService: ClientLauncherService,
    private http: HttpClient,
    // NOTE: transferHttpService can be injected from builder client for SSR
    @Inject(TRANSFER_HTTP_SERVICE) @Optional() private transferHttpService: TransferHttpService,
  ) {}

  createFlow(flowBody: FlowBodyInterface): Observable<FlowDataInterface> {
    const path = `${this.configService.getBackendConfig().payments}/api/rest/v1/checkout/flow`;

    return this.createFlowService.createFlow({
      // TODO "pos_merchant_mode" should be renamed to "keep_payment_on_fail". Because it's nothing about merchant.
      flowRawData: { ...flowBody, ...(this.isPosTerminal !== undefined ? { pos_merchant_mode: !!this.isPosTerminal } : {}) },
      channelSetId: flowBody.channel_set_id,
      // When we open POS terminal outside commercos - it means tablet in store where user can pay with payment verification code
      generatePaymentCode: this.isPosTerminal && !this.isInIframe,
    }).pipe(map(d => d.flow as FlowDataInterface));
/*
    // Request must have withCredentials and Bearer token
    return this.http.post<FlowDataInterface>(path, {
      ...flowBody,
      // TODO "pos_merchant_mode" should be renamed to "keep_payment_on_fail". Because it's nothing about merchant.
      ...(this.isPosTerminal !== undefined ? { pos_merchant_mode: !!this.isPosTerminal } : {}),
    },
    {
      withCredentials: true,
      ...(this.token && { headers: { Authorization: `Bearer ${this.token}` } }),
    });*/
  }

  patchFlow(flowId: string, flowIdentifier: string, flowData: FlowBodyInterface): Observable<FlowDataInterface> {
    // Request must have withCredentials and Bearer token
    return this.http.patch<FlowDataInterface>(
      `${this.configService.getBackendConfig().payments}/api/rest/v1/checkout/flow/${flowId}`,
      {
        ...flowData,
        // ...(this.merchantMode !== undefined && { pos_merchant_mode: this.merchantMode }),
      },
      {
        headers: {
          'flow-identifier': flowIdentifier,
          ...(this.token && { Authorization: `Bearer ${this.token}` }),
        },
        withCredentials: true,
      },
    );
  }

  getCurrency(business: string): Observable<CurrencyInterface> {
    const path = `${this.configService.getBackendConfig().builder}/api/business/${business}/currency`;

    // @ts-ignore
    return this.httpService.get<CurrencyInterface>(path);
  }

  set token(value: string) {
    localStorage.setItem('pe_auth_token', value);
  }

  get token(): string {
    return localStorage.getItem('pe_auth_token');
  }

  // set merchantMode(value: boolean) {
  //   localStorage.setItem('pos_merchant_mode', JSON.stringify(value));
  // }

  // get merchantMode(): boolean {
  //   return JSON.parse(localStorage.getItem('pos_merchant_mode'));
  // }

  get isPosTerminal(): boolean {
    return this.clientLauncherService.currentApp === PebAppType.pos;
  }

  get isInIframe(): boolean {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }
}
