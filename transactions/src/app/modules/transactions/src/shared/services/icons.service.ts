import { Injectable } from '@angular/core';

// TODO: unfortunately somewhy Connect micro is have in DB hardcoded icons for each payment option and channel type. Need to make the service which will be manage icons ids cause we can't now just rename icons in ui-kit in proper way
@Injectable()
export class IconsService {

  getChannelIconId(channelType: string): string {
    let iconId: string = '#icon-';
    switch (channelType) {
      case 'facebook':
        iconId += 'channel-fb';
        break;
      case 'facebook_messenger':
      case 'facebook-messenger':
      case 'facebookMessenger':
        iconId += 'channel-fb-messenger';
        break;
      case 'whatsapp':
        iconId += 'channel-whatsapp';
        break;
      case 'instagram':
        iconId += 'channel-instagram';
        break;
      case 'finance_express':
        iconId += 'payment-option-santander';
        break;
      case 'shop':
      case 'store':
        iconId += 'channel-store';
        break;
      case 'marketing':
        iconId += 'apps-marketing';
        break;
      case 'pos':
        iconId += 'channel-pos';
        break;
      // Shopsystems:
      case 'api':
        iconId += 'api';
        break;
      case 'dandomain':
        iconId += 'dan-domain-bw';
        break;
      case 'jtl':
        iconId += 'jtl';
        break;
      case 'magento':
        iconId += 'magento';
        break;
      case 'oxid':
        iconId += 'oxid';
        break;
      case 'plentymarkets':
        iconId += 'plenty-markets-bw';
        break;
      case 'presta':
        iconId += 'prestashop-bw';
        break;
      case 'shopify':
        iconId += 'shopify';
        break;
      case 'shopware':
        iconId += 'shopware';
        break;
      case 'woo_commerce':
      case 'wooCommerce':
        iconId += 'woo-commerce-bw';
        break;
      case 'xt_commerce':
      case 'xtCommerce':
        iconId += 'xt-commerce';
        break;
      default:
        iconId += 'channel-other_shopsystem';
        break;
    }
    return iconId;
  }

  getPaymentMethodIconId(paymentType: string): string {
    let iconId: string = '#icon-payment-option-';
    switch (paymentType) {
      case 'cash':
        iconId += 'wire-transfer';
        break;
      case 'invoice':
        iconId += 'invoice';
        break;
      case 'payex_creditcard':
      case 'payex_faktura':
        iconId += 'payex';
        break;
      case 'swedbank_creditcard':
      case 'swedbank_invoice':
        iconId += 'swedbank';
        break;
      case 'paymill_creditcard':
      case 'paymill_directdebit':
        iconId += 'paymill';
        break;
      case 'santander_factoring_de':
      case 'santander_ccp_installment':
      case 'santander_installment':
      case 'santander_installment_at':
      case 'santander_installment_dk':
      case 'santander_installment_no':
      case 'santander_installment_nl':
      case 'santander_installment_se':
      case 'santander_invoice_no':
      case 'santander_invoice_de':

      case 'santander_pos_factoring_de':
      case 'santander_pos_installment':
      case 'santander_pos_installment_at':
      case 'santander_pos_installment_dk':
      case 'santander_pos_installment_no':
      case 'santander_pos_installment_se':
      case 'santander_pos_invoice_no':
      case 'santander_pos_invoice_de':
      case 'instant_payment':
        iconId += 'santander';
        break;
      case 'paypal':
        iconId += 'paypall';
        break;
      case 'sofort':
        iconId += 'sofort';
        break;
      case 'stripe':
      case 'stripe_directdebit':
        iconId += 'stripe';
        break;
      default:
        iconId += 'wire-transfer';
        break;
    }
    return iconId;
  }

}
