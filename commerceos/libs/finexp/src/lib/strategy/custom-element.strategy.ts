
import {
  CheckoutModeEnum,
  PaymentMethodEnum,
} from '@pe/checkout-types';

import { CHECKOUT_PAYMENTS, defaultLocale } from '../constants';
import { ExpandedCustomWidgetConfigInterface, WidgetElementInterface } from '../models';
import { calcTotal, onError, setConfigToElem } from '../utils';

import { AbstractStrategyClass } from "./abstract-strategy.class";

export class CustomElementStrategyClass extends AbstractStrategyClass {

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

    const customElement = document.createElement('pe-checkout-widget');
    customElement.setAttribute('paymentmethod', paymentMethod);

    customElement.addEventListener('clicked', (event: any) => {
      if (CHECKOUT_PAYMENTS.includes(paymentMethod)) {
        this.loadCheckoutWrapperWebComponent(existing.config, existing.paymentMethod, customElement);
      }
    });
    setConfigToElem(existing.root, customElement, customConfig, paymentMethod, this.envJson);


    this.getCheckoutSettingsByChannelSetId(
      customConfig.channelSet,
      (settings) => {
        const locale = settings?.languages.find(l => l.isDefault)?.code || defaultLocale;

        this.loadScript(
          `${this.envJson.frontend.checkoutWrapper}/wrapper/${locale}/${this.version}/checkout-main-ce/micro.js`,
          () => {
            existing.root.innerHTML = '';
            existing.root.appendChild(customElement);
            existing.elem = customElement;
            existing.config = customConfig;
            existing.paymentMethod = paymentMethod;

            return successCallback && successCallback();
          },
          (err) => {
            onError(existing.root, err);

            return failCallback && failCallback(err);
          },
        );
      },
    );
  }

  private loadCheckoutWrapperWebComponent(
    config: ExpandedCustomWidgetConfigInterface,
    paymentMethod: PaymentMethodEnum,
    widgetCustomElement: HTMLElement,
  ): void {

    if (!document.getElementsByTagName('head')[0].getElementsByTagName('base')[0]) {
      const base = document.createElement('base');
      // TODO This can be removed when APP_BASE_HREF provider added to all payment micros
      base.href = '/';
      document.getElementsByTagName('head')[0].appendChild(base);
    }

    const customElement = document.createElement('pe-checkout-wrapper-by-channel-set-id-finexp');
    customElement.setAttribute('fixedposition', JSON.stringify(true));
    customElement.setAttribute('absoluterooturl', `${this.envJson.frontend.checkoutWrapper}/wrapper/${this.version}`);
    customElement.setAttribute('finexpcreateflowparams', JSON.stringify({
      channelSetId: config.channelSet,
      clientMode: true,
      apiCallData: {
        amount: config.amount || calcTotal(config),
        cart: config.cart,
        reference: String(config.reference),
        successUrl: config.successUrl,
        pendingUrl: config.pendingUrl,
        cancelUrl: config.cancelUrl,
        failureUrl: config.failureUrl,
        noticeUrl: config.noticeUrl,
        billingAddress: config.billingAddress,
        shippingAddress: config.shippingAddress,
        shippingOptions: config.shippingOptions,
      },
    }));
    customElement.setAttribute('params', JSON.stringify({
      forceNoPaddings: true,
      forceNoCloseButton: false,
      forceNoOrder: true,
      setDemo: config.checkoutMode === CheckoutModeEnum.Calculator,
      forceSinglePaymentMethodOnly: paymentMethod,
      embeddedMode: true,
    }));
    customElement.addEventListener('eventemitted', (event: any) => {
      if (event?.detail?.event === 'payeverCheckoutClosed') {
        const parent = customElement.parentNode;
        parent.parentNode.removeChild(parent);
      }
    });
    const wrapper = document.createElement('div');
    customElement.classList.add(`pe-finexp-checkout-wrapper-elem`);

    wrapper.classList.add(`pe-finexp-checkout-wrapper`);
    wrapper.classList.add(`pe-finexp-checkout-wrapper-${config.checkoutPlacement}`);
    wrapper.appendChild(customElement);
    document.body.appendChild(wrapper);

    widgetCustomElement.setAttribute('loading', JSON.stringify(true));
    this.getCheckoutSettingsByChannelSetId(config.channelSet, (settings) => {
      const locale = settings?.languages.find(l => l.isDefault)?.code || defaultLocale;
      this.loadScript(
        `${this.envJson.frontend.checkoutWrapper}/wrapper/${locale}/${this.version}/checkout-main-ce/micro.js`,
        () => {
          // Hide loading anination
          widgetCustomElement.setAttribute('loading', JSON.stringify(false));
        });
    },
    );
  }
}
