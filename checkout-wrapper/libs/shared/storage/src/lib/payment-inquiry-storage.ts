import { Injectable, Injector } from '@angular/core';


import { FlowStorage } from './flow-storage';

const FLOW_ENABLE_DURATIONS_KEY = 'pe-checkout_flowEnableDurations';

/**
 * @deprecated
 */
@Injectable()
/**
 * class for storing data and sharing it between steps.
 * we use 'any' because:
 * - interfaces are different in each payment method
 * - anyway we are storing any typed objects in storage
 */
export class PaymentInquiryStorage {

  private flowStorage = this.injector.get(FlowStorage);

  private flowId: string;

  constructor(protected injector: Injector) {}

  setExtraDurations(flowId: string, value: number[]) {
    if (!this.flowId) {
      throw Error('Attempt to use storage without flowId set');
    }

    this.flowStorage.setData(flowId, FLOW_ENABLE_DURATIONS_KEY, value);
  }

  getExtraDurations(flowId: string):number[] {
    if (!flowId) {
      throw Error('Attempt to use storage without flowId set');
    }

    return this.flowStorage.getData(flowId, FLOW_ENABLE_DURATIONS_KEY) || [];
  }
}
