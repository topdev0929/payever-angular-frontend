/* tslint:disable */
import { addClass, removeClass } from '../helpers/index';
import { BubblePayLink } from './bubble-pay-link';
import { Embed } from './embed';
import { FinanceExpressConfig } from './finance-express-config';
import { Panel } from './panel';

export class BubbleWidget extends Panel {

  hint: HTMLElement;
  payLink: BubblePayLink;
  settings: any;
  content: any;
  type: string;

  /**
   * @deprecated
   */
  // static initClass() {
  //   instance = null;
  // }

  /**
   * @deprecated
   */
  static dynamicStyleSheet() { return ''; }

  static instance() {
    return window['Payever'].FinanceExpress.BubbleWidgetInstance || new BubbleWidget();
  } // { return this.instance != null ? instance : (instance = new (this)()); }

  constructor() {
    super();

    window['Payever'].FinanceExpress.BubbleWidgetInstance = this;

    this.payLink = new BubblePayLink(this.settings, this.element);
    this.element.className = 'payever-finance-express-bubble payever-banner-type-bubble';
    this.element.innerHTML = `
      <button class="payever-activator-link" data-target="overlay" title="${this.payLink.title()}">
        <span class="payever-button-flipper">
          <!--{% set absolute_url = absolute_url(asset('/bundles/payeverapplicationfrontend/images/plugin_button_santander_logo.png')) %}-->
           <span class="payever-button-face" style="background-image:url('${ FinanceExpressConfig.getConfig().logoUrl }')"></span><span class="payever-button-flip" style="background-image:url('${ FinanceExpressConfig.getConfig().logoUrl }')"></span>
          <!-- <span class="payever-button-face" style="background-image:url('{{ absolute_url }}')"></span><span class="payever-button-flip" style="background-image:url('{{ absolute_url }}')"></span> -->
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

    // .payever-bubble-preview is used in checlout app for preview
    const bubblePreviewElement: HTMLElement = document.querySelector('.payever-bubble-preview');
    (bubblePreviewElement || document.body).appendChild(this.element);

    this.hint = this.element.querySelector('.payever-installment-hint');

    const activatorButton: HTMLElement = this.element.querySelector('.payever-activator-link');
    activatorButton.addEventListener('click', this.show.bind(this));

    this.payLink.addEventListener('.payever-installment-hint-add-to-cart button,.payever-activator-link');

    const closeButton = this.hint.querySelector('.payever-installment-hint-close');
    closeButton.addEventListener('click', this.hide.bind(this));
  }

  show(src?: string, title?: string): string {
    super.show(src, title);
    return removeClass(this.hint, 'payever-hide');
  }

  hide(): void {
    addClass(this.hint, 'payever-hide');
  }

  setData(data): void {
    this.payLink.setData(data);
    const url: string = this.payLink.url();
    this.hint.querySelector('.payever-installment-hint-add-to-cart button').setAttribute('data-href', url);
    this.element.querySelector('.payever-activator-link').setAttribute('data-href', url);
  }

  update(): void {
    const url: string = this.payLink.url();
    const title: string = this.payLink.title();
    this.hint.querySelector('.payever-installment-hint-add-to-cart button').setAttribute('data-href', url);
    this.hint.querySelector('.payever-installment-hint-add-to-cart button').setAttribute('title', title);
    this.hint.querySelector('.payever-installment-hint-value').innerHTML = this.content.messages.bubble;
  }

  setContent(content): void {
    this.content = content;
    this.update();
  }

  initType(): void {
    this.type = 'bubble';
  }

}
