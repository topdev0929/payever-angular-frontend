import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Actions, Select, Store, ofActionDispatched } from '@ngxs/store';
import { Observable } from 'rxjs';
import { tap, withLatestFrom } from 'rxjs/operators';

import {
  PebFill,
  PebViewQueryModel,
  isIframe,
  isImage,
  isVideo,
  PebRenderUpdateModel,
} from '@pe/builder/core';
import {
  PebRenderUpdateAction,  
  PebViewPageRenderingAction,
  PebViewPageScrollReadyAction,
} from '@pe/builder/view-actions';
import { PebViewState } from '@pe/builder/view-state';

import { PEB_LAZY_LOADED_CLASS } from '../services';

import { PebViewBaseHandler } from './base-view.handler';

declare function setupLazyLoading(): any;

@Injectable()
export class PebViewLazyLoadHandler extends PebViewBaseHandler {
  @Select(PebViewState.query) query$!: Observable<PebViewQueryModel>;

  pageRendering$ = this.actions$.pipe(
    ofActionDispatched(PebViewPageRenderingAction),
    withLatestFrom(this.query$),
    tap(([action, query]: [PebViewPageRenderingAction, PebViewQueryModel]) => {
      const elements = Object.values(action.elements);

      query.enableLazyLoading
        ? this.enableLazyLoading(elements)
        : this.disableLazyLoading(elements);
    }),
  );

  scrollReady$ = this.actions$.pipe(
    ofActionDispatched(PebViewPageScrollReadyAction),
    withLatestFrom(this.query$),
    tap(([action, query]: [PebViewPageScrollReadyAction, PebViewQueryModel]) => {
      if (!query.enableLazyLoading) {
        return;
      }

      isPlatformBrowser(this.platformId) && setupLazyLoading();
    }),
  );

  constructor(
    private readonly actions$: Actions,
    @Inject(PLATFORM_ID) private platformId: any,
    private readonly store: Store,
  ) {
    super();
    this.startObserving(
      this.pageRendering$,
      this.scrollReady$,
    );
  }

  disableLazyLoading(elements: PebRenderUpdateModel[]) {
    const payload: PebRenderUpdateModel[] = [];
    elements.forEach((elm) => {
      const fill = elm.fill;
      if (isImage(fill)) {
        payload.push({ id: elm.id, style: { class: { [PEB_LAZY_LOADED_CLASS]: true } } });
      }
    });

    this.store.dispatch(new PebRenderUpdateAction(payload));
  }

  enableLazyLoading(elements: PebRenderUpdateModel[]) {
    const payload: PebRenderUpdateModel[] = [];
    elements.forEach((elm) => {
      const fill = elm.fill;
      if (isImage(fill) || isVideo(fill) || isIframe(fill)) {
        payload.push({ id: elm.id, fill: { lazy: { enabled: true } } as PebFill });
      }
    });

    this.store.dispatch(new PebRenderUpdateAction(payload));
  }
}
