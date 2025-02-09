import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';

import { SettingsService } from '../../../shared';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { ActionTypes } from '../actions';
import { FiltersEffects } from './filters.effects';

describe('FiltersEffects', () => {
  let filtersEffects: FiltersEffects;

  let settingsService: SettingsService;
  let store: Store<any>;
  let action: Subject<{ type: ActionTypes; payload?: any }>;
  let actions: Actions;
  let effect: FiltersEffects;

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        provideMockActions(() => of({})),
        FiltersEffects,
        {
          provide: SettingsService,
          useValue: {
            filters: [],
            settings: {
              filtersList: [],
            },
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
            select: () =>
              of({
                configuration: {},
                page: 1,
              }),
          },
        },
      ],
    })
  );

  beforeEach(() => {
    filtersEffects = TestBed.get(FiltersEffects);
    settingsService = TestBed.get(SettingsService);
    store = TestBed.get(Store);
    action = new Subject<{ type: ActionTypes; payload: any }>();
    actions = new Actions(action);
    effect = new FiltersEffects(actions, settingsService, store);
  });

  it('should be created without errors', () => {
    expect(filtersEffects).toBeTruthy();
  });

  it('should addFilter$ without errors', fakeAsync(() => {
    effect.addFilter$.subscribe(res => res);
    action.next({
      type: ActionTypes.ADD_FILTER,
      payload: { key: 'test', value: 'test', condition: 'in' },
    });
    tick();
    expect(effect.addFilter$).toBeTruthy();
    expect(FiltersEffects).toBeTruthy();
  }));

  it('should addSearchQuery$ without errors', fakeAsync(() => {
    effect.addSearchQuery$.subscribe(res => res);
    action.next({
      type: ActionTypes.ADD_SEARCH_QUERY,
      payload: { search: 'test' },
    });
    tick();
    expect(effect.addSearchQuery$).toBeTruthy();
    expect(FiltersEffects).toBeTruthy();
  }));

  it('should changeSortDirection$ without errors', fakeAsync(() => {
    effect.changeSortDirection$.subscribe(res => res);
    action.next({
      type: ActionTypes.CHANGE_SORT_DIRECTION,
      payload: { orderBy: 'name', direction: 'desc' },
    });
    tick();
    expect(effect.changeSortDirection$).toBeTruthy();
    expect(FiltersEffects).toBeTruthy();
  }));

  it('should removeFilter$ without errors', fakeAsync(() => {
    effect.removeFilter$.subscribe(res => res);
    action.next({
      type: ActionTypes.REMOVE_FILTER,
      payload: { key: 'test', value: 'test', condition: 'in' },
    });
    tick();
    expect(effect.removeFilter$).toBeTruthy();
    expect(FiltersEffects).toBeTruthy();
  }));

  it('should nextPage$ without errors', fakeAsync(() => {
    effect.nextPage$.subscribe(res => res);
    action.next({ type: ActionTypes.NEXT_PAGE, payload: { page: 2 } });
    tick();
    expect(effect.nextPage$).toBeTruthy();
    expect(FiltersEffects).toBeTruthy();
  }));

  it('should loadMore$ without errors', fakeAsync(() => {
    effect.loadMore$.subscribe(res => res);
    action.next({ type: ActionTypes.LOAD_MORE });
    tick();
    expect(effect.loadMore$).toBeTruthy();
    expect(FiltersEffects).toBeTruthy();
  }));
});
