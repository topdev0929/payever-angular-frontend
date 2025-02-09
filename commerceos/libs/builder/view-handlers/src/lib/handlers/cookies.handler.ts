import { Injectable } from '@angular/core';
import { Actions, Store, ofActionDispatched } from '@ngxs/store';
import { tap } from 'rxjs/operators';

import { PebViewCookiesPermission } from '@pe/builder/core';
import {
  PebViewScriptsRenderAction,
  PebViewCookiesAcceptAction,
  PebViewCookiesRejectAction,
  PebViewQueryPatchAction,
} from '@pe/builder/view-actions';

import { PebViewCookiesPermissionService } from '../services';

import { PebViewBaseHandler } from './base-view.handler';

@Injectable()
export class PebViewCookiesHandler extends PebViewBaseHandler {
  cookiesAccepted$ = this.actions$.pipe(
    ofActionDispatched(PebViewCookiesAcceptAction),
    tap(() => this.setCookiesPermissions(true)),
  );

  cookiesRejected$ = this.actions$.pipe(
    ofActionDispatched(PebViewCookiesRejectAction),
    tap(() => this.setCookiesPermissions(false)),
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
    private readonly cookiesPermissionService: PebViewCookiesPermissionService,
  ) {
    super();

    this.startObserving(
      this.cookiesAccepted$,
      this.cookiesRejected$,
    );
  }

  setCookiesPermissions(isAllowed: boolean): void {
    const cookiesPermission: PebViewCookiesPermission = {
      isSet: true,
      isAllowed,
    };
    this.cookiesPermissionService.setCookiesPermission(cookiesPermission);
    this.store.dispatch(new PebViewQueryPatchAction({ cookiesPermission: cookiesPermission }));

    isAllowed && this.store.dispatch(new PebViewScriptsRenderAction());
  }
}
