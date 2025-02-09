import { Injectable } from '@angular/core';
import { Actions, Store, ofActionDispatched } from '@ngxs/store';
import { tap } from 'rxjs/operators';

import { PebViewScriptsRenderAction } from '@pe/builder/view-actions';
import { PebViewState } from '@pe/builder/view-state';

import { PebViewScriptService } from '../services';

import { PebViewBaseHandler } from './base-view.handler';

@Injectable()
export class PebViewScriptHandler extends PebViewBaseHandler {
  renderScripts$ = this.actions$.pipe(
    ofActionDispatched(PebViewScriptsRenderAction),
    tap(() => {
      const container = this.store.selectSnapshot(PebViewState.container);
      if (!container?.renderScripts) {
        return;
      }
      const scripts = this.scriptService.getAllowedPageScriptsToRun();
      this.scriptService.renderScripts(scripts);
    },
    ),
  );

  constructor(
    private readonly actions$: Actions,
    private store: Store,

    private readonly scriptService: PebViewScriptService,
  ) {
    super();

    this.startObserving(
      this.renderScripts$,
    );
  }
}
