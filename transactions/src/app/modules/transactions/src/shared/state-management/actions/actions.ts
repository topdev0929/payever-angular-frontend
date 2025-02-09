import {
  BusinessChannelInterface,
  BusinessCurrencyInterface,
  BusinessPaymentOptionInterface
} from '@pe/ng-kit/modules/business';
import { DataGridFilterInterface, DataGridTableColumnInterface } from '@pe/ng-kit/modules/data-grid';

import { ActionFnType, TransactionAction } from '../interfaces';
import {
  ListResponseInterface,
  SearchTransactionsInterface,
  SortInterface,
  UserBusinessInterface
} from '../../interfaces';
import {
  TransactionsFilterSchemaInterface
} from '../../settings';

export enum ActionTypes {
  ADD_FILTER = '[FILTERS] Add filter',
  REMOVE_FILTER = '[FILTERS] Remove filter',
  ADD_SEARCH_QUERY = '[FILTERS] Add search query',
  CHANGE_SORT_DIRECTION = '[FILTERS] Change sort direction',
  NEXT_PAGE = '[FILTERS] Next page',
  SET_FILTERS = '[FILTERS] Set filters configuration',
  INIT_FILTERS_SCHEMA = '[FILTERS] Init filters schema',

  GET_TRANSACTIONS = '[TRANSACTIONS] Get transactions',
  GET_TRANSACTIONS_SUCCESS = '[TRANSACTIONS] Get transactions - success',
  GET_TRANSACTIONS_FAIL = '[TRANSACTIONS] Get transactions - fail',
  LOAD_MORE = '[TRANSACTIONS] Load more',

  UPDATE_COLUMNS = '[BUSINESS DATA] Get columns',
  UPDATE_BUSINESS_SETTINGS = '[BUSINESS DATA] Get business settings',
  GET_ACTIVE_COLUMNS_SUCCESS = '[BUSINESS DATA] Get active columns - success',
  GET_BUSINESS_DATA = '[BUSINESS DATA] Get business data',
  GET_COLUMNS_DATA = '[COLUMNS DATA] Get columns data',
  GET_BUSINESS_CHANNELS_SUCCESS = '[BUSINESS DATA] Get business channels - success',
  GET_BUSINESS_CURRENCIES_SUCCESS = '[BUSINESS DATA] Get business currencies - success',
  GET_BUSINESS_PAYMENT_OPTIONS_SUCCESS = '[BUSINESS DATA] Get business payment options - success'
}

export const getTransactions: ActionFnType = (
  searchData: SearchTransactionsInterface = {} as SearchTransactionsInterface,
  loadMoreMode: boolean = false,
): any => {
  return {
    type: ActionTypes.GET_TRANSACTIONS,
    payload: searchData,
    loadMoreMode: loadMoreMode
  };
};

export const nextPage: ActionFnType = (page: string): TransactionAction => {
  return {
    type: ActionTypes.NEXT_PAGE,
    payload: page
  };
};

export const setFilters: ActionFnType = (filtersConfig?: string): TransactionAction => {
  return {
    type: ActionTypes.SET_FILTERS,
    payload: filtersConfig
  };
};

export const addFilter: ActionFnType = (filter: DataGridFilterInterface): TransactionAction => {
  return {
    type: ActionTypes.ADD_FILTER,
    payload: filter
  };
};

export const addSearchQuery: ActionFnType = (search: string): TransactionAction => {
  return {
    type: ActionTypes.ADD_SEARCH_QUERY,
    payload: search
  };
};

export const changeSortDirection: ActionFnType = (sort: SortInterface): TransactionAction => {
  return {
    type: ActionTypes.CHANGE_SORT_DIRECTION,
    payload: sort
  };
};

export const getActiveColumnsSuccess: ActionFnType = (columns: string[]): TransactionAction => {
  return {
    type: ActionTypes.GET_ACTIVE_COLUMNS_SUCCESS,
    payload: columns
  };
};

export const updateColumns: ActionFnType = (columns: DataGridTableColumnInterface[]): TransactionAction => {
  return {
    type: ActionTypes.UPDATE_COLUMNS,
    payload: columns
  };
};

export const removeFilter: ActionFnType = (filter: DataGridFilterInterface): TransactionAction => {
  return {
    type: ActionTypes.REMOVE_FILTER,
    payload: filter
  };
};

export const updateBusinessSettings: ActionFnType = (settings: UserBusinessInterface): TransactionAction => {
  return {
    type: ActionTypes.UPDATE_BUSINESS_SETTINGS,
    payload: settings
  };
};

export const getTransactionsSuccess: any = (transactions: ListResponseInterface, loadMoreMode: boolean = false): any => {
  return {
    type: ActionTypes.GET_TRANSACTIONS_SUCCESS,
    payload: transactions,
    loadMoreMode
  };
};

export const getTransactionsFail: ActionFnType = (): TransactionAction => {
  return {
    type: ActionTypes.GET_TRANSACTIONS_FAIL,
    payload: {}
  };
};

export const loadMore: ActionFnType = (): TransactionAction => {
  return {
    type: ActionTypes.LOAD_MORE,
    payload: {}
  };
};

export const getBusinessData: ActionFnType = (searchData: SearchTransactionsInterface): TransactionAction => {
  return {
    type: ActionTypes.GET_BUSINESS_DATA,
    payload: searchData
  };
};

export const getColumnsData: ActionFnType = (): TransactionAction => {
  return {
    type: ActionTypes.GET_COLUMNS_DATA,
    payload: {}
  };
};

export const getBusinessChannelsSuccess: ActionFnType = (businessChannels: BusinessChannelInterface[]): TransactionAction => {
  return {
    type: ActionTypes.GET_BUSINESS_CHANNELS_SUCCESS,
    payload: businessChannels
  };
};

export const getBusinessCurrenciesSuccess: ActionFnType = (businessCurrencies: BusinessCurrencyInterface[]): TransactionAction => {
  return {
    type: ActionTypes.GET_BUSINESS_CURRENCIES_SUCCESS,
    payload: businessCurrencies
  };
};

export const getBusinessPaymentOptionsSuccess: ActionFnType = (businessPaymentOptions: BusinessPaymentOptionInterface[]): TransactionAction => {
  return {
    type: ActionTypes.GET_BUSINESS_PAYMENT_OPTIONS_SUCCESS,
    payload: businessPaymentOptions
  };
};

export const initFiltersSchema: ActionFnType = (schema: TransactionsFilterSchemaInterface[]): TransactionAction => {
  return {
    type: ActionTypes.INIT_FILTERS_SCHEMA,
    payload: schema
  };
};
