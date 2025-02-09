import { assign, cloneDeep, forEach, isEqual, values } from 'lodash-es';

import { EnvironmentConfigInterface } from '@pe/common';
import {
  CustomWidgetConfigInterface,
  CheckoutModeEnum,
  WidgetConfigInterface,
  WidgetTypeEnum,
  CartItemInterface,
  PaymentMethodEnum,
} from '@pe/checkout-types';

import { defaultCustomWidgetConfig } from './constants';

import { styles as STYLES } from './finexp-styles';
import { CheckoutSettingsInterface } from './models';
import { BehaviorSubject, Observable } from 'rxjs';

interface WidgetElementInterface {
  config: CustomWidgetConfigInterface;
  root: HTMLElement;
  elem: HTMLElement;
  paymentMethod: PaymentMethodEnum;
  initialHTML: string;
  mutationObserver: MutationObserver;
}

const CHECKOUT_PAYMENTS = [
  PaymentMethodEnum.SANTANDER_INSTALLMENT_AT,
  PaymentMethodEnum.SANTANDER_INSTALLMENT,
  PaymentMethodEnum.SANTANDER_INSTALLMENT_DK,
  PaymentMethodEnum.SANTANDER_INSTALLMENT_NO,
  PaymentMethodEnum.SANTANDER_INSTALLMENT_SE,
  PaymentMethodEnum.SANTANDER_FACTORING_DE,
  PaymentMethodEnum.SANTANDER_INSTALLMENT_NL,
];

export class PayeverPaymentWidgetLoader {

  private envJson: EnvironmentConfigInterface | null = null;
  // private emitter = new EventEmitter();
  // private customElement: HTMLElement | null = null;
  // private isLoadingPayment: boolean = false;
  private loadedScripts: {[key: string]: boolean} = {};

  private elems: WidgetElementInterface[] = [];
  private logsEnabled = Boolean(localStorage.getItem('payEverLogsEnabled'));
  private intervalSub: any = null;
  private selectedPaymentOptionSubject$: BehaviorSubject<PaymentMethodEnum> = new BehaviorSubject(null);
  public selectedPaymentOption$: Observable<PaymentMethodEnum> = this.selectedPaymentOptionSubject$.asObservable();

  private readonly microCheckoutVersionVar = 'MICRO_CHECKOUT_XXXXX';
  private version: string = 'MICRO_CHECKOUT_VERSION' === this.microCheckoutVersionVar.replace('XXXXX', 'VERSION') ?
    'latest' : 'MICRO_CHECKOUT_VERSION';
  private defaultLocale = 'en';

  constructor() {
    this.intervalSub = setInterval(() => this.checkElementsDatasetChangesAndUpdate(), 100);
    this.initBaseStyles();
  }

  public init(
    selector: string = null,
    envJson: string | EnvironmentConfigInterface = null,
    config: CustomWidgetConfigInterface = null,
    successCallback: () => void = null,
    failCallback: (error: string) => void = null
  ): void {
    const defaultEnvJson: EnvironmentConfigInterface = {
      frontend: {
        checkoutWrapper: 'MICRO_URL_FRONTEND_CHECKOUT_WRAPPER',
        paymentOptionsSantanderAt: 'MICRO_URL_FRONTEND_PAYMENT_OPTIONS_SANTANDER_AT',
        paymentOptionsSantanderDe: 'MICRO_URL_FRONTEND_PAYMENT_OPTIONS_SANTANDER_DE',
        paymentOptionsSantanderDeCcp: 'MICRO_URL_FRONTEND_PAYMENT_OPTIONS_SANTANDER_DE_CCP',
        paymentOptionsSantanderDeFact: 'MICRO_URL_FRONTEND_PAYMENT_OPTIONS_SANTANDER_DE_FACT',
        paymentOptionsSantanderDeInvoice: 'MICRO_URL_FRONTEND_PAYMENT_OPTIONS_SANTANDER_DE_INVOICE',
        paymentOptionsSantanderNoInvoice: 'MICRO_URL_FRONTEND_PAYMENT_OPTIONS_SANTANDER_NO_INVOICE',
        paymentOptionsSantanderDk: 'MICRO_URL_FRONTEND_PAYMENT_OPTIONS_SANTANDER_DK',
        paymentOptionsSantanderSe: 'MICRO_URL_FRONTEND_PAYMENT_OPTIONS_SANTANDER_SE',
        paymentOptionsSantanderNo: 'MICRO_URL_FRONTEND_PAYMENT_OPTIONS_SANTANDER_NO',
        paymentOptionsSantanderNl: 'MICRO_URL_FRONTEND_PAYMENT_OPTIONS_SANTANDER_NL',
        paymentOptionsSwedbank: 'MICRO_URL_FRONTEND_PAYMENT_OPTIONS_SWEDBANK',
        paymentOptionsPaypal: 'MICRO_URL_FRONTEND_PAYMENT_OPTIONS_PAYPAL',
        paymentOptionsSofort: 'MICRO_URL_FRONTEND_PAYMENT_OPTIONS_SOFORT',
        paymentOptionsStripe: 'MICRO_URL_FRONTEND_PAYMENT_OPTIONS_STRIPE',
        paymentOptionsWiretransfer: 'MICRO_URL_FRONTEND_PAYMENT_OPTIONS_WIRETRANSFER',
        paymentOptionsInstantPayment: 'MICRO_URL_FRONTEND_PAYMENT_OPTIONS_INSTANT_PAYMENT',
      },
      custom: {
        storage: 'MICRO_URL_CUSTOM_STORAGE',
        proxy: 'MICRO_URL_CUSTOM_PROXY',
        cdn: 'MICRO_URL_CUSTOM_CDN',
        translation: 'MICRO_URL_TRANSLATION_STORAGE',
        checkoutCdn: 'MICRO_URL_CHECKOUT_CDN'
      },
      php: {
        checkout: 'MICRO_URL_PHP_CHECKOUT', // Replaced on deploy
        financeExpress: 'MICRO_URL_PHP_FINANCE_EXPRESS',
      },
      backend: {
        checkout: 'MICRO_URL_CHECKOUT', // Replaced on deploy
        payments: 'MICRO_URL_PHP_CHECKOUT', // Replaced on deploy
        financeExpress: 'MICRO_URL_FINANCE_EXPRESS', // Replaced on deploy
        webWidgets: 'MICRO_URL_WEB_WIDGETS', // Replaced on deploy
      },
      config: {
        tmetrixOrigId: 'TMETRIX_ORIG_ID',
        recaptchaSiteKey: 'RECAPTCHA_SITE_KEY',
        googleMapsApiKey: 'GOOGLE_MAPS_API_KEY',
        fullStoryOrgId: 'FULL_STORY_ORG_ID',
        env: 'ENV'
      },
      thirdParty: {
        communications: 'MICRO_URL_THIRD_PARTY_COMMUNICATIONS',
        payments: 'MICRO_URL_THIRD_PARTY_PAYMENTS',
        products: 'MICRO_URL_THIRD_PARTY_PRODUCTS',
        shipping: 'MICRO_URL_THIRD_PARTY_SHIPPING',
        messenger: 'MICRO_URL_THIRD_PARTY_MESSENGER',
        plugins: 'MICRO_URL_THIRD_PARTY_PLUGINS'
      },
      payments: {
        stripe: 'MICRO_URL_PAYMENTS_STRIPE',
        instantPayment: 'MICRO_URL_PAYMENTS_INSTANT_PAYMENT',
        sofort: 'MICRO_URL_PAYMENTS_SOFORT',
        paypal: 'MICRO_URL_PAYMENTS_PAYPAL',
        swedbank: 'MICRO_URL_PAYMENTS_SWEDBANK',
        santanderNl: 'MICRO_URL_PAYMENTS_SANTANDER_NL',
        santanderAt: 'MICRO_URL_PAYMENTS_SANTANDER_AT',
        santanderDeInvoice: 'MICRO_URL_PAYMENTS_SANTANDER_DE_INVOICE',
        santanderDeFactoring: 'MICRO_URL_PAYMENTS_SANTANDER_DE_FACTORING'
      }
    } as any;
    envJson = envJson || defaultEnvJson;
    this.loadEnvJson(envJson, (envJsonData: EnvironmentConfigInterface) => {
      this.envJson = envJsonData;
      if (selector) {
        this.loadWidget(selector, config, successCallback, failCallback);
      } else {
        return successCallback && successCallback();
      }
    }, (error: string) => {
      this.onError(selector, 'Cant init finexp widget: failed to load env json', error);
      return failCallback && failCallback(error);
    });
  }

  readElemDatasetAsCustomWidgetConfig(elem: HTMLElement): CustomWidgetConfigInterface {
    const attrValues: {[key: string]: any} = {};
    for (let i = 0; i < elem.attributes.length; i++) {
      const attr = elem.attributes[i];
      if (attr.name.indexOf('data-') === 0) {
        let value = attr.value;
        try {
          value = JSON.parse(attr.value);
        } catch (e) {}
        attrValues[attr.name.replace('data-', '')] = value;
      }
    }
    return this.restoreWidgetElementConfigCase(attrValues);
  }

  public loadWidget(
    selector: string,
    config: CustomWidgetConfigInterface = null,
    successCallback: () => void = null,
    failCallback: (data: string) => void = null
  ): void {
    const elems = document.querySelectorAll(selector);
    if (!elems || elems.length === 0) {
      this.onError(selector, 'Cant find element on page', selector);
      return failCallback && failCallback('Cant find element on page: ' + selector);
    }
    // bySelector.appendChild(customElement);
    // this.customElement = customElement;
    // config.onReady && config.onReady();

    elems.forEach((elem: HTMLElement) => {

      const customConfig: CustomWidgetConfigInterface = this.readElemDatasetAsCustomWidgetConfig(elem);

      // Each element can have own channel set id
      const business = customConfig.business || config?.business;
      const checkoutId = customConfig.checkoutId || config?.checkoutId;
      const widgetId = customConfig.widgetId || config?.widgetId;
      const type = customConfig.type || config?.type;
      const total = customConfig.amount || config?.amount || this.calcTotal(customConfig) || this.calcTotal(config);
      if (!business) {
        this.onError(elem, 'Empty business Id');
        if (!customConfig.channelSet) {
          return failCallback && failCallback('Cant load widget because of empty business Id');
        }
      }
      if (!checkoutId) {
        this.onError(elem, 'Empty checkout Id');
        if (!customConfig.channelSet) {
          return failCallback && failCallback('Cant load widget because of empty checkout Id');
        }
      }
      if (checkoutId && !widgetId) {
        this.onError(elem, 'Empty widget Id');
        if (!customConfig.channelSet) {
          return failCallback && failCallback('Cant load widget because of empty widget Id');
        }
      }
      const types = values(WidgetTypeEnum);
      if (!type || types.indexOf(type) < 0) {
        this.onError(elem, 'Cant load widget because of empty/invalid type: ' + type);
        return failCallback && failCallback('Cant load widget because of empty/invalid type: ' + type);
      }
      if (!total) {
        this.onError(elem, 'Cant load widget because of empty amount/cart');
        return failCallback && failCallback('Cant load widget because of empty amount/cart');
      }
      this.loadWidgetConfig(elem, business, checkoutId, widgetId, (widgetsConfig: WidgetConfigInterface) => {
        // TODO Clone deep
        const widgetConfig: CustomWidgetConfigInterface = Object.assign({}, widgetsConfig, config || {}, customConfig);
        this.loadWidgetRoot(elem, widgetConfig, successCallback, failCallback);
      }, err => {
        this.onError(elem, err);
        return failCallback && failCallback(err);
      });
    });
  }

  private loadWidgetConfig(elem: HTMLElement, business: string, checkoutId: string, widgetId: string, successCallback: (WidgetConfigInterface: any) => void, failCallback: (data: string) => void) {
    if (business && checkoutId && widgetId) {
      const path = `${this.envJson.backend.webWidgets}/api/app/finance-express/business/${business}/client-action/get-widgets-by-id`;
      this.request(path, 'POST', false, { checkoutId, widgetId }, (config: WidgetConfigInterface) => {
        const data = assign({}, defaultCustomWidgetConfig, config);
        successCallback(config);
      }, err => {
        this.onError(elem, 'Cant load widget config: ' + err);
        return failCallback && failCallback(err);
      });
    } else {
      successCallback(defaultCustomWidgetConfig);
    }
  }

  private getPaymentMethodByAmountAndEnabled(customConfig: CustomWidgetConfigInterface): PaymentMethodEnum {
    let result: PaymentMethodEnum = null;
    const total = this.calcTotal(customConfig);
    forEach(customConfig.payments, payment => {
      if (payment.enabled && (
        !payment.amountLimits || (
          (total >= payment.amountLimits.min || !payment.amountLimits.min) &&
          (total <= payment.amountLimits.max || !payment.amountLimits.max)
        )
      )) {
        result = payment.paymentMethod;
      }
    });
    return result;
  }

  private loadWidgetRoot(
    root: HTMLElement,
    customConfig: CustomWidgetConfigInterface,
    successCallback: () => void,
    failCallback: (data: string) => void
  ): void {
    const mutationObserver: MutationObserver = null;
    // As we use timer MutationObserver is disabled for now
    // const mutationObserver: MutationObserver = new MutationObserver(() => {
    //   this.checkElementsDatasetChangesAndUpdate();
    // });
    // mutationObserver.observe(root, { attributes: true, childList: false, subtree: false });
    if (root.innerHTML.trim() === '') {
      root.innerHTML = `<div class="pe-finexp-loading-dot-flashing" style="max-width: ${customConfig.maxWidth || 500}px"><span></span></div>`;
    }
    const initialHTML = root.innerHTML;
    const existing: WidgetElementInterface = {
      config: customConfig,
      root: root,
      elem: null,
      paymentMethod: null,
      initialHTML: initialHTML,
      mutationObserver: mutationObserver
    };
    this.elems.push(existing);
    this.loadScript(`${this.envJson.custom.cdn}/js/${this.isIE() ? 'polyfills.js' : 'polyfills-no-ie.js'}`, () => {
      this.loadWidgetWebComponent(customConfig, existing, successCallback, failCallback);
    }, err => {
      this.onError(existing.root, err);
      return failCallback && failCallback(err);
    });
  }

  private isIE(): boolean {
    const ua = window.navigator.userAgent;
    const msie = ua.indexOf('MSIE ');
    return !!(msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./));
  }

  private loadWidgetWebComponent(
    customConfig: CustomWidgetConfigInterface,
    existing: WidgetElementInterface,
    successCallback: () => void,
    failCallback: (data: string) => void
  ): void {
    existing.root.innerHTML = existing.initialHTML;
    existing.elem = null;
    existing.config = customConfig;
    existing.paymentMethod = null;

    const paymentMethod = this.getPaymentMethodByAmountAndEnabled(customConfig);
    this.selectedPaymentOptionSubject$.next(paymentMethod);
    const customElement = document.createElement('pe-checkout-widget');
    customElement.setAttribute('paymentmethod', paymentMethod);
    customElement.addEventListener('clicked', (event: any) => {
      this.log('Clicked!'); // TODO Remove log
      if (CHECKOUT_PAYMENTS.includes(paymentMethod)) {
        this.loadCheckoutWrapperWebComponent(existing.config, existing.paymentMethod, customElement);
      }
    });
    this.setConfigToElem(existing.root, customElement, customConfig);


    this.getCheckoutSettingsByChannelSetId(
      customConfig.channelSet,
      (settings) => {
        const locale = settings?.languages.find(l => l.isDefault)?.code || this.defaultLocale;

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
            this.onError(existing.root, err);
            return failCallback && failCallback(err);
          },
        );
      },
    );
  }

  private loadCheckoutWrapperWebComponent(
    config: CustomWidgetConfigInterface,
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
      apiCallData: {
        amount: config.amount || this.calcTotal(config),
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
      }
    }));
    customElement.setAttribute('params', JSON.stringify({
      forceNoPaddings: true,
      forceNoCloseButton: false,
      forceNoOrder: true,
      setDemo: config.checkoutMode === CheckoutModeEnum.Calculator,
      forceSinglePaymentMethodOnly: paymentMethod,
      embeddedMode: true
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
        const locale = settings?.languages.find(l => l.isDefault)?.code || this.defaultLocale;
        this.loadScript(
          `${this.envJson.frontend.checkoutWrapper}/wrapper/${locale}/${this.version}/checkout-main-ce/micro.js`,
          () => {
          // Hide loading anination
          widgetCustomElement.setAttribute('loading', JSON.stringify(false));
        });
      },
    );
  }

  private loadEnvJson(envJson: string | EnvironmentConfigInterface, successCallback: (data: EnvironmentConfigInterface) => void, failCallback: (data: string) => void): void {
    if (typeof envJson === 'string') {
      const envJsonUrl = envJson;
      if (sessionStorage.getItem('pe_env') && !!(sessionStorage.getItem('pe_env') || '').length) {
        const envData: EnvironmentConfigInterface = JSON.parse(sessionStorage.getItem('pe_env') || '');
        successCallback(envData);
      } else {
        this.request(envJsonUrl, 'GET', false, null, (envData: EnvironmentConfigInterface) => {
          sessionStorage.setItem('pe_env', JSON.stringify(envData as EnvironmentConfigInterface));
          successCallback(envData);
        }, (error: string) => {
          this.log(error);
          return failCallback && failCallback(error);
        });
      }
    } else if (envJson) {
      successCallback(envJson);
    } else {
      return failCallback && failCallback('Empty data');
    }
  }

  private loadScript(url: string, successCallback: () => void = null, failCallback: (data: string) => void = null): void {
    if (this.loadedScripts[url]) {
      successCallback();
    } else {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.onload = () => {
        this.loadedScripts[url] = true;
        successCallback();
      };
      script.src = url;
      script.onerror = (error) => {
        return failCallback && failCallback(`Cant load '${url}': ` + error.toString());
      };
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  }

  private request(
    path: string, method: 'GET' | 'POST' | 'PATCH',
    withToken: boolean,
    body: any,
    successCallback: (data: any) => void,
    failCallback: (data: string) => void = null
  ): void {
    const xhr = new XMLHttpRequest();
    xhr.open(method, path, true);
    xhr.responseType = 'json';
    xhr.setRequestHeader('Content-Type', 'application/json');
    // if (withToken && this.guestToken) {
    //   xhr.setRequestHeader('Authorization', 'Bearer ' + this.guestToken);
    // }
    xhr.withCredentials = true;
    // xhr.addEventListener('load', () => {
    //   loadCallback(xhr.response);
    // });
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (this.isStatus200(xhr.status)) {
          let parsed = xhr.responseType === '' || xhr.responseType === 'text' ? JSON.parse(xhr.responseText) : xhr.response;
          if (typeof parsed === 'string') {
            // For IE prev code is not parsed
            parsed = JSON.parse(parsed);
          }
          // if (parsed.guest_token) {
          //   this.guestToken = parsed.guest_token;
          //   localStorage.setItem('pe_guest_token', parsed.guest_token);
          // }
          successCallback(parsed);

        // } else if (String(xhr.status) !== '0') { // 0 is called when browser cancels OPTIONS request
        //   failCallback && failCallback(xhr.statusText);
        // }
        } else {
          return failCallback && failCallback(xhr.response?.message || xhr.statusText);
        }
      }
    };
    xhr.onerror = () => {
      return failCallback && failCallback(xhr.response?.message || xhr.statusText);
    };
    try {
      xhr.send(body ? JSON.stringify(body) : null);
    } catch (error) {
      return failCallback && failCallback(error.toString());
    }
  }

  private isStatus200(status: any): boolean {
    return String(status).length === 3 && String(status).substr(0, 1) === '2';
  }

  private onError(elemOrSelector: HTMLElement | string, msg: string, ...optionalParams: any[]): void {
    if (typeof elemOrSelector === 'string') {
      const elems = document.querySelectorAll(elemOrSelector);
      elems.forEach((elem: HTMLElement) => {
        elem.innerHTML = `<p style="color: red;">${msg}: ${JSON.stringify(optionalParams)}</p>`;
      });
    } else {
      elemOrSelector.innerHTML = `<p style="color: red;">${msg}: ${JSON.stringify(optionalParams)}</p>`;
    }
    this.log(msg, ...optionalParams);
  }

  private log(msg: string, ...optionalParams: any[]): void {
    const host = window.location.hostname;
    if (this.logsEnabled || host === 'localhost' || host.indexOf('.test.') >= 0 || host.indexOf('.test.')) {
      console.log('FINEXP WIDGET:', msg, ...optionalParams);
    }
  }

  private restoreWidgetElementConfigCase(data: {[key: string]: any}): CustomWidgetConfigInterface {
    const result: CustomWidgetConfigInterface = {} as any;
    for (const key in defaultCustomWidgetConfig) {
      for (const lowerKey in data) {
        if (lowerKey.toLowerCase() === key.toLocaleLowerCase()) {
          result[key] = data[lowerKey];
          break;
        }
      }
    }
    return result;
  }

  private setConfigToElem(
    rootElement: HTMLElement,
    customElement: HTMLElement,
    customConfig: CustomWidgetConfigInterface
  ): void {
    const widgetConfig: WidgetConfigInterface = Object.assign({}, customConfig); // TODO replace to clone deep
    delete widgetConfig['channelSet'];
    delete widgetConfig['type'];
    delete widgetConfig['amount'];
    delete widgetConfig['isDebugMode'];

    if (!customConfig.isVisible) {
      rootElement.classList.add(`pe-finexp-widget-hidden`);
    } else {
      rootElement.classList.remove(`pe-finexp-widget-hidden`);
    }
    if (customElement) {
      customElement.setAttribute('channelset', customConfig.channelSet);
      customElement.setAttribute('type', customConfig.type);
      customElement.setAttribute('amount', String(this.calcTotal(customConfig)));
      customElement.setAttribute('isDebugMode', JSON.stringify(customConfig.isDebugMode || false));
      customElement.setAttribute('config', JSON.stringify(widgetConfig));
      customElement.setAttribute('env', JSON.stringify(this.envJson));
      customConfig.cart && customElement.setAttribute('cart', JSON.stringify(customConfig.cart))
    }
  }

  private calcTotal(customConfig: CustomWidgetConfigInterface): number {
    return customConfig.amount || (customConfig.cart || []).reduce((a: number, c: CartItemInterface) => a + c.price * c.quantity, 0);
  }

  private checkElementsDatasetChangesAndUpdate(): void {
    for (let i = 0; i < this.elems.length; i++) {
      const item: WidgetElementInterface = this.elems[i];
      const customConfig: CustomWidgetConfigInterface = this.readElemDatasetAsCustomWidgetConfig(item.root);
      const currentConfig: CustomWidgetConfigInterface = cloneDeep(item.config);
      let updated = 0;
      forEach(customConfig, (value: any, key: string) => {
        if (
          (!isEqual(currentConfig[key], value)) &&
          !(JSON.stringify(currentConfig[key]) === 'false' && JSON.stringify(value) === 'false') &&
          !(currentConfig[key] === 0 && value === 0)
        ) {
          this.log(`Dataset param '${key}' was changed from ${JSON.stringify(currentConfig[key])} to ${JSON.stringify(value)}`); // TODO Remove log
          currentConfig[key] = value;
          updated++;
        }
      });
      if (updated) {
        let needPaymentMicroReload = false;
        if (item.config && this.calcTotal(item.config) !== this.calcTotal(currentConfig)) {
          needPaymentMicroReload = item.paymentMethod !== this.getPaymentMethodByAmountAndEnabled(currentConfig);
        }

        item.config = currentConfig;
        if (needPaymentMicroReload) {
          this.loadWidgetWebComponent(currentConfig, item, null, null);
        } else {
          this.setConfigToElem(item.root, item.elem, currentConfig);
        }
      }
    }
  }

  private initBaseStyles(): void {
    let stylesStr: string = STYLES;
    stylesStr = stylesStr.split('{COLOR_DOTS_1}').join(window['pe_widgetLoaderColor1'] || '#999999');
    stylesStr = stylesStr.split('{COLOR_DOTS_2}').join(window['pe_widgetLoaderColor2'] || '#dddddd');
    stylesStr = stylesStr.split('{MAX_WIDTH}').join(window['pe_widgetLoaderMaxWidth'] || '500px');

    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(stylesStr));
    document.head.appendChild(style);
  }

  unsubscribeChangeDetectionSub(): void {
    if (this.intervalSub) {
      clearInterval(this.intervalSub);
      this.intervalSub = null;
    }
  }

  private getCheckoutSettingsByChannelSetId(
    channelSetId: string,
    callback: (settings: CheckoutSettingsInterface) => void,
  ): void {
    this.request(
      `${this.envJson.backend.checkout}/api/checkout/channel-set/${channelSetId}/base-settings`,
      'GET',
      true,
      null,
      callback,
    );
  }
}

if (!(window as any).PayeverPaymentWidgetLoader) {
  (window as any).PayeverPaymentWidgetLoader = new PayeverPaymentWidgetLoader();
}

