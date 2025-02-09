import { HttpEventType } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, ElementRef, Inject, Optional, ViewChild } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { produceWithPatches } from 'immer';
import { uniqBy } from 'lodash';
import { BehaviorSubject, fromEvent, merge, Observable, of, combineLatest } from 'rxjs';
import { catchError, filter, map, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { PebPublishAction, PebPublishedAction } from '@pe/builder/actions';
import { PebEditorApi } from '@pe/builder/api';
import { BackgroundActivityService } from '@pe/builder/background-activity';
import {
  PebEnvService,
  PebLanguageEnum,
  PebPage,
  PebPageType,
  PebPageVariant,
  PebScreen,
  PebScript,
  PebShopThemeVersion,
} from '@pe/builder/core';
import {
  PebApplyPatches,
  PebEditorState,
  PebOptionsState,
  PebPagesState,
  PebScriptsState,
} from '@pe/builder/state';
import {   MessageBus, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PebShopContainer } from '@pe/resources/shared';
import { SnackbarConfig, SnackbarService } from '@pe/snackbar';

import { PebReviewPublishComponent } from '../review-publish.component';


export interface PebEditorPublishDialogData {
  appId: string;
}

@Component({
  selector: 'peb-publish-dialog',
  templateUrl: './publish-dialog.component.html',
  styleUrls: ['./publish-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
  ],
})
export class PebEditorPublishDialogComponent {

  @Select(PebOptionsState.screen) screen$!: Observable<PebScreen>;
  @Select(PebEditorState.theme) readonly theme$!: Observable<any>;
  @Select(PebEditorState.publishedVersion) private readonly publishedVersion$!: Observable<any>;
  @Select(PebPagesState.pages) private readonly pages$!: Observable<PebPage[]>;
  @Select(PebScriptsState.scriptList({ includeDeleted: true })) private readonly scripts$!: Observable<PebScript[]>;

  disabled$ = combineLatest([this.pages$, this.scripts$, this.theme$, this.publishedVersion$]).pipe(
    map(([pages, scripts, theme, publishedVersion]) => {
      return publishedVersion
        && theme.versionNumber <= publishedVersion
        && !pages.some(p => p.versionNumber > publishedVersion)
        && !scripts.some(s => s.versionNumber > publishedVersion);
    }));

  preview$ = this.theme$.pipe(
    withLatestFrom(this.screen$),
    map(([theme, screen]) => {
      if (theme.picture) {
        return theme.picture;
      }

      const pages = this.store.selectSnapshot(PebPagesState.pages);
      const page = pages.find(p => p.variant === PebPageVariant.Front) ?? pages[0];

      return page?.preview?.[screen.key] ?? null;
    }),
  );

  previewLoading$ = this.preview$.pipe(
    switchMap((preview) => {
      if (preview) {
        const img = new Image();
        img.src = preview;

        return merge(
          of(true),
          fromEvent(img, 'load').pipe(map(() => false))
        );
      }

      return of (false);
    })
  );

  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;

  readonly publishing$ = new BehaviorSubject(false);
  readonly loading$ = new BehaviorSubject(false);
  readonly pictureLoading$ = new BehaviorSubject(false);
  readonly uploadProgress$ = new BehaviorSubject(100);
  readonly isReviewEnabledSubject$ = new BehaviorSubject<boolean>(localStorage.getItem('review_enabled') === 'true');
  readonly isReviewEnabled$ = this.isReviewEnabledSubject$.pipe(
    tap(value => localStorage.setItem('review_enabled', value.toString())),
  );

  publishedUrl: string;

  language: PebLanguageEnum;

  readonly activeThemeVersion$ = new BehaviorSubject<PebShopThemeVersion>(null);

  get activeThemeVersion() {
    return this.activeThemeVersion$.getValue();
  }

  readonly isNewTheme$ = this.activeThemeVersion$.pipe(
    map(theme => theme === null),
  );

  readonly isNotNewTheme$ = this.activeThemeVersion$.pipe(
    map(theme => theme !== null),
  );

  get reviewable() {
    return this.activeThemeVersion?.published;
  }

  readonly tags$ = new BehaviorSubject<string[]>([]);

  get tags() {
    return this.tags$.getValue();
  }

  set tags(value) {
    this.tags$.next(value);
  }

  readonly hasActiveTask$ = this.backgroundActivityService.hasActiveTasks$;

  readonly showDescription$ = combineLatest([
    this.isNotNewTheme$,
    this.isNewTheme$,
  ]).pipe(
    map(([isNotNewTheme, isNewTheme]) => isNotNewTheme || isNewTheme),
  );

  constructor(
    private dialogRef: MatDialogRef<PebEditorPublishDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private dialogData: PebEditorPublishDialogData,
    private readonly editorApi: PebEditorApi,
    private readonly pebEnvService: PebEnvService,
    private readonly destroy$: PeDestroyService,
    private readonly dialog: MatDialog,
    private readonly messageBus: MessageBus,
    private readonly env: PeAppEnv,
    private readonly translateService: TranslateService,
    private backgroundActivityService: BackgroundActivityService,
    private store: Store,
    private actions$: Actions,
    private snackbarService: SnackbarService,
    matIconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
  ) {
    matIconRegistry.addSvgIcon(
      'app-small-icon',
      domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/app-small-icon.svg`),
    );
  }

  publish(): void {
    this.dialogRef.close();

    const config: SnackbarConfig = {
      content: this.translateService.translate('builder-app.publish.publishing'),
      pending: true,
      duration: 50000,
    };
    this.snackbarService.toggle(true, config);

    this.actions$.pipe(
      ofActionDispatched(PebPublishedAction),
      tap(() => {
        this.snackbarService.hide();
        const config: SnackbarConfig = {
          boldContent: this.translateService.translate('builder-app.publish.success'),
          content: this.translateService.translate('builder-app.publish.published'),
          duration: 5000,
          useShowButton: true,
          iconId: 'icon-commerceos-success',
          iconSize: 24,
          iconColor: '#00B640',
          showButtonAction: () => {
            this.openPublished();
          },
        };
        this.snackbarService.toggle(true, config);
        const state = this.store.selectSnapshot(PebEditorState.state);
        const [theme] = Object.values(state.theme);
        const [, patches] = produceWithPatches(state, (draft) => {
          draft.theme[theme.id].publishedVersion = theme.publishedVersion + 1;
        });
        this.store.dispatch(new PebApplyPatches(patches));
      }),
      take(1),
    ).subscribe();

    const themeId = this.store.selectSnapshot(PebEditorState.themeId);
    this.store.dispatch(new PebPublishAction({ themeId }));
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  updateThemeName(name: string) {
    this.store.selectSnapshot(PebEditorState.theme);
  }

  onPublish(): void {
    let pages = [];
    const isReviewEnabled = this.isReviewEnabledSubject$.getValue();
    this.publishing$.next(true);


    const publishing$ = this.editorApi.getCurrentPreview(this.dialogData.appId, true, false).pipe(
      switchMap(({ current, published }) => {
        const curr = { pages: current.pages, snapshot: current };
        if (published?.pages) {
          const totalPages = uniqBy([...curr.pages, ...published.pages], 'id');
          const samePages = totalPages.filter((page) => {
            const currentPage = curr.pages.find(p => p.id === page.id);
            const publishedPage = published.pages.find(p => p.id === page.id);

            return currentPage?.updatedAt === publishedPage?.updatedAt;
          });
          pages = totalPages.filter((page) => {
            if (page.type === PebPageType.Replica) {
              return !samePages.includes(page);
            }

            return false;
          });
        } else {
          pages = curr.pages;
        }

        if (!this.reviewable || !isReviewEnabled) {
          return of(true);
        } else {
          const dialogData = {
            published,
            totalPages: pages,
            current: curr,
          };

          const dialogRef = this.dialog.open(PebReviewPublishComponent, {
            height: '82.3vh',
            maxHeight: '82.3vh',
            maxWidth: '78.77vw',
            width: '78.77vw',
            panelClass: ['review-publish-dialog'],
            data: { ...dialogData },
          });

          dialogRef.backdropClick().pipe(
            tap(() => dialogRef.close()),
            takeUntil(dialogRef.componentInstance.destroy$),
          ).subscribe();

          return dialogRef.beforeClosed();
        }
      }),
      catchError((err) => {
        console.error(err);

        return of(false);
      }),
    );

    publishing$.pipe(
      take(1),
      tap(() => {
        this.dialogRef.close();
      }),
      filter(r => !!r),
      switchMap(() => {
        const config: SnackbarConfig = {
          content: this.translateService.translate('builder-app.publish.publishing'),
          pending: true,
          duration: 50000,
        };
        this.snackbarService.toggle(true, config);

        const theme = this.store.selectSnapshot(PebEditorState.theme);

        this.store.dispatch(new PebPublishAction({ themeId: theme.id }));

        return this.actions$.pipe(
          ofActionDispatched(PebPublishedAction),
          tap(() => {
            this.snackbarService.hide();
            const config: SnackbarConfig = {
              boldContent: this.translateService.translate('builder-app.publish.success'),
              content: this.translateService.translate('builder-app.publish.published'),
              duration: 5000,
              useShowButton: true,
              iconId: 'icon-commerceos-success',
              iconSize: 24,
              iconColor: '#00B640',
              showButtonAction: () => this.messageBus.emit('editor.application.open', null),
            };
            this.snackbarService.toggle(true, config);
          }),
        );
      }),
    ).subscribe();
  }

  openPublished(): void {
    this.editorApi.getApp().pipe(
      filter(app => !!app),
      tap((app) => {
        const url = `https://${app.accessConfig.internalDomain}.${this.env.host}`;
        setTimeout(() => {
          window.open(url, '_blank');
        });
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  addTag(inputEvent: MatChipInputEvent) {
    const input = inputEvent.input;
    const value = inputEvent.value;
    if ((value || '').trim()) {
      this.tags = [...this.tags, value.trim()];
    }

    if (input) {
      input.value = '';
    }
  }

  removeTag(index: number): void {
    if (index >= 0) {
      const tags = this.tags.splice(index, 1);
      this.tags = tags;
    }
  }

  upload($event: any) {
    const files = $event.target.files as FileList;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      this.fileInput.nativeElement.value = '';
      reader.onload = () => {
        this.pictureLoading$.next(true);
        this.editorApi.uploadImageWithProgress(PebShopContainer.Images, file).pipe(
          tap((event) => {
              switch (event.type) {
                case HttpEventType.UploadProgress: {
                  this.uploadProgress$.next(event.loaded);
                  break;
                }
                case HttpEventType.Response: {
                  this.uploadProgress$.next(100);
                  break;
                }
                default:
                  break;
              }
            },
          ),
          filter(event => event.type === HttpEventType.Response && !!event.body?.blobName),
          takeUntil(this.destroy$),
        ).subscribe();
      };
    }
  }

  onReviewToggle(): void {
    this.isReviewEnabledSubject$.next(!this.isReviewEnabledSubject$.getValue());
  }

}
