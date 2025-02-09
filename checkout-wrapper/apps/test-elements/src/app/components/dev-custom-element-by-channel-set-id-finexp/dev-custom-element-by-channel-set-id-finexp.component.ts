import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { Subject } from 'rxjs';

import {
  BaseTimestampEvent as TimestampEvent,
  CartItemInterface,
  FlowInterface,
  PaymentMethodEnum,
} from '@pe/checkout/types';

// eslint-disable-next-line
import { FinExpCreateFlowParamsInterface } from '../../../../../custom-elements/src/app/checkout-wrapper-by-channel-set-id-finexp/checkout-wrapper-by-channel-set-id-finexp.component';
import { BaseDevByComponent } from '../base-dev-by.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dev-custom-element-by-channel-set-id-finexp.component.html',
})
export class DevCustomElementByChannelSetIdFinExpComponent extends BaseDevByComponent {

  @LocalStorage() amount = 1000;
  @LocalStorage() paymentMethod: PaymentMethodEnum = PaymentMethodEnum.SANTANDER_INSTALLMENT_AT;

  @LocalStorage() private channelSetIdValue = '90b135fa-22f2-40ff-b3ea-314df63338f5';

  paymentMethods: string[] = Object.values(PaymentMethodEnum);

  reCreateFlow$: Subject<TimestampEvent> = new Subject();

  cart: CartItemInterface[] = [
    // {"uuid":"0e309207-fd42-4632-b8fe-53ee7bc2d1c4", "name": "First cart item", "quantity":1},
    // {"uuid":"2959bc5e-0e49-4d07-9f80-92057f73d33a", "name": "First cart item", "quantity":2}
    // {"uuid":"581b732e-0162-48c2-9e8f-c0b3acb5a05e", "name": "First cart item", "quantity":2}
  ];

  set channelSetId(channelSetId: string) {
    this.channelSetIdValue = channelSetId;
  }

  get channelSetId(): string {
    return this.channelSetIdValue;
  }

  getFinExpCreateFlowParams(): FinExpCreateFlowParamsInterface {
    return { channelSetId: this.channelSetId, apiCallData: { amount: this.amount, paymentMethod: this.paymentMethod } };
  }

  onFlowCloned(event: any): void {
    const flow: FlowInterface = event?.detail ? event?.detail.cloned : null;
    // eslint-disable-next-line
    console.log('Flow was cloned', flow);
  }

  reCreateFlow(): void {
    this.reCreateFlow$.next(new TimestampEvent());
  }
}
