/* tslint:disable */
import { endsWith } from 'lodash-es';

import {
  cannotGetConnectionIdEventMessage,
  cannotFetchPaymentOptionsEventMessage,
  cannotGetCalculationsEventMessage,
  paymentOptionsNotSetEventMessage,
  SettingsResponseInterface,
  swedenTokenErrorEventMessage,
  widgetCreatedEventMessage,
  WidgetType
} from '../interfaces';
import { camelCased, hasClass } from '../helpers';
import {
  CalculationDataInterface,
  CalculationResponseInterface,
  EmbedInterface,
  FinanceExpressConfigInterface, OldWidgetDataInterface,
  PaymentOptionInteface,
  PhrasesInterface,
  SwedenTokenDataResponse,
  WidgetDataInterface
} from '../interfaces';
import { AbstractWidget } from './abstract-widget';
import { BannerAndRateDKWidget } from './banner-and-rate-dk-widget';
import { BannerAndRateWidgetGeneral } from './banner-and-rate-general-widget';
import { BannerAndRateNOWidget } from './banner-and-rate-no-widget';
import { BubbleWidget } from './bubble-widget';
import { FinanceExpressConfig } from './finance-express-config';
import { FinExpRequest } from './request';

import { UrlParser } from './url-parser';

const uuid = require('uuid');

function isDevServer(): boolean {
  return !!process.env.DEV_SERVER;
}

function getDevDomain(root: string, domain: string): string {
  if (isDevServer()) {
    try {
      const envConfig = require('../../env.json');
      return envConfig[root][domain];
    } catch (e) {}
  }
  return null;
}

const phraseUrl = getDevDomain('php', 'financeExpress') || 'MICRO_URL_PHP_FINANCE_EXPRESS';
const checkoutWrapperUrl = getDevDomain('frontend', 'checkoutWrapper') || 'MICRO_URL_FRONTEND_CHECKOUT_WRAPPER';
const checkoutPhpUrl = getDevDomain('php', 'checkout') || 'MICRO_URL_PHP_CHECKOUT';
const checkoutBackendUrl = getDevDomain('backend', 'checkout') || 'MICRO_URL_CHECKOUT';
const checkoutMicroUrl: string = isDevServer() ? 'http://localhost:8081' : 'MICRO_URL_FRONTEND_CHECKOUT';
const financeExpressBackendUrl = getDevDomain('php', 'financeExpress') || 'MICRO_URL_PHP_FINANCE_EXPRESS';
const commerceosMicroUrl = getDevDomain('frontend', 'commerceos') || 'MICRO_URL_FRONTEND_COMMERCEOS';
const cdnUrl = getDevDomain('custom', 'cdn') || 'MICRO_URL_CUSTOM_CDN';

export class Embed implements EmbedInterface {

  isNo: boolean;
  isSe: boolean;
  swedenToken: string;

  static widgetTypes: WidgetType[] = ['text-link', 'button', 'banner-and-rate', 'bubble'];

  static updateWidget() {
    return window['Payever'].FinanceExpress.Embed.call(window['Payever'].FinanceExpress.embedInstance);
  }

  static postMessage(message): void {
    window.postMessage(message, location.origin);
  }

  static parseOldScriptUrl(src: string): OldWidgetDataInterface {
    // https://mein.payever.de/finances/business/sun-sky-de/finance-express/90764/scripts/finance_express.embed.min.js
    const url: UrlParser = new UrlParser(src);
    let businessSlug: string;
    const paths: string[] = url.uri.path.split('/').filter((path: string) => !!path);
    const oldBusinessSlug: string = paths[0] === 'finances' ? paths[2] : paths[1];
    const oldChannelSetId: string = paths[0] === 'finances' ? paths[4] : paths[3];
    return { oldBusinessSlug, oldChannelSetId };
  }

  static requestNewBusinessAndChannelSet(oldData: OldWidgetDataInterface, successHandler, errorHandler): void {
    const request: FinExpRequest = new FinExpRequest(successHandler, errorHandler);

    request.open(`${phraseUrl}/api/convert?slug=${oldData.oldBusinessSlug}&channel_set_id=${oldData.oldChannelSetId}`);
  }

  /**
   * defaultSettings is used in demo mode in case when widget has no settings
   */
  static fetchConfigAndRun() {
    const defaultSettings: SettingsResponseInterface[] = window['PayeverCommerceos'] ? window['PayeverCommerceos'].defaultSettings : null;

    const scriptEl: HTMLScriptElement = document.head.querySelector('script[src*="finance_express.embed.min.js"]');
    const widgetPlaced: string = '';// url.uri.query searchParams.get('widget_placed');

    FinanceExpressConfig.setConfig({
      widgetPlaced: widgetPlaced,
      schemeAndHttpHost: location.origin,
      logoUrl: `${checkoutMicroUrl}/assets/images/plugin_button_santander_logo.png`,
      payLinkUrl: `${checkoutWrapperUrl}/pay`,
      polyfillsUrl: `${cdnUrl}/js/polyfills.js`,
      envBaseUrl: `${checkoutWrapperUrl}`,
      checkoutWrapperMicro: `${checkoutWrapperUrl}/checkout-main-ce/micro.js`,
      commerceosOrigin: commerceosMicroUrl,
      commerceosWrapperStyles: `${commerceosMicroUrl}/lazy-styles.css`,
      checkoutWrapperStyles: `${checkoutWrapperUrl}/lazy-styles.css`,
      createFlowUrl: `${checkoutPhpUrl}/api/rest/v1/checkout/flow`, // TODO Remove as not needed
      financeExpressCssFileUrl: `${checkoutMicroUrl}/finance_express_embed.css`,
      defaultSettings
    });
    if (scriptEl) {
      const src = scriptEl.src;
      const oldFinExpScriptLink: boolean = src.indexOf('mein.payever.de') >= 0 || src.indexOf('proxy.payever.org') >= 0; // TODO proxy.payever.org for tests

      let business: string;
      let channelSetId: string;

      const successHandler = (data: PaymentOptionInteface[]) => {
        let payment: string = '';
        let paymentId: string = '';
        if (data && data.length) {
          const santaderPaymentMethods: PaymentOptionInteface[]
            = data.filter(paymentOption => paymentOption.payment_method.indexOf('santander') === 0)
            .filter(paymentOption =>
              paymentOption.payment_method.indexOf('invoice') < 0
              // && paymentOption.payment_method.indexOf('factoring') < 0
            );
          if (santaderPaymentMethods.length) {
            payment = santaderPaymentMethods[0].payment_method;
            paymentId = santaderPaymentMethods[0].id;
          }
        }

        const isDk: boolean = endsWith(payment, '_dk');
        const isNo: boolean = endsWith(payment, '_no');
        const isSe: boolean = endsWith(payment, '_se');
        Embed.prototype.isSe = isSe;
        Embed.prototype.isNo = isNo;

        if (isDk) {
          window['Payever'].FinanceExpress.BannerAndRateWidget = BannerAndRateDKWidget;
        } else if (isNo) {
          window['Payever'].FinanceExpress.BannerAndRateWidget = BannerAndRateNOWidget;
        } else {
          window['Payever'].FinanceExpress.BannerAndRateWidget = BannerAndRateWidgetGeneral;
        }

        // extend config by new values
        const config: FinanceExpressConfigInterface = FinanceExpressConfig.getConfig();
        FinanceExpressConfig.setConfig({
          ...config,
          settingsUrl: `${financeExpressBackendUrl}/api/settings/${channelSetId}`,
          calculationUrl: `${checkoutPhpUrl}/api/rest/v3/service/${business}/${payment}/translated-calculation`,
          getConnectionIdUrl: `${checkoutBackendUrl}/api/channel-set/${channelSetId}/default-connection/${payment}`,
          businessSlug: business,
          channelSetId: channelSetId,
          phrasesUrl: `${phraseUrl}/api/rest/v1/finance/business/${ business }/finance-express/${ channelSetId }/${ payment }/widget-phrases`,
          // phrasesUrl: `${phraseUrl}/finances/business/${ business }/finance-express/${ channelSetId }/${ payment }/widget-phrases`,
          // TODO replace DEFAULT_BANNER_PRICE to real price
          swedenTokenUrl: `${checkoutPhpUrl}/santander-se/${business}/santander_installment_se/express-application-token`
        });

        if (!payment) {
          Embed.postMessage(paymentOptionsNotSetEventMessage);
          console.error(`Payments not set for channel set ${channelSetId}`);
          return;
        }

        Embed.instance();
      };

      const errorHandler = (data: any) => {
        Embed.postMessage(cannotFetchPaymentOptionsEventMessage);
        console.error('Cannnot fetch data about payment options.');
      };

      const setBusinessAndChannelSetHandler = (data: any) => {
        // if data== null then business and channelSetId should be set already
        if (data) {
          business = data.business_uuid;
          channelSetId = data.channel_set_uuid;
        }

        const request: FinExpRequest = new FinExpRequest(successHandler, errorHandler);
        request.open(`${checkoutPhpUrl}/api/rest/v3/payment-options/channel-set/${channelSetId}`);
      };

      if (oldFinExpScriptLink) {
        const oldData: OldWidgetDataInterface = Embed.parseOldScriptUrl(src);
        Embed.requestNewBusinessAndChannelSet(oldData, setBusinessAndChannelSetHandler, () => {})
      } else {
        const url: UrlParser = new UrlParser(src);
        /* path has structure /finance/business/BUSINESS_UUID/channel/CHANNEL_SEY_UUID/finance_express.embed.min.js */
        const paths: string[] = url.uri.path.split('/').filter((path: string) => !!path);
        business = paths[2] || url.uri.queryKey['businessUuid'];
        channelSetId = paths[4] || url.uri.queryKey['channelSetId'];

        setBusinessAndChannelSetHandler(null);
      }
    }
  }

  static instance(): Embed {
    return window['Payever'].FinanceExpress.embedInstance || new Embed();
  }

  defaultStyleSheet: HTMLLinkElement;
  financeExpressConfig: FinanceExpressConfigInterface;
  events = {
    created: [],
    error: []
  };
  isPreview = typeof window['Payever'].FinanceExpress.BubbleWidget['instance'] !== 'function'; // TODO
  phrases: PhrasesInterface;
  widgetRefs = {};
  widgetRefField = {
    element: 0,
    widget: 1,
    data: 2
  };
  uniqId = 0;

  constructor() {
    window['Payever'].FinanceExpress.embedInstance = this;

    this.defaultStyleSheet = document.createElement('link') as HTMLLinkElement;
    this.defaultStyleSheet.type = 'text/css';
    this.defaultStyleSheet.rel = 'stylesheet';
    this.defaultStyleSheet.href = FinanceExpressConfig.getConfig().financeExpressCssFileUrl; // TODO STUB '{{ absolute_url(asset("dist/finance_express_embed.css")) }}';
    document.head.insertBefore(this.defaultStyleSheet, document.head.firstChild);

    const request: FinExpRequest = new FinExpRequest(
      (data: any) => {
        this.phrases = data;
        this.requestSettings();
      },
      () => {
        this.requestSettings();
      });

    request.open(FinanceExpressConfig.getConfig().phrasesUrl);
  }

  get settingsStyleSheet(): HTMLStyleElement {
    return window['Payever'].FinanceExpress.settingsStyleSheet;
  }

  set settingsStyleSheet(element: HTMLStyleElement) {
    window['Payever'].FinanceExpress.settingsStyleSheet = element;
  }

  on(eventName: string, callback, context) {
    return this.events[eventName].push({
      callback,
      context
    });
  }

  off(eventName: string, callback, context): void {
    if (callback) {
      this.events[eventName] = this.events[eventName].filter((event) => event.context !== context);
    } else {
      this.events[eventName] = [];
    }
  }

  trigger(eventName, ...args): void {
    this.events[eventName].map((event) => event.callback.call(event.context, args));
  }

  requestSettings(): void {
    const request: FinExpRequest = new FinExpRequest((settings: SettingsResponseInterface[]) => {
      this.responseSettings(settings);
    });

    request.open(FinanceExpressConfig.getConfig().settingsUrl);

    // this.relay = document.createElement('iframe') as HTMLIFrameElement;
    // this.relay.style.display = 'none';
    //
    // // TODO STUB - stub
    // this.relay.src = FinanceExpressConfig.getConfig().relayFrameUrl; // `https://stage.payever.de/finances/business/xxxlutz/finance-express/28559/scripts/santander-installments/test-relay-iframe`;
    // // this.relay.src = '{{ absolute_url(path("business.relay.test.iframe.js", {slug: business.getSlug(), id: channelSet.getId(), payment_option_slug: paymentOption.getSlug()})) }}';
    // document.body.appendChild(this.relay);
  }

  // onWindowMessage(event) {
  //   // if ((event.origin !== '{{ app.request.getSchemeAndHttpHost() }}') || (event.source !== this.relay.contentWindow)) {
  //   if (event.origin !== FinanceExpressConfig.getConfig().schemeAndHttpHost || event.source !== this.relay.contentWindow) {
  //     return;
  //   }
  //
  //   const data: any = JSON.parse(event.data);
  //
  //   // if (Boolean(data.responseSettings)) {
  //     // this.responseSettings(data.responseSettings);
  //   // } else
  //   if (Boolean(data.responseCalculate)) {
  //     this.responseCalculate(data.responseCalculate);
  //   } else if (data === 'responseCalculateError') {
  //     this.trigger('error', 'Error on load rates');
  //   }
  // }

  widgetType(element: HTMLElement): WidgetType {
    for (let type of Embed.widgetTypes) {
      if (hasClass(element, `payever-${type}`)) {
        return type as WidgetType;
      }
    }
    return null;
  }

  getIdBy(field, value): string {
    for (let id in this.widgetRefs) {
      const widgetRef = this.widgetRefs[id];
      if (widgetRef[field] === value) {
        return id;
      }
    }
    return null;
  }

  collectWidgets(parentElement?: HTMLDocument) {
    if (parentElement == null) {
      parentElement = document;
    }

    if (!this.settingsStyleSheet) {
      return;
    }

    const result = [];
    for (let i = 0, element: Element; element = parentElement.querySelectorAll('.payever-finance-express')[i] as any; i++) {
      let id;
      const widgetType: WidgetType = this.widgetType(element as HTMLElement);
      const data: WidgetDataInterface = {} as WidgetDataInterface;
      for (let attr of AbstractWidget.dataTypes) {
        data[attr as string] = (element as HTMLElement).getAttribute(`data-${attr}`);
      }

      if (!(widgetType
            && window['Payever'].FinanceExpress[`${camelCased(widgetType)}Widget`].prototype.settings
            && window['Payever'].FinanceExpress[`${camelCased(widgetType)}Widget`].prototype.settings.visibility
            || this.isPreview
          ) && data.demo !== '1') {
        continue;
      }

      if (widgetType === 'bubble' && !this.isPreview) {
        id = this.uniqId++;
        this.widgetRefs[id] = [element, null, data];
      } else {
        id = this.getIdBy(this.widgetRefField.element, element);
        if (id != null) {
          if (this.widgetRefs[id][this.widgetRefField.widget]) {
            this.widgetRefs[id][this.widgetRefField.widget].destroy();
            this.widgetRefs[id][this.widgetRefField.widget] = null;
          }
        } else {
          id = this.uniqId++;
          this.widgetRefs[id] = [element, null];
        }
      }

      const caclulationRequest: FinExpRequest = new FinExpRequest(
        (calculationResponse: CalculationResponseInterface) => {
          Embed.postMessage(widgetCreatedEventMessage);

          const calcData: CalculationDataInterface = {
            id,
            data: calculationResponse
          };
          this.responseCalculate(calcData);
        },
        () => {
          Embed.postMessage(cannotGetCalculationsEventMessage);
        }
      );

      const run = () => {
        // Request ConnectionId and then Calculations
        new FinExpRequest(
          (response: any) => {
            console.log('response with connectionId', response);
            const connectionId = response._id;
            caclulationRequest.open(Embed.getCalculationUrl(data, widgetType, connectionId));
          },
          () => {
            Embed.postMessage(cannotGetConnectionIdEventMessage);
            console.error('Cannnot fetch connectionId.');
          })
          .open(FinanceExpressConfig.getConfig().getConnectionIdUrl);
      };

      if (Embed.prototype.isSe) {
        new FinExpRequest(
          (response: SwedenTokenDataResponse) => {
            if (response && response.tokenData) {
              Embed.prototype.swedenToken = response.tokenData.token;
            }
            run();
          },
          () => {
            Embed.postMessage(swedenTokenErrorEventMessage);
            console.error('Cannnot fetch token for Santander Installment SE.');
          })
          .open(FinanceExpressConfig.getConfig().swedenTokenUrl, {amount: data.price});
      } else {
        run();
      }
    }
  }

  static getCalculationUrl(data: WidgetDataInterface, widgetType: WidgetType, connectionId: string): string {
    return `${ FinanceExpressConfig.getConfig().calculationUrl }?`
      + `amount=${ data.price }&`
      // + `currency=${ data.currency }&`
      + `code=${ data.code }&`
      + `widget_type=${ widgetType }&`
      + `widget_placed=${ '' }&`
      + `connection_id=${ connectionId }&`
      + `${ Embed.prototype.isSe ? 'reference=' + uuid() + '&' : '' }`
      + `${ Embed.prototype.isSe ? 'token=' + Embed.prototype.swedenToken + '&' : '' }`
      + `${ Embed.prototype.isNo ? 'product_type=HANDLEKONTO' : '' } `; // <-- use exactly HANDLEKONTO and only for Norway
  }

  removeWidget(widget): void {
    const id = this.getIdBy(this.widgetRefField.widget, widget);
    if (!id) {
      return;
    }
    delete this.widgetRefs[id];
  }

  responseSettings(settings: SettingsResponseInterface[]): void {
    this.setSettings(settings);
    this.collectWidgets();
  }

  setSettings(settingsArray: SettingsResponseInterface[]) {

    // NOTE: temp solution to convert new response format to the old format
    const doResponseFormat: boolean = true;
    if (doResponseFormat && !Array.isArray(settingsArray)) {
      const newSettings: SettingsResponseInterface[] = [];
      for (let type in <any>settingsArray) {
        const setting: SettingsResponseInterface = {
          type: type as WidgetType,
          data: (<any>settingsArray)[type]
        };
        newSettings.push(setting);
      }
      settingsArray = newSettings;
    }

    // add to settings from server some default setting for missed types of widget
    if (FinanceExpressConfig.getConfig().defaultSettings) {
      FinanceExpressConfig.getConfig().defaultSettings.forEach((defaultSettings: SettingsResponseInterface) => {
        if (settingsArray.filter(settings => settings.type === defaultSettings.type).length === 0) {
          settingsArray.push(defaultSettings);
        }
      });
    }

    if (!settingsArray || settingsArray.length === 0) {
      settingsArray = FinanceExpressConfig.getConfig().defaultSettings;
    }

    let widgetSettings: SettingsResponseInterface;
    let type: WidgetType;
    const content: string[] = [];

    if (!this.settingsStyleSheet) {
      this.settingsStyleSheet = document.createElement('style') as HTMLStyleElement;
      this.settingsStyleSheet.type = 'text/css';
      document.head.insertBefore(this.settingsStyleSheet, this.defaultStyleSheet.nextSibling);
      window['Payever'].FinanceExpress.styleElement = this.settingsStyleSheet;
    }

    for (widgetSettings of settingsArray) {
      type = widgetSettings.type;
      if (Embed.widgetTypes.indexOf(type) > -1) {
        const classWidget = window['Payever'].FinanceExpress[`${camelCased(type)}Widget`];
        classWidget.prototype.settings = widgetSettings.data;
        content.push(classWidget.dynamicStyleSheet());
      }
    }

    this.settingsStyleSheet.innerHTML = content.join('');

    return (() => {
      const result = [];
      for (let id in this.widgetRefs) {
        const widgetRef = this.widgetRefs[id];
        if (widgetRef[this.widgetRefField.widget]) {
          for (widgetSettings of settingsArray) {
            type = widgetSettings.type.replace(/_/g, '-') as WidgetType;
            if (Embed.widgetTypes.indexOf(type) > -1) {
              if (type === widgetRef[this.widgetRefField.widget].getType()) {
                if (null !== widgetSettings.data.linkTo) {
                  widgetRef[this.widgetRefField.widget].setLinkTo(widgetSettings.data.linkTo);
                }
              }
            }
          }
          result.push(widgetRef[this.widgetRefField.widget].update());
        }
      }
      return result;
    })();
  }

  responseCalculate(calculationData: CalculationDataInterface) {
    let widget: AbstractWidget | BubbleWidget;
    // if (!__guard__(calculationData.data.messages != null ? calculationData.data.messages.link : undefined, x => x.text)) {
    //   this.trigger('error', 'Connection failed. Please check Santander connection.');
    //   return;
    // }
    const element = this.widgetRefs[calculationData.id][this.widgetRefField.element];
    const data = this.widgetRefs[calculationData.id][this.widgetRefField.data];
    const widgetType = this.widgetType(element);
    if ((widgetType === 'bubble') && !this.isPreview) {
      widget = BubbleWidget.instance();
      (widget as BubbleWidget).setData(data);
      (widget as BubbleWidget).show();
    } else {
      widget = this.widgetRefs[calculationData.id][this.widgetRefField.widget];
      if (!widget) {
        widget = new (window['Payever'].FinanceExpress[`${camelCased(widgetType)}Widget`])(element);
        if (!widget) { return; }
        this.widgetRefs[calculationData.id][this.widgetRefField.widget] = widget;
      }
    }
    widget.setContent(calculationData.data);
    return this.trigger('created', widget);
  }

}

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
