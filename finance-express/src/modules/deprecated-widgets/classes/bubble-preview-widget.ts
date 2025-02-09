/* tslint:disable */
import { Payever } from '../global';
import { AbstractWidget } from './abstract-widget';
import { FinanceExpressConfig } from './finance-express-config';

export class BubblePreviewWidget extends AbstractWidget {

  element: HTMLElement;

  /**
   * @deprecated
   */
  static dynamicStyleSheet() { return ''; }

  /**
   * @deprecated
   */
  static instance() { return null; }

  constructor(element) {
    super(element);
    this.element = element;
    this.element.className += ' payever-finance-express-bubble payever-banner-type-bubble';
    this.element.innerHTML = `
      <button class="payever-activator-link" data-target="overlay" title="${this.payLink.title()}">
        <span class="payever-button-flipper">
          <!--{% set absolute_url = absolute_url(asset('/bundles/payeverapplicationfrontend/images/plugin_button_santander_logo.png')) %}-->
          <span class="payever-button-face" style="background-image:url('${ FinanceExpressConfig.getConfig().logoUrl }')"></span><span class="payever-button-flip" style="background-image:url('${ FinanceExpressConfig.getConfig().logoUrl }')"></span>
        </span>
      </button>
      <div class="payever-installment-hint">
        <div class="payever-installment-hint-value-box">
          <span class="payever-installment-hint-value"></span>
        </div>
        <span class="payever-installment-hint-close">${window['Payever'].FinanceExpress.embedInstance.phrases.bubble_close}</span>
        <span class="payever-installment-hint-add-to-cart">
          <button data-target="overlay" title="${this.payLink.title()}">${this.payLink.title()}</button>
        </span>
      </div>`;

    this.payLink.addEventListener('.payever-installment-hint-add-to-cart button,.payever-activator-link');

    const url: string = this.payLink.url();
    this.element.querySelector('.payever-installment-hint-add-to-cart button').setAttribute('data-href', url);
    this.element.querySelector('.payever-activator-link').setAttribute('data-href', url);
  }

  update(): void {
    const url: string = this.payLink.url();
    const title: string = this.payLink.title();
    this.element.querySelector('.payever-installment-hint-add-to-cart button').setAttribute('data-href', url);
    this.element.querySelector('.payever-activator-link').setAttribute('data-href', url);
    this.element.querySelector('.payever-installment-hint-add-to-cart button').setAttribute('title', title);
    this.element.querySelector('.payever-activator-link').setAttribute('title', title);
    this.element.querySelector('.payever-installment-hint-value').innerHTML = this.content.messages.bubble;
  }

  initType(): void {
    this.type = 'bubble';
  }
}
