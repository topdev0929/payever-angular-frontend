import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable } from 'rxjs';

import { BaseNodeFlowService } from '@pe/checkout/node-api';
import { PaymentState } from '@pe/checkout/store';
import { NodePaymentInterface, NodePaymentPreInitializeData, PaymentMethodEnum } from '@pe/checkout/types';

import { StripeApiService } from './stripe-api.service';

@Injectable()
export class StripeFlowService extends BaseNodeFlowService {

  @SelectSnapshot(PaymentState.paymentPayload)
  private paymentPayload: NodePaymentInterface<any>;

  private stripeApiService = this.injector.get(StripeApiService);

  getStripeData(): Observable<NodePaymentPreInitializeData> {
    return this.stripeApiService.paymentPublishKey(
      PaymentMethodEnum.STRIPE,
      this.flow.connectionId,
      this.paymentPayload,
    );
  }
}
