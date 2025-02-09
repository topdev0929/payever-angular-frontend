import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';

import { BusinessDataEffects } from './business-data.effects';
import { ApiService } from '../../../shared';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { ActionTypes } from '../actions';

describe('businessDataEffects', () => {
  let businessDataEffects: BusinessDataEffects;

  let apiService: ApiService;
  let store: Store<any>;
  let action: Subject<{ type: ActionTypes; payload?: any }>;
  let actions: Actions;
  let effect: BusinessDataEffects;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideMockActions(() => of({})),
        BusinessDataEffects,
        {
          provide: ApiService,
          useValue: {
            getBusinessData: () => of({}),
            getCurrencies: () => of([]),
            getTransactionsListColumns: () => of(['test', 'test1']),
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
          },
        },
      ],
    })
  );

  beforeEach(() => {
    businessDataEffects = TestBed.get(BusinessDataEffects);
    apiService = TestBed.get(ApiService);
    store = TestBed.get(Store);
    action = new Subject<{ type: ActionTypes; payload: any }>();
    actions = new Actions(action);
    effect = new BusinessDataEffects(actions, apiService, store);
  });

  it('should be created without errors', () => {
    expect(businessDataEffects).toBeTruthy();
  });

  it('should getBusinessData$ without errors', fakeAsync(() => {
    effect.getBusinessData$.subscribe(res => res);
    action.next({ type: ActionTypes.GET_BUSINESS_DATA });
    tick();
    expect(effect.getBusinessData$).toBeTruthy();
    expect(businessDataEffects).toBeTruthy();
  }));

  it('should updateColumns$ without errors', fakeAsync(() => {
    effect.updateColumns$.subscribe(res => res);
    action.next({
      type: ActionTypes.UPDATE_COLUMNS,
      payload: ['test', 'test1'],
    });
    tick();
    expect(effect.updateColumns$).toBeTruthy();
    expect(businessDataEffects).toBeTruthy();
  }));
});
