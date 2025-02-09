import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BYPASS_AUTH } from '@pe/checkout/api';
import { FlowInterface, PaymentPayload } from '@pe/checkout/types';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { ConnectionDTO, FlowRequestDto, TokenDTO } from '../models';

@Injectable()
export class IvyWidgetApiService {

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private http: HttpClient,
  ) {}

  public createFlow(payload: FlowRequestDto) {
    return this.http.post<FlowInterface>(`${this.env.backend.checkout}/api/flow/v1`, payload);
  }

  public getSettings(channelSetId: string) {
    return this.http.get(`${this.env.backend.checkout}/api/checkout/channel-set/${channelSetId}/full-settings`);
  }

  public getGuestToken(): Observable<TokenDTO> {
    return this.http.post<TokenDTO>(`${this.env.backend.auth}/api/guest-token`, {});
  }

  public getConnection(channelSetId: string): Observable<ConnectionDTO> {
    return this.http.get<ConnectionDTO>(
      `${this.env.backend.checkout}/api/channel-set/${channelSetId}/default-connection/ivy`
    );
  }

  public submitPayment(
    connectionId: string,
    body: PaymentPayload,
    token: string,
  ): Observable<any> {
    return this.http.post(
      `${this.env.thirdParty.payments}/api/connection/${connectionId}/action/pay`,
      body,
      {
        context: new HttpContext().set(BYPASS_AUTH, true),
        headers: new HttpHeaders().append('authorization', `Bearer ${token}`),
      }
    );
  }
}
