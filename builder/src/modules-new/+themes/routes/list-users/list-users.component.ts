/* tslint:disable:member-ordering */
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, throwError } from 'rxjs';
import { bufferCount, catchError, delay, distinctUntilChanged, filter, finalize, map, share, shareReplay, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import {
  PebTheme,
  PebThemeCollectionStore,
  PebThemeCreateDto,
  PebThemeType,
} from '@pe/builder-core';
import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { SnackBarService, SnackBarVerticalPositionType } from '@pe/ng-kit/modules/snack-bar';
import { ThemeApp } from '../../../../interfaces';
import { ThemeCardActions } from '../../../core/core.entities';
import { ThemeData } from '../../../core/theme.data';
import { ThemesService } from '../../services/themes.service';
import { BuilderApi } from '../../../core/api/builder-api.service';

export const ANIMATION_DELAY = 700;

@Component({
  selector: 'pe-builder-themes-list-user',
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListUsersComponent extends AbstractComponent implements OnInit {
  themes$: Observable<PebTheme[]> = this.themesStore.themes$.pipe(filter(t => !!t));

  hasLoaded$ = this.themes$.pipe(
    take(2),
    bufferCount(2),
    map(themes => !!themes),
  );

  actionsToHide: ThemeCardActions[] = [];
  currentThemesPage = 1;

  private readonly isDeletingSubject$ = new BehaviorSubject<string>(null);
  private readonly isDuplicatingSubject$ = new BehaviorSubject<string>(null);
  private readonly isEditingSubject$ = new BehaviorSubject<string>(null);
  private readonly isInstallingSubject$ = new BehaviorSubject<string>(null);
  private readonly isLoadingThemesSubject$ = new BehaviorSubject<boolean>(false);

  isDeleting$ = this.isDeletingSubject$.pipe(share());
  isDuplicating$ = this.isDuplicatingSubject$.pipe(share());
  isEditing$ = this.isEditingSubject$.pipe(share());
  isInstalling$ = this.isInstallingSubject$.pipe(share());
  isLoadingMoreThemes$ = this.isLoadingThemesSubject$.pipe(share());

  allowPaginationRequest: boolean; // It's used to avoid keep loading themes forever when the user stays on page bottom.

  mutatingThemeId$ = combineLatest([
    this.isDeleting$,
    this.isDuplicating$,
    this.isEditing$,
    this.isInstalling$,
  ]).pipe(
    map(actions => actions.find(Boolean)),
    distinctUntilChanged(),
    shareReplay(),
  );

  isAppTypePOS = this.themeData.applicationType === ThemeApp.POS;

  private businessId: string;
  private applicationId: string;

  constructor(
    private readonly router: Router,
    private readonly snackbarService: SnackBarService,
    private readonly themeData: ThemeData,
    private readonly themesService: ThemesService,
    private readonly themesStore: PebThemeCollectionStore,
    private readonly builderApi: BuilderApi,

    // tmp
    private readonly config: EnvironmentConfigService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.themesStore.themesSubject$.next([]);

    this.businessId = this.themeData.businessId;
    this.applicationId = this.themeData.applicationId;

    this.allowPaginationRequest = true;
    if (!this.themesService.loadNextThemesPage$.value) {
      this.themesService.loadNextThemesPage$.next(true);
    }

    this.populateActionsToHide();
    this.loadThemeNextPage();
  }

  trackByThemeId = theme => theme.id;

  // TODO: This rewritten
  get builderHost(): string {
    return `${this.config.getConfig().backend.builder}/api`;
  }

  onInstall(theme: PebTheme): void {
    this.isInstallingSubject$.next(theme.id);

    this.themesStore.installTemplate(this.themeData.businessId, this.themeData.applicationId, theme).pipe(
      tap(() => {
        this.isInstallingSubject$.next(null);
      }),
      catchError(err => {
        this.snackbarService.show(err.message, { position: SnackBarVerticalPositionType.Top });

        return throwError(err);
      }),
      finalize(() => this.isInstallingSubject$.next(null)),
    ).subscribe();
  }

  onCreate(): void {
    const createThemeDto: PebThemeCreateDto = {
      active: true,
      appType: this.themeData.applicationType as any, // TODO rewrite this line
      name: 'New theme',
      type: PebThemeType.App,
      businessId: this.themeData.businessId,
      appId: this.themeData.applicationId,
    };

    this.themesStore.createTheme(createThemeDto).pipe(
      tap((theme: PebTheme) => {
        return this.router.navigate([
          'business', this.themeData.businessId,
          'builder', this.themeData.applicationType, this.themeData.applicationId,
          'builder', 'editor',
        ], { queryParams: { themeId: theme.id } });
      }),
      catchError(err => {
        // this.snackBarService.show(err.message, { position: SnackBarVerticalPositionType.Top });

        return throwError(err);
      }),
      // finalize(() => this.isCreatingSubject$.next(false)),
    ).subscribe();
  }

  onDuplicated(theme: PebTheme): void {
    this.isDuplicatingSubject$.next(theme.id);
    this.themesStore.duplicateTheme(theme, this.businessId, this.applicationId).pipe(
      tap(() => {
        this.isDuplicatingSubject$.next(null);
      }),
      catchError(err => {
        this.snackbarService.show(err.message, { position: SnackBarVerticalPositionType.Top });
        return throwError(err);
      }),
      finalize(() => this.isDuplicatingSubject$.next(null)),
    ).subscribe();
  }

  // tslint:disable-next-line:no-empty
  onTranslated(theme: any): void {
  }

  onEdited(theme: any): void {
    this.isEditingSubject$.next(theme.id);

    this.router
      .navigate([
        'business', this.businessId,
        'builder', this.themeData.applicationType,
        this.applicationId, 'builder', 'editor',
      ], {
        queryParams: theme.active ? {} : { themeId: theme.id },
      })
      .then(/* do nothing */)
      .catch(err => console.error(err));
  }

  // tslint:disable-next-line:no-empty
  onExported(theme: any): void {
  }

  onDeleted(theme: PebTheme): void {
    this.isDeletingSubject$.next(theme.id);
    this.themesStore.deleteTheme(theme.id).pipe(
      tap(() => {
        this.isDeletingSubject$.next(null);
      }),
      catchError(err => {
        this.snackbarService.show(err.message, { position: SnackBarVerticalPositionType.Top });

        return throwError(err);
      }),
      finalize(() => this.isDeletingSubject$.next(null)),
    ).subscribe();
  }

  private populateActionsToHide(): void {
    if (this.isAppTypePOS) {
      this.actionsToHide.push('edit');
    }
  }

  loadThemeNextPage(): void {
    this.themesService.loadNextThemesPage$.pipe(
      filter((isLoadingNextThemes: boolean) =>
        (this.allowPaginationRequestValidation(isLoadingNextThemes) && !this.isLoadingThemesSubject$.value),
      ),
      switchMap(() => {
        this.allowPaginationRequest = false;

        return this.loadThemes();
      }),
      takeUntil(this.destroyed$),
    )
    .subscribe();
  }

  allowPaginationRequestValidation(loadingNext: boolean): boolean {
    if (!loadingNext) {
      this.allowPaginationRequest = true;
    }

    return this.allowPaginationRequest && loadingNext;
  }

  loadThemes(): Observable<any> {
    this.isLoadingThemesSubject$.next(true);

    return this.themesStore.loadApplicationThemes(this.businessId, this.applicationId, this.currentThemesPage).pipe(
      delay(ANIMATION_DELAY),
      tap((themes: PebTheme[]) => {
        if (themes.length !== 0) {
          this.currentThemesPage++;
        }
      }),
      tap(() => {
        this.isLoadingThemesSubject$.next(false);
      }),
      catchError(err => {
        this.snackbarService.show(err.message, { position: SnackBarVerticalPositionType.Top });

        return throwError(err);
      }),
      finalize(() => this.isLoadingThemesSubject$.next(false)),
    );
  }
}
