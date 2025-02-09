import { Injectable, OnDestroy } from '@angular/core';
import { Actions, Store, ofActionDispatched } from '@ngxs/store';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { catchError, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebRenderPebElementsAction } from '@pe/builder/actions';
import { PebEditorApi } from '@pe/builder/api';
import { PebElementDef } from '@pe/builder/core';
import { PebEditorState, PebGetPageElements, PebSetPageElements } from '@pe/builder/state';

@Injectable()
export class PebElementsActionHandler implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  private getElements$ = this.actions$.pipe(
    ofActionDispatched(PebGetPageElements),
    filter(({ page }: PebGetPageElements) => !!page),
    switchMap(({ page }: PebGetPageElements) => {
      const masterPageId = page.master?.page;

      return forkJoin([
        masterPageId ? this.getPageElements$(page.master?.page) : of(undefined),
        this.getPageElements$(page.id),
      ]).pipe(
        switchMap(([masterElements, elements]) =>
          forkJoin([
            masterElements ? this.store.dispatch(new PebSetPageElements(page.master?.page, masterElements)) : of(undefined),
            this.store.dispatch(new PebSetPageElements(page.id, elements)),
          ])
        ),
        tap(() => this.store.dispatch(new PebRenderPebElementsAction())),
      );
    }),
  );

  constructor(
    private readonly api: PebEditorApi,
    private readonly store: Store,
    private readonly actions$: Actions,
  ) {
    this.getElements$.pipe(
      catchError((err, caught) => {
        console.error(err);

        return caught;
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    const page = this.store.selectSnapshot(PebEditorState.activePage);
    this.store.dispatch(new PebGetPageElements(page));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  private getPageElements$(pageId: string): Observable<{ [id: string]: PebElementDef }> {
    const theme = this.store.selectSnapshot(PebEditorState.theme);
    const page = theme.page[pageId];

    if (page.element && Object.keys(page.element).length > 0) {
      return of(page.element);
    }
    const version = theme.publishedVersion + 1;

    return this.api.getElements(theme.id, page.id, version).pipe(
      map(elements => elements.filter(elm => elm.delete !== true).reduce((acc, elm) => ({ ...acc, [elm.id]: elm }), {})),
    );
  }
}
