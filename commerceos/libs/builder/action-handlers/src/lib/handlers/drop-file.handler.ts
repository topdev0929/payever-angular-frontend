import { Inject, Injectable, OnDestroy, Optional } from '@angular/core';
import { Actions, Select, Store, ofActionDispatched } from '@ngxs/store';
import { EMPTY, Observable, Subject, combineLatest, concat } from 'rxjs';
import { catchError, filter, map, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { PebDropFileAction } from '@pe/builder/actions';
import {
  PebDroppedFileEnum,
  PebElementDef,
  PebElementType,
  PebMediaService,
  PebUploadedFile,
  pebGenerateId,
} from '@pe/builder/core';
import { createElementByUploadedFile, getFillByUploadedFile } from '@pe/builder/editor-utils';
import { PebElement } from '@pe/builder/render-utils';
import { PebElementsState, PebInsertAction, PebUpdateAction } from '@pe/builder/state';
import { APP_TYPE } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PebShopContainer } from '@pe/resources/shared';
import { SnackbarService } from '@pe/snackbar';

@Injectable()
export class PebDropFileActionHandler implements OnDestroy {
  @Select(PebElementsState.selected) private readonly selected!: Observable<PebElement[]>;

  private uploaderResolvers = {
    [PebDroppedFileEnum.Image]: (file: File) => this.uploadImage$(file),
    [PebDroppedFileEnum.Video]: (file: File) => this.uploadVideo$(file),
  };

  private drop$ = this.actions$.pipe(
    ofActionDispatched(PebDropFileAction),
    withLatestFrom(this.selected),
    tap(([{ event }, [selected]]) => this.drop(event, selected)),
  );

  private destroy$ = new Subject<void>();

  constructor(
    private readonly actions$: Actions,
    private readonly mediaService: PebMediaService,
    private readonly store: Store,
    private readonly snackbar: SnackbarService,
    private readonly translateService: TranslateService,
    @Optional() @Inject(APP_TYPE) private entityName,
  ) {
    this.drop$.pipe(
      takeUntil(this.destroy$),
      catchError((err, caught) => {
        console.error(err);

        return caught;
      }),
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  private drop(event: DragEvent, selected: PebElement): void {
    if (!event.dataTransfer.files?.length) {
      return;
    }

    const files = event.dataTransfer.files;

    if (selected.type === PebElementType.Section) {
      this.createElements(files);
    } else {
      this.fillElement(files, selected);
    }
  }

  private fillElement(files: FileList, selected: PebElement): void {
    const file = files[0];
    const fileType = this.getFileType(file);

    if (fileType) {
      this.uploadFile$(file, fileType).pipe(
        filter(uploadedFile => !!uploadedFile),
        tap((uploadedFile) => {
          const fill = getFillByUploadedFile(uploadedFile);
          this.store.dispatch(new PebUpdateAction([{
            id: selected.id,
            styles: { mediaType: fileType, fill },
          }]));
        }),
        take(1)
      ).subscribe();
    }
  }

  private createElements(files: FileList): void {
    const uploads$: Observable<PebUploadedFile>[] = [];

    for (let file of Array.from(files)) {
      const fileType = this.getFileType(file);

      if (fileType === undefined) {
        continue;
      }

      uploads$.push(this.uploadFile$(file, fileType));
    }

    combineLatest(uploads$).pipe(
      filter(file => !!file),
      map(file => this.convertToElementDefs(file)),
      switchMap(elements => concat(elements.map(element =>
        this.store.dispatch(new PebInsertAction([element], { selectInserted: true, sync: true }))))
      ),
      take(1),
    ).subscribe();
  }

  private uploadFile$(file: File, fileType: PebDroppedFileEnum): Observable<PebUploadedFile> {
    const uploader = this.uploaderResolvers[fileType];
    const cancel$ = new Subject();

    const config = {
      content: this.translateService.translate('builder-app.actions.uploading'),
      pending: true,
      hideButtonTitle: this.translateService.translate('builder-app.actions.cancel'),
      hideCallback: () => {
        cancel$.next();
        this.snackbar.hide();
      },
    };
    this.snackbar.toggle(true, config);

    return uploader(file).pipe(
      map(({ blobName, preview }) => ({ url: blobName, preview, fileType, mimeType: file.type })),
      tap(() => this.snackbar.hide()),
      catchError((error) => {
        console.error(error);

        if (error?.error?.message) {
          this.snackbar.toggle(true, {
            content: error?.error?.message,
            duration: 2500,
            iconId: 'icon-commerceos-error',
          });
        }

        return EMPTY;
      }),
      takeUntil(cancel$),
    );
  }

  private convertToElementDefs(files: PebUploadedFile[]): PebElementDef[] {
    return files.map(file => createElementByUploadedFile(file));
  }

  private uploadImage$(file: File): Observable<{ blobName: string; preview: string }> {
    const container = `cdn/${this.entityName}-images`;

    return this.mediaService.uploadImage(file, container, pebGenerateId());
  }

  private uploadVideo$(file: File): Observable<{ blobName: string; preview: string }> {
    const container = PebShopContainer.BuilderVideo;

    return this.mediaService.uploadVideo(file, container);
  }

  private getFileType(file: File): PebDroppedFileEnum | undefined {
    if (file.type.startsWith('image/')) {
      return PebDroppedFileEnum.Image;
    }

    if (file.type.startsWith('video/')) {
      return PebDroppedFileEnum.Video;
    }

    return undefined;
  }
}
