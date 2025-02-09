import { Injectable } from '@angular/core';
import { Actions, Store, ofActionDispatched } from '@ngxs/store';
import { tap } from 'rxjs/operators';

import { PebIntegrationApiCachedDataClearAllAction } from '@pe/builder/core';
import { PebViewIntegrationClearCacheAction } from '@pe/builder/view-actions';

import { PebViewBaseHandler } from './base-view.handler';


@Injectable()
export class PebViewIntegrationHandler extends PebViewBaseHandler {
  private clearCache$ = this.actions$.pipe(
    ofActionDispatched(PebViewIntegrationClearCacheAction),
    tap(() => {
      this.store.dispatch(new PebIntegrationApiCachedDataClearAllAction());
    })
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
  ) {
    super();
    this.startObserving(this.clearCache$);
  }
}
