import { ActionTypes } from './actions';

import { OrdersStateInterface, TransactionAction } from './interfaces';

const initialState: OrdersStateInterface = {
  transactionsListData: {
    collection: [],
    pagination_data: {
      amount: 0,
      // amount_currency: null,
      page: -1, // -1 means that it loads first time
      total: 0
    },
    usage: {
      specific_statuses: [],
      statuses: []
    }
  },
  filters: {
    configuration: {},
    page: 1
  },
  businessChannels: [],
  businessPaymentOptions: [],
  businessCurrencies: [],
  activeColumns: [],
  filtersSchema: [],
  businessSettings: null
};

export function reducer(state: OrdersStateInterface = initialState, action: any): OrdersStateInterface {
  switch (action.type) {

    case ActionTypes.GET_ACTIVE_COLUMNS_SUCCESS: {
      return { ...state, activeColumns: action.payload };
    }

    case ActionTypes.GET_TRANSACTIONS_SUCCESS: {
      const transactionsListData: any = action.payload;
      if (action.loadMoreMode) {
        transactionsListData.collection = state.transactionsListData.collection.concat(transactionsListData.collection);
      }
      return { ...state, transactionsListData };
    }

    case ActionTypes.GET_TRANSACTIONS_FAIL: {
      return { ...state, transactionsListData: action.payload };
    }

    case ActionTypes.GET_BUSINESS_CHANNELS_SUCCESS: {
      return { ...state, businessChannels: action.payload };
    }

    case ActionTypes.GET_BUSINESS_CURRENCIES_SUCCESS: {
      return { ...state, businessCurrencies: action.payload };
    }

    case ActionTypes.UPDATE_BUSINESS_SETTINGS: {
      return { ...state, businessSettings: action.payload };
    }

    case ActionTypes.GET_BUSINESS_PAYMENT_OPTIONS_SUCCESS: {
      return { ...state, businessPaymentOptions: action.payload };
    }

    case ActionTypes.SET_FILTERS: {
      return { ...state, filters: action.payload ? action.payload : { configuration: {}, page: 1 } };
    }

    case ActionTypes.INIT_FILTERS_SCHEMA: {
      return { ...state, filtersSchema: action.payload };
    }

    default: {
      return state;
    }

  }
}
