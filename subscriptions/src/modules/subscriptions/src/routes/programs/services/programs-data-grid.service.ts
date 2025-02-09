import { Inject, Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationExtras, Router } from '@angular/router';
import { isArray, isEqual } from 'lodash-es';
import { BehaviorSubject } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import {
  AppThemeEnum,
  EnvironmentConfigInterface,
  PeDataGridFilterWithConditions,
  PeDataGridListOptions,
  PeDataGridMultipleSelectedAction,
  PeDataGridSingleSelectedAction,
  PeDataGridSortByAction,
  PeDataGridSortByActionIcon,
  PE_ENV,
  TreeFilterNode,
} from '@pe/common';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';

import { PeSubscriptionApi } from '../../../api/subscription/abstract.subscription.api';
import { ProgramEntity } from '../../../api/subscription/subscription.api.interface';
import { ConfirmDialogService } from '../../../shared/dialogs/dialog-data.service';
import { Filter } from '../../../shared/interfaces/filter.interface';
import { PeSubscriptionsModule } from '../../../subscriptions.module';
import { PeProgramsSortEvent } from '../actions';
import { PesProgramDto } from '../dto/program.dto';
import { PePlanDialogComponent } from '../plan-dialog/plan-dialog.component';
import { PesProgramsService } from './programs.service';

import * as uuid from 'uuid';

@Injectable()
export class ProgramsDataGridService {
  addAction: PeDataGridSingleSelectedAction = {
    label: 'Add Program',
    callback: () => {
      this.showFloatingForm(null);
    },
  };

  openAction: PeDataGridSingleSelectedAction = {
    label: 'Edit',
    callback: (id: string) => {
      const plan = this.programsService.programs.find((p: any) => p._id === id);
      this.showFloatingForm(plan);
    },
  };

  dataGridListOptions: PeDataGridListOptions = {
    nameTitle: 'Name',
    customFieldsTitles: ['Price/Interval', 'Subscribers'],
  };

  multipleSelectedActions: PeDataGridMultipleSelectedAction[] = [
    {
      label: 'Select all',
      callback: () => {
        this.selectedProgramsStream$.next(this.programsService.programs.map((program: ProgramEntity) => program._id));
      },
    },
    {
      label: 'Deselect all',
      callback: () => {
        this.selectedProgramsStream$.next([]);
      },
    },
    {
      label: 'Delete',
      callback: (ids?: string[]) => {
        this.deleteSelectedPlans(ids);
        this.selectedProgramsStream$.value.forEach(() => {});
      },
    },
  ];

  sortByActions: PeDataGridSortByAction[] = [
    {
      label: 'Title',
      callback: () => this.programsService.toggleOrderByField(PeProgramsSortEvent.Title),
      icon: PeDataGridSortByActionIcon.Name,
    },
    {
      label: 'Subscribers: Ascending',
      callback: () => this.programsService.toggleOrderByField(PeProgramsSortEvent.SortBySubscribersAsc),
      icon: PeDataGridSortByActionIcon.Ascending,
    },
    {
      label: 'Subscribers: Descending',
      callback: () => this.programsService.toggleOrderByField(PeProgramsSortEvent.SortBySubscribersDesc),
      icon: PeDataGridSortByActionIcon.Descending,
    },
  ];

  filterConditions: PeDataGridFilterWithConditions[] = [];

  filtersFormGroup = this.fb.group({
    tree: [[]],
    toggle: [false],
  });

  private conditionFormattedFiltersStream$ = new BehaviorSubject<Filter[]>([]);
  private loadingProgramIdStream$ = new BehaviorSubject<string>(null);
  private selectedProgramsStream$ = new BehaviorSubject<string[]>([]);
  private gridItemsStream$ = new BehaviorSubject<PesProgramDto[]>([]);
  private showAddItemStream$ = new BehaviorSubject<boolean>(true);
  private showFiltersStream$ = new BehaviorSubject<boolean>(false);
  private displayFiltersStream$ = new BehaviorSubject<boolean>(true);

  private groupFiltersTreeStream$ = new BehaviorSubject<TreeFilterNode[]>([
    { name: 'All Groups', data: { key: 'all-groups' } },
  ]);

  groupFiltersTree$ = this.groupFiltersTreeStream$.asObservable();

  groupFiltersFormGroup: FormGroup = this.fb.group({
    tree: [],
    toggle: [false],
  });

  private albumsTreeStream$ = new BehaviorSubject<TreeFilterNode[]>([]);
  albumsTree$ = this.albumsTreeStream$.asObservable();

  albumsFormGroup: FormGroup = this.fb.group({
    tree: [],
    toggle: [false],
  });

  private initialSidebarFooterData = {
    headItem: {
      title: 'Group',
    },
    menuItems: [{ title: 'Add', onClick: () => this.addGroupFilter() }],
  };

  groupFilters: any[] = [
    {
      label: 'GROUP',
      buttonLabel: 'Add',
      expandable: true,
      expanded: true,
      filters: [
        {
          title: 'All',
          key: 'toggle-all-items',
          image: `${this.env.custom.cdn}'icons/apps-icon.svg'`,
          selected: true,
          toggleAllItems: true,
        },
      ],
      labelCallback: () => {
        console.log('labelCallback');
      },
      buttonCallback: () => {
        console.log('buttonCallback');
      },
    },
  ];

  sidebarFooterData$ = this.filtersFormGroup.get('tree').valueChanges.pipe(startWith(this.initialSidebarFooterData));

  loadingProgramId$ = this.loadingProgramIdStream$.asObservable();
  showAddItem$ = this.showAddItemStream$.asObservable();
  conditionFormattedFilters$ = this.conditionFormattedFiltersStream$.asObservable();
  gridItems$ = this.gridItemsStream$.asObservable();
  selectedPrograms$ = this.selectedProgramsStream$.asObservable();
  showFilters$ = this.showFiltersStream$.asObservable();
  displayFilters$ = this.displayFiltersStream$.pipe(shareReplay(1));

  allFilters$ = this.conditionFormattedFilters$.pipe(
    distinctUntilChanged(([conditionalFilters1], [conditionalFilters2]) =>
      isEqual(conditionalFilters1, conditionalFilters2),
    ),
    map((conditionalFilters: any) => [...conditionalFilters]),
  );

  get gridItems(): PesProgramDto[] {
    return this.gridItemsStream$.value;
  }

  set gridItems(items: PesProgramDto[]) {
    this.gridItemsStream$.next(items);
  }

  set loadingProgramId(value: string) {
    this.loadingProgramIdStream$.next(value);
  }

  get selectedPrograms(): string[] {
    return this.selectedProgramsStream$.value;
  }

  set selectedPrograms(ids: string[]) {
    this.selectedProgramsStream$.next(ids);
  }

  get showAddItem(): boolean {
    return this.showAddItemStream$.value;
  }

  set conditionFormattedFilters(filters: Filter[]) {
    const validatedFilters = filters.filter(
      (filter: any) =>
        !!filter.value &&
        (!isArray(filter.value) ||
          (filter.value as any[]).some((val: any) => val !== undefined && val !== null && val !== '')),
    );
    this.conditionFormattedFiltersStream$.next(validatedFilters);
  }

  get conditionFormattedFilters(): Filter[] {
    return this.conditionFormattedFiltersStream$.value;
  }

  set showFilters(value: boolean) {
    this.showFiltersStream$.next(value);
  }

  get showFilters(): boolean {
    return this.showFiltersStream$.value;
  }

  set displayFilters(value: boolean) {
    this.displayFiltersStream$.next(value);
  }

  get displayFilters(): boolean {
    return this.displayFiltersStream$.value;
  }

  dialogRef: PeOverlayRef;
  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private confirmDialog: ConfirmDialogService,
    private programsService: PesProgramsService,
    private subscriptionApi: PeSubscriptionApi,
    private overlayService: PeOverlayWidgetService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {}

  private applyFilterToFormattedFilters(formattedFilter: Filter) {
    const formattedFilterValue: Filter[] = !this.conditionFormattedFilters.some(
      (filter: any) => filter.key === formattedFilter.key,
    )
      ? [...this.conditionFormattedFilters, formattedFilter]
      : this.conditionFormattedFilters.map((filter: any) =>
          filter.key === formattedFilter.key ? formattedFilter : filter,
        );
    this.conditionFormattedFilters = formattedFilterValue;
  }

  private deleteSelectedPlans(ids: string[]): void {
    this.confirmDialog.open({
      title: 'Deleting plans',
      subtitle: 'Do you really want to delete your plans?',
      cancelButtonTitle: 'No',
      confirmButtonTitle: 'Yes',
    });

    this.confirmDialog
      .onConfirmClick()
      .pipe(
        take(1),
        switchMap(() => this.subscriptionApi.deletePlans(ids)),
        withLatestFrom(this.allFilters$),
        switchMap(([_, filters]) => {
          this.selectedPrograms = this.selectedPrograms.filter((id: any) => !ids.includes(id));
          return this.programsService.loadPrograms();
        }),
      )
      .subscribe();
  }

  private getNavigateParams(): NavigationExtras {
    const navigateParams: NavigationExtras = {};
    if (this.canUseRelativeNavigate()) {
      navigateParams.relativeTo = this.activatedRoute;
      navigateParams.queryParams = {};
      navigateParams.queryParams.addExisting = true;
      navigateParams.queryParams.prevPath = this.router.url.substr(1, this.router.url.length);
    }
    navigateParams.queryParamsHandling = 'merge';
    return navigateParams;
  }

  private canUseRelativeNavigate(): boolean {
    return (
      this.activatedRoute.snapshot.pathFromRoot.filter((route: ActivatedRouteSnapshot) => route.url.length > 0).length >
      0
    );
  }

  private addGroupFilter() {
    const count = this.groupFiltersTreeStream$.value.length;

    this.groupFiltersTreeStream$.next([
      ...this.groupFiltersTreeStream$.value,
      {
        name: `Group ${count}`,
        data: {
          key: 'group',
          groupId: uuid.v4(),
        },
      },
    ]);
  }

  private showFloatingForm(item: any) {
    const config: PeOverlayConfig = {
      data: { data: item },
      headerConfig: {
        title: item ? 'Edit plan' : 'Add plan',
        backBtnTitle: 'Cancel',
        backBtnCallback: () => {
          this.dialogRef.close();
        },
        doneBtnTitle: 'Done',
        doneBtnCallback: () => {
          console.log('overalsp', this.onSaveSubject$.observers);
          if (this.onSaveSubject$.observers.length > 1) {
            this.onSaveSubject$.observers.shift();
          }
          this.onSaveSubject$.next(this.dialogRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
        theme: AppThemeEnum.default,
      },
      component: PePlanDialogComponent,
      lazyLoadedModule: PeSubscriptionsModule,
    };
    this.dialogRef = this.overlayService.open(config);
    this.dialogRef.afterClosed
      .pipe(
        tap((saved) => {
          if (saved) {
            this.programsService.loadPrograms().subscribe();
          }
        }),
      )
      .subscribe();
  }
}
