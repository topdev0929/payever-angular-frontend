import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { catchError, switchMap, takeUntil, tap } from 'rxjs/operators';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { BehaviorSubject } from 'rxjs';
import { HttpEventType } from '@angular/common/http';

import { PebEditorApi } from '@pe/builder-api';
import { PebShopContainer, PebTheme } from '@pe/builder-core';
import { TranslateService } from '@pe/i18n';
import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'pe-builder-publish',
  templateUrl: './builder-publish.component.html',
  styleUrls: ['./builder-publish.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeSubscriptionBuilderPublishComponent implements OnInit {
  loading = true;
  errorMsg = '';
  publishing: boolean;
  theme;
  preview;
  activeVersion: string;
  tags: string[] = [];

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  @ViewChild('fileInput') fileInput: ElementRef;
  isLargeThenParent = false;
  readonly isPictureLoadingSubject = new BehaviorSubject(true);
  uploadProgress = 0;

  constructor(
    public dialogRef: MatDialogRef<PeSubscriptionBuilderPublishComponent>,
    private editorApi: PebEditorApi,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
    private destroyed$: PeDestroyService,
  ) {}

  ngOnInit() {
    this.editorApi.getShopActiveTheme().subscribe(
      (data: any) => this.getSnapshot(data.theme),
      () => {
        this.errorMsg = this.translateService.translate(`header.unknown_publish_error`);
        this.loading = false;
      },
    );
  }

  getSnapshot(themeId) {
    this.editorApi
      .getShopThemeById(themeId)
      .pipe(
        switchMap((theme: PebTheme) => {
          this.theme = theme;
          if (!theme.picture) { this.isPictureLoadingSubject.next(false); }
          return this.editorApi.getThemeDetail(theme.id, 'front');
        }),
        switchMap((data) => {
          return this.editorApi.getPage(themeId, data.pages[0].id, 'desktop');
        }),
        tap((data) => {
          this.preview = data;
        }),
        switchMap((data) => {
          return this.editorApi.getShopThemeActiveVersion(themeId);
        }),
        tap((data: any) => {
          this.activeVersion = data?.id;
          this.tags = data?.tags.length ? data.tags : [];
          this.loading = false;
          this.cdr.detectChanges();
        }),
        catchError((err) => {
          this.errorMsg = this.errorMsg = this.translateService.translate(`header.unknown_publish_error`);
          this.loading = false;
          this.cdr.detectChanges();
          return this.errorMsg;
        }),
      )
      .subscribe();
  }

  onCloseClick() {
    this.dialogRef.close();
  }

  updateThemeName(event) {
    this.editorApi.updateShopThemeName(this.theme.id, event).subscribe((data: any) => (this.theme = data.theme));
  }

  publish() {
    this.dialogRef.close(true);
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    if ((value || '').trim()) {
      this.tags.push(value.trim());
    }

    if (input) {
      input.value = '';
    }
    this.editorApi.updateThemeVersion(this.theme.id, this.activeVersion, { tags: this.tags }).subscribe();
  }

  remove(index): void {
    if (index >= 0) {
      this.tags.splice(index, 1);
      this.editorApi.updateThemeVersion(this.theme.id, this.activeVersion, { tags: this.tags }).subscribe();
    }
  }

  onImageUpload($event: any) {
    const files = $event.target.files as FileList;
    if (files.length > 0) {
      this.isLargeThenParent = false;
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      this.fileInput.nativeElement.value = '';
      reader.onload = () => {
        this.isPictureLoadingSubject.next(true);
        this.editorApi
          .uploadImageWithProgress(PebShopContainer.Images, file)
          .pipe(
            takeUntil(this.destroyed$),
            tap(
              (event) => {
                switch (event.type) {
                  case HttpEventType.UploadProgress: {
                    this.uploadProgress = event.loaded;
                    this.cdr.detectChanges();
                    break;
                  }
                  case HttpEventType.Response: {
                    this.uploadProgress = 0;
                    this.updateThemeImage(event?.body?.blobName);
                    this.cdr.detectChanges();
                    break;
                  }
                  default:
                    break;
                }
              },
              () => {
                this.isPictureLoadingSubject.next(false);
              },
            ),
          )
          .subscribe();
      };
    }
  }

  updateThemeImage(image) {
    this.editorApi.updateShopThemePreview(this.theme.id, image).subscribe(
      (data) => {
        this.theme = data;
        this.cdr.markForCheck();
        this.isPictureLoadingSubject.next(false);
      },
      () => {
        this.isPictureLoadingSubject.next(false);
      },
    );
  }

  onload() {
    this.isPictureLoadingSubject.next(false);
  }
}
