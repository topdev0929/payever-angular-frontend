/* tslint:disable */

import { BaseWidgetSettingsInterface, LinkToType, WidgetType } from '../interfaces';
import { WidgetDataInterface } from '../interfaces';
import { FinanceExpressConfig } from './finance-express-config';
import { Overlay } from './overlay';
import { FinExpRequest } from './request';

export class PayLink {
  context: HTMLElement;
  data: WidgetDataInterface;
  settings: BaseWidgetSettingsInterface;
  linkTo: LinkToType;
  widgetType: WidgetType;

  constructor(settings: any, context: HTMLElement, widgetType: WidgetType) {
    this.goByClickEvent = this.goByClickEvent.bind(this);
    this.settings = settings;
    this.context = context;
    this.widgetType = widgetType;

    // Uncomment if you want to preload micro.js
    // Overlay.instance().preload();
  }

  setData(data): void {
    this.data = data;
  }

  additionalParams(): string {
    // TODO STUB - done
    // return '&cart=1{{ app.request.get("widget_placed") == "finance_express_preview" ? "&cpi=0" }}';
    return `&cart=1${ FinanceExpressConfig.getConfig().widgetPlaced === 'finance_express_preview' ? '&cpi=0' : '' }`;
  }

  isDemo(): boolean {
    return !!parseInt(this.data.demo) || this.settings.linkTo === 'finance_calculator';
  }

  url(): string {
    const demo: string = this.isDemo() ? '1' : '0';

    // TODO STUB - done //  'https://stage.payever.de/pay/init/28559/santander-installments'
    // return FinanceExpressConfig.getConfig().payLinkUrl + '?' + ('amount=' + (encodeURIComponent(this.data.price)) + '&currency=' + (encodeURIComponent(this.data.currency)) + '&') + ('item=' + (encodeURIComponent(this.data.name)) + '&code=' + (encodeURIComponent(this.data.code)) + '&demo=' + demo) + ('&finance_type=' + this.settings.linkTo) + this.additionalParams();
    return FinanceExpressConfig.getConfig().payLinkUrl + '?' + ('amount=' + (encodeURIComponent(this.data.price)) + '&') + ('item=' + (encodeURIComponent(this.data.name)) + '&code=' + (encodeURIComponent(this.data.code)) + '&demo=' + demo) + ('&finance_type=' + this.settings.linkTo) + this.additionalParams();

    // return `{{ absolute_url(path('online_shop.payment.id', {id: channelSet.getId(), payment_option_slug: paymentOption.getSlug()})) }}?
    //   amount=${encodeURIComponent(this.data.price)}&currency=${encodeURIComponent(this.data.currency)}&
    //   item=${encodeURIComponent(this.data.name)}&code=${encodeURIComponent(this.data.code)}&demo=${demo}
    //   &finance_type=${this.settings.link_to}` + this.additionalParams();
  }

  title(): string {
    if (this.settings.linkTo === 'finance_calculator') {
      return window['Payever'].FinanceExpress.embedInstance.phrases.finance_calculator;
    } else {
      return window['Payever'].FinanceExpress.embedInstance.phrases.overlay_title;
    }
  }

  goByClickEvent(event: Event): void {
    event.preventDefault();

    const link = (event.currentTarget || event.srcElement) as HTMLLinkElement;
    return Overlay.instance().showByChannelSetId(FinanceExpressConfig.getConfig().channelSetId, this.data.price, this.data.name, link.title);
  }

  getHTML(className): string {
    if (this.settings.linkTo) {
      return `<a href="${this.url()}" target="overlay" title="${this.title()}" class="${className}"></a>`;
    } else {
      return `<span class="${className}"></span>`;
    }
  }

  addEventListener(selector: string): void {
    for (let i = 0, element: Element; element = this.context.querySelectorAll(selector)[i]; i++) {
      if (this.settings.linkTo) {
        element.addEventListener('click', this.goByClickEvent);
      }
    }
  }

  setLinkTo(linkTo): void {
    this.linkTo = linkTo;
    this.settings.linkTo = this.linkTo;
  }

  isConfigured(): boolean {
    return !!this.settings.linkTo;
  }
}
