import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterEvent } from '@angular/router';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, finalize, map, share, takeUntil, tap } from 'rxjs/operators';

import {
  PebTheme,
  PebThemeCollectionStore,
  PebThemeCreateDto,
  PebThemeType,
} from '@pe/builder-core';
import { AuthService } from '@pe/ng-kit/modules/auth';
import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { SnackBarService, SnackBarVerticalPositionType } from '@pe/ng-kit/modules/snack-bar';
import { WindowService } from '@pe/ng-kit/modules/window';
import { ThemeData } from '../../../core/theme.data';
import { ThemesService } from '../../services/themes.service';

export interface ThemeCategoryInterface {
  _id: string;
  name: string;
  children: ThemeCategoryInterface[];
  industries: string[];
  themeCount: number;
}

@Component({
  selector: 'pe-builder-themes-list-all',
  templateUrl: './list-all.component.html',
  styleUrls: ['./list-all.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListAllComponent extends AbstractComponent implements OnInit {
  selectedCategoryIdSubject$ = new BehaviorSubject<string>(null);

  categoriesSource: { [key: string]: ThemeCategoryInterface[] };
  categories: ThemeCategoryInterface[];
  filtersOpened$ = new BehaviorSubject<boolean>(false);

  industries: string[];

  selectedIndustry$ = new BehaviorSubject<string>('all');
  selectedSortBy: string;
  themesCount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  sortByOptions: string[] = ['Created At'];

  isCreatingSubject$ = new BehaviorSubject<boolean>(false);

  isCreating$ = this.isCreatingSubject$.pipe(share());
  isAdmin = this.authService.isAdmin()

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private windowService: WindowService,
    private themeData: ThemeData,
    private themesService: ThemesService,
    private themesStore: PebThemeCollectionStore,
    private snackBarService: SnackBarService,
    private authService: AuthService,
  ) {
    super();

    (window as any).router = router;
    (window as any).listRoute = activatedRoute;

    // tslint:disable-next-line: ban-comma-operator
    this.windowService.width$.pipe(
      tap(w => this.filtersOpened$.next(w >= 480)),
    ).subscribe(),

    this.themesService.themesCount$.pipe(
      takeUntil(this.destroyed$),
      tap(count => this.themesCount$.next(count)),
    ).subscribe(),

    this.router.events
      .pipe(
        filter((evt: RouterEvent) => evt instanceof NavigationEnd),
        filter(() => !!this.activatedRoute.firstChild),
        map(() => (this.activatedRoute.firstChild.params as any).value),
        map(params => ({ category: params.category, industry: params.industry })),
        tap(({ category, industry }) => {
          this.selectedCategoryIdSubject$.next(category);
          const nextIndustry = industry ? industry : 'all';
          if (this.selectedIndustry$.value === nextIndustry && this.categories && this.categories.length) {
            return;
          }

          this.selectedIndustry$.next(nextIndustry);
          this.categories = industry && industry !== 'all' ?
            this.categoriesSource[this.selectedIndustry$.value] : this.combineCategories(this.categoriesSource);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.activatedRoute.data
      .pipe(
        tap((data: any) => {
          this.industries = Object.keys(data.categories);
          this.selectedSortBy = this.sortByOptions[this.sortByOptions.length - 1];
          this.categoriesSource = data.categories;
          if (this.selectedIndustry$.value) {
            this.categories = this.categoriesSource[this.selectedIndustry$.value];
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  ngOnInit(): void {
  }

  onCategorySelect(category: string): void {
    this.router.navigate([
      category === this.selectedCategoryIdSubject$.value ?
        `${this.selectedIndustry$.value}` :
        `${this.selectedIndustry$.value}/${category}`,
    ], { relativeTo: this.activatedRoute }).then().catch();
  }

  onChangeIndustry(industry: string): void {
    this.router.navigate([industry ? industry : './'], { relativeTo: this.activatedRoute }).then().catch();
  }

  onChangeSortBy(sortBy: string): void {
    console.log(sortBy);
  }

  onToggleFilters(): void {
    this.filtersOpened$.next(!this.filtersOpened$.value);
  }

  onCreate(): void {
    this.isCreatingSubject$.next(true);

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
        this.snackBarService.show(err.message, { position: SnackBarVerticalPositionType.Top });

        return throwError(err);
      }),
      finalize(() => this.isCreatingSubject$.next(false)),
    ).subscribe();
  }

  // tslint:disable-next-line: prefer-function-over-method
  private combineCategories(categories: { [key: string]: ThemeCategoryInterface[] }): ThemeCategoryInterface[] {
    return Object.keys(categories).reduce((acc, key) => {

      categories[key].forEach((cat, index) => {
        const sameCategoryIndex = acc.findIndex(c => c.name === cat.name);
        if (sameCategoryIndex === -1) {
          return;
        }


        if (cat.children && cat.children.length) {
          acc[sameCategoryIndex].children = [
            ...(acc[sameCategoryIndex].children ? acc[sameCategoryIndex].children : []),
            ...cat.children,
          ];
        }

        categories[key].splice(index, 1);
      });


      return [ ...acc, ...categories[key] ];
    }, []);
  }
}
