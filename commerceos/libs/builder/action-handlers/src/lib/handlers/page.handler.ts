import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { merge, Subject } from 'rxjs';
import { catchError, filter, take, takeUntil, tap } from 'rxjs/operators';

import { PebCreateEmptyPageAction } from '@pe/builder/actions';
import {
  createEmptyDocument,
  createEmptyMasterSections,
  createEmptySections,
  pebGenerateId,
  PebPage,
  PebPageVariant,
} from '@pe/builder/core';
import { uniquePageName } from '@pe/builder/editor-utils';
import { getNormalizedKey } from '@pe/builder/render-utils';
import {
  PebDeselectAllAction,
  PebInsertPageAction,
  PebPagesState,
  PebSetActivePage,
  PebEditorState,
} from '@pe/builder/state';
import { PebViewIntegrationClearCacheAction, PebViewQueryPatchAction } from '@pe/builder/view-actions';

@Injectable()
export class PebPageActionHandler implements OnDestroy {

  private createEmptyPage$ = this.actions$.pipe(
    ofActionDispatched(PebCreateEmptyPageAction),
    tap((action: PebCreateEmptyPageAction) => {
      const { payload } = action;

      this.createEmptyPage(payload.isMaster ?? false, payload.masterPage);
    })
  );

  private handleRoute$ = this.route.queryParams.pipe(
    filter(params => params.pageId),
    tap((params) => {
      const pageId = params.pageId;
      this.store.dispatch(new PebViewQueryPatchAction({ urlParameters: params }));
      const activePage = this.store.selectSnapshot(PebEditorState.activePage);

      if (!activePage || activePage.id !== pageId) {
        this.store.dispatch([
          new PebDeselectAllAction(),
          new PebSetActivePage(pageId),
          new PebViewIntegrationClearCacheAction(),
        ]);
      }
    }),
  );

  private destroy$ = new Subject<void>();

  constructor(
    private readonly store: Store,
    private readonly actions$: Actions,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    merge(
      this.createEmptyPage$,
      this.handleRoute$,
    ).pipe(
      takeUntil(this.destroy$),
      catchError((err, caught) => {
        console.error(err);

        return caught;
      })
    ).subscribe();
  }

  createEmptyPage(isMaster: boolean, masterPageId?: string): void {
    const pages = this.store.selectSnapshot(PebPagesState.pages);
    const masterPage = masterPageId ? pages.find(page => page.id === masterPageId) : undefined;
    const page = this.getEmptyPage(masterPage?.id, isMaster);

    this.store.dispatch(new PebDeselectAllAction());
    this.store.dispatch(new PebInsertPageAction(pages.length, page as PebPage)).pipe(
      tap(() => this.navigateToPage(page.id)),
      take(1),
    ).subscribe();
  }

  private navigateToPage(pageId: string): void {
    this.router.navigate([], { queryParams: { pageId } });
  }

  private getEmptyPage(
    masterPageId: string | undefined,
    isMaster: boolean,
  ): PebPage {
    const pages = this.store.selectSnapshot(PebPagesState.pages);
    const document = createEmptyDocument();
    const screens = this.store.selectSnapshot(PebEditorState.screens);
    const sections = isMaster
      ? createEmptyMasterSections(document.id, screens)
      : createEmptySections(document.id, screens);

    const name = uniquePageName(isMaster ? 'Master Page' : 'Blank page', pages.map(p => p.name));
    const url = '/' + getNormalizedKey(name);
    const pageId = pebGenerateId();

    const pageElements = [document, ...sections].reduce((acc, elm) => ({ ...acc, [elm.id]: elm }), {});

    const page: PebPage = {
      id: pageId,
      variant: pages.find(page => page.variant === PebPageVariant.Front)
        ? PebPageVariant.Default
        : PebPageVariant.Front,
      name,
      element: pageElements,
      master: { isMaster, page: masterPageId },
      next: null,
      prev: null,
      preview: undefined,
      restrictAccess: undefined,
      seo: undefined,
      updatedAt: new Date(),
      url,
      versionNumber: 0,
    };

    return page;
  }

  ngOnDestroy() {
    this.destroy$.next();
  }
}
