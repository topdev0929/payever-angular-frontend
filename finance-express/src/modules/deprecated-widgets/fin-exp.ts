/* tslint:disable */
import {
  Embed,
  PayLink,
  BubblePreviewWidget,
  BubbleWidget,
  AbstractWidget,
  BannerAndRateDKWidget, BannerAndRateNOWidget,
  BannerAndRateWidgetGeneral,
  ButtonWidget,
  TextLinkWidget
} from './classes/index';
import { FinanceExpressInterface, PayeverInterface } from './interfaces/index';

// NOTE callback - is not reuqired params
// {% set callback = app.request.get('callback') ? "window.#{app.request.get('callback')}" : 'console.log' %}

// TODO temp disabled. Need to check paymentOptions count here somehow
// {% if not paymentOptions | length %}
// if ( !Payever ) {
//   window['Payever'] = {} as PayeverInterface;
// }
//
// if ( !Payever.FinanceExpress ) {
//   Payever.FinanceExpress = {} as FinanceExpressInterface;
// }
// {{ callback }}? error: 'Payment Option is not enabled'

// {% else %}
// {% set paymentOption = paymentOptions[0]%}
// {% set isDK = paymentOption.paymentMethod == "santander_installment_dk" %}
// {% set isNO = paymentOption.paymentMethod == "santander_installment_no" %}

const isDK: boolean = false;
const isNO: boolean = false;
const isPreview: boolean =  false;

if (!window['Payever']) {
  window['Payever'] = {} as PayeverInterface;
}

if (!window['Payever'].FinanceExpress) {
  window['Payever'].FinanceExpress = {} as FinanceExpressInterface;
}

window['Payever'].FinanceExpress.paymentOptionsEnabled = true;
window['Payever'].FinanceExpress.embedInstance = null;
window['Payever'].FinanceExpress.EmbedClass = Embed;
window['Payever'].FinanceExpress.AbstractWidget = AbstractWidget;
window['Payever'].FinanceExpress.TextLinkWidget = TextLinkWidget;
window['Payever'].FinanceExpress.ButtonWidget = ButtonWidget;
// window['Payever'].Overlay = Overlay;
window['Payever'].FinanceExpress.BannerAndRateWidgetGeneral = BannerAndRateWidgetGeneral;
window['Payever'].FinanceExpress.Embed = Embed;


if (isPreview) {
  window['Payever'].FinanceExpress.BubbleWidget = BubblePreviewWidget;
} else {
  window['Payever'].FinanceExpress.BubbleWidget = BubbleWidget;
}

(() => {
  // let events = undefined;
  // let uniqId = undefined;
  // let defaultStyleSheet = undefined;
  // let settingsStyleSheet = undefined;
  // let widgetRefField = undefined;
  // let isPreview = undefined;

  if (window['Payever'].FinanceExpress.script) {
    // it also creates an instance of Embed
    Embed.fetchConfigAndRun();
  }
  // Embed.fetchConfigAndRun();
})();
