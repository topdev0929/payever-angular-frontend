import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { cloneDeep } from 'lodash-es';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

import { DataGridFilterInterface } from '@pe/ng-kit/modules/data-grid';
import {
  PaginationInterface,
  SearchTransactionsInterface,
  SortInterface
} from '../../interfaces';
import {
  TransactionsFilterSchemaInterface
} from '../../settings';
import {
  SettingsService
} from '../../services';
import { ActionTypes, getTransactions, setFilters } from '../actions';
import { GlobalStateInterface, TransactionAction } from '../interfaces';
import { filtersSelector, paginationSelector } from '../selectors';

@Injectable()
export class FiltersEffects {

  private fixDate(data: any): any {
    if (typeof (data) === 'object' && !isNaN(Date.parse(data))) {
      data = moment(data).toISOString(true);
      // 2019-07-10T00:00:00.000 02:00 -> 2019-07-10
      data = data.substr(0, 10);
    }
    return data;
  }

  @Effect()
  addFilter$: Observable<TransactionAction> = this.actions.pipe(
    ofType(ActionTypes.ADD_FILTER),
    switchMap((action: TransactionAction) => {
      const filter: DataGridFilterInterface = cloneDeep(action.payload);
      const filterSchema: TransactionsFilterSchemaInterface = this.settingsService.filters.find((filterSchema: TransactionsFilterSchemaInterface) => filterSchema.field === filter.key);
      let currentFiltersState: any = null;
      this.store.select(filtersSelector).pipe(
        take(1))
        .subscribe((data: any) => {
          currentFiltersState = cloneDeep(data);
        });

      // reset page when filters changed
      currentFiltersState.page = 1;
      if (filter.value) {
        filter.value = this.fixDate(filter.value);
      }
      if (filter.value.dateFrom) {
        filter.value.dateFrom = this.fixDate(filter.value.dateFrom);
      }
      if (filter.value.dateTo) {
        filter.value.dateTo = this.fixDate(filter.value.dateTo);
      }

      // TODO Must be removed once changed inside ng-kit
      if (filter.value.dateFrom) {
        filter.value.from = filter.value.dateFrom;
      }
      if (filter.value.dateTo) {
        filter.value.to = filter.value.dateTo;
      }

      const rootCondition: any = currentFiltersState.configuration[filter.key] &&
        currentFiltersState.configuration[filter.key].find((elem: any) => elem.condition === filter.condition);
      if (rootCondition) {
        const conditions: any = currentFiltersState.configuration[filter.key].find((elem: any) => elem.condition === filter.condition);
        let exists: any = false;
        if (conditions) {
          exists = conditions.value.find((elem: any) => filter.value === elem);
        }

        // no dups
        if (!exists) {
          conditions.value.push(filter.value as string);
        }
      } else {
        currentFiltersState.configuration[filter.key] = [
          ...(currentFiltersState.configuration[filter.key] || []), {
            condition: filter.condition,
            value: [filter.value as string]
          }];
      }

      this.store.dispatch(setFilters(currentFiltersState));
      this.store.dispatch(getTransactions(currentFiltersState));
      return [];
    })
  );

  @Effect()
  addSearchQuery$: Observable<TransactionAction> = this.actions.pipe(
    ofType(ActionTypes.ADD_SEARCH_QUERY),
    switchMap((action: TransactionAction) => {
      const searchQuery: string = action.payload;
      let currentFiltersState: SearchTransactionsInterface = null;
      this.store.select(filtersSelector).pipe(
        take(1))
        .subscribe((data: any) => {
          currentFiltersState = cloneDeep(data);
        });
      currentFiltersState.search = searchQuery;
      this.store.dispatch(setFilters(currentFiltersState));
      this.store.dispatch(getTransactions(currentFiltersState));
      return [];
    })
  );

  @Effect()
  changeSortDirection$: Observable<TransactionAction> = this.actions.pipe(
    ofType(ActionTypes.CHANGE_SORT_DIRECTION),
    switchMap((action: TransactionAction) => {
      const sortContinion: SortInterface = action.payload;
      let currentFiltersState: SearchTransactionsInterface = null;
      this.store.select(filtersSelector).pipe(
        take(1))
        .subscribe((data: SearchTransactionsInterface) => {
          currentFiltersState = cloneDeep(data);
        });
      currentFiltersState.orderBy = sortContinion.orderBy;
      currentFiltersState.direction = sortContinion.direction;
      this.store.dispatch(setFilters(currentFiltersState));
      this.store.dispatch(getTransactions(currentFiltersState));
      return [];
    })
  );

  @Effect()
  removeFilter$: Observable<TransactionAction> = this.actions.pipe(
    ofType(ActionTypes.REMOVE_FILTER),
    switchMap((action: TransactionAction) => {
      const dataGridFilter: DataGridFilterInterface = action.payload;
      let currentFiltersState: any = null;
      this.store.select(filtersSelector).pipe(
        take(1))
        .subscribe((data: DataGridFilterInterface) => {
          currentFiltersState = cloneDeep(data);
        });

      // reset page when filters changed
      currentFiltersState.page = 1;

      const filterItem: TransactionsFilterSchemaInterface = this.settingsService.settings.filtersList.find(
        (filter: TransactionsFilterSchemaInterface) => filter.field === dataGridFilter.key
      );
      if (filterItem) {
        const condition: DataGridFilterInterface = currentFiltersState.configuration[dataGridFilter.key].find((elem: DataGridFilterInterface) => dataGridFilter.condition === elem.condition);
        const elemIndex: DataGridFilterInterface = condition.value.findIndex((elem: DataGridFilterInterface) => elem === dataGridFilter.value);
        condition.value.splice(elemIndex, 1);
        if (condition.value.length === 0) {
          currentFiltersState.configuration[dataGridFilter.key] = currentFiltersState.configuration[dataGridFilter.key].filter((elem: DataGridFilterInterface) => {
            return dataGridFilter.condition !== elem.condition;
          });
        }
        if (currentFiltersState.configuration[dataGridFilter.key].length === 0) {
          delete currentFiltersState.configuration[dataGridFilter.key];
        }
      } else if (dataGridFilter.key === 'search') {
        delete currentFiltersState.search;
      }
      if (Object.keys(currentFiltersState.configuration).length) {
        this.store.dispatch(setFilters(currentFiltersState));
        this.store.dispatch(getTransactions(currentFiltersState));
      } else {
        this.store.dispatch(setFilters());
        this.store.dispatch(getTransactions());
      }
      return [];
    })
  );

  @Effect()
  nextPage$: Observable<TransactionAction> = this.actions.pipe(
    ofType(ActionTypes.NEXT_PAGE),
    switchMap((action: TransactionAction) => {
      const page: number = +action.payload;
      let currentFiltersState: SearchTransactionsInterface = null;
      this.store.select(filtersSelector).pipe(
        take(1))
        .subscribe((data: any) => {
          currentFiltersState = cloneDeep(data);
        });
      if (page >= currentFiltersState.page) {
        currentFiltersState.page += 1;
      } else {
        currentFiltersState.page -= 1;
      }
      this.store.dispatch(setFilters(currentFiltersState));
      this.store.dispatch(getTransactions(currentFiltersState));
      return [];
    })
  );

  @Effect()
  loadMore$: Observable<TransactionAction> = this.actions.pipe(
    ofType(ActionTypes.LOAD_MORE),
    switchMap((action: TransactionAction) => {
      let currentFiltersState: SearchTransactionsInterface = null;
      let paginationState: PaginationInterface = null;
      this.store.select(filtersSelector).pipe(take(1)).subscribe((data: any) => {
        currentFiltersState = cloneDeep(data);
      });
      this.store.select(paginationSelector).pipe(take(1)).subscribe((data: any) => {
        paginationState = cloneDeep(data);
      });
      if (Number(currentFiltersState.page) === Number(paginationState.page)) {
        this.store.dispatch(setFilters(currentFiltersState));
        this.store.dispatch(getTransactions(currentFiltersState, true));
      }
      return [];
    })
  );

  constructor(
    private actions: Actions,
    private settingsService: SettingsService,
    private store: Store<GlobalStateInterface>
  ) {
  }

}
