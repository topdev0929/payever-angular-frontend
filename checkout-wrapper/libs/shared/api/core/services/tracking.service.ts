import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

import { PaymentMethodEnum } from '@pe/checkout/types';
import { PE_ENV } from '@pe/common/core';

import { BaseTrackingService } from './base-tracking.service';

@Injectable({
  providedIn: 'root',
})
export class TrackingService extends BaseTrackingService {

  private readonly env = inject(PE_ENV);
  private readonly http = inject(HttpClient);

  protected doEmitEvent(
    flowId: string,
    paymentMethod: PaymentMethodEnum,
    eventCode: string,
    details?: { [key: string]: any },
  ): void {
    this.http.post(
      `${this.env.backend.checkoutAnalytics}/api/event`,
      {
        type: eventCode,
        userAgent: window.navigator.userAgent,
        paymentFlowId: flowId,
        paymentMethod: paymentMethod,
        ...details,
      },
    ).subscribe();
  }
}
