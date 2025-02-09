import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { groupBy } from 'lodash-es';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { catchError, delay, distinctUntilChanged, filter, map, share, shareReplay, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebAppType, PebTheme, PebThemeCollectionStore, PebThemeTemplateCreateDto } from '@pe/builder-core';
import { AuthService } from '@pe/ng-kit/modules/auth';
import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { SnackBarService, SnackBarVerticalPositionType } from '@pe/ng-kit/modules/snack-bar';
import { PeStepperService, PeWelcomeStepAction, PeWelcomeStepperAction } from '@pe/stepper';
import { AppModelInterface, ThemeApp } from '../../../../interfaces';
import { ApplicationApiService } from '../../../core/api/application-api.service';
import { BuilderApi } from '../../../core/api/builder-api.service';
import { ThemeCardActions } from '../../../core/core.entities';
import { ThemeData } from '../../../core/theme.data';
import { ThemesService } from '../../services/themes.service';

export const ANIMATION_DELAY = 700;

@Component({
  selector: 'pe-builder-themes-list-all',
  templateUrl: './list-category.component.html',
  styleUrls: ['./list-category.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListCategoryComponent extends AbstractComponent implements OnInit {
  currentTemplatesPage = 1;

  groupedTemplates$ = this.themesStore.templates$.pipe(
    filter(templates => !!templates && !!templates.length),
    map((templates: PebTheme[]) => templates.map(t => ({ ...t, industryName: '' }))), // TODO tmp
    map((templates: PebTheme[]) => {
      return Object.entries(groupBy(templates, (t: any) => t.industryName)).map(
        ([industry, themes]) => ({ industry, themes }),
      );
    }),
  );
  isCreating$ = new BehaviorSubject<boolean>(false);

  actionsToHide$ = new BehaviorSubject<ThemeCardActions[]>([]);

  isAdmin = this.authService.isAdmin() || localStorage.getItem('pe-admin') === 'true';
  allowPaginationRequest: boolean;

  private installingThemeSubject$ = new BehaviorSubject<string>(null);
  private openingThemeSubject$ = new BehaviorSubject<string>(null);
  private readonly isLoadingTemplatesSubject$ = new BehaviorSubject<boolean>(false);

  private applicationType: PebAppType;

  // tslint:disable:member-ordering
  installingTheme$: Observable<string> = this.installingThemeSubject$.pipe(share());
  openingTheme$: Observable<string> = this.openingThemeSubject$.pipe(share());
  isLoadingMoreTemplates$ = this.isLoadingTemplatesSubject$.pipe(share());

  loadingTheme$: Observable<string> = combineLatest([
    this.installingTheme$,
    this.openingTheme$,
  ]).pipe(
    map(actions => actions.find(Boolean)),
    distinctUntilChanged(),
    shareReplay(),
  );

  themes$ = new BehaviorSubject<PebTheme[]>([]);

  private isAppTypePOS = this.themeData.applicationType === ThemeApp.POS;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private builderApiService: BuilderApi,
    private router: Router,
    private themeData: ThemeData,
    private themesService: ThemesService,
    private themesStore: PebThemeCollectionStore,
    private readonly peStepperService: PeStepperService,
    private readonly snackBarService: SnackBarService,
    private applicationApiService: ApplicationApiService,
  ) {
    super();
  }

  ngOnInit(): void {

    this.activatedRoute.paramMap.pipe(
      takeUntil(this.destroyed$),
      map(params => ({ category: params.get('category'), industry: params.get('industry') })),
      switchMap(({ category, industry }) => this.builderApiService.getThemes({
        ...(category && { 'category[_id]': category }),
        ...(industry && industry !== 'all' && { 'category[industries]': industry }),
        type: 'system',
        'order[createdAt]': '-1',
      })),
      map(themes => themes.filter(t => t.appType === 'shop')),
      tap(themes => {
        this.themesService.themesCount$.next(themes.length);
        this.themes$.next(themes)
      }),
    ).subscribe();

    this.applicationType = this.themeData.applicationType as PebAppType;
  }

  trackByThemeId = (theme: PebTheme) => theme.id;

  onCreateTemplate(): void {
    const dto: PebThemeTemplateCreateDto = {
      name: 'Template',
      appType: this.themeData.applicationType as any,
    };

    this.isCreating$.next(true);
    this.themesStore.createTemplate(dto).pipe(
      tap(() => this.isCreating$.next(false)),
    ).subscribe();
  }

  onInstalled(theme: PebTheme): void {
    this.installingThemeSubject$.next(theme.id);

    const installAndPublishTheme$ = this.applicationApiService.getShop(
      this.themeData.context.businessId,
      this.themeData.context.applicationId,
    ).pipe(
      switchMap((t: AppModelInterface) => (this.builderApiService.installTemplate(theme.id, {
        businessId: this.themeData.businessId,
        appId: this.themeData.applicationId,
        domainName: `${t.name}-${+new Date()}`,
        logo: t.logo,
      }))),
      tap(() => {
        const currentStepIndex = this.peStepperService.steps.findIndex(s => s.id === this.peStepperService.currentStep.id);
        const nextStep = this.peStepperService.steps[currentStepIndex + 1];
        this.peStepperService.dispatch(PeWelcomeStepperAction.Continue, nextStep);
        this.peStepperService.dispatch(PeWelcomeStepperAction.ShowLoading, true);
      }),
    );

    const install$ = this.peStepperService.isActiveStored ?
      installAndPublishTheme$ : this.themesStore.installTemplate(this.themeData.businessId, this.themeData.applicationId, theme).pipe(
        tap(() => this.installingThemeSubject$.next(null)),
        tap(() => {
          theme.active = true;
          this.snackBarService.show(
            'Your theme has been successfully installed.', {
              position: SnackBarVerticalPositionType.Top,
              iconId: 'icon-help-24',
              iconSize: 24,
              panelClass: ['some-custom-class', 'some-custom-class-2'],
            },
          );
        }),
      );

    install$.pipe(
      catchError(() => {
        this.installingThemeSubject$.next(null);

        return of(null);
      }),
    ).subscribe();
  }

  onEdited(theme: PebTheme): void {

    if (this.peStepperService.currentStep.action === PeWelcomeStepAction.ChooseTheme) {
      this.onInstalled(theme);
    }

    this.openingThemeSubject$.next(theme.id);
    this.router
      .navigate([
        'business', this.themeData.businessId,
        'builder', this.themeData.applicationType,
        this.themeData.applicationId, 'builder', 'editor',
      ], {
        queryParams: {
          themeId: theme.id,
          type: 'system',
        }, // TODO check this code theme.active ? {} : { themeId: theme.id },
      }).then().catch();
  }

  loadTemplatesNextPage(): void {
    this.themesService.loadNextThemesPage$.pipe(
      filter((isLoadingNextThemes: boolean) =>
        (this.allowPaginationRequestValidation(isLoadingNextThemes) && !this.isLoadingTemplatesSubject$.value),
      ),
      switchMap(() => {
        this.allowPaginationRequest = false;

        return this.loadTemplates();
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

  loadTemplates(): Observable<any> {
    this.isLoadingTemplatesSubject$.next(true);

    return this.themesStore.loadTemplates(this.applicationType, this.currentTemplatesPage).pipe(
      delay(ANIMATION_DELAY),
      tap((templates: PebTheme[]) => {
        if (templates.length !== 0) {
          this.currentTemplatesPage++;
        }
      }),
      tap(() => {
        this.isLoadingTemplatesSubject$.next(false);
      }),
    );
  }

  private populateActionsToHide(): void {
    if (this.isAppTypePOS && !this.isAdmin) {
      this.actionsToHide$.next(['edit']);
    }
  }
}
