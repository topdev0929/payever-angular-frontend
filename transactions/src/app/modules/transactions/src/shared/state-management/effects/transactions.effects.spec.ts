import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';

import { ApiService } from '../../../shared';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { ActionTypes } from '../actions';

import { TransactionsEffects } from './transactions.effects';
import { DATE_FORMAT_SHORT } from '@pe/ng-kit/src/kit/i18n';

describe('TransactionsEffects', () => {
  let transactionsEffects: TransactionsEffects;

  let apiService: ApiService;
  let store: Store<any>;
  let action: Subject<{ type: ActionTypes; payload?: any }>;
  let actions: Actions;
  let effect: TransactionsEffects;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideMockActions(() => of({})),
        TransactionsEffects,
        {
          provide: DATE_FORMAT_SHORT,
          useValue: {},
        },
        {
          provide: ApiService,
          useValue: {
            getBusinessData: () => of({}),
            getCurrencies: () => of([]),
            getTransactionsListColumns: () => of(['test', 'test1']),
            getTransactions: () => of([]),
          },
        },
        {
          provide: Store,
          useValue: {
            state: {
              transactionsListData: null,
              filters: {
                configuration: {},
                page: 1,
              },
              businessChannels: [],
              businessPaymentOptions: [],
              businessCurrencies: [],
              activeColumns: [],
              filtersSchema: [],
              businessSettings: null,
            },
            dispatch: () => of({}),
            select: () => of({ businessCurrencies: [] }),
          },
        },
      ],
    })
  );

  beforeEach(() => {
    transactionsEffects = TestBed.get(TransactionsEffects);
    apiService = TestBed.get(ApiService);
    store = TestBed.get(Store);
    action = new Subject<{ type: ActionTypes; payload: any }>();
    actions = new Actions(action);
    effect = new TransactionsEffects(actions, apiService, store, null);
  });

  it('should be created without errors', () => {
    expect(TransactionsEffects).toBeTruthy();
  });

  it('should getTransactions$ without errors', fakeAsync(() => {
    effect.getTransactions$.subscribe(res => res);
    action.next({
      type: ActionTypes.GET_TRANSACTIONS,
      payload: {
        type: ActionTypes.GET_TRANSACTIONS,
        payload: {},
        loadMoreMode: true,
      },
    });

    tick();
    expect(effect.getTransactions$).toBeTruthy();
    expect(TransactionsEffects).toBeTruthy();
  }));

  it('should getColumnsData$ without errors', fakeAsync(() => {
    effect.getColumnsData$.subscribe(res => res);
    action.next({ type: ActionTypes.GET_COLUMNS_DATA, payload: {} });

    tick();
    expect(effect.getColumnsData$).toBeTruthy();
    expect(TransactionsEffects).toBeTruthy();
  }));
});
