import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { combineLatest, iif, Observable, of, Subject } from 'rxjs';
import { filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder/api';
import {
  pebGenerateId,
  PebPage,
  PebPageVariant,
  PebScreen,
} from '@pe/builder/core';
import { uniquePageName } from '@pe/builder/editor-utils';
import { clonePlainObject } from '@pe/builder/render-utils';
import {
  PebArrangePagesAction,
  PebDeletePageAction,
  PebDeselectAllAction,
  PebInsertPageAction,
  PebOptionsState,
  PebPagesState,
  PebEditorState,
  PebSetActivePage,
} from '@pe/builder/state';
import { PebViewIntegrationClearCacheAction } from '@pe/builder/view-actions';

import { cloneElementsTree, PebPageListItem } from './page-list';


@Injectable()
export class PebPageListService implements OnDestroy {
  @Select(PebPagesState.pages) private readonly pages$!: Observable<PebPage[]>;
  @Select(PebPagesState.activePage) private readonly activePage$!: Observable<PebPage>;
  @Select(PebOptionsState.screen) private readonly screen$!: Observable<PebScreen>;

  private readonly destroy$ = new Subject<void>();

  readonly allPages$: Observable<PebPageListItem[]> = combineLatest([
    this.activePage$.pipe(filter(page => !!page)),
    this.screen$,
  ]).pipe(
    switchMap(([activePage, screen]) => this.pages$.pipe(
      map(pages => pages.map(page => this.toPageListItem(page, screen.key, page.id === activePage.id))),
      map(pages => this.toPageTreeItem(pages)),
    )),
  );

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly store: Store,
    private readonly api: PebEditorApi,
  ) {
  }

  private toPageListItem(page: PebPage, screen: string, active: boolean): PebPageListItem {
    return {
      id: page.id,
      name: page.name,
      preview: page.preview?.[screen] ?? '',
      active,
      variant: page.variant,
      master: { isMaster: false, ...page.master },
      parentId: page.parentId,
      prev: page.prev,
      next: page.next,
      page,
      children: [],
    };
  }

  private toPageTreeItem(pages: PebPageListItem[]): PebPageListItem[] {
    const pageMap = new Map(pages.map(page => [page.id, page]));
    const result: PebPageListItem[] = [];
    for (const page of pages) {
      if (page.parentId) {
        const parent = pageMap.get(page.parentId);
        parent?.children.push(page);
        page.parent = parent;
      } else {
        result.push(page);
      }
    }

    return result;
  }

  deletePage(pageId: string): void {
    const pages = this.store.selectSnapshot(PebPagesState.pages);
    const index = pages.findIndex(p => p.id === pageId);
    if (index < 0) {
      return;
    }

    const activePage = this.store.selectSnapshot(PebPagesState.activePage);
    const page = pages[index];

      this.store.dispatch(new PebDeletePageAction(pageId));

    if (activePage.id === page.id) {
      page.parentId
        ? this.navigateToParentPage(page)
        : this.navigateToPreviousPage(index);
    }
  }

  duplicatePage(pageId: string): void {
    const pages = this.store.selectSnapshot(PebPagesState.pages);
    const index = pages.findIndex(p => p.id === pageId);

    if (index !== -1) {
      const source = clonePlainObject(pages[index]);
      const pageId = pebGenerateId();

      const page: PebPage = {
        ...source,
        id: pageId,
        name: `${uniquePageName(source.name, pages.map(p => p.name))} (Duplicate)`,
        variant: source.variant === PebPageVariant.Front ? PebPageVariant.Default : source.variant,
      };

      iif(
        () => Object.keys(page.element).length === 0,
        this.store.select(PebEditorState.theme).pipe(
          take(1),
          switchMap(theme => this.api.getElements(theme.id, source.id, theme.publishedVersion + 1)),
        ),
        of(Object.values(source.element)),
      ).pipe(
        map((elements) => {
          return cloneElementsTree(elements).reduce((acc, elm) => ({ ...acc, [elm.id]: elm }), {});
        }),
        tap((elements) => {
          const clone = { ...page, element: elements };
          this.store.dispatch([
            new PebViewIntegrationClearCacheAction(),
            new PebDeselectAllAction(),
            new PebInsertPageAction(index + 1, clone),
            new PebSetActivePage(clone.id),
          ]);

          this.navigateToPage(clone.id);
        }),
        take(1),
        takeUntil(this.destroy$),
      ).subscribe();
    }
  }

  arrangePages(previousIndexId: string, currentIndexId: string) {
    if (previousIndexId !== currentIndexId) {
      this.store.dispatch(new PebArrangePagesAction(previousIndexId, currentIndexId));
    }
  }

  navigateToPreviousPage(index: number) {
    const pages = this.store.selectSnapshot(PebPagesState.pages);
    const page = pages[Math.max(0, index - 1)];
    this.navigateToPage(page.id);
  }

  navigateToParentPage(page: PebPage) {
    this.navigateToPage(page.parentId);
  }

  private navigateToPage(pageId: string): void {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { pageId },
      queryParamsHandling: 'merge',
    }).then();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }
}
