import { Injectable, inject } from '@angular/core';
import { PaymentRequestShippingAddress, PaymentRequestShippingOption } from '@stripe/stripe-js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  AddressInterface,
  CustomWidgetConfigInterface,
  FlowInterface,
  PaymentMethodEnum,
} from '@pe/checkout/types';

import { ShippingOptionsDTO } from '../models/payment.dto';

import { StripeWalletApiService } from './stripe-wallet-api.service';

@Injectable({
  providedIn: 'root',
})
export class StripeWalletService {

  private api = inject(StripeWalletApiService);

  public getPublishKey(
    paymentMethod: PaymentMethodEnum,
    channelSetId: string,
    amount: number,
    deliveryFee: number,
  ) {
    return this.api.initPayment(
      paymentMethod,
      {
        flow: {
          channelSetId,
        },
        initData: { amount, deliveryFee },
      },
    );
  }

  public createFlow(
    channelSetId: string,
    config: CustomWidgetConfigInterface,
    amount: number,
  ) {
    return this.api.createFlow({
      channelSetId,
      amount,
      cancelUrl: config.cancelUrl,
      failureUrl: config.failureUrl,
      successUrl: config.successUrl,
      noticeUrl: config.noticeUrl,
      pendingUrl: config.pendingUrl,
      ...config.reference && { reference: config.reference },
    });
  }

  public submitPayment(
    paymentMethod: PaymentMethodEnum,
    flow: FlowInterface,
    config: CustomWidgetConfigInterface,
    deliveryFee: number,
    shippingAddress: PaymentRequestShippingAddress,
    shippingOption: PaymentRequestShippingOption,
  ) {
    const shippingAddressRecipient = shippingAddress?.recipient?.split(' ') ?? [];

    const payload = {
      payment: {
        deliveryFee,
        amount: flow.amount,
        apiCallId: flow.apiCall.id,
        billingAddress: flow.billingAddress,
        businessId: flow.businessId,
        businessName: flow.businessName,
        channel: flow.channel,
        channelSetId: flow.channelSetId,
        currency: flow.currency,
        flowId: flow.id,
        reference: flow.reference,
        total: flow.total,
        shippingOption: {
          name: shippingOption.label,
          price: shippingOption.amount / 100,
          carrier: shippingOption.id,
        },
        ...shippingAddress && {
          shippingAddress: {
            city: shippingAddress.city,
            country: shippingAddress.country,
            zipCode: shippingAddress.postalCode,
            postalCode: shippingAddress.postalCode,
            state: shippingAddress.region,
            firstName: shippingAddressRecipient[0],
            lastName: shippingAddressRecipient[1],
            street: shippingAddress.addressLine.filter(Boolean).join(', '),
          } as AddressInterface,
        },
      },
      paymentDetails: {
        frontendCancelUrl: config.cancelUrl,
        frontendFailureUrl: config.failureUrl,
        frontendFinishUrl: config.successUrl,
        quoteCallbackUrl: config.quoteCallbackUrl,
      },
      paymentItems: config.cart ?? [],
    };

    return this.api.submitPayment(paymentMethod, payload, flow.guestToken);
  }

  public getCallbacks(flowId: string, token: string) {
    return this.api.getCallbacks(flowId, token);
  }

  public getShippingOptions(url: string, shippingData: ShippingOptionsDTO): Observable<PaymentRequestShippingOption[]> {
    return this.api.getShippingOptions(url, shippingData).pipe(
      map(response => response.shippingMethods.map(item => ({
        id: item.reference,
        label: item.name,
        detail: '',
        amount: item.price * 100,
      }))),
    );
  }
}
