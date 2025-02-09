import { Component, ChangeDetectionStrategy } from '@angular/core';
import { LocalStorage } from 'ngx-webstorage';
import { Subject } from 'rxjs';

import { CreateFlowParamsInterface } from '@pe/checkout/api';
import {
  CheckoutStateParamsInterface,
  FlowInterface,
  BaseTimestampEvent as TimestampEvent,
} from '@pe/checkout/types';

import { BaseDevByComponent } from '../base-dev-by.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dev-custom-element-as-finexp.component.html',
})
export class DevCustomElementAsFinexpComponent extends BaseDevByComponent {

  @LocalStorage() private channelSetIdValue = '8d46a5b1-29f2-4f8c-8d55-1119402bf8de';

  isShowing = true;
  reCreateFlow$: Subject<TimestampEvent> = new Subject();

  defaultParams: CheckoutStateParamsInterface = {
    embeddedMode: true,
    forceNoPaddings: true,
    forceNoCloseButton: true,
    setDemo: true,
  };

  set channelSetId(channelSetId: string) {
    this.channelSetIdValue = channelSetId;
  }

  get channelSetId(): string {
    return this.channelSetIdValue;
  }

  get createFlowParams(): CreateFlowParamsInterface {
    return {
      amount: 3000,
      reference: 'TESTTEST',
      // express: true,
      channelSetId: this.channelSetId,
    };
  }

  onFlowCloned(event: any): void {
    const flow: FlowInterface = event?.detail ? event?.detail.cloned : null;
    // eslint-disable-next-line
    console.log('Flow was cloned', flow);
  }

  reCreateFlow(): void {
    this.reCreateFlow$.next(new TimestampEvent());
  }

  toggleShow(): void {
    this.isShowing = !this.isShowing;
  }
}
