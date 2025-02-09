import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Select } from '@ngxs/store';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';

import { PebScreen } from '@pe/builder/core';
import { fromResizeObserver } from '@pe/builder/editor-utils';
import { PebEditorState } from '@pe/builder/state';
import { PeDestroyService } from '@pe/common';

export interface PreviewDialogData {
  themeSnapshot: any;
  screen: PebScreen;
}

@Component({
  selector: 'peb-viewer-preview-dialog',
  templateUrl: './preview.dialog.html',
  styleUrls: ['./preview.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebViewerPreviewDialog implements AfterViewInit {
  frameScreenType$: BehaviorSubject<PebScreen>;
  activeScreen$: Observable<PebScreen>;
  themeSnapshot: any;

  @ViewChild('frameWrapper')
  private frameWrapper: ElementRef;

  @Select(PebEditorState.screens) screens$!: Observable<PebScreen[]>;

  readonly viewInit$ = new Subject<void>();

  readonly deviceFrameTransform$ = this.viewInit$.pipe(
    switchMap(() => fromResizeObserver(this.frameWrapper.nativeElement)),
    map((ds) => {
      const screen = this.frameScreenType$.value;

      return ds.width < screen.width ?
        `scale(${ds.width / screen.width})` : `scale(1)`;
    }),
    takeUntil(this.destroy$),
  );

  readonly deviceFrameHeight$ = this.viewInit$.pipe(
    switchMap(() => fromResizeObserver(this.frameWrapper.nativeElement)),
    map((ds) => {
      const screen = this.frameScreenType$.value;

      return ds.width < screen.width ?
        `calc(100% / ${ds.width / screen.width})` : '100%';
    }),
    takeUntil(this.destroy$),
  )

  constructor(
    private dialogRef: MatDialogRef<PebViewerPreviewDialog>,
    readonly destroy$: PeDestroyService,
    @Inject(MAT_DIALOG_DATA) data: PreviewDialogData,
    private iconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
  ) {
    this.themeSnapshot = data.themeSnapshot;
    this.frameScreenType$ = new BehaviorSubject<PebScreen>(data.screen);
    this.activeScreen$ = this.frameScreenType$.asObservable();

    iconRegistry.addSvgIcon(
      'preview-back',
      domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/general/preview-back.svg`),
    );
  }

  ngAfterViewInit() {
    this.viewInit$.next();
  }

  close() {
    this.dialogRef.close();
  }

  changeScreenType(screen?: PebScreen) {
    this.frameScreenType$.next(screen);
  }

  applyImport() {
    this.dialogRef.close({ applyImport: true });
  }
}
