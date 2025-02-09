
import {
  PaymentMethodEnum, WidgetConfigInterface,
} from '@pe/checkout-types';

import { defaultLocale } from '../constants';
import { ExpandedCustomWidgetConfigInterface, WidgetElementInterface } from '../models';
import { calcTotal } from '../utils';

import { AbstractStrategyClass } from "./abstract-strategy.class";

export class IframeStrategyClass extends AbstractStrategyClass {

  public loadWidgetWebComponent(
    customConfig: ExpandedCustomWidgetConfigInterface,
    existing: WidgetElementInterface,
    paymentMethod: PaymentMethodEnum,
    successCallback: () => void,
    failCallback: (data: string) => void
  ): void {
    existing.root.innerHTML = existing.initialHTML;
    existing.elem = null;
    existing.config = customConfig;
    existing.paymentMethod = null;

    this.getCheckoutSettingsByChannelSetId(
      customConfig.channelSet,
      (settings) => {
        const locale = settings?.languages.find(l => l.isDefault)?.code || defaultLocale;

        const customSettings = this.prepareConfig(existing.root, customConfig, paymentMethod);

        const iframeElement = document.createElement('iframe');
        iframeElement.src = `${this.envJson.frontend.checkoutWrapper}/${locale}/pay/widget/${customConfig.widgetId}`;
        iframeElement.height = customSettings.config.maxHeight;
        iframeElement.width = '100%';
        iframeElement.style.border = 'none';
        iframeElement.sandbox.add('allow-same-origin', 'allow-top-navigation', 'allow-scripts');
        iframeElement.allow = 'payment';

        existing.root.innerHTML = '';
        existing.root.appendChild(iframeElement);
        existing.elem = iframeElement;
        existing.config = customConfig;
        existing.paymentMethod = paymentMethod;


        iframeElement.onload = () => {
          iframeElement.contentWindow.postMessage({
            event: 'peWidgetSettings',
            ...customSettings,
          }, '*');
        };

        return successCallback && successCallback();
      },
    );
  }

  private prepareConfig(
    rootElement: HTMLElement,
    customConfig: ExpandedCustomWidgetConfigInterface,
    paymentMethod = null
  ): any {
    const widgetConfig: WidgetConfigInterface = Object.assign({}, {
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

    return {
      channelSet: customConfig.channelSet,
      type: customConfig.type,
      theme: customConfig.theme,
      amount: calcTotal(customConfig),
      paymentMethod,
      isDebugMode: customConfig.isDebugMode || false,
      config: paymentConfig ? {
        ...widgetConfig,
        ...paymentConfig,
        previewPayment: 'apple_pay',
      } : widgetConfig,
      cart: customConfig.cart,
    };
  }
}
