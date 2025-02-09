import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { elementsDefaults } from '@pe/builder/abstract';
import { MediaService, PebEditorApi } from '@pe/builder/api';
import { MediaType } from '@pe/builder/core';
import { PebBackgroundForm, PebBackgroundFormService } from '@pe/builder/forms';
import { PebElement } from '@pe/builder/render-utils';
import { PebSideBarService } from '@pe/builder/services';
import {
  PebElementsState,
  PebInsertAction,
  PebSecondaryTab,
} from '@pe/builder/state';


@Component({
  selector: 'peb-editor-section-sidebar',
  templateUrl: 'section.sidebar.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './section.sidebar.scss',
  ],
})
export class PebEditorSectionSidebarComponent implements OnInit, OnDestroy {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  activeTab = PebSecondaryTab.Section;

  mediaType = MediaType;

  activeMediaType$ = this.backgroundFormService.activeMediaType$;
  background$ = this.backgroundFormService.preview$;

  private readonly destroy$ = new Subject<void>();

  constructor(
    public sanitizer: DomSanitizer,
    public api: PebEditorApi,
    public mediaService: MediaService,
    public dialog: MatDialog,
    private sideBarService: PebSideBarService,
    private store: Store,
    private backgroundFormService: PebBackgroundFormService,
  ) {
  }

  ngOnInit() {
    this.backgroundFormService.init();

    this.selectedElements$.pipe(
      filter(elements => elements?.length > 0),
      tap(([element]) => {
        this.backgroundFormService.activeMediaType$.next(element.styles.mediaType);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.backgroundFormService.destroy$.next();
    this.destroy$.next();
  }

  addSection(): void {
    this.store.dispatch(new PebInsertAction([elementsDefaults.section], { selectInserted: true, sync: true }));
  }

  showBackgroundForm() {
    this.sideBarService.openDetail(PebBackgroundForm, { backTitle: 'Style', title: 'Fill' });
  }
}
