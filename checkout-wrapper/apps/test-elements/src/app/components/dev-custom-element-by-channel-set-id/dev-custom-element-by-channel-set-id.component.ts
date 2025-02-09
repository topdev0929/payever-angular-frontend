import { Component, ChangeDetectionStrategy } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { Subject } from 'rxjs';

import { CreateFlowParamsInterface } from '@pe/checkout/api';
import {
  BaseTimestampEvent as TimestampEvent,
  CartItemInterface,
  FlowInterface,
} from '@pe/checkout/types';

import { BaseDevByComponent } from '../base-dev-by.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dev-custom-element-by-channel-set-id.component.html',
})
export class DevCustomElementByChannelSetIdComponent extends BaseDevByComponent {

  @LocalStorage() private channelSetIdValue =
    // '8dfc1913-56dc-4135-8e4c-0d9327504f3f'; // Test - UK Pos
    // '64461f1b-4cf0-455f-90ba-2b36bf118c5e'; // Staging - DE
     '3bd30155-1f7f-4c80-8e31-7a124e271883'; // Staging - DE POS
    // '74828412-c2bd-4146-a375-17d9e78dd64a'; Staging
    // 'cfe0b5f1-bdd9-4f8b-b5e9-a442b6a55223';
    // 'e0e9b189-8828-47fd-8a5a-b1c3c53647f0';
    // '4e0e633c-6e7d-4d49-af73-bc91cf339d64';
    // '1d802abf-13da-47a4-8b46-02366250c6a9';
    // '84135165-0f4e-4f44-990d-cee67e4c5c06';
    // '1d802abf-13da-47a4-8b46-02366250c6a9';
    // '1e4e542f-73cb-4ae7-a58d-b3215aade69e';
    // '4b8d0b20-24e0-4af3-8707-42037023add7';

  reCreateFlow$: Subject<TimestampEvent> = new Subject();
  reCreateFlowAndResetCart$: Subject<TimestampEvent> = new Subject();

  createParams: CreateFlowParamsInterface = {
    channelSetId: this.channelSetId,
    amount: 340,
    reference: 'TEST-GRUEN',
    flowRawData: {

    },
  };

  cart: CartItemInterface[] = [
    // {
    //   productId: '0e309207-fd42-4632-b8fe-53ee7bc2d1c4',
    //   identifier: '0e309207-fd42-4632-b8fe-53ee7bc2d1c4',
    //   name: 'First cart item',
    //   quantity: 1,
    //   price: 1100,
    // },
    // {
    //   productId: '2959bc5e-0e49-4d07-9f80-92057f73d33a',
    //   identifier: '2959bc5e-0e49-4d07-9f80-92057f73d33a',
    //   name: 'First cart item',
    //   quantity: 2,
    //   price: 1250,
    // },
    // {'uuid':'581b732e-0162-48c2-9e8f-c0b3acb5a05e', 'name': 'First cart item', 'quantity':2}
    // {uuid: '680d486d-c263-4868-aa32-b5103a3b1615', quantity: 1},
  ];

  set channelSetId(channelSetId: string) {
    this.channelSetIdValue = channelSetId;
  }

  get channelSetId(): string {
    return this.channelSetIdValue;
  }

  onFlowCloned(event: any): void {
    const flow: FlowInterface = event?.detail ? event?.detail.cloned : null;
    throw new Error(`Flow was cloned: ${JSON.stringify(flow)}`);
  }

  reCreateFlow(): void {
    this.reCreateFlow$.next(new TimestampEvent());
  }

  reCreateFlowAndResetCart(): void {
    this.cart = [];
    this.reCreateFlowAndResetCart$.next(new TimestampEvent());
  }
}
