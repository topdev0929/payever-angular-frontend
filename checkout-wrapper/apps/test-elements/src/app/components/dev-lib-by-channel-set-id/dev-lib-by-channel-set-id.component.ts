import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { Subject } from 'rxjs';

import {
  BaseTimestampEvent as TimestampEvent,
  CartItemInterface,
  CheckoutStateParamsInterface,
  FlowInterface,
} from '@pe/checkout/types';

import { CheckoutWrapperInstanceInterface } from '../../services';
import { BaseDevByComponent } from '../base-dev-by.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dev-lib-by-channel-set-id.component.html',
})
export class DevLibByChannelSetIdComponent extends BaseDevByComponent implements AfterViewInit {

  instance: CheckoutWrapperInstanceInterface = null;

  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;

  @LocalStorage() private channelSetIdValue = '1d802abf-13da-47a4-8b46-02366250c6a9';
    // '1d802abf-13da-47a4-8b46-02366250c6a9';
    // '84135165-0f4e-4f44-990d-cee67e4c5c06';
    // '1d802abf-13da-47a4-8b46-02366250c6a9';
    // '1e4e542f-73cb-4ae7-a58d-b3215aade69e';
    // '4b8d0b20-24e0-4af3-8707-42037023add7';

  reCreateFlow$: Subject<TimestampEvent> = new Subject();

  cart: CartItemInterface[] = [
    // {"uuid":"0e309207-fd42-4632-b8fe-53ee7bc2d1c4", "name": "First cart item", "quantity":1},
    // {"uuid":"2959bc5e-0e49-4d07-9f80-92057f73d33a", "name": "First cart item", "quantity":2}
    // {"uuid":"581b732e-0162-48c2-9e8f-c0b3acb5a05e", "name": "First cart item", "quantity":2}
    { productId: '5263c79d-e284-47fc-89d3-49f545a05704', quantity: 1 },
  ];

  ngAfterViewInit(): void {
    this.elementsManagerService.insertByChannelSetId(this.container, {
      createFlowParams: { channelSetId: this.channelSetIdValue },
      params: this.params,
      cart: this.cart,
      disableLocaleDetection: false,
      checkoutHidden: false,

      layoutShown: () => {
        // eslint-disable-next-line
        console.log('EVENT layoutShown');
      },
      eventEmitted: (event: any) => {
        this.onEventEmitted( { detail: event });
      },
      // eslint-disable-next-line
      closed: () => {},
    }, null).subscribe((instance: any) => {
      this.instance = instance;
      // eslint-disable-next-line
      console.log('checkout created', instance);
    });
  }

  saveFlowToStorage(): void {
    this.instance.saveFlowToStorage().subscribe({
      // eslint-disable-next-line
      error: err => console.error(err),
    });
  }

  reCreateFlow(): void {
    this.instance.reCreateFlow().subscribe((instance) => {
      this.instance = instance;
      // eslint-disable-next-line
      console.log('checkout re-created', instance);
    }, (err) => {
      // eslint-disable-next-line
      console.error(err);
    });
  }

  paramsChanged(params: CheckoutStateParamsInterface): void {
    this.instance?.setParams(params);
    super.paramsChanged(params);
  }

  set channelSetId(channelSetId: string) {
    this.channelSetIdValue = channelSetId;
  }

  get channelSetId(): string {
    return this.channelSetIdValue;
  }

  onFlowCloned(event: any): void {
    const flow: FlowInterface = event?.detail ? event?.detail.cloned : null;
    // eslint-disable-next-line
    console.log('Flow was cloned', flow);
  }
}
