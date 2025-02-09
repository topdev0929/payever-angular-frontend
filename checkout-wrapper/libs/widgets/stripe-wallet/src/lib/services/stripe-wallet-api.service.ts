import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { BYPASS_AUTH } from '@pe/checkout/api';
import {
  NodeApiCallInterface,
  NodePaymentResponseInterface,
  PaymentMethodEnum,
  PaymentPayload,
} from '@pe/checkout/types';
import { PE_ENV } from '@pe/common';

import {
  CreateFlowRequestDto,
  CreateFlowResponseDto,
  PublishKeyRequestDto,
  PublishKeyResponseDto,
} from '../models';
import { ShippingMethods, ShippingOptionsDTO } from '../models/payment.dto';

@Injectable({
  providedIn: 'root',
})
export class StripeWalletApiService {

  private readonly http = inject(HttpClient);
  private readonly env = inject(PE_ENV);

  public initPayment(
    paymentMethod: PaymentMethodEnum,
    payload: PublishKeyRequestDto,
  ) {
    return this.http.post<PublishKeyResponseDto>(
      `${this.env.backend.checkout}/api/finance-express/${paymentMethod}/init`,
      payload,
    );
  }

  public createFlow(
    payload: CreateFlowRequestDto,
  ) {
    return this.http.post<CreateFlowResponseDto>(
      `${this.env.backend.checkout}/api/flow/v1`,
      payload,
      {
        context: new HttpContext().set(BYPASS_AUTH, true),
      },
    );
  }

  public submitPayment(
    paymentMethod: PaymentMethodEnum,
    body: PaymentPayload,
    token: string,
  ) {
    return this.http.post<NodePaymentResponseInterface<any>>(
      `${this.env.backend.checkout}/api/finance-express/${paymentMethod}/pay`,
      body,
      {
        context: new HttpContext().set(BYPASS_AUTH, true),
        headers: new HttpHeaders().append('authorization', `Bearer ${token}`),
      }
    );
  }

  public getCallbacks(flowId: string, token: string) {
    return this.http.get<NodeApiCallInterface>(
      `${this.env.backend.checkout}/api/flow/v1/${flowId}/callbacks`,
      {
        context: new HttpContext().set(BYPASS_AUTH, true),
        headers: new HttpHeaders().append('authorization', `Bearer ${token}`),
      }
    );
  }

  public getShippingOptions(url: string, shippingData: ShippingOptionsDTO) {
    return this.http.post<ShippingMethods>(
      url,
      {
        shipping: {
          shippingAddress: shippingData,
        },
      },
    );
  }
}
