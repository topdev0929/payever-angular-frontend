import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { BehaviorSubject, of } from 'rxjs';
import {
  catchError,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';

import { PebThemeResolver } from '@pe/builder/resolvers';
import { PebEditorState, PebSetActivePage } from '@pe/builder/state';
import { TranslateService } from '@pe/i18n-core';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { PePlatformHeaderService } from '@pe/platform-header';
import { SnackbarService } from '@pe/snackbar';
import { ThemesApi } from '@pe/themes';

import { PeMainEditorRequestsErrorsEnum } from '../../enums/requests-errors.enum';

import { IntegrationImportMode } from './integration-import-mode.enum';

const SIDENAV_NAME = 'app-theme-sidenav';

@Component({
  selector: 'peb-integration-import',
  templateUrl: './integration-import.dialog.html',
  styleUrls: ['./integration-import.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorIntegrationImportDialog implements OnInit {
  mode: IntegrationImportMode;
  files$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  pages$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  selectedFile$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  selectAllPages$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  selectedPages$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  importing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  message$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  pageSelectionState = false;
  title = this.translateService.translate('builder-themes.actions.import');

  constructor(
    private dialogRef: MatDialogRef<PebEditorIntegrationImportDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private themesApi: ThemesApi,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private router: Router,
    private readonly themeResolver: PebThemeResolver,
    private headerService: PePlatformHeaderService,
    private readonly store: Store,
  ) {
    this.mode = data.mode;
  }

  get themeImportMode(): boolean {
    return this.mode === IntegrationImportMode.Theme;
  }

  get pageImportMode(): boolean {
    return this.mode === IntegrationImportMode.Page;
  }

  get selectedPages(): any[] {
    return this.selectAllPages$.getValue() ? this.pages$.getValue() : this.selectedPages$.getValue();
  }

  get selectedPagesCount(): number {
    return this.selectedPages.length;
  }

  ngOnInit(): void {
    this.loading$.next(true);
    this.themesApi.getThirdpartyFiles()
      .pipe(
        tap((res) => {
          this.files$.next(res);
          this.loading$.next(false);
        }),
        catchError((error) => {
          if (error?.error?.errors === PeMainEditorRequestsErrorsEnum.GetThirdpartyFilesNoIntegrationError) {
            this.message$.next(this.translateService.translate('builder-themes.messages.no_design_integration'));
          }
          this.loading$.next(false);

          return of({});
        })
      ).subscribe();
  }

  goToPageSelector(): void {
    this.pageSelectionState = true;
    this.loading$.next(true);
    this.themesApi.getThirdpartyFilePages(this.selectedFile$.getValue().fileId)
      .pipe(
        tap((res) => {
          this.pages$.next(res);
          this.loading$.next(false);
        }))
      .subscribe();
  }

  goToFileSelector(): void {
    this.pageSelectionState = false;
  }

  submitForm(): void {
    this.importing$.next(true);
    const folder = 'root-folder';
    this.themesApi.importThirdpartyFileAsTheme(this.selectedFile$.getValue().fileId, folder)
      .pipe(
        switchMap((res) => {
          const themeId = res.theme._id;
          const firstPageId = res.theme.snapshot.pages[0];

          return this.themeResolver.resolveThemeById(themeId).pipe(
            tap(() => {
              const url = location.pathname
                .replace('themes', 'edit')
                .replace('dashboard', 'edit')
                .replace('settings', 'edit');
              const notify = this.translateService.translate('builder-themes.messages.theme_imported');

              this.router.navigate([url], { queryParams: { pageId: firstPageId }, replaceUrl: true }).then(() => {
                this.dialogRef.close();
                this.showSnackbar(notify, true);
                this.headerService.removeSidenav(SIDENAV_NAME);
              });
            }),
            take(1),
          );
        })
      ).subscribe();
  }

  importPages(): void {
    this.importing$.next(true);
    const themeId = this.store.selectSnapshot(PebEditorState.themeId);
    this.themesApi.importThirdpartyFileAsPages(
      themeId,
      this.selectedFile$.getValue().fileId,
      this.selectedPages.map(a => a.id)
    ).pipe(
      switchMap((res) => {
        const firstPageId = res[0].id;

        return this.themeResolver.resolveThemeById(themeId).pipe(
          tap((theme) => {
            const notify = this.translateService.translate('builder-themes.messages.pages_imported');
            this.dialogRef.close();
            this.showSnackbar(notify, true);
            this.headerService.removeSidenav(SIDENAV_NAME);
            this.store.dispatch(new PebSetActivePage(firstPageId));
          }),
          take(1),
        );
      })
    ).subscribe();
  }

  closeForm(): void {
    this.dialogRef.close();
  }

  toggleSelectFile(item: any): void {
    this.selectedFile$.next(item);
    if (this.mode === IntegrationImportMode.Page) {
      this.goToPageSelector();
    }
  }

  toggleSelectPage(page: any): void {
    const currentPages = this.selectedPages$.getValue();
    const pageExists = currentPages.some(p => p.id === page.id);
    if (pageExists) {
      const updatedPages = currentPages.filter(p => p.id !== page.id);
      this.selectedPages$.next(updatedPages);
    } else {
      this.selectedPages$.next([...currentPages, page]);
    }
    this.selectAllPages$.next(false);
  }

  toggleSelectAllPages(): void {
    this.selectAllPages$.next(!this.selectAllPages$.getValue());
  }

  isPageSelected(page: any): boolean {
    return this.selectAllPages$.getValue() || this.selectedPages$.getValue().some(a => a.id === page.id);
  }

  private showSnackbar(notify: string, success = true): void {
    const iconId = success ? 'icon-commerceos-success' : 'icon-alert-24';
    const iconColor = success ? '#00B640' : '#E2BB0B';
    this.snackbarService.toggle(true, {
      content: notify,
      duration: 5000,
      iconColor,
      iconId,
      iconSize: 24,
    });
  }
}
