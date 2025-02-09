import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable, forkJoin, of } from 'rxjs';
import { delay, map, switchMap, tap } from 'rxjs/operators';

import { PebMap, PebPartialContent, PebRenderElementModel, PebViewPage } from '@pe/builder/core';
import { flattenContexts, flattenELements } from '@pe/builder/render-utils';
import {
  PebViewContextRenderAllAction,
  PebViewContextSetAction,
  PebViewPartialContentLoadingAction,
} from '@pe/builder/view-actions';
import { PebPartialContentService, PebViewContextRenderService } from '@pe/builder/view-handlers';
import { PebViewState } from '@pe/builder/view-state';

import { CLIENT_CONTAINER } from '../../constants';
import { toRenderElement } from '../renderer/helpers';

import { PebClientPagesService } from './pages.service';
import { PebSsrStateService } from './ssr-state.service';


@Injectable()
export class PebBrowserPartialContentService implements PebPartialContentService {
  constructor(
    private readonly store: Store,
    private readonly pagesService: PebClientPagesService,
    private ssrStateService: PebSsrStateService,
    private contextRenderService: PebViewContextRenderService,
  ) {
  }

  container = CLIENT_CONTAINER;

  loadContent$(partial: PebPartialContent): Observable<PebRenderElementModel | undefined> {
    if (!partial?.elementId) {
      return of(undefined);
    }

    const { pageId, elementId } = partial;
    const existingElement = this.store.selectSnapshot(PebViewState.elements)[elementId];
    if (existingElement) {
      return of(existingElement);
    }

    const page = this.store.selectSnapshot(PebViewState.pages)[pageId];
    if (!page) {
      return of(undefined);
    }

    return this.loadPageElements$(page).pipe(
      map(elements => elements[elementId]),
      tap(element => this.store.dispatch(new PebViewPartialContentLoadingAction(pageId, element))),
      delay(0),
    );
  }

  private loadPageElements$(page: PebViewPage): Observable<PebMap<PebRenderElementModel>> {
    const hasElements = page.elements && Object.keys(page.elements).length > 0;
    if (page.elements && hasElements) {
      return of(page.elements);
    }

    return forkJoin([
      this.pagesService.getPageElementDefs$(page.id),
      this.pagesService.getPageElementDefs$(page.master?.page),
    ]).pipe(
      switchMap(([pageElementsDefs, masterPageElementsDef]) => {
        const { rootElement } = this.pagesService.processElementDefs(page.id, pageElementsDefs, masterPageElementsDef);
        const screen = this.store.selectSnapshot(PebViewState.screen);
        const element = toRenderElement(rootElement, screen.key, page.id, this.container);

        const rootContext$ = this.contextRenderService.createRootContext$();

        return rootContext$.pipe(
          switchMap(() => this.contextRenderService.resolveContext$(element).pipe(
            tap((context) => {
              this.store.dispatch(new PebViewContextSetAction(flattenContexts(context)));
              this.store.dispatch(new PebViewContextRenderAllAction());
              this.ssrStateService.transferRenderDataToSsrState();
            }),
          )),
          switchMap(()=>of(flattenELements(element))),
        );
      }),
    );
  }
}
