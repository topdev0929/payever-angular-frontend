import { Stripe } from '@stripe/stripe-js';
import { Observable } from 'rxjs';

import { CustomWidgetConfigInterface } from '@pe/checkout/types';

export interface PayComponent {
  channelSetId: string;
  config: CustomWidgetConfigInterface;
  amount: number;
  theme?: string;
  isDebugMode?: boolean;
}

export interface PayService {
  init(
    channelSetId: string,
    config: CustomWidgetConfigInterface,
    amount: number,
  ): Observable<{
    stripe: Stripe,
    paymentRequest: PaymentRequest,
  }>;
}
