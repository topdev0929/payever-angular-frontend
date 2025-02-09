import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { catchError, takeUntil, tap } from 'rxjs/operators';

import { PebPage } from '@pe/builder/core';
import { PebEditorState, PebPagesState, PebSetSidebarsAction } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';
import { SnackbarService } from '@pe/snackbar';


@Component({
  selector: 'peb-master-page-toolbar',
  templateUrl: 'master-page-toolbar.component.html',
  styleUrls: ['master-page-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [],
})
export class PebMasterPageToolbarComponent {
  masterPage: PebPage;
  @Select(PebPagesState.activePage) readonly activePage$!: Observable<PebPage>;

  private readonly selectPage$ = this.activePage$.pipe(
    tap((page) => {
      this.masterPage = page;
      this.snackbarService.hide();
      this.isHidden$.next(false);
    }),
  );

  isHidden$ = new BehaviorSubject(false);

  constructor(
    private readonly store: Store,
    private router: Router,
    private readonly destroy$: PeDestroyService,
    private snackbarService: SnackbarService,
  ) {
    merge(
      this.selectPage$,
    ).pipe(
      takeUntil(this.destroy$),
      catchError((err, caught) => {
        console.error(err);

        return caught;
      }),
    ).subscribe();
  }

  done() {
    this.snackbarService.hide();
    this.store.dispatch(new PebSetSidebarsAction({ navigator: true }));

    let pageId = this.store.selectSnapshot(PebEditorState.activeChildPageId);

    if (!pageId) {
      const pages = Object.values(this.store.selectSnapshot(PebEditorState.pages));
      pageId = (pages.find(page => page.master?.page === this.masterPage.id) ?? pages[0]).id;
    }

    this.router.navigate([], { queryParams: { pageId } });
  }
}
