import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil, tap } from 'rxjs/operators';

import { MediaService, PebEditorApi } from '@pe/builder/api';
import { MediaType, PebElementType, isImage, isVideo, isGridLayout } from '@pe/builder/core';
import { PebBackgroundForm, PebBackgroundFormService } from '@pe/builder/forms';
import { PebMediaDialogService } from '@pe/builder/media';
import { PebElement } from '@pe/builder/render-utils';
import { PebSideBarService } from '@pe/builder/services';
import { PebElementsState } from '@pe/builder/state';


@Component({
  selector: 'peb-editor-shapes-sidebar',
  templateUrl: 'shape.sidebar.html',
  styleUrls: [
    '../../../../styles/src/lib/styles/_sidebars.scss',
    './shape.sidebar.scss',
  ],
})
export class PebEditorShapeSidebarComponent implements OnInit, OnDestroy {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;

  @ViewChild('shapeMenu') public shapeMenu: TemplateRef<any>;

  color = 'white';
  mediaType = MediaType;

  editMode$: Observable<boolean>;

  showVideoForm$ = this.selectedElements$.pipe(map(([elm]) => isVideo(elm?.styles?.fill)));
  showImageForm$ = this.selectedElements$.pipe(map(([elm]) => isImage(elm?.styles?.fill)));
  showRadiusForm$ = this.selectedElements$.pipe(map(
    ([elm]) => elm?.parent?.type !== PebElementType.Grid && !elm?.meta?.borderRadiusDisabled));

  showLayoutIndexForm$ = this.selectedElements$.pipe(
    filter(elements => !!elements?.length),
    map(([elm]) => isGridLayout(elm.parent?.styles?.layout)),
  );

  backgroundForm = this.backgroundFormService.backgroundForm;
  
  private readonly destroy$ = new Subject<void>();

  activeMediaType$ = this.backgroundFormService.activeMediaType$;
  background$ = this.backgroundFormService.preview$;

  isCell = false;


  constructor(
    public api: PebEditorApi,
    public mediaService: MediaService,
    public dialog: MatDialog,
    private mediaDialogService: PebMediaDialogService,
    private readonly sidebarService: PebSideBarService,
    private backgroundFormService: PebBackgroundFormService,
  ) {
  }

  ngOnInit() {
    this.backgroundFormService.init();
    this.selectedElements$.pipe(
      filter(elements => elements?.length > 0),
      tap(([element]) => {
        this.isCell = element.parent?.type === PebElementType.Grid;
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

  getMaxBorderRadius(): number {
    return 0;
  }

  showBackgroundForm() {
    this.sidebarService.openDetail(PebBackgroundForm, { backTitle: 'Style', title: 'Fill' });
  }

  onSubmit() {
    this.backgroundFormService.submit$.next(true);
  }

  ngOnDestroy(): void {
    this.backgroundFormService.destroy$.next();
    this.destroy$.next();
  }
}
