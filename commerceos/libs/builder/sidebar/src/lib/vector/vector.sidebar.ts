import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';

import { MediaService, PebEditorApi } from '@pe/builder/api';
import { MediaType, isImage } from '@pe/builder/core';
import { PebBackgroundForm, PebBackgroundFormService } from '@pe/builder/forms';
import { PebMediaDialogService } from '@pe/builder/media';
import { PebElement } from '@pe/builder/render-utils';
import { PebSideBarService } from '@pe/builder/services';
import { PebElementsState, PebSecondaryTab } from '@pe/builder/state';


@Component({
  selector: 'peb-editor-vector-sidebar',
  templateUrl: 'vector.sidebar.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './vector.sidebar.scss',
  ],
})
export class PebEditorVectorSidebarComponent implements OnInit, OnDestroy {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  @ViewChild('shapeMenu') public shapeMenu: TemplateRef<any>;

  activeTab = PebSecondaryTab.Style;

  color = 'white';
  mediaType = MediaType;
  activeTabIndex$ = new BehaviorSubject<number>(0);

  editMode$: Observable<boolean>;

  showImageForm$ = this.selectedElements$.pipe(map(([elm]) => isImage(elm?.styles?.fill)));

  backgroundForm = this.backgroundFormService.backgroundForm;
  
  private readonly destroy$ = new Subject<void>();

  activeMediaType$ = this.backgroundFormService.activeMediaType$;
  background$ = this.backgroundFormService.preview$;

  constructor(
    public readonly api: PebEditorApi,
    public readonly mediaService: MediaService,
    public readonly dialog: MatDialog,
    private readonly mediaDialogService: PebMediaDialogService,
    private readonly sidebarService: PebSideBarService,
    private readonly backgroundFormService: PebBackgroundFormService,
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

  changeBgInputHandler($event) {
    const files = $event.target.files as FileList;
    if (files.length > 0) {
      const file = files[0];
      this.backgroundForm.controls.file.markAsDirty();
      this.backgroundForm.controls.file.patchValue(file);
    }
  }

  openStudio(): void {
    const dialog = this.mediaDialogService.openMediaDialog();

    dialog.afterClosed().pipe(
      takeUntil(this.destroy$),
      filter(data => data && data !== ''),
    ).subscribe((data) => {
      if (data && data !== '') {
        this.backgroundForm.get('bgImage').markAsDirty();
        this.backgroundForm.get('bgImage').patchValue(data.thumbnail);
      }
    });
  }

  showBackgroundNewForm() {
    this.sidebarService.openDetail(
      PebBackgroundForm,
      { backTitle: 'Style', title: 'Fill' },
    );
  }

  onSubmit() {
    this.backgroundFormService.submit$.next(true);
  }

  ngOnDestroy(): void {
    this.backgroundFormService.destroy$.next();
    this.destroy$.next();
  }
}
