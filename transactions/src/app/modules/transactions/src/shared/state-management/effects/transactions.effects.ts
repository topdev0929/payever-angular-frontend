import { Inject, Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { catchError, mergeMap, switchMap, take, tap } from 'rxjs/operators';
import { cloneDeep } from 'lodash-es';

import { BusinessChannelInterface } from '@pe/ng-kit/modules/business';
import { DATE_FORMAT_SHORT } from '@pe/ng-kit/modules/i18n';

import { ApiService, FiltersFieldType } from '../../../shared';

import { ActionTypes, getActiveColumnsSuccess, getTransactionsFail, getTransactionsSuccess } from '../actions';
import { GlobalStateInterface } from '../interfaces';
import { ListResponseInterface, ListInterface } from '../../interfaces';
// TODO: HARDCODED MOCK
import { usages } from '../../mocks';

import { businessChannelsSelector, businessPaymentOptionsSelector, businessCurrencySelector } from '../selectors';

@Injectable()
export class TransactionsEffects {

  @Effect()
  getTransactions$: Observable<any> = this.actions.pipe(
    ofType(ActionTypes.GET_TRANSACTIONS),
    mergeMap((action: any) => {
      const currency: string = this.getBusinessCurrency();
      action = cloneDeep(action);
      action.payload.currency = currency;
      return this.apiService.getTransactions(action.payload).pipe(
        switchMap((response: ListResponseInterface) => {
          response.collection = this.convertCollectionData(response.collection);
          const filteredUsages: any = usages;
          if (response.usage.statuses) {
            filteredUsages.statuses = response.usage.statuses.map(
              ((value: string) => ({ key: value, name: value }))
            );
          }
          if (response.usage.specific_statuses) {
            filteredUsages.specific_statuses = response.usage.specific_statuses.map(
              ((value: string) => ({ key: value, name: value }))
            );
          }
          response.usage = filteredUsages;
          this.store.dispatch(getTransactionsSuccess(response, action.loadMoreMode));
          return [];
        }),
        catchError(() => {
          this.store.dispatch(getTransactionsFail());
          return [];
        })
      );
    })
  );

  @Effect()
  getColumnsData$: Observable<any> = this.actions.pipe(
    ofType(ActionTypes.GET_COLUMNS_DATA),
    switchMap(() => this.apiService.getTransactionsListColumns().pipe(
      tap(response => {
        const nonActiveColumns: string[] = [
          FiltersFieldType.CustomerEmail,
          FiltersFieldType.MerchantEmail,
          FiltersFieldType.SpecificStatus,
          FiltersFieldType.Reference,
          FiltersFieldType.CustomerName
        ];

        this.store.dispatch(getActiveColumnsSuccess(response.filter(col => !nonActiveColumns.includes(col))));
      }),
      mergeMap(() => [])
    ))
  );

  constructor(
    private actions: Actions,
    private apiService: ApiService,
    private store: Store<GlobalStateInterface>,
    @Inject(DATE_FORMAT_SHORT) private dateFormatShort: string
  ) {
  }

  private convertCollectionData(collection: ListInterface[]): ListInterface[] {
    let businessChannelsObject: { [propName: string]: BusinessChannelInterface } = null;
    this.store.select(businessChannelsSelector).pipe(
      take(1))
      .subscribe((businessChannels: { [propName: string]: BusinessChannelInterface }) => {
        businessChannelsObject = businessChannels;
      });

    if (businessChannelsObject) {
      collection.forEach((order: ListInterface) => {
        order._channelThumbnail = Boolean(businessChannelsObject[order.channel]) ? businessChannelsObject[order.channel].thumbnail : null;
      });
    }

    return collection;
  }

  private getBusinessCurrency(): string {
    let businessCurrency: string = null;
    this.store.select(businessCurrencySelector).pipe(
      take(1))
      .subscribe((currency: string) => {
        businessCurrency = currency;
      });

    return businessCurrency;
  }
}
