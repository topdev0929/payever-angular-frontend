import {
  getTransactions,
  nextPage,
  setFilters,
  addFilter,
  addSearchQuery,
  changeSortDirection,
  getActiveColumnsSuccess,
  updateColumns,
  removeFilter,
  updateBusinessSettings,
  getTransactionsSuccess,
  getTransactionsFail,
  loadMore,
  getBusinessData,
  getColumnsData,
  getBusinessChannelsSuccess,
  getBusinessCurrenciesSuccess,
  getBusinessPaymentOptionsSuccess,
  initFiltersSchema,
  ActionTypes,
} from './actions';

describe('State Management Actions', () => {
  it('should getTransactions', () => {
    expect(JSON.stringify(getTransactions({}, true))).toEqual(
      JSON.stringify({
        type: ActionTypes.GET_TRANSACTIONS,
        payload: {},
        loadMoreMode: true,
      })
    );

    expect(JSON.stringify(getTransactions({}, false))).toEqual(
      JSON.stringify({
        type: ActionTypes.GET_TRANSACTIONS,
        payload: {},
        loadMoreMode: false,
      })
    );

    expect(JSON.stringify(getTransactions({ page: 1 }, false))).toEqual(
      JSON.stringify({
        type: ActionTypes.GET_TRANSACTIONS,
        payload: { page: 1 },
        loadMoreMode: false,
      })
    );

    expect(JSON.stringify(getTransactions())).toEqual(
      JSON.stringify({
        type: ActionTypes.GET_TRANSACTIONS,
        payload: {},
        loadMoreMode: false,
      })
    );
  });

  it('should nextPage', () => {
    expect(JSON.stringify(nextPage(1))).toEqual(
      JSON.stringify({ type: ActionTypes.NEXT_PAGE, payload: 1 })
    );
    expect(JSON.stringify(nextPage())).toEqual(
      JSON.stringify({ type: ActionTypes.NEXT_PAGE, payload: undefined })
    );
  });

  it('should setFilters', () => {
    expect(JSON.stringify(setFilters('test-filter'))).toEqual(
      JSON.stringify({ type: ActionTypes.SET_FILTERS, payload: 'test-filter' })
    );
    expect(JSON.stringify(setFilters())).toEqual(
      JSON.stringify({ type: ActionTypes.SET_FILTERS, payload: undefined })
    );
  });

  it('should addFilter', () => {
    expect(JSON.stringify(addFilter({}))).toEqual(
      JSON.stringify({ type: ActionTypes.ADD_FILTER, payload: {} })
    );
    expect(
      JSON.stringify(
        addFilter({
          key: 'test',
          value: 'test value',
          condition: 'in',
        })
      )
    ).toEqual(
      JSON.stringify({
        type: ActionTypes.ADD_FILTER,
        payload: {
          key: 'test',
          value: 'test value',
          condition: 'in',
        },
      })
    );
    expect(JSON.stringify(addFilter())).toEqual(
      JSON.stringify({ type: ActionTypes.ADD_FILTER, payload: undefined })
    );
  });

  it('should addSearchQuery', () => {
    expect(JSON.stringify(addSearchQuery('test'))).toEqual(
      JSON.stringify({ type: ActionTypes.ADD_SEARCH_QUERY, payload: 'test' })
    );
    expect(JSON.stringify(addSearchQuery())).toEqual(
      JSON.stringify({ type: ActionTypes.ADD_SEARCH_QUERY, payload: undefined })
    );
  });

  it('should addSearchQuery', () => {
    expect(
      JSON.stringify(
        changeSortDirection({ orderBy: 'name', direction: 'desc' })
      )
    ).toEqual(
      JSON.stringify({
        type: ActionTypes.CHANGE_SORT_DIRECTION,
        payload: { orderBy: 'name', direction: 'desc' },
      })
    );
    expect(JSON.stringify(changeSortDirection())).toEqual(
      JSON.stringify({
        type: ActionTypes.CHANGE_SORT_DIRECTION,
        payload: undefined,
      })
    );
  });

  it('should getActiveColumnsSuccess', () => {
    expect(
      JSON.stringify(getActiveColumnsSuccess(['column 1', 'column 2']))
    ).toEqual(
      JSON.stringify({
        type: ActionTypes.GET_ACTIVE_COLUMNS_SUCCESS,
        payload: ['column 1', 'column 2'],
      })
    );
    expect(JSON.stringify(getActiveColumnsSuccess())).toEqual(
      JSON.stringify({
        type: ActionTypes.GET_ACTIVE_COLUMNS_SUCCESS,
        payload: undefined,
      })
    );
  });

  it('should updateColumns', () => {
    expect(JSON.stringify(updateColumns(['column 1', 'column 2']))).toEqual(
      JSON.stringify({
        type: ActionTypes.UPDATE_COLUMNS,
        payload: ['column 1', 'column 2'],
      })
    );
    expect(JSON.stringify(updateColumns())).toEqual(
      JSON.stringify({ type: ActionTypes.UPDATE_COLUMNS, payload: undefined })
    );
  });

  it('should removeFilter', () => {
    expect(JSON.stringify(removeFilter({}))).toEqual(
      JSON.stringify({ type: ActionTypes.REMOVE_FILTER, payload: {} })
    );
    expect(
      JSON.stringify(
        removeFilter({
          key: 'test',
          value: 'test value',
          condition: 'in',
        })
      )
    ).toEqual(
      JSON.stringify({
        type: ActionTypes.REMOVE_FILTER,
        payload: {
          key: 'test',
          value: 'test value',
          condition: 'in',
        },
      })
    );
    expect(JSON.stringify(removeFilter())).toEqual(
      JSON.stringify({ type: ActionTypes.REMOVE_FILTER, payload: undefined })
    );
  });

  it('should updateBusinessSettings', () => {
    expect(JSON.stringify(updateBusinessSettings({}))).toEqual(
      JSON.stringify({
        type: ActionTypes.UPDATE_BUSINESS_SETTINGS,
        payload: {},
      })
    );
    expect(
      JSON.stringify(
        updateBusinessSettings({
          _id: 'test',
          name: 'test',
        })
      )
    ).toEqual(
      JSON.stringify({
        type: ActionTypes.UPDATE_BUSINESS_SETTINGS,
        payload: {
          _id: 'test',
          name: 'test',
        },
      })
    );
    expect(JSON.stringify(updateBusinessSettings())).toEqual(
      JSON.stringify({
        type: ActionTypes.UPDATE_BUSINESS_SETTINGS,
        payload: undefined,
      })
    );
  });

  it('should getTransactionsSuccess', () => {
    expect(JSON.stringify(getTransactionsSuccess([]))).toEqual(
      JSON.stringify({
        type: ActionTypes.GET_TRANSACTIONS_SUCCESS,
        payload: [],
        loadMoreMode: false,
      })
    );
    expect(JSON.stringify(getTransactionsSuccess([], true))).toEqual(
      JSON.stringify({
        type: ActionTypes.GET_TRANSACTIONS_SUCCESS,
        payload: [],
        loadMoreMode: true,
      })
    );
    expect(JSON.stringify(getTransactionsSuccess())).toEqual(
      JSON.stringify({
        type: ActionTypes.GET_TRANSACTIONS_SUCCESS,
        payload: undefined,
        loadMoreMode: false,
      })
    );
  });

  it('should getTransactionsFail', () => {
    expect(JSON.stringify(getTransactionsFail())).toEqual(
      JSON.stringify({ type: ActionTypes.GET_TRANSACTIONS_FAIL, payload: {} })
    );
  });

  it('should loadMore', () => {
    expect(JSON.stringify(loadMore())).toEqual(
      JSON.stringify({ type: ActionTypes.LOAD_MORE, payload: {} })
    );
  });

  it('should getBusinessData', () => {
    expect(JSON.stringify(getBusinessData({}))).toEqual(
      JSON.stringify({ type: ActionTypes.GET_BUSINESS_DATA, payload: {} })
    );
    expect(JSON.stringify(getBusinessData({ page: 1 }))).toEqual(
      JSON.stringify({
        type: ActionTypes.GET_BUSINESS_DATA,
        payload: { page: 1 },
      })
    );
    expect(JSON.stringify(getBusinessData())).toEqual(
      JSON.stringify({
        type: ActionTypes.GET_BUSINESS_DATA,
        payload: undefined,
      })
    );
  });

  it('should getColumnsData', () => {
    expect(JSON.stringify(getColumnsData())).toEqual(
      JSON.stringify({ type: ActionTypes.GET_COLUMNS_DATA, payload: {} })
    );
  });

  it('should getBusinessChannelsSuccess', () => {
    expect(JSON.stringify(getBusinessChannelsSuccess([]))).toEqual(
      JSON.stringify({
        type: ActionTypes.GET_BUSINESS_CHANNELS_SUCCESS,
        payload: [],
      })
    );
    expect(
      JSON.stringify(
        getBusinessChannelsSuccess([
          {
            description: 'test',
            name: 'test',
            thumbnail: 'test',
            type: 'test',
          },
        ])
      )
    ).toEqual(
      JSON.stringify({
        type: ActionTypes.GET_BUSINESS_CHANNELS_SUCCESS,
        payload: [
          {
            description: 'test',
            name: 'test',
            thumbnail: 'test',
            type: 'test',
          },
        ],
      })
    );
    expect(JSON.stringify(getBusinessChannelsSuccess())).toEqual(
      JSON.stringify({
        type: ActionTypes.GET_BUSINESS_CHANNELS_SUCCESS,
        payload: undefined,
      })
    );
  });

  it('should getBusinessCurrenciesSuccess', () => {
    expect(JSON.stringify(getBusinessCurrenciesSuccess([]))).toEqual(
      JSON.stringify({
        type: ActionTypes.GET_BUSINESS_CURRENCIES_SUCCESS,
        payload: [],
      })
    );
    expect(
      JSON.stringify(
        getBusinessCurrenciesSuccess([
          {
            code: 'test',
            name: 'test',
            symbol: 'test',
            rate: 6,
          },
        ])
      )
    ).toEqual(
      JSON.stringify({
        type: ActionTypes.GET_BUSINESS_CURRENCIES_SUCCESS,
        payload: [
          {
            code: 'test',
            name: 'test',
            symbol: 'test',
            rate: 6,
          },
        ],
      })
    );
    expect(JSON.stringify(getBusinessCurrenciesSuccess())).toEqual(
      JSON.stringify({
        type: ActionTypes.GET_BUSINESS_CURRENCIES_SUCCESS,
        payload: undefined,
      })
    );
  });

  it('should getBusinessPaymentOptionsSuccess', () => {
    expect(JSON.stringify(getBusinessPaymentOptionsSuccess([]))).toEqual(
      JSON.stringify({
        type: ActionTypes.GET_BUSINESS_PAYMENT_OPTIONS_SUCCESS,
        payload: [],
      })
    );
    expect(
      JSON.stringify(
        getBusinessPaymentOptionsSuccess([
          {
            contract_length: 6,
            description_fee: 'test',
            description_offer: 'test',
            fixed_fee: 6,
            id: 6,
            info_url: 'test',
            instruction_text: 'test',
            max: 6,
            merchant_allowed_countries: ['test'],
            min: 6,
            name: 'test',
            payment_method: 'test',
            related_country: ['test'],
            slug: 'test',
            status: 'test',
            thumbnail1: 'test',
            thumbnail2: 'test',
            variable_fee: 6,
          },
        ])
      )
    ).toEqual(
      JSON.stringify({
        type: ActionTypes.GET_BUSINESS_PAYMENT_OPTIONS_SUCCESS,
        payload: [
          {
            contract_length: 6,
            description_fee: 'test',
            description_offer: 'test',
            fixed_fee: 6,
            id: 6,
            info_url: 'test',
            instruction_text: 'test',
            max: 6,
            merchant_allowed_countries: ['test'],
            min: 6,
            name: 'test',
            payment_method: 'test',
            related_country: ['test'],
            slug: 'test',
            status: 'test',
            thumbnail1: 'test',
            thumbnail2: 'test',
            variable_fee: 6,
          },
        ],
      })
    );
    expect(JSON.stringify(getBusinessPaymentOptionsSuccess())).toEqual(
      JSON.stringify({
        type: ActionTypes.GET_BUSINESS_PAYMENT_OPTIONS_SUCCESS,
        payload: undefined,
      })
    );
  });

  it('should initFiltersSchema', () => {
    expect(JSON.stringify(initFiltersSchema({}))).toEqual(
      JSON.stringify({ type: ActionTypes.INIT_FILTERS_SCHEMA, payload: {} })
    );
    expect(JSON.stringify(initFiltersSchema())).toEqual(
      JSON.stringify({
        type: ActionTypes.INIT_FILTERS_SCHEMA,
        payload: undefined,
      })
    );
  });
});
