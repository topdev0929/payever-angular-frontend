import { Injectable } from '@angular/core';
import { Actions, Store, ofActionDispatched } from '@ngxs/store';
import { tap } from 'rxjs/operators';

import { isDashboardContainer } from '@pe/builder/core';
import { flattenELements } from '@pe/builder/render-utils';
import { PebRenderCreateOrUpdateAction, PebViewPartialContentLoadingAction } from '@pe/builder/view-actions';
import { PebViewState } from '@pe/builder/view-state';

import { PebViewStylesService } from '../services';

import { PebViewBaseHandler } from './base-view.handler';


@Injectable()
export class PebViewPartialContentHandler extends PebViewBaseHandler {
  partialContentLoading$ = this.actions$.pipe(
    ofActionDispatched(PebViewPartialContentLoadingAction),
    tap((action: PebViewPartialContentLoadingAction) => {
      if (!action.element.id) {
        return;
      }

      const existingElement = this.store.selectSnapshot(PebViewState.elements)[action.element.id];
      if (existingElement) {
        return;
      }

      const newElements = Object.values(flattenELements(action.element));
      this.store.dispatch(new PebRenderCreateOrUpdateAction(newElements));
      this.stylesService.setElementClasses(newElements);

      const container = this.store.selectSnapshot(PebViewState.container);

      const screens = isDashboardContainer(container)
        ? [this.store.selectSnapshot(PebViewState.screen)]
        : this.store.selectSnapshot(PebViewState.screens);

      this.stylesService.addPageStyles(action.pageId, newElements, screens);
    }),
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
    private readonly stylesService: PebViewStylesService,
  ) {
    super();
    this.startObserving(
      this.partialContentLoading$,
    );
  }
}
