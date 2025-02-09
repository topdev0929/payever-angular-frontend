import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import {
  CustomWidgetConfigInterface,
  FlowInterface,
  CheckoutSettingsInterface,
  PaymentItem,
  PaymentPayload,
} from '@pe/checkout/types';

import { FlowRequestDto } from '../models';

import { IvyWidgetApiService } from './ivy-widget-api.service';

@Injectable()
export class IvyWidgetService {

  public token: string;

  constructor(
    private api: IvyWidgetApiService,
  ) {}

  public createFlow(payload: FlowRequestDto) {
    return this.api.createFlow(payload).pipe(
      tap((flow) => {
        this.token = flow.guestToken;
      }),
    );
  }

  public getSettings(channelSetId: string): Observable<CheckoutSettingsInterface> {
    return this.api.getSettings(channelSetId);
  }

  public getConnection(channelSetId: string) {
    return this.api.getConnection(channelSetId);
  }

  public submitPayment(
    flow: FlowInterface,
    connectionId: string,
    amount: number,
    channelSetId: string,
    settings: CheckoutSettingsInterface,
    config: CustomWidgetConfigInterface,
    cart: PaymentItem[],
  ) {
    const deliveryFee = config.shippingOption?.price ?? 0;
    const payload: PaymentPayload = {
      payment: {
        flowId: flow.id,
        amount,
        channelSetId,
        currency: settings.currency,
        deliveryFee,
        businessId: settings.businessUuid,
        businessName: settings.businessName,
        channel: settings.channelType,
        reference: config.reference,
        total: amount + deliveryFee,
        billingAddress: config.billingAddress,
        shippingAddress: config.shippingAddress,
        shippingOption: config.shippingOption,
        apiCallId: flow.apiCall?.id,
      },
      paymentDetails: {
        frontendFailureUrl: window.location.href,
        frontendCancelUrl: config.cancelUrl || config.failureUrl || '',
        frontendFinishUrl: config.successUrl,
        quoteCallbackUrl: config.quoteCallbackUrl,
      },
      paymentItems: cart || config.cart,
    };

    return this.api.submitPayment(connectionId, payload, this.token);
  }
}
