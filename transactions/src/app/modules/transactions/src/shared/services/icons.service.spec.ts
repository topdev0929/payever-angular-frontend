import { TestBed } from '@angular/core/testing';

import { IconsService } from './icons.service';

describe('IconsService', () => {
  let service: IconsService;

  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [IconsService],
    })
  );

  beforeEach(() => {
    service = TestBed.get(IconsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getChannelIconId should return a proper icon id', () => {
    expect(service.getChannelIconId('facebook')).toBe('#icon-channel-facebook');
    expect(service.getChannelIconId('finance_express')).toBe(
      '#icon-payment-option-santander'
    );
    expect(service.getChannelIconId('store')).toBe('#icon-channel-store');
    expect(service.getChannelIconId('marketing')).toBe('#icon-apps-marketing');
    expect(service.getChannelIconId('pos')).toBe('#icon-channel-pos');
    expect(service.getChannelIconId('api')).toBe('#icon-api');
    expect(service.getChannelIconId('dandomain')).toBe('#icon-dan-domain-bw');
    expect(service.getChannelIconId('jtl')).toBe('#icon-jtl');
    expect(service.getChannelIconId('magento')).toBe('#icon-magento');
    expect(service.getChannelIconId('oxid')).toBe('#icon-oxid');
    expect(service.getChannelIconId('plentymarkets')).toBe(
      '#icon-plenty-markets-bw'
    );
    expect(service.getChannelIconId('presta')).toBe('#icon-prestashop-bw');
    expect(service.getChannelIconId('shopify')).toBe('#icon-shopify');
    expect(service.getChannelIconId('shopware')).toBe('#icon-shopware');
    expect(service.getChannelIconId('woo_commerce')).toBe(
      '#icon-woo-commerce-bw'
    );
    expect(service.getChannelIconId('wooCommerce')).toBe(
      '#icon-woo-commerce-bw'
    );
    expect(service.getChannelIconId('xt_commerce')).toBe('#icon-xt-commerce');
    expect(service.getChannelIconId('xtCommerce')).toBe('#icon-xt-commerce');
    expect(service.getChannelIconId('')).toBe('#icon-channel-other_shopsystem');
  });

  it('getPaymentMethodIconId should return a proper icon id', () => {
    expect(service.getPaymentMethodIconId('cash')).toBe(
      '#icon-payment-option-wire-transfer'
    );
    expect(service.getPaymentMethodIconId('invoice')).toBe(
      '#icon-payment-option-invoice'
    );
    expect(service.getPaymentMethodIconId('payex_creditcard')).toBe(
      '#icon-payment-option-payex'
    );
    expect(service.getPaymentMethodIconId('payex_faktura')).toBe(
      '#icon-payment-option-payex'
    );
    expect(service.getPaymentMethodIconId('paymill_creditcard')).toBe(
      '#icon-payment-option-paymill'
    );
    expect(service.getPaymentMethodIconId('paymill_directdebit')).toBe(
      '#icon-payment-option-paymill'
    );

    expect(service.getPaymentMethodIconId('santander_factoring_de')).toBe(
      '#icon-payment-option-santander'
    );
    expect(service.getPaymentMethodIconId('santander_ccp_installment')).toBe(
      '#icon-payment-option-santander'
    );
    expect(service.getPaymentMethodIconId('santander_installment')).toBe(
      '#icon-payment-option-santander'
    );
    expect(service.getPaymentMethodIconId('santander_installment_at')).toBe(
      '#icon-payment-option-santander'
    );
    expect(service.getPaymentMethodIconId('santander_installment_dk')).toBe(
      '#icon-payment-option-santander'
    );
    expect(service.getPaymentMethodIconId('santander_installment_no')).toBe(
      '#icon-payment-option-santander'
    );
    expect(service.getPaymentMethodIconId('santander_installment_se')).toBe(
      '#icon-payment-option-santander'
    );
    expect(service.getPaymentMethodIconId('santander_invoice_no')).toBe(
      '#icon-payment-option-santander'
    );
    expect(service.getPaymentMethodIconId('santander_invoice_de')).toBe(
      '#icon-payment-option-santander'
    );
    expect(service.getPaymentMethodIconId('santander_pos_factoring_de')).toBe(
      '#icon-payment-option-santander'
    );
    expect(service.getPaymentMethodIconId('santander_pos_installment')).toBe(
      '#icon-payment-option-santander'
    )
    expect(service.getPaymentMethodIconId('santander_pos_installment_at')).toBe(
      '#icon-payment-option-santander'
    );
    expect(service.getPaymentMethodIconId('santander_pos_installment_dk')).toBe(
      '#icon-payment-option-santander'
    );
    expect(service.getPaymentMethodIconId('santander_pos_installment_no')).toBe(
      '#icon-payment-option-santander'
    );
    expect(service.getPaymentMethodIconId('santander_pos_installment_se')).toBe(
      '#icon-payment-option-santander'
    );
    expect(service.getPaymentMethodIconId('santander_pos_invoice_no')).toBe(
      '#icon-payment-option-santander'
    );
    expect(service.getPaymentMethodIconId('santander_pos_invoice_de')).toBe(
      '#icon-payment-option-santander'
    );

    expect(service.getPaymentMethodIconId('paypal')).toBe(
      '#icon-payment-option-paypall'
    );
    expect(service.getPaymentMethodIconId('sofort')).toBe(
      '#icon-payment-option-sofort'
    );
    expect(service.getPaymentMethodIconId('stripe')).toBe(
      '#icon-payment-option-stripe'
    );
    expect(service.getPaymentMethodIconId('stripe_directdebit')).toBe(
      '#icon-payment-option-stripe'
    );
    expect(service.getPaymentMethodIconId('')).toBe(
      '#icon-payment-option-wire-transfer'
    );
  });
});
