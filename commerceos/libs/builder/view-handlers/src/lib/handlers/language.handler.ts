import { Injectable } from '@angular/core';
import { Actions, Store, ofActionDispatched } from '@ngxs/store';
import { of } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

import { 
  PebRenderUpdateModel,
} from '@pe/builder/core';
import {
  flattenContexts,
  getText,
} from '@pe/builder/render-utils';
import { PebRenderUpdateAction,
  PebViewContextRenderAllAction,
  PebViewContextSetAction,
  PebViewLanguageSetAction,
} from '@pe/builder/view-actions';
import { PebViewState } from '@pe/builder/view-state';

import { PebViewContextRenderService } from '../services';

import { PebViewBaseHandler } from './base-view.handler';


@Injectable()
export class PebViewLanguageHandler extends PebViewBaseHandler {

  private onLanguageChange$ = this.actions$.pipe(
    ofActionDispatched(PebViewLanguageSetAction),
    distinctUntilChanged((key1, key2) => key1 === key2),
    switchMap(({ languageKey }) => this.handleLanguageChange(languageKey)),
  );

  constructor(
    private readonly actions$: Actions,
    private readonly store: Store,
    private contextRenderService: PebViewContextRenderService,
  ) {
    super();
    this.startObserving(this.onLanguageChange$);
  }

  handleLanguageChange(languageKey: string){
    const page = this.store.selectSnapshot(PebViewState.page);

    if (!page) {
      return of(undefined);
    }
    const container = this.store.selectSnapshot(PebViewState.container);
    if (!page.rootElement || !container) {
      return of(undefined);
    }

    return this.contextRenderService.resolveContext$(page.rootElement).pipe(
      tap((context) => {
        const contexts = flattenContexts(context);
        this.updateElementTexts(languageKey);
        this.store.dispatch(new PebViewContextSetAction(contexts));
        this.store.dispatch(new PebViewContextRenderAllAction());
      }),
    );
  }

  updateElementTexts(languageKey: string): void {
    const elements = this.store.selectSnapshot(PebViewState.elements);
    const updateElements: PebRenderUpdateModel[] = [];
    Object.values(elements).forEach((elm)=>{
      let text = getText(elm, languageKey);
      text && updateElements.push({ id: elm.id, text });
    });
    updateElements.length > 0 && this.store.dispatch(new PebRenderUpdateAction(updateElements));
  }

}
