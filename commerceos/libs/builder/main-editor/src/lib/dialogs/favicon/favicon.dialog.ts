import { HttpEvent, HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, TemplateRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

import { PebEditorState, PebUpdateThemeFavicon } from '@pe/builder/state';
import { EnvService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { BlobCreateResponse, MediaContainerType, MediaService } from '@pe/media';
import { SnackbarService } from '@pe/snackbar';


@Component({
  selector: 'peb-favicon',
  templateUrl: './favicon.dialog.html',
  styleUrls: ['./favicon.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PebEditorFaviconDialog {
  @Select(PebEditorState.favicon) private readonly favicon$!: Observable<string>;
  public readonly uploaded$ = new BehaviorSubject<boolean>(false);

  filename: string;
  title = 'Favicon';
  confirmDialogRef: MatDialogRef<any>;
  @ViewChild('confirmDialogTpl') confirmDialogTpl: TemplateRef<any>;

  constructor(
    private dialogRef: MatDialogRef<PebEditorFaviconDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private mediaService: MediaService,
    private cdr: ChangeDetectorRef,
    private store: Store,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private envService: EnvService,
  ) {
    this.favicon$.pipe(
      filter(favicon => !!favicon),
      tap((favicon) => {
        this.filename = favicon.split('/').pop();
      })
    ).subscribe();
  }

  get previewImageUrl(): string {
    return this.mediaService.getMediaUrl(this.filename, 'images');
  }

  submitForm(): void {
    this.store.dispatch(new PebUpdateThemeFavicon(this.previewImageUrl));
    this.dialogRef.close();
    this.snackbarService.toggle(true, {
      content: this.translateService.translate('Success! Your favicon has been set.'),
      duration: 3000,
      iconId: 'icon-commerceos-success',
      iconSize: 24,
    });

  }

  uploadImage($event) {
    const file = $event[0];
    if (!file) {
      return;
    }

    this.mediaService
      .createBlobByBusiness(
        this.envService.businessId,
        MediaContainerType.Images,
        file,
      ).pipe(
        filter((event: HttpEvent<BlobCreateResponse>) =>
          event.type === HttpEventType.Response)
      ).subscribe((res: any) => {
        this.filename = res.body.blobName;
        this.cdr.detectChanges();
    });
    
    this.uploaded$.next(true);
  }

  closeForm() {
    this.confirmDialogRef = this.dialog.open(this.confirmDialogTpl, {
      panelClass: ['favicon-dialog__panel'],
      maxWidth: '300px',
    });
    this.confirmDialogRef.afterClosed().subscribe((ans) => {
      if (ans) {
        this.dialogRef.close();
      }
      this.confirmDialogRef = undefined;
    });
  }
}
