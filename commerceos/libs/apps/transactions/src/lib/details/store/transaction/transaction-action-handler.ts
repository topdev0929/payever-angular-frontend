import { Injectable, OnDestroy } from '@angular/core';
import {
  Store,
  Actions,
  ofActionDispatched,
  ofActionCompleted,
} from '@ngxs/store';
import { Subject, merge } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

import { PostAction, AddRuntimeAction, DeleteRuntimeAction } from './transaction.action';

@Injectable({
  providedIn: 'root',
})
export class TransactionActionHandler implements OnDestroy{
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private actions$: Actions,
  ) {
    merge(
      this.actions$.pipe(
        ofActionDispatched(PostAction),
        switchMap(value => this.store.dispatch(new AddRuntimeAction(value.action))),
      ),
      this.actions$.pipe(
        ofActionCompleted(PostAction),
        switchMap(value => this.store.dispatch(new DeleteRuntimeAction(value.action.action))),
      )
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
