import {
  transactionsListDataSelector,
  activeColumnsSelector,
  paginationSelector,
  filtersSelector,
  activeFiltersSelector,
  businessChannelsConditionsSelector,
  businessChannelsSelector,
  businessCurrenciesConditionsSelector,
  businessCurrencySelector,
  businessPaymentOptionsConditionsSelector,
  businessPaymentOptionsSelector,
  filtersSchemaSelector,
  storesConditionsSelector,
  statusesConditionsSelector,
  specificStatusesConditionsSelector,
} from './selectors';
import { OrdersStateInterface } from '../interfaces';
import {
  mockTransactionsListData,
  mockUserBusinessSettings,
} from '../../../../test-mocks';
import { fakeAsync } from '@angular/core/testing';

describe('State Management Selectors ', () => {
  let state: { orders: OrdersStateInterface };

  beforeEach(() => {
    state = {
      orders: {
        transactionsListData: mockTransactionsListData as any,
        filters: [],
        businessChannels: [],
        businessPaymentOptions: [],
        businessCurrencies: [
          { code: 'EUR', name: 'EUR', symbol: 'e', rate: 1 },
        ],
        businessSettings: mockUserBusinessSettings,
        activeColumns: ['name'],
        filtersSchema: [],
      },
    };
  });

  it('transactionsListDataSelector', fakeAsync(() => {
    expect(JSON.stringify(transactionsListDataSelector(state))).toEqual(
      JSON.stringify(mockTransactionsListData)
    );
  }));

  it('transactionsListDataSelector', fakeAsync(() => {
    expect(JSON.stringify(activeColumnsSelector(state))).toEqual(
      JSON.stringify([
        {
          name: 'channel',
          title: 'channel',
          isActive: false,
          isToggleable: false,
        },
        {
          name: 'original_id',
          title: 'original_id',
          isActive: false,
          isToggleable: false,
        },
        {
          name: 'reference',
          title: 'reference',
          isActive: false,
          isToggleable: true,
        },
        { name: 'total', title: 'total', isActive: false, isToggleable: false },
        { name: 'type', title: 'type', isActive: false, isToggleable: true },
        {
          name: 'customer_email',
          title: 'customer_email',
          isActive: false,
          isToggleable: true,
        },
        {
          name: 'customer_name',
          title: 'customer_name',
          isActive: false,
          isToggleable: true,
        },
        {
          name: 'merchant_email',
          title: 'merchant_email',
          isActive: false,
          isToggleable: true,
        },
        {
          name: 'merchant_name',
          title: 'merchant_name',
          isActive: false,
          isToggleable: true,
        },
         {
           name: 'seller_email',
           title: 'seller_email',
           isActive: false,
           isToggleable: true,
         },
         {
           name: 'seller_name',
           title: 'seller_name',
           isActive: false,
           isToggleable: true,
         },
        {
          name: 'created_at',
          title: 'created_at',
          isActive: false,
          isToggleable: true,
        },
        {
          name: 'status',
          title: 'status',
          isActive: false,
          isToggleable: true,
        },
        {
          name: 'specific_status',
          title: 'specific_status',
          isActive: false,
          isToggleable: true,
        },
      ])
    );
  }));

  it('paginationSelector', fakeAsync(() => {
    expect(JSON.stringify(paginationSelector(state))).toEqual(
      JSON.stringify({
        amount: 16059551.85,
        amount_currency: 'EUR',
        page: 1,
        total: 33531,
      })
    );
  }));

  it('filtersSelector', fakeAsync(() => {
    expect(JSON.stringify(filtersSelector(state))).toEqual(JSON.stringify([]));
  }));

  it('businessCurrencySelector', fakeAsync(() => {
    expect(businessCurrencySelector(state)).toEqual('EUR');
  }));

  it('businessChannelsSelector', fakeAsync(() => {
    expect(JSON.stringify(businessChannelsSelector(state))).toEqual(
      JSON.stringify(undefined)
    );
  }));

  it('businessChannelsConditionsSelector', fakeAsync(() => {
    expect(JSON.stringify(businessChannelsConditionsSelector(state))).toEqual(
      JSON.stringify([
        { value: 'shopify', label: 'Shopify' },
        { value: 'facebook', label: 'Facebook' },
        { value: 'finance_express', label: 'Finance express' },
        { value: 'store', label: 'Store' },
        { value: 'wooCommerce', label: 'WooCommerce' },
        { value: 'magento', label: 'Magento' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'pos', label: 'PoS' },
        { value: 'shopware', label: 'Shopware' },
        { value: 'debitoor', label: 'Debitoor' },
        { value: 'link', label: 'Link' },
        { value: 'e-conomic', label: 'E-conomic' },
        { value: 'jtl', label: 'JTL' },
        { value: 'oxid', label: 'OXID' },
        { value: 'weebly', label: 'Weebly' },
        { value: 'plentymarkets', label: 'Plentymarkets' },
        { value: 'advertising', label: 'Advertising' },
        { value: 'offer', label: 'Offer' },
        { value: 'dandomain', label: 'DanDomain' },
        { value: 'presta', label: 'PrestaShop' },
        { value: 'xt_commerce', label: 'xt:Commerce' },
        { value: 'overlay', label: 'Overlay' },
      ])
    );
  }));

  it('businessCurrenciesConditionsSelector', fakeAsync(() => {
    expect(JSON.stringify(businessCurrenciesConditionsSelector(state))).toEqual(
      JSON.stringify([{ value: 'EUR', label: 'EUR' }])
    );
  }));

  it('businessPaymentOptionsSelector', fakeAsync(() => {
    expect(JSON.stringify(businessPaymentOptionsSelector(state))).toEqual(
      JSON.stringify(undefined)
    );
  }));

  it('businessPaymentOptionsConditionsSelector', fakeAsync(() => {
    expect(
      JSON.stringify(businessPaymentOptionsConditionsSelector(state))
    ).toEqual(
      JSON.stringify([
        { value: 'sofort', label: 'SOFORT Banking' },
        { value: 'invoice', label: 'Invoice' },
        { value: 'cash', label: 'Wire Transfer' },
        { value: 'paymill_creditcard', label: 'Paymill Credit Card' },
        { value: 'paymill_directdebit', label: 'Direct Debit' },
        { value: 'paypal', label: 'PayPal' },
        { value: 'stripe', label: 'Credit Card' },
        { value: 'santander_installment', label: 'Santander Installments' },
        {
          value: 'santander_pos_installment',
          label: 'POS Santander Installments',
        },
        {
          value: 'santander_installment_no',
          label: 'Santander Installments Norway',
        },
        {
          value: 'santander_pos_installment_no',
          label: 'POS Santander Installments Norway',
        },
        { value: 'santander_invoice_no', label: 'Santander Invoice Norway' },
        {
          value: 'santander_pos_invoice_no',
          label: 'POS Santander Invoice Norway',
        },
        {
          value: 'santander_installment_at',
          label: 'Santander Installments Austria',
        },
        {
          value: 'santander_installment_dk',
          label: 'Santander Installments Denmark',
        },
        {
          value: 'santander_installment_se',
          label: 'Santander Installments Sweden',
        },
        { value: 'payex_faktura', label: 'PayEx Invoice' },
        {
          value: 'santander_ccp_installment',
          label: 'Santander DE Comfort card plus',
        },
        { value: 'payex_creditcard', label: 'PayEx Credit Card' },
        { value: 'stripe_directdebit', label: 'Stripe DirectDebit' },
        { value: 'santander_invoice_de', label: 'Santander DE Invoice' },
        {
          value: 'santander_pos_invoice_de',
          label: 'POS Santander DE Invoice',
        },
        {
          value: 'santander_pos_installment_se',
          label: 'POS Santander Installments Sweden',
        },
        { value: 'santander_factoring_de', label: 'Santander Factoring' },
        {
          value: 'santander_pos_factoring_de',
          label: 'POS Santander Factoring',
        },
      ])
    );
  }));

  it('statusesConditionsSelector', fakeAsync(() => {
    expect(JSON.stringify(statusesConditionsSelector(state))).toEqual(
      JSON.stringify([
        { value: 'STATUS_ACCEPTED', label: 'STATUS_ACCEPTED' },
        { value: 'STATUS_FAILED', label: 'STATUS_FAILED' },
        { value: 'STATUS_NEW', label: 'STATUS_NEW' },
        { value: 'STATUS_IN_PROCESS', label: 'STATUS_IN_PROCESS' },
        { value: 'STATUS_DECLINED', label: 'STATUS_DECLINED' },
        { value: 'STATUS_REFUNDED', label: 'STATUS_REFUNDED' },
        { value: 'STATUS_CANCELLED', label: 'STATUS_CANCELLED' },
        { value: 'STATUS_PAID', label: 'STATUS_PAID' },
      ])
    );
  }));

  it('storesConditionsSelector', fakeAsync(() => {
    expect(JSON.stringify(storesConditionsSelector(state))).toEqual(
      JSON.stringify([])
    );
  }));

  it('filtersSchemaSelector', fakeAsync(() => {
    expect(JSON.stringify(filtersSchemaSelector(state))).toEqual(
      JSON.stringify([])
    );
  }));
});
