import { Injectable } from '@angular/core';
import { Actions, Store, ofActionDispatched } from '@ngxs/store';
import { tap } from 'rxjs/operators';

import { PebMap, isDashboardContainer } from '@pe/builder/core';
import { PebViewPageRenderingAction } from '@pe/builder/view-actions';
import { PebViewState } from '@pe/builder/view-state';

import { PebViewStylesService } from '../services';

import { PebViewBaseHandler } from './base-view.handler';


@Injectable()
export class PebViewStylesHandler extends PebViewBaseHandler {
  pageStyles: PebMap<HTMLElement> = {};

  pageRendering$ = this.actions$.pipe(
    ofActionDispatched(PebViewPageRenderingAction),
    tap((action: PebViewPageRenderingAction) => {
      const pageId = this.store.selectSnapshot(PebViewState.pageId);
      if (!pageId) {
        return;
      }
      const elements = Object.values(action.elements);
      const container = this.store.selectSnapshot(PebViewState.container);
      const screens = isDashboardContainer(container)
        ? [this.store.selectSnapshot(PebViewState.screen)]
        : this.store.selectSnapshot(PebViewState.screens);

      this.stylesService.addPageStyles(pageId, elements, screens);
      this.stylesService.setElementClasses(elements);
      this.stylesService.clearAllStyles([pageId]);
    }),
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
    private readonly stylesService: PebViewStylesService,
  ) {
    super();       
    this.startObserving(
      this.pageRendering$,
    );
  }
}
