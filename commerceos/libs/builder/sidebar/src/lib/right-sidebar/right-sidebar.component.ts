import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable, ReplaySubject, merge } from 'rxjs';
import { distinctUntilChanged, filter, map, shareReplay, take, takeUntil, tap } from 'rxjs/operators';

import { PebElementType, PebPage } from '@pe/builder/core';
import { isReadonly, PebElement } from '@pe/builder/render-utils';
import { PebSideBarService } from '@pe/builder/services';
import {
  PebElementsState,
  PebInspectorState,
  PebInspectorStateModel,
  PebMainTab,
  PebPagesState,
  PebSetInspectorAction,
} from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'peb-editor-right-sidebar',
  templateUrl: './right-sidebar.component.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './right-sidebar.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class PebEditorRightSidebarComponent {

  @Select(PebInspectorState.inspector) private readonly inspectorSidebar$!: Observable<PebInspectorStateModel>;
  @Select(PebPagesState.activePage) private readonly page$: Observable<PebPage>;
  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  @ViewChild('detailSlot', { read: ViewContainerRef, static: true })
  public detailSlot: ViewContainerRef;

  mainTab$ = new ReplaySubject<PebMainTab>(1);
  isDetail$ = new ReplaySubject<boolean>(1);
  sidebarHidden$ = new ReplaySubject<boolean>(1);

  isReadonly$ = this.selectedElements$.pipe(map(elements => elements.some(isReadonly)));

  readonly tabs = Object.values(PebMainTab);
  elementType = PebElementType;

  header?: { title?: string, backTitle?: string };

  multipleSelection$ = this.selectedElements$.pipe(
    map(elements => elements.length > 1),
    shareReplay(),
  );

  singleSelectionType$ = this.selectedElements$.pipe(
    filter(elements => elements.length === 1),
    distinctUntilChanged(([previous], [current]) => current.id === previous.id),
    map(([element]) => element.type),
    tap(() => {
      const { secondaryTab } = this.store.selectSnapshot(PebInspectorState.inspector);
      this.sidebarService.clear();
      this.store.dispatch(new PebSetInspectorAction({ secondaryTab, isDetail: false }));
    }),
    shareReplay(),
  );

  constructor(
    private readonly destroy$: PeDestroyService,
    private readonly sidebarService: PebSideBarService,
    private readonly store: Store,
  ) {
    this.page$.pipe(
      filter(page => !!page),
      take(1),
      tap(() => {
        this.init();
      }),
    ).subscribe();
  }

  init() {
    const detailInsertion$ = this.sidebarService.insertDetail$.pipe(
      tap(({ viewRef, header }) => {
        this.header = header;
        this.detailSlot?.detach();
        this.detailSlot?.insert(viewRef);
      }),
    );

    const inspectorSidebar$ = this.inspectorSidebar$.pipe(
      tap(({ mainTab, isDetail }) => {
        this.mainTab$.next(mainTab);
        this.isDetail$.next(isDetail);
        this.sidebarHidden$.next(isDetail);
      }),
    );

    merge(
      inspectorSidebar$,
      detailInsertion$,
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  backTo(): void {
    this.sidebarService.back();
  }

  selectTab(mainTab) {
    this.sidebarService.selectMainTab(mainTab);
  }
}
