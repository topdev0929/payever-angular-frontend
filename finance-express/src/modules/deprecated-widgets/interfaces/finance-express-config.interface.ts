import { SettingsResponseInterface } from './widget-settings.interface';

export interface FinanceExpressConfigInterface {

  // like https://stage.payever.de/pay/init/28559/santander-installments
  payLinkUrl?: string;

  // like https://payevertest.azureedge.net/js/polyfills.js
  polyfillsUrl?: string;

  // like https://checkout.test.devpayever.com
  envBaseUrl?: string;

  // like https://checkout.test.devpayever.com/micro.js
  checkoutWrapperMicro?: string;
  checkoutWrapperStyles?: string;
  commerceosWrapperStyles?: string;

  //  like: https://commerceos.test.devpayever.com
  commerceosOrigin?: string;

  settingsUrl?: string;

  calculationUrl?: string;

  getConnectionIdUrl?: string;

  createFlowUrl?: string;

  defaultSettings?: SettingsResponseInterface[];

  financeExpressCssFileUrl?: string;

  // tslint:disable-next-line max-line-length
  // old code {{ absolute_url(path("finance.express.widget.phrases", {slug: business.getSlug(), id: channelSet.getId(), payment_option_slug: paymentOption.getSlug()})) }}{{ app.request.get("widget_placed") ? "?widget_placed=#{app.request.get("widget_placed")}" }}
  // example https://mein.payever.de/business/bad/finance-express/100273/santander-installments-norway/widget-phrases
  phrasesUrl?: string;

  // old code absolute_url(asset('/bundles/payeverapplicationfrontend/images/plugin_button_santander_logo.png'))
  logoUrl?: string;

  // should be like https://mein.payever.de
  schemeAndHttpHost?: string;

  // santander-installments
  paymentOptionSlug?: string;

  // not returned by API
  widgetPlaced?: string;

  // not returned by API
  businessSlug?: string;

  // not returned by API
  channelSetId?: string;

  swedenTokenUrl?: string;
}
