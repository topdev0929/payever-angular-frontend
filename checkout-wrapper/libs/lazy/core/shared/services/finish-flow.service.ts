import { Injectable, Injector } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { PluginEventsService } from '@pe/checkout/plugins';
import { CheckoutState, FlowState } from '@pe/checkout/store';
import { FlowInterface, FlowStateEnum } from '@pe/checkout/types';


@Injectable({
  providedIn: 'root',
})
export class FinishFlowService {

  @SelectSnapshot(FlowState.flow) flow!: FlowInterface;

  @SelectSnapshot(CheckoutState.paymentComplete) private paymentComplete: boolean;

  private pluginEventsService: PluginEventsService = this.injector.get(PluginEventsService);

  constructor(private injector: Injector) {}

  closeCheckout(flow: FlowInterface, isModalOpen = false): void {
    this.pluginEventsService.emitClosed(
      flow.id,
      !!flow?.payment?.status
      || flow?.state === FlowStateEnum.FINISH
      || isModalOpen
      || this.paymentComplete
    );

    if (window.parent !== window) {
      // For now we have to send closed event twice to trigger flow
      // recreate in shop when it should be (when wrapper in iframe)
      this.pluginEventsService.emitClosed(
        this.flow.id,
        !!this.flow?.payment?.status
        || this.flow?.state === FlowStateEnum.FINISH
        || isModalOpen
        || this.paymentComplete
      );
    }
  }

}
