import { Injectable, inject } from '@angular/core';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import produce from 'immer';
import { throwError } from 'rxjs';
import { catchError, filter, map, switchMap, takeWhile } from 'rxjs/operators';

import { ApiService } from '../../../services';
import { ActionTypeEnum, DetailInterface } from '../../../shared';
import { DetailsState, GetActions, GetDetails, SetDetails } from '../details';

import { PostAction, AddRuntimeAction, DeleteRuntimeAction } from './transaction.action';

export interface TransactionStateModel {
  details: DetailInterface,
  runtimeActions: ActionTypeEnum[],
}

const initialState: TransactionStateModel = {
  details: null,
  runtimeActions: [],
};

@State<TransactionStateModel>({
  name: 'transaction',
  children: [
    DetailsState,
  ],
  defaults: initialState,
})
@Injectable()
export class TransactionState {
  private apiService = inject(ApiService);
  private store = inject(Store);

  @Selector() static runtimeActions(state: TransactionStateModel) {
    return state.runtimeActions;
  }

  @Action(PostAction)
  getDetails({ getState }: StateContext<TransactionStateModel>, action: PostAction) {
    const state = getState();

    return this.store.selectOnce(TransactionState.runtimeActions).pipe(
      filter(() => action.skipRuntimeActionsCheck || !state.runtimeActions.includes(action.action)),
      switchMap(() => this.apiService.postAction(action.orderId, action.action, action.payload).pipe(
        takeWhile(() => {
          return !state.runtimeActions.includes(action.action);
        }),
        switchMap(details => this.store.dispatch(new SetDetails(details))),
      )),
      catchError((err) => {
        const orderId = this.store.selectSnapshot(DetailsState.orderId);

        return this.store.dispatch(new GetDetails(orderId, GetDetails.bypassCache)).pipe(
          switchMap(() => this.store.dispatch(new GetActions(orderId))),
          map(() => throwError(err)),
        );
      })
    );
  }

  @Action(AddRuntimeAction)
  addRuntimeAction({ getState, patchState }: StateContext<TransactionStateModel>, action: AddRuntimeAction) {
    const state = getState();
    const newState = produce(state, (draft) => {
      draft.runtimeActions = [
        ...draft.runtimeActions,
        action.action,
      ];
    });

    patchState(newState);
  }

  @Action(DeleteRuntimeAction)
  deleteRuntimeAction({ getState, patchState }: StateContext<TransactionStateModel>, action: DeleteRuntimeAction) {
    const state = getState();
    const newState = produce(state, (draft) => {
      draft.runtimeActions = state.runtimeActions.filter(item => item !== action.action);
    });

    patchState(newState);
  }
}
