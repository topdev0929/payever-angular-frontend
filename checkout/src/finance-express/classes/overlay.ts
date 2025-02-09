/* tslint:disable */

import { addClass, removeClass } from '../helpers/index';
import { FinanceExpressConfig } from './finance-express-config';
import { Panel } from './panel';

export class Overlay extends Panel {

  private loadedScripts: {[key: string]: boolean} = {};
  private titleElement: HTMLElement;
  private customElement: HTMLElement;

  /**
   * @deprecated try not to use it
   */
  static initClass() {
    // instance = null;
    // titleElement = null;
    // loadingElement = null;
  }

  // /**
  //  * @deprecated not use. return null;
  //  */
  static instance() {
    return window['Payever'].Overlay || new Overlay();
  }
   // { return instance != null ? instance : (instance = new (this)()); }

  constructor() {
    super();

    window['Payever'].Overlay = this;

    this.element.className = 'payever-overlay payever-hide';
    // TODO ad translaton for "loading"
    this.element.innerHTML = `
      <div class="payever-installment-title">
        <span class="payever-option-logo"></span>
        <span class="payever-close-button">&times;</span>
        <span class="payever-option-name"></span>
      </div>
      <div class="payever-loading">loading</div>
      <div class="payever-installment-iframe">
        <pe-checkout-wrapper-by-channel-set-id></pe-checkout-wrapper-by-channel-set-id>
      </div>`;

    const closeButton: HTMLElement = this.element.querySelector('.payever-close-button');
    closeButton.addEventListener('click', this.hide.bind(this));

    this.titleElement = this.element.querySelector('.payever-option-name');

    this.customElement = this.element.querySelector('.payever-installment-iframe pe-checkout-wrapper-by-channel-set-id');
    document.body.appendChild(this.element);
  }

  showByChannelSetId(channelSetId: string, amount: number, reference: string, title: string): string {
    super.baseShow();

    this.titleElement.innerHTML = title;

    addClass(this.element, 'payever-is-loading');
    removeClass(this.element, 'payever-hide');

    if (!document.getElementsByTagName('head')[0].getElementsByTagName('base')[0]) {
      const base = document.createElement('base');
      // TODO This can be removed when APP_BASE_HREF provider added to all payment micros
      base.href = '/';
      document.getElementsByTagName('head')[0].appendChild(base);
    }

    this.customElement.setAttribute('fixedposition', JSON.stringify(true));
    this.customElement.setAttribute('absoluterooturl', String(FinanceExpressConfig.getConfig().envBaseUrl));
    this.customElement.setAttribute('createflowparams', JSON.stringify({
      channelSetId: channelSetId,
      amount: amount,
      reference: reference
    }));
    this.customElement.setAttribute('params', JSON.stringify({
      forceNoPaddings: true,
      forceNoCloseButton: true,
      setDemo: true,
      embeddedMode: true
    }));

    this.loadScript(FinanceExpressConfig.getConfig().polyfillsUrl, () => {
      this.loadScript(FinanceExpressConfig.getConfig().checkoutWrapperMicro, () => {
        removeClass(this.element, 'payever-hide');
        removeClass(this.element, 'payever-is-loading');
      });
    });
    return '';
  }

  hide(): void {
    addClass(this.element, 'payever-hide');
  }

  preload(): void {
    this.loadScript(FinanceExpressConfig.getConfig().polyfillsUrl, () => {});
    this.loadScript(FinanceExpressConfig.getConfig().checkoutWrapperMicro, () => {});
  }

  private loadStyles(): void {
    const commerceosOrigin = FinanceExpressConfig.getConfig().commerceosOrigin;
    const url1 = FinanceExpressConfig.getConfig().commerceosWrapperStyles;
    const url2 = FinanceExpressConfig.getConfig().checkoutWrapperStyles; // Preffered if none loaded
    if (
      !document.querySelector(`link[href="${url1}"]`) &&
      !document.querySelector(`link[href="${url2}"]`) &&
      window.location.origin !== commerceosOrigin // If we are in commerceos - url2 is already loaded as we are in checkout app
    ) {
      const style: HTMLStyleElement = document.createElement('link');
      style.setAttribute('rel', 'stylesheet');
      style.setAttribute('href', url2);
      document.getElementsByTagName('body')[0].appendChild(style);
    }
  }

  private loadScript(url: string, callback: () => void): void {
    this.loadStyles();
    if (this.loadedScripts[url]) {
      callback();
    } else {
      const script: HTMLScriptElement = document.createElement('script');
      script.type = 'text/javascript';
      script.onload = () => {
        this.loadedScripts[url] = true;
        callback();
      };
      script.src = url;
      script.onerror = (error: any) => {
        console.error(`Not possible to load script '${url}':\n ${JSON.stringify(error)}`);
      };
      document.getElementsByTagName('head')[0].appendChild(script);
    }
  }

}
