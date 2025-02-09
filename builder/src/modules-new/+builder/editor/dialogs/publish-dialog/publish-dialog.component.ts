import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { orderBy } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, pluck, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebAbstractThemeApi, PebTheme, PebThemeStore, PebVersionId, PebVersionShort } from '@pe/builder-core';
import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { ImageUploadService } from '@pe/ng-kit/modules/form';
import { notEqualValidation, notInValidation } from '../../../../shared/validators';
import { SnackbarComponent } from '../../../components/snackbar/snackbar.component';
import { BlobUploadService } from '../../../services/blob-upload.service';
import { SnackbarService } from '../../../services/snackbar.service';

@Component({
  selector: 'pe-builder-publish-menu-new',
  templateUrl: './publish-dialog.component.html',
  styleUrls: ['./publish-dialog.component.scss'],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublishDialogComponent extends AbstractComponent implements OnInit {
  @Input() editor: any;
  @Input() document: any;

  isLogoChanging$ = new BehaviorSubject<boolean>(false);
  get isLogoChanging(): boolean {
    return this.isLogoChanging$.value;
  }
  set isLogoChanging(value: boolean) {
    this.isLogoChanging$.next(value);
  }

  isNameChanging = false;
  isVersionCreating = false;

  currentThemeName: string;

  themeNameForm = this.formBuilder.group({
    name: ['', [
      Validators.required,
      Validators.minLength(4),
      notEqualValidation(() => this.currentThemeName)],
    ],
  });

  versionNameForm = this.formBuilder.group({
    name: ['', [
      Validators.required,
      notInValidation(() => (this.availableVersions || []).map((v: PebVersionShort) => v.name))],
    ],
  });

  availableVersions: PebVersionShort[] = [];

  logo$: Observable<string> = this.themeStore.theme$.pipe(pluck('logo'));

  constructor(
    private readonly changeDetector: ChangeDetectorRef,
    private readonly themeStore: PebThemeStore,
    private readonly themeApi: PebAbstractThemeApi,
    private readonly formBuilder: FormBuilder,
    private readonly imageUpload: ImageUploadService,
    private readonly blobUpload: BlobUploadService,
    private readonly snackbarService: SnackbarService,
    ) {
    super();
    (window as any).publishDialog = this;
  }

  ngOnInit(): void {
    this.themeApi.getVersions(this.themeStore.theme.id).pipe(
      tap((versions: PebVersionShort[]) => {
        this.themeNameForm.setValue({ name: this.themeStore.theme.name });

        this.currentThemeName = this.themeStore.theme.name;
        this.availableVersions = orderBy(versions, 'createdAt', 'desc');
        this.changeDetector.markForCheck();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  onNameUpdate(): void {
    this.isNameChanging = !this.isNameChanging;

    this.themeStore.updateThemeData({
      name: this.themeNameForm.value.name,
    }).pipe(
      tap(() => {
        this.isNameChanging = false;
        this.currentThemeName = this.themeNameForm.value.name;
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  onLogoUpload(): void {
    // TODO: ImageUpload service requires refactoring. It should receive businessId
    //       (and probably some image limitation) as an input and provide an observable
    //       that will emit only when upload is complete.
    //       BlobUpload exposure is not required at all since it is internal upload logic.
    if (this.isLogoChanging || this.themeStore.theme.logo) {
      return;
    }

    this.imageUpload
      .selectImage()
      .pipe(
        filter(file => {
          const isValid = this.imageUpload.checkImage(file, false);

          if (isValid) {
            this.isLogoChanging = true;

            return true;
          }

          this.snackbarService.open(SnackbarComponent, 'Maximum size exceeded', 'right');

          return false;
        }),
        switchMap(file => this.blobUpload.uploadLogo(file)),
        switchMap(imgUrl =>
          this.themeStore.updateThemeData({
            logo: imgUrl,
          }),
        ),
        tap(() => (this.isLogoChanging = false)),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  onLogoClear(): void {
    this.isLogoChanging = true;
    this.themeStore
      .updateThemeData({
        logo: null,
      })
      .pipe(
        tap(() => (this.isLogoChanging = false)),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  onVersionCreate(): void {
    const name = this.versionNameForm.value.name;

    this.isVersionCreating = true;
    this.themeStore.createVersion(name).pipe(
      tap((version: PebVersionShort) => {
        this.availableVersions = orderBy([...this.availableVersions, version], 'createdAt', 'desc').map(
          (v: PebVersionShort) => ({ ...v, current: version.id === v.id }),
        );
        this.isVersionCreating = false;
        this.versionNameForm.reset();

        this.changeDetector.markForCheck();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  onVersionInstall(versionId: PebVersionId): void {
    this.themeStore.installVersion(versionId).pipe(
      tap((theme: PebTheme) => {
        this.availableVersions = this.availableVersions.map(
          (v: PebVersionShort) => ({ ...v, current: theme.currentVersion === v.id }),
        );

        this.changeDetector.markForCheck();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  onVersionPublish(versionId: PebVersionId): void {
    this.themeStore.publishVersion(versionId).pipe(
      tap((publishedVersion: PebVersionShort) => {
        this.availableVersions = this.availableVersions.map((v: PebVersionShort) => ({
          ...v,
          published: publishedVersion.id === v.id,
        }));

        this.changeDetector.markForCheck();
      }),
      takeUntil(this.destroyed$),
    )
      .subscribe();

    // this.themeApi.publishVersion
    //
    // this.themeData
    //   .publishVersion(version)
    //   .pipe(
    //     tap(updatedVersion => {
    //       const index = this.sortedVersions.findIndex(v => v === version);
    //
    //       this.sortedVersions = this.sortedVersions.map(v => ({
    //         ...v,
    //         published: false,
    //       }));
    //       this.sortedVersions = [
    //         ...this.sortedVersions.slice(0, index),
    //         updatedVersion,
    //         ...this.sortedVersions.slice(index + 1, this.sortedVersions.length),
    //       ];
    //     }),
    //     takeUntil(this.destroyed$),
    //   )
    //   .subscribe();
  }

  onVersionDelete(versionId: PebVersionId): void {
    this.themeApi.deleteVersion(versionId).pipe(
      tap(() => {
        this.availableVersions = this.availableVersions.filter((v: PebVersionShort) => v.id !== versionId);

        this.changeDetector.markForCheck();
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }
}
