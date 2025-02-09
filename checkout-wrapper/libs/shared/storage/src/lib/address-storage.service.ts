import { Injectable, Injector } from '@angular/core';

import { AddressInterface, PaymentAddressSettingsInterface } from '@pe/checkout/types';

import { FlowStorage } from './flow-storage';

/**
 * @deprecated
 * Unnecessary now that we have use ngxs, should be refactored
 */
@Injectable()
export class AddressStorageService {

  private flowStorage: FlowStorage = this.injector.get(FlowStorage);

  constructor(private injector: Injector) {
  }

  /**
   * @deprecated
   */
  getTemporaryAddress(flowId: string): AddressInterface {
    // We have to save to the temporary variable because at /user step we have only email and address but
    //  it can't be saved to server because
    return this.flowStorage.getData(flowId, 'temporaryAddress');
  }

  /**
   * @deprecated
   */
  setTemporaryAddress(flowId: string, address: AddressInterface): void {
    this.flowStorage.setData(flowId, 'temporaryAddress', address);
  }

  /**
   * @deprecated
   */
  getAddressSettings(flowId: string): PaymentAddressSettingsInterface {
    return this.flowStorage.getData(flowId, 'addressSettings') || null;
  }

  /**
   * @deprecated
   */
  setAddressSettings(flowId: string, settings: PaymentAddressSettingsInterface): void {
    this.flowStorage.setData(flowId, 'addressSettings', settings);
  }
}
