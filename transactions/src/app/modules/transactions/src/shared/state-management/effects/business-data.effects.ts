import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { forkJoin, Observable, of } from 'rxjs';
import { mergeMap, switchMap } from 'rxjs/operators';
import { FiltersFieldType, UserBusinessInterface } from '../../interfaces';

import {
  BusinessChannelInterface,
  BusinessCurrencyInterface,
  BusinessPaymentOptionInterface
} from '@pe/ng-kit/modules/business';
import { DataGridTableColumnInterface } from '@pe/ng-kit/modules/data-grid';

import { ApiService } from '../../services';

// TODO: MOCKS - REMOVE
import { channels, paymentOptions } from '../../mocks';

import {
  ActionTypes,
  getActiveColumnsSuccess,
  getBusinessChannelsSuccess,
  getBusinessCurrenciesSuccess,
  getBusinessPaymentOptionsSuccess,
  getTransactions,
  updateBusinessSettings
} from '../actions';
import { GlobalStateInterface, TransactionAction } from '../interfaces';

@Injectable()
export class BusinessDataEffects {

  @Effect()
  updateColumns$: Observable<TransactionAction> = this.actions.pipe(
    ofType(ActionTypes.UPDATE_COLUMNS),
    switchMap((action: TransactionAction) => {
      const columns: DataGridTableColumnInterface[] = action.payload;
      const columnsNames: string[] = columns
        .filter((column: DataGridTableColumnInterface) => column.isActive)
        .map((column: DataGridTableColumnInterface) => column.name);
      // TODO: implement when backend columns functionality will be ready
      // return this.apiService.putTransactionsListColumns(columnsNames).pipe(
      //   mergeMap(() => {
      //     this.store.dispatch(getActiveColumnsSuccess(columnsNames));
      //     return [];
      //   }));
      this.store.dispatch(getActiveColumnsSuccess(columnsNames));
      return [];
    })
  );

  @Effect()
  getBusinessData$: Observable<TransactionAction> = this.actions.pipe(
    ofType(ActionTypes.GET_BUSINESS_DATA),
    switchMap((action: TransactionAction) => {
      const requests: Observable<
        BusinessChannelInterface[]
        | BusinessPaymentOptionInterface[]
        | UserBusinessInterface
        | BusinessCurrencyInterface[]
        | string[]
      >[] = [
        of(channels),
        of(paymentOptions),
        this.apiService.getBusinessData(),
        this.apiService.getCurrencies(),
        this.apiService.getTransactionsListColumns()
      ];
      return forkJoin(requests).pipe(
        mergeMap((response: [
          BusinessChannelInterface[],
          BusinessPaymentOptionInterface[],
          UserBusinessInterface,
          BusinessCurrencyInterface[],
          string[]
        ]) => {
          this.store.dispatch(getBusinessChannelsSuccess(response[0]));
          this.store.dispatch(getBusinessPaymentOptionsSuccess(response[1]));
          this.store.dispatch(updateBusinessSettings(response[2]));
          this.store.dispatch(getBusinessCurrenciesSuccess(response[3]));
          this.filterActiveColumns(response[4]);
          if (action.payload) {
            this.store.dispatch(getTransactions(action.payload));
          } else {
            this.store.dispatch(getTransactions());
          }
          return [];
        })
      );
    })
  );

  constructor(
    private actions: Actions,
    private apiService: ApiService,
    private store: Store<GlobalStateInterface>
  ) {}

  // TODO: redo when BE functionality for columns will be ready
  private filterActiveColumns(activeColumnsList: string[]): void {
    const nonActiveColumns: string[] = [
      FiltersFieldType.CustomerEmail,
      FiltersFieldType.MerchantEmail,
      FiltersFieldType.SpecificStatus,
      FiltersFieldType.Reference
    ];
    const filteredColumns: string[] = activeColumnsList.filter((columnName: string) => nonActiveColumns.indexOf(columnName) === -1);
    this.store.dispatch(getActiveColumnsSuccess(filteredColumns));
  }

}
