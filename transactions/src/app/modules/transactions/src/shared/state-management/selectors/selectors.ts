import { forIn } from 'lodash-es';
import { createSelector, Selector } from 'reselect';

import { BusinessChannelInterface, BusinessCurrencyInterface, BusinessPaymentOptionInterface } from '@pe/ng-kit/modules/business';
import { DataGridFilterInterface, DataGridFilterSelectOptionInterface } from '@pe/ng-kit/modules/data-grid';

import { GlobalStateInterface, OrdersStateInterface } from '../interfaces';
import { columns as columnsConfig, notToggleableColumns } from '../../settings';
import { FiltersFieldType, FilterOptionInterface, ListResponseInterface } from '../../interfaces';

const ordersStateSelector: Selector<GlobalStateInterface,
  OrdersStateInterface> = (state: GlobalStateInterface) => state ? state.orders : null;

export const transactionsListDataSelector: any = createSelector(
  ordersStateSelector,
  (state: OrdersStateInterface) => {
    if (state && state.transactionsListData) {
      return state.transactionsListData;
    }
  }
);

export const activeColumnsSelector: any = createSelector(
  ordersStateSelector,
  (state: OrdersStateInterface) => {
    if (state && state.activeColumns) {
      return columnsConfig.map((column: FiltersFieldType) => {
        return {
          name: column,
          title: column,
          isActive: state.activeColumns.indexOf(column) > -1,
          isToggleable: notToggleableColumns.indexOf(column) === -1
        };
      });
    }
  }
);

export const paginationSelector: any = createSelector(
  transactionsListDataSelector,
  (state: ListResponseInterface) => {
    if (state && state.pagination_data) {
      return state.pagination_data;
    }
  }
);

export const filtersSelector: any = createSelector(
  ordersStateSelector,
  (state: OrdersStateInterface) => {
    if (state && state.filters) {
      return state.filters;
    }
  }
);

export const businessCurrencySelector: any = createSelector(
  ordersStateSelector,
  (state: OrdersStateInterface) => {
    if (state && state.businessSettings) {
      return state.businessSettings.currency;
    }
  }
);

export const activeFiltersSelector: any = createSelector(
  ordersStateSelector,
  (state: OrdersStateInterface) => {
    if (state && state.filters && Object.keys(state.filters).length) {
      const activeFilters: DataGridFilterInterface[] = [];
      if (Object.keys(state.filters.configuration).length) {
        forIn(state.filters.configuration, (filterValue: any, filterName: string) => {
          if (!filterValue.length) {
            filterValue = [filterValue];
          }
          filterValue.forEach((elem: any) => {
            if (Array.isArray(elem.value)) {
              elem.value.forEach((singleFilterActiveOptions: string) => {
                activeFilters.push({
                                     key: filterName,
                                     value: singleFilterActiveOptions,
                                     condition: elem.condition
                                   });
              });
            } else {
              activeFilters.push({
                                   key: filterName,
                                   value: elem.value,
                                   condition: elem.condition
                                 });
            }
          });
        });
      }
      if (state.filters.search) {
        activeFilters.push({
                             key: 'search',
                             value: state.filters.search,
                             condition: 'is'
                           });
      }
      return activeFilters;
    } else {
      return [];
    }
  }
);

export const businessChannelsSelector: any = createSelector(
  ordersStateSelector,
  (state: OrdersStateInterface) => {
    if (state && state.businessChannels && state.businessChannels.length) {
      const result: { [propName: string]: BusinessChannelInterface } = {};
      state.businessChannels.forEach((channel: BusinessChannelInterface) => {
        result[channel.type] = channel;
      });
      return result;
    }
  }
);

export const businessChannelsConditionsSelector: any = createSelector(
  ordersStateSelector,
  (state: OrdersStateInterface) => {
    const channels: any = [
      {type: 'shopify', name: 'Shopify'},
      {type: 'facebook', name: 'Facebook'},
      {type: 'finance_express', name: 'Finance express'},
      {type: 'shop', name: 'Shop'},
      {type: 'woo_commerce', name: 'WooCommerce'},
      {type: 'magento', name: 'Magento'},
      {type: 'marketing', name: 'Marketing'},
      {type: 'pos', name: 'PoS'},
      {type: 'shopware', name: 'Shopware'},
      {type: 'debitoor', name: 'Debitoor'},
      {type: 'link', name: 'Link'},
      {type: 'e-conomic', name: 'E-conomic'},
      {type: 'jtl', name: 'JTL'},
      {type: 'oxid', name: 'OXID'},
      {type: 'weebly', name: 'Weebly'},
      {type: 'plentymarkets', name: 'Plentymarkets'},
      {type: 'advertising', name: 'Advertising'},
      {type: 'offer', name: 'Offer'},
      {type: 'dandomain', name: 'DanDomain'},
      {type: 'presta', name: 'PrestaShop'},
      {type: 'xt_commerce', name: 'xt:Commerce'},
      {type: 'overlay', name: 'Overlay'}];
    return channels.map((channel: BusinessChannelInterface) => {
      return {
        value: channel.type,
        label: channel.name
      };
    });
  }
);

export const businessCurrenciesConditionsSelector: any = createSelector(
  ordersStateSelector,
  (state: OrdersStateInterface) => {
    if (state && state.businessCurrencies && state.businessCurrencies.length) {
      return state.businessCurrencies
        .map((currency: BusinessCurrencyInterface) => {
          return {
            value: currency.code,
            label: currency.name
          };
        });
    }
  }
);

export const businessPaymentOptionsSelector: any = createSelector(
  ordersStateSelector,
  (state: OrdersStateInterface) => {
    if (state && state.businessPaymentOptions && state.businessPaymentOptions.length) {
      const result: { [propName: string]: BusinessPaymentOptionInterface } = {};
      state.businessPaymentOptions.forEach((paymentOption: BusinessPaymentOptionInterface) => {
        result[paymentOption.payment_method] = paymentOption;
      });
      return result;
    }
  }
);

export const businessPaymentOptionsConditionsSelector: any = createSelector(
  ordersStateSelector,
  (state: OrdersStateInterface) => {
    const payments: any = [
      {payment_method: 'sofort', name: 'SOFORT Banking'},
      {payment_method: 'invoice', name: 'Invoice'},
      {payment_method: 'cash', name: 'Wire Transfer'},
      // {payment_method: 'paymill_creditcard', name: 'Paymill Credit Card'},
      // {payment_method: 'paymill_directdebit', name: 'Direct Debit'},
      {payment_method: 'paypal', name: 'PayPal'},
      {payment_method: 'stripe', name: 'Credit Card'},
      {payment_method: 'instant_payment', name: 'Instant Payment'},
      {payment_method: 'santander_installment', name: 'Santander Installments'},
      {payment_method: 'santander_pos_installment', name: 'POS Santander Installments'},
      {payment_method: 'santander_installment_no', name: 'Santander Installments Norway'},
      {payment_method: 'santander_installment_nl', name: 'Santander Installments Netherlands'},
      // {payment_method: 'santander_pos_installment_no', name: 'POS Santander Installments Norway'},
      {payment_method: 'santander_invoice_no', name: 'Santander Invoice Norway'},
      // {payment_method: 'santander_pos_invoice_no', name: 'POS Santander Invoice Norway'},
      {payment_method: 'santander_installment_at', name: 'Santander Installments Austria'},
      {payment_method: 'santander_installment_dk', name: 'Santander Installments Denmark'},
      {payment_method: 'santander_installment_se', name: 'Santander Installments Sweden'},
      {payment_method: 'payex_faktura', name: 'PayEx Invoice'},
      {payment_method: 'santander_ccp_installment', name: 'Santander DE Comfort card plus'},
      {payment_method: 'payex_creditcard', name: 'PayEx Credit Card'},
      {payment_method: 'swedbank_creditcard', name: 'Swedbank Credit Card'},
      {payment_method: 'swedbank_invoice', name: 'Swedbank Invoice'},
      {payment_method: 'stripe_directdebit', name: 'Stripe DirectDebit'},
      {payment_method: 'santander_invoice_de', name: 'Santander DE Invoice'},
      {payment_method: 'santander_pos_invoice_de', name: 'POS Santander DE Invoice'},
      {payment_method: 'santander_pos_installment_se', name: 'POS Santander Installments Sweden'},
      {payment_method: 'santander_factoring_de', name: 'Santander Factoring'},
      {payment_method: 'santander_pos_factoring_de', name: 'POS Santander Factoring'}];
    return payments.map((paymentMethod: BusinessPaymentOptionInterface) => {
      return {
        value: paymentMethod.payment_method,
        label: `integrations.payments.${paymentMethod.payment_method}.title`
      };
    });
  }
);

export const statusesConditionsSelector: any = createSelector(
  ordersStateSelector,
  (state: OrdersStateInterface) => {
    if (state && state.transactionsListData && state.transactionsListData.usage) {
      const statuses: FilterOptionInterface[] = [{key: 'STATUS_ACCEPTED', name: 'STATUS_ACCEPTED'},
        {key: 'STATUS_FAILED', name: 'STATUS_FAILED'},
        {key: 'STATUS_NEW', name: 'STATUS_NEW'},
        {key: 'STATUS_IN_PROCESS', name: 'STATUS_IN_PROCESS'},
        {key: 'STATUS_DECLINED', name: 'STATUS_DECLINED'},
        {key: 'STATUS_REFUNDED', name: 'STATUS_REFUNDED'},
        {key: 'STATUS_CANCELLED', name: 'STATUS_CANCELLED'},
        {key: 'STATUS_PAID', name: 'STATUS_PAID'}];
      return (statuses).map((status: FilterOptionInterface) => {
        return {
          value: status.key,
          label: status.name
        };
      });
    }
    }
    );

export const specificStatusesConditionsSelector: any = createSelector(
  ordersStateSelector,
  (state: OrdersStateInterface) => {
    const specificStatuses: any = [
      {key: 'STATUS_NEW', name: 'New'},
      {key: 'STATUS_IN_PROCESS', name: 'In progress'},
      {key: 'STATUS_ACCEPTED', name: 'Accepted'},
      {key: 'STATUS_PAID', name: 'Paid'},
      {key: 'STATUS_DECLINED', name: 'Declined'},
      {key: 'STATUS_REFUNDED', name: 'Refunded'},
      {key: 'STATUS_FAILED', name: 'Failed'},
      {key: 'STATUS_CANCELLED', name: 'Cancelled'},
      {key: 'STATUS_INVOICE_CANCELLATION', name: 'Cancelled'},
      {key: 'STATUS_INVOICE_INCOLLECTION', name: 'Collection'},
      {key: 'STATUS_INVOICE_LATEPAYMENT', name: 'Late payment'},
      {key: 'STATUS_INVOICE_REMINDER', name: 'Reminder'},
      {key: 'STATUS_SANTANDER_IN_PROGRESS', name: 'In progress'},
      {key: 'STATUS_SANTANDER_IN_PROCESS', name: 'In process'},
      {key: 'STATUS_SANTANDER_DECLINED', name: 'Declined'},
      {key: 'STATUS_SANTANDER_APPROVED', name: 'Approved'},
      {key: 'STATUS_SANTANDER_APPROVED_WITH_REQUIREMENTS', name: 'Approved with requirements'},
      {key: 'STATUS_SANTANDER_DEFERRED', name: 'Deferred'},
      {key: 'STATUS_SANTANDER_CANCELLED', name: 'Cancelled'},
      {key: 'STATUS_SANTANDER_AUTOMATIC_DECLINE', name: 'Automatically declined'},
      {key: 'STATUS_SANTANDER_IN_DECISION', name: 'In decision'},
      {key: 'STATUS_SANTANDER_DECISION_NEXT_WORKING_DAY', name: 'Decision in the next working day'},
      {key: 'STATUS_SANTANDER_IN_CANCELLATION', name: 'In cancellation'},
      {key: 'STATUS_SANTANDER_ACCOUNT_OPENED', name: 'Account opened'},
      {key: 'STATUS_SANTANDER_CANCELLED_ANOTHER', name: 'Cancelled'},
      {key: 'STATUS_SANTANDER_SHOP_TEMPORARY_APPROVED', name: 'Temporarily approved'}];
    return specificStatuses.map((specificStatus: FilterOptionInterface) => {
      return {
        value: specificStatus.key,
        label: specificStatus.name
      };
    });
  });

export const storesConditionsSelector: any = createSelector(
  ordersStateSelector,
  (state: OrdersStateInterface) => {
    if (state && state.transactionsListData && state.transactionsListData.usage) {
      return (state.transactionsListData.usage.stores as FilterOptionInterface[])
        .map((store: FilterOptionInterface) => {
          return {
            value: store.id,
            label: store.name
          };
        });
    }
  }
);

export const filtersSchemaSelector: any = createSelector(
  ordersStateSelector,
  (state: OrdersStateInterface) => {
    return state.filtersSchema;
  }
);
