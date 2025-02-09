import { PaymentMethodEnum } from '@pe/checkout-types';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { EnvironmentConfigInterface } from '@pe/common';

import { CheckoutSettingsInterface, ExpandedCustomWidgetConfigInterface, WidgetElementInterface } from '../models';
import { request } from '../utils';

export abstract class AbstractStrategyClass {
  protected envJson: EnvironmentConfigInterface | null = null;
  protected loadScript: (url: string, successCallback: () => void, failCallback?: (data: string) => void) => void;

  private readonly microCheckoutVersionVar = 'MICRO_CHECKOUT_XXXXX';
  protected version: string = 'MICRO_CHECKOUT_VERSION' === this.microCheckoutVersionVar.replace('XXXXX', 'VERSION') ?
    'latest' : 'MICRO_CHECKOUT_VERSION';

  public abstract loadWidgetWebComponent(
    customConfig: ExpandedCustomWidgetConfigInterface,
    existing: WidgetElementInterface,
    paymentMethod: PaymentMethodEnum,
    successCallback: () => void,
    failCallback: (data: string) => void
  );

  constructor(
    envJson: EnvironmentConfigInterface,
    loadScript: (url: string, successCallback: () => void, failCallback?: (data: string) => void) => void
  ) {
    this.envJson = envJson;
    this.loadScript = loadScript;
  }

  protected getCheckoutSettingsByChannelSetId(
    channelSetId: string,
    callback: (settings: CheckoutSettingsInterface) => void,
  ): void {
    request(
      `${this.envJson.backend.checkout}/api/checkout/channel-set/${channelSetId}/base-settings`,
      'GET',
      true,
      null,
      callback,
    );
  }
}
