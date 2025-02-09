import { CartItemInterface } from "@pe/checkout-types";
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { EnvironmentConfigInterface } from "@pe/common";

import { ExpandedCustomWidgetConfigInterface } from "../models";

import { log } from "./log.util";

export function setConfigToElem(
  rootElement: HTMLElement,
  customElement: HTMLElement,
  customConfig: ExpandedCustomWidgetConfigInterface,
  paymentMethod = null,
  envJson: string | EnvironmentConfigInterface
): void {
  const widgetConfig: ExpandedCustomWidgetConfigInterface = Object.assign({}, {
    ...customConfig,
    ...customConfig?.paymentSettings?.[paymentMethod],
  }); // TODO replace to clone deep
  delete widgetConfig['channelSet'];
  delete widgetConfig['type'];
  delete widgetConfig['amount'];
  delete widgetConfig['isDebugMode'];

  if (!customConfig.isVisible) {
    rootElement.classList.add(`pe-finexp-widget-hidden`);
  } else {
    rootElement.classList.remove(`pe-finexp-widget-hidden`);
  }

  const paymentConfig = customConfig.payments.find(item => item.paymentMethod === paymentMethod)?.customWidgetSetting;

  const config = paymentConfig ? {
    ...widgetConfig,
    ...paymentConfig?.isDefault ? {} : paymentConfig,
  } : widgetConfig;

  if (customElement) {
    customElement.setAttribute('channelset', customConfig.channelSet);
    customElement.setAttribute('type', customConfig.type);
    customElement.setAttribute('theme', config.theme);
    customElement.setAttribute('amount', String(calcTotal(customConfig)));
    customElement.setAttribute('isDebugMode', JSON.stringify(customConfig.isDebugMode || false));
    customElement.setAttribute('config', JSON.stringify(config));
    customElement.setAttribute('env', JSON.stringify(envJson));
    customConfig.cart && customElement.setAttribute('cart', JSON.stringify(customConfig.cart));
  }
}

export function onError(elemOrSelector: HTMLElement | string, msg: string, ...optionalParams: any[]): void {
  if (typeof elemOrSelector === 'string') {
    const elems = document.querySelectorAll(elemOrSelector);
    elems.forEach((elem: HTMLElement) => {
      elem.innerHTML = `<p style="color: red;">${msg}: ${JSON.stringify(optionalParams)}</p>`;
    });
  } else {
    elemOrSelector.innerHTML = `<p style="color: red;">${msg}: ${JSON.stringify(optionalParams)}</p>`;
  }
  log(msg, ...optionalParams);
}


export function calcTotal(customConfig: ExpandedCustomWidgetConfigInterface): number {
  return customConfig.amount || (customConfig.cart || []).reduce((a: number, c: CartItemInterface) => a + c.price * c.quantity, 0);
}
