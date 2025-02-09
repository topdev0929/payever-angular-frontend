import { cloneDeep, forEach, isEqual, values } from 'lodash-es';
import { BehaviorSubject } from 'rxjs';

import {
  WidgetConfigInterface,
  WidgetTypeEnum,
} from '@pe/checkout-types';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { EnvironmentConfigInterface } from '@pe/common';

import { defaultCustomWidgetConfig } from './constants';
import { styles as STYLES } from './finexp-styles.constant';
import { ExpandedCustomWidgetConfigInterface, WidgetElementInterface } from './models';
import { AbstractStrategyClass, CustomElementStrategyClass } from './strategy';
import { calcTotal, getPaymentMethodByAmountAndEnabled, log, onError, request, setConfigToElem } from './utils';

export class PayeverPaymentWidgetLoader {

  private envJson: EnvironmentConfigInterface | null = null;
  private loadedScripts: { [key: string]: boolean } = {};

  private elems: WidgetElementInterface[] = [];
  private intervalSub: any = null;
  private selectedPaymentOptionSubject$ = new BehaviorSubject(null);
  public selectedPaymentOption$ = this.selectedPaymentOptionSubject$.asObservable();

  private strategy: AbstractStrategyClass;

  constructor() {
    this.intervalSub = setInterval(() => this.checkElementsDatasetChangesAndUpdate(), 100);
    this.initBaseStyles();
  }

  public init(
    selector: string = null,
    envJson: string | EnvironmentConfigInterface = null,
    config: ExpandedCustomWidgetConfigInterface = null,
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
        checkoutCdn: 'MICRO_URL_CHECKOUT_CDN',
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
        env: 'ENV',
      },
      thirdParty: {
        communications: 'MICRO_URL_THIRD_PARTY_COMMUNICATIONS',
        payments: 'MICRO_URL_THIRD_PARTY_PAYMENTS',
        products: 'MICRO_URL_THIRD_PARTY_PRODUCTS',
        shipping: 'MICRO_URL_THIRD_PARTY_SHIPPING',
        messenger: 'MICRO_URL_THIRD_PARTY_MESSENGER',
        plugins: 'MICRO_URL_THIRD_PARTY_PLUGINS',
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
        santanderDeFactoring: 'MICRO_URL_PAYMENTS_SANTANDER_DE_FACTORING',
      },
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
      onError(selector, 'Cant init finexp widget: failed to load env json', error);

      return failCallback && failCallback(error);
    });
  }

  readElemDatasetAsCustomWidgetConfig(elem: HTMLElement): ExpandedCustomWidgetConfigInterface {
    const attrValues: { [key: string]: any } = {};
    for (const attr of Array.from(elem.attributes)) {
      if (attr.name.indexOf('data-') === 0) {
        let value = attr.value;
        try {
          value = JSON.parse(attr.value);
        } catch (e) { }
        attrValues[attr.name.replace('data-', '')] = value;
      }
    }

    return this.restoreWidgetElementConfigCase(attrValues);
  }

  public loadWidget(
    selector: string,
    config: ExpandedCustomWidgetConfigInterface = null,
    successCallback: () => void = null,
    failCallback: (data: string) => void = null
  ): void {
    const elems = document.querySelectorAll(selector);
    if (!elems || elems.length === 0) {
      onError(selector, 'Cant find element on page', selector);

      return failCallback && failCallback('Cant find element on page: ' + selector);
    }

    elems.forEach((elem: HTMLElement) => {
      const customConfig: ExpandedCustomWidgetConfigInterface = this.readElemDatasetAsCustomWidgetConfig(elem);

      // Each element can have own channel set id
      const business = customConfig.business || config?.business;
      const checkoutId = customConfig.checkoutId || config?.checkoutId;
      const widgetId = customConfig.widgetId || config?.widgetId;
      const type = customConfig.type || config?.type;
      const total = customConfig.amount || config?.amount || calcTotal(customConfig) || calcTotal(config);
      if (!business) {
        onError(elem, 'Empty business Id');
        if (!customConfig.channelSet) {
          return failCallback && failCallback('Cant load widget because of empty business Id');
        }
      }
      if (!checkoutId) {
        onError(elem, 'Empty checkout Id');
        if (!customConfig.channelSet) {
          return failCallback && failCallback('Cant load widget because of empty checkout Id');
        }
      }
      if (checkoutId && !widgetId) {
        onError(elem, 'Empty widget Id');
        if (!customConfig.channelSet) {
          return failCallback && failCallback('Cant load widget because of empty widget Id');
        }
      }
      const types = values(WidgetTypeEnum);
      if (!type || types.indexOf(type) < 0) {
        onError(elem, 'Cant load widget because of empty/invalid type: ' + type);

        return failCallback && failCallback('Cant load widget because of empty/invalid type: ' + type);
      }
      if (!total) {
        onError(elem, 'Cant load widget because of empty amount/cart');

        return failCallback && failCallback('Cant load widget because of empty amount/cart');
      }
      this.loadWidgetConfig(elem, business, checkoutId, widgetId, (widgetsConfig: WidgetConfigInterface) => {
        // TODO Clone deep
        const widgetConfig: ExpandedCustomWidgetConfigInterface = Object.assign({}, widgetsConfig, config || {}, customConfig);
        this.loadWidgetRoot(elem, widgetConfig, successCallback, failCallback);
      }, (err) => {
        onError(elem, err);

        return failCallback && failCallback(err);
      });
    });
  }

  private loadWidgetConfig(elem: HTMLElement, business: string, checkoutId: string, widgetId: string, successCallback: (WidgetConfigInterface: any) => void, failCallback: (data: string) => void) {
    if (business && checkoutId && widgetId) {
      const path = `${this.envJson.backend.webWidgets}/api/app/finance-express/business/${business}/client-action/get-widgets-by-id`;
      request(path, 'POST', false, { checkoutId, widgetId }, (config: WidgetConfigInterface) => {
        successCallback(config);
      }, (err) => {
        onError(elem, 'Cant load widget config: ' + err);

        return failCallback && failCallback(err);
      });
    } else {
      successCallback(defaultCustomWidgetConfig);
    }
  }

  private loadWidgetRoot(
    root: HTMLElement,
    customConfig: ExpandedCustomWidgetConfigInterface,
    successCallback: () => void,
    failCallback: (data: string) => void
  ): void {
    const mutationObserver: MutationObserver = null;
    if (root.innerHTML.trim() === '') {
      root.innerHTML = `
      <div style="display: flex; justify-content: ${customConfig?.alignment || 'left'}">
        <div class="pe-finexp-loading-dot-flashing" style="width: ${customConfig.maxWidth || 500}px"><span></span></div>
      </div>
      `;
    }

    const initialHTML = root.innerHTML;
    const existing: WidgetElementInterface = {
      config: customConfig,
      root: root,
      elem: null,
      paymentMethod: null,
      initialHTML: initialHTML,
      mutationObserver: mutationObserver,
    };
    this.elems.push(existing);
    this.loadScript(`${this.envJson.custom.cdn}/js/${this.isIE() ? 'polyfills.js' : 'polyfills-no-ie.js'}`, () => {
      this.loadWidgetWebComponent(customConfig, existing, successCallback, failCallback);
    }, (err) => {
      onError(existing.root, err);

      return failCallback && failCallback(err);
    });
  }

  private isIE(): boolean {
    const ua = window.navigator.userAgent;
    const msie = ua.indexOf('MSIE ');

    return !!(msie > 0 || !!/Trident.*rv:11\./.exec(navigator.userAgent));
  }

  private loadWidgetWebComponent(
    customConfig: ExpandedCustomWidgetConfigInterface,
    existing: WidgetElementInterface,
    successCallback: () => void,
    failCallback: (data: string) => void
  ): void {
    existing.root.innerHTML = existing.initialHTML;
    existing.elem = null;
    existing.config = customConfig;
    existing.paymentMethod = null;

    const paymentMethod = customConfig?.previewPayment || getPaymentMethodByAmountAndEnabled(customConfig);
    this.selectedPaymentOptionSubject$.next(paymentMethod);

    this.strategy =  new CustomElementStrategyClass(this.envJson, this.loadScript.bind(this));

    this.strategy.loadWidgetWebComponent(
      customConfig,
      existing,
      paymentMethod,
      successCallback,
      failCallback
    );
  }

  private loadEnvJson(envJson: string | EnvironmentConfigInterface, successCallback: (data: EnvironmentConfigInterface) => void, failCallback: (data: string) => void): void {
    if (typeof envJson === 'string') {
      const envJsonUrl = envJson;
      if (sessionStorage.getItem('pe_env') && !!(sessionStorage.getItem('pe_env') || '').length) {
        const envData: EnvironmentConfigInterface = JSON.parse(sessionStorage.getItem('pe_env') || '');
        successCallback(envData);
      } else {
        request(envJsonUrl, 'GET', false, null, (envData: EnvironmentConfigInterface) => {
          sessionStorage.setItem('pe_env', JSON.stringify(envData as EnvironmentConfigInterface));
          successCallback(envData);
        }, (error: string) => {
          log(error);

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

  private restoreWidgetElementConfigCase(data: { [key: string]: any }): ExpandedCustomWidgetConfigInterface {
    const result: ExpandedCustomWidgetConfigInterface = {} as any;
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

  private checkElementsDatasetChangesAndUpdate(): void {
    for (const item of  this.elems) {
      const customConfig: ExpandedCustomWidgetConfigInterface = this.readElemDatasetAsCustomWidgetConfig(item.root);
      const currentConfig: ExpandedCustomWidgetConfigInterface = cloneDeep(item.config);

      let updated = 0;
      forEach(customConfig, (value: any, key: string) => {
        if (
          !isEqual(currentConfig[key], value) &&
          !(JSON.stringify(currentConfig[key]) === 'false' && JSON.stringify(value) === 'false') &&
          !(currentConfig[key] === 0 && value === 0)
        ) {
          log(`Dataset param '${key}' was changed from ${JSON.stringify(currentConfig[key])} to ${JSON.stringify(value)}`); // TODO Remove log
          currentConfig[key] = value;
          updated++;
        }
      });
      if (updated) {
        let needPaymentMicroReload = false;
        if (item.config && calcTotal(item.config) !== calcTotal(currentConfig)) {
          needPaymentMicroReload = item.paymentMethod !== getPaymentMethodByAmountAndEnabled(currentConfig);
        }

        item.config = currentConfig;
        if (needPaymentMicroReload || item.paymentMethod !== currentConfig.previewPayment) {
          this.loadWidgetWebComponent(currentConfig, item, null, null);
        } else {
          setConfigToElem(item.root, item.elem, currentConfig, item.paymentMethod, this.envJson);
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
}

if (!(window as any).PayeverPaymentWidgetLoader) {
  (window as any).PayeverPaymentWidgetLoader = new PayeverPaymentWidgetLoader();
}
