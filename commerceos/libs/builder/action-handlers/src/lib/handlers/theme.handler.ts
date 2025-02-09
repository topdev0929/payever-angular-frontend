import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { produceWithPatches } from 'immer';
import { merge, Subject } from 'rxjs';
import { catchError, filter, take, takeUntil, tap } from 'rxjs/operators';

import {
  PebCreateEmptyThemeSuccessAction,
  PebWebsocketAction,
  PebCreateEmptyPageAction,
  PebCreateEmptyThemeAction,
} from '@pe/builder/actions';
import { PebWebsocketEventType, PebWebsocketService } from '@pe/builder/api';
import {
  createEmptyDocument,
  createEmptyPage,
  createEmptySections,
  createEmptyTheme,
  PebPageVariant,
} from '@pe/builder/core';
import { defaultUndoState, PebEditorState, PebEditorStateModel, PebSetScriptsAction, PebSetTheme, PebUndoSet } from '@pe/builder/state';
import { BusinessState } from '@pe/user';


@Injectable()
export class PebThemeActionHandler implements OnDestroy {

  private createEmptyTheme$ = this.actions$.pipe(
    ofActionDispatched(PebCreateEmptyThemeAction),
    tap((action: PebCreateEmptyPageAction) => {
      this.createEmptyTheme();
    })
  );

  private destroy$ = new Subject<void>();

  constructor(
    private readonly store: Store,
    private readonly actions$: Actions,
    private readonly router: Router,
    private readonly websocketService: PebWebsocketService,

  ) {
    merge(
      this.createEmptyTheme$,
    ).pipe(
      takeUntil(this.destroy$),
      catchError((err, caught) => {
        console.error(err);

        return caught;
      })
    ).subscribe();
  }

  public createEmptyTheme(): void {
    const business = this.store.selectSnapshot(BusinessState.businessData);
    const theme = createEmptyTheme(`${business.name}-New Theme`);
    const page = createEmptyPage('Front', PebPageVariant.Front);
    const doc = createEmptyDocument();
    const screens = this.store.selectSnapshot(PebEditorState.screens);
    const sections = createEmptySections(doc.id, screens);
    const base: PebEditorStateModel = { theme: {}, editText: { enabled: false } };

    const [state, patches] = produceWithPatches(base, (draft) => {
      draft.theme[theme.id] = {
        ...theme,
        page: {
          [page.id]: {
            ...page,
            element: [doc, ...sections].reduce((acc, elm) => {
              return { ...acc, [elm.id]: { ...elm, versionNumber: 1 } };
            }, {}),
          },
        },
      };
    });

    const action = new PebWebsocketAction(PebWebsocketEventType.JsonPatch, { patches });
    this.store.dispatch(action);
    this.store.dispatch(new PebSetTheme(state));
    this.store.dispatch(new PebUndoSet(defaultUndoState));
    this.store.dispatch(new PebSetScriptsAction([]));
    this.websocketService.messages$.pipe(
      filter(msg => msg.id === action.id),
      take(1),
      tap(() => {
        this.store.dispatch(new PebCreateEmptyThemeSuccessAction());
        this.navigateToTheme(page.id);
      }),
    ).subscribe();
  }

  navigateToTheme(pageId: string) {
    const url = this.router.url.replace('themes', 'edit');
    this.router.navigate([url], { queryParams: { pageId } });
  }

  ngOnDestroy() {
    this.destroy$.next();
  }
}
