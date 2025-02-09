import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  Optional,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, switchMap, take, tap, delay } from 'rxjs/operators';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { TranslateService } from '@pe/i18n';
import { DomSanitizer } from '@angular/platform-browser';
import { ChannelTypeIconService } from '../../services/channel-type-icon.service';

import {
  PeDataGridFilterItem,
  PeDataGridItem,
  PeDataGridListOptions,
  PeDataGridMultipleSelectedAction,
  PeDataGridSingleSelectedAction,
  PeDataGridSortByAction,
  PeDataGridSortByActionIcon,
  AppThemeEnum,
  PebEnvService,
} from '@pe/common';
import { PePlatformHeaderService } from '@pe/platform-header';
import { PeDataGridComponent } from '@pe/data-grid';
import { PeAffiliatesApi } from '../../api/abstract.affiliates.api';
import { AbstractComponentDirective } from '../../misc/abstract.component';
import { filterDataGrid } from '../../shared/data-grid-filter';
import { PebNewProgramComponent } from './new-prpgram-modal/new-program.component';

export interface SortAction {
  field: string;
  asc: boolean;
}

@Component({
  selector: 'peb-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebProgramsComponent extends AbstractComponentDirective implements OnInit {
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;
  isFiltered = false;
  readonly programsUpdatedSubject$ = new BehaviorSubject<any>(null);

  private showSidebarStream$ = new BehaviorSubject<boolean>(true);
  showSidebar$ = this.showSidebarStream$.asObservable().pipe(delay(0));
  isFilterCreating = false;
  searchItems = [];
  dialogRef: PeOverlayRef;
  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();
  items: PeDataGridItem[] = [];
  filteredItems = [];

  baseUrl = ['./'];
  addCampaignIsLoading$ = new BehaviorSubject(false);

  addItemAction: PeDataGridSingleSelectedAction = {
    label: 'Add Program',
    callback: (data: string) => {
      const config: PeOverlayConfig = {
        data: { },
        headerConfig: {
          title: 'Add Program',
          backBtnTitle: 'Cancel',
          backBtnCallback: () => {
            this.dialogRef.close();
          },
          doneBtnTitle: 'Save',
          doneBtnCallback: () => {
            this.onSaveSubject$.next(this.dialogRef);
          },
          onSaveSubject$: this.onSaveSubject$,
          onSave$: this.onSave$,
          theme: this.theme,
        },
        component: PebNewProgramComponent,
      };
      this.dialogRef = this.overlayService.open(config);
    },
  };

  openItemAction: PeDataGridSingleSelectedAction = {
    label: 'Open',
    callback: (data: string) => {
      const item = this.items.find(x => x.id === data);
      const config: PeOverlayConfig = {
        data: { data: item },
        headerConfig: {
          title: 'Open Program',
          backBtnTitle: 'Cancel',
          backBtnCallback: () => {
            this.dialogRef.close();
          },
          doneBtnTitle: 'Done',
          doneBtnCallback: () => {
            this.onSaveSubject$.next(this.dialogRef);
          },
          onSaveSubject$: this.onSaveSubject$,
          onSave$: this.onSave$,
          theme: this.theme,
        },
        component: PebNewProgramComponent,
      };
      this.dialogRef = this.overlayService.open(config);
    },
  };

  editItemAction: PeDataGridSingleSelectedAction = {
    label: 'Edit',
    callback: (data: string) => {
      const item = this.items.find(x => x.id === data);
      const config: PeOverlayConfig = {
        data: { data: item },
        headerConfig: {
          title: 'Edit Program',
          backBtnTitle: 'Cancel',
          backBtnCallback: () => {
            this.dialogRef.close();
          },
          doneBtnTitle: 'Done',
          doneBtnCallback: () => {
            this.onSaveSubject$.next(this.dialogRef);
          },
          onSaveSubject$: this.onSaveSubject$,
          onSave$: this.onSave$,
          theme: this.theme,
        },
        component: PebNewProgramComponent,
      };
      this.dialogRef = this.overlayService.open(config);
    },
  };
  set showSidebar(value: boolean) {
    this.showSidebarStream$.next(value);
  }

  @ViewChild('dataGridComponent') set setDataGrid(dataGrid: PeDataGridComponent) {
    if (dataGrid?.showFilters$) {
      dataGrid.showFilters$.subscribe((value) => {
        if (value !== this.showSidebarStream$.value) {
          this.showSidebarStream$.next(value);
        }
      });
    }
  }

  programs$: Observable<PeDataGridItem[]> = this.programsUpdatedSubject$.asObservable().pipe(
    switchMap(() => {
      return this.api.getPrograms()
        .pipe(
          switchMap((programs: any) => {
            return combineLatest([
              this.selectedFilters$,
              this.searchString$,
              this.selectedSort$,
            ]).pipe(
              map(([selectedFilters, searchString, selectedSort]) => {
                return this.getFilteredPrograms(programs, selectedFilters, searchString, selectedSort);
              }),
            );
          }),
        );
    }));

  dataGridListOptions: PeDataGridListOptions;
  showCollectionsCountInHeader = false;

  readonly selectedSortSubject$ = new BehaviorSubject<SortAction>(null);
  selectedSort$ = this.selectedSortSubject$.asObservable();
  set selectedSort(sortAction: SortAction) {
    this.selectedSortSubject$.next(sortAction);
  }

  sortByActions: PeDataGridSortByAction[] = [
    {
      label: 'Title (A-Z)',
      callback: () => this.selectedSort = { field: 'title', asc: true },
      icon: PeDataGridSortByActionIcon.Ascending,
    },
    {
      label: 'Title (Z-A)',
      callback: () => this.selectedSort = { field: 'title', asc: false },
      icon: PeDataGridSortByActionIcon.Descending,
    },
  ];

  readonly selectedProgramsSubject$ = new BehaviorSubject<string[]>([]);
  selectedPrograms$ = this.selectedProgramsSubject$.asObservable();
  set selectedPrograms(ids: string[]) {
    this.selectedProgramsSubject$.next(ids);
  }
  get selectedPrograms() {
    return this.selectedProgramsSubject$.value;
  }

  readonly selectedFiltersSubject$ = new BehaviorSubject<PeDataGridFilterItem[]>([]);
  selectedFilters$ = this.selectedFiltersSubject$.asObservable();
  set selectedFilters(filters: PeDataGridFilterItem[]) {
    this.selectedFiltersSubject$.next(filters);
  }

  readonly searchStringSubject$ = new BehaviorSubject<string>(null);
  searchString$ = this.searchStringSubject$.asObservable();
  set searchString(searchString: string) {
    this.searchStringSubject$.next(searchString);
  }

  multipleSelectedActions: PeDataGridMultipleSelectedAction[] = [
    {
      label: 'Delete',
      callback: () => this.onDelete(this.selectedPrograms),
    },
    {
      label: 'Select all',
      callback: () => {
        this.programs$.pipe(
          take(1),
          tap((programs: any) => {
            this.selectedPrograms = programs.map((c: any) => c.id);
          }),
        ).subscribe();
      },
    },
    {
      label: 'Deselect all',
      callback: () => this.selectedPrograms = [],
    },
  ];

  firstCardAction: PeDataGridSingleSelectedAction = {
    label: 'Open',
    callback: (programId: string) => {
      this.onOpenProgram(programId);
    }};
  addNewItem = {
    title: 'Create Program',
    actions: [this.addItemAction],
  };
  channles = [{ type: 'pos', name: 'Point of Sale' }, { type: 'shop', name: 'Shop' }, { type: 'market', name: 'Marketing' }];

  constructor(
    private cdr: ChangeDetectorRef,
    private api: PeAffiliatesApi,
    private envService: PebEnvService,
    private translateService: TranslateService,
    private overlayService: PeOverlayWidgetService,
    private sanitizer: DomSanitizer,
    private channelTypeIconService: ChannelTypeIconService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    @Optional() private platformHeader: PePlatformHeaderService,
  ) {
    super();
  }
  getChannelTypeIcon(type) {
    return this.channelTypeIconService.getIconAsSafeHtml([type]);
  }

  ngOnInit(): void {
    this.theme = AppThemeEnum.default;
    this.platformHeader.setFullHeader();
    this.dataGridListOptions = {
      nameTitle: 'NAME',
      customFieldsTitles: [
        'ASSETS',
        'AFFILIATE',
      ],
    };
    this.getItems();
    this.filteredItems = this.items;
  }

  getItems() {
    this.api.getPrograms().subscribe((programs: any[]) => {
      this.items = [];
      programs.forEach((program) => {
        this.items.push({
          id: program.id,
          title: this.sanitizer.bypassSecurityTrustHtml(`
            <div style="
              display: flex;
              align-items: center;
            ">
              <div style="
                background-image: linear-gradient(224deg, #d764a5 100%, #e7534c 8%);
                font-family: 'Roboto', sans-serif;
                line-height: 1.33;
                font-size: 12px;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-right: 12px;
                height: 32px;
                width: 32px;
                border-radius: 3.2px;
                color: #ffffff;
              ">
              </div>
              <span>${program.subtitle}</span>
            </div>
          `),
          customFields: [
            {
              content: this.sanitizer.bypassSecurityTrustHtml(`
                <span>${program.assets}</span>
            `),
            },
            {
              content: this.sanitizer.bypassSecurityTrustHtml(`
                <span>${program.affiliates}</span>
            `),
            },
            {
              content: this.sanitizer.bypassSecurityTrustHtml(`
                <button style="
                  border-radius: 6px;
                  background-color: rgba(255, 255, 255, 0.3);
                  border: 0;
                  outline: 0;
                  color: white;
                  width: 51px;
                  height: 24px;
                  font-family: 'Roboto', sans-serif;
                  font-size: 12px;
                  font-weight: normal;
                  font-stretch: normal;
                  font-style: normal;
                  line-height: 1.33;
                  letter-spacing: normal;
                  text-align: center;
                  color: #ffffff;">View
                </button>
                <button style="
                  border-radius: 6px;
                  background-color: rgba(255, 255, 255, 0.3);
                  border: 0;
                  outline: 0;
                  color: white;
                  width: 51px;
                  height: 24px;
                  font-family: 'Roboto', sans-serif;
                  font-size: 12px;
                  font-weight: normal;
                  font-stretch: normal;
                  font-style: normal;
                  line-height: 1.33;
                  letter-spacing: normal;
                  text-align: center;
                  color: #ffffff;">Edit
                </button>
              `),
              callback: () => {
                const id = program._id;

                const item = this.items.find(x => x.id === id);

                const config: PeOverlayConfig = {
                  data: { data: item },
                  headerConfig: {
                    title: 'Edit Program',
                    backBtnTitle: 'Cancel',
                    backBtnCallback: () => {
                      this.dialogRef.close();
                    },
                    doneBtnTitle: 'Done',
                    doneBtnCallback: () => {
                      this.onSaveSubject$.next(this.dialogRef);
                    },
                    onSaveSubject$: this.onSaveSubject$,
                    onSave$: this.onSave$,
                    theme: this.theme,
                  },
                  component: PebNewProgramComponent,
                };
                this.dialogRef = this.overlayService.open(config);
              },
            },
          ],
          data: program,
          actions: [this.openItemAction, this.editItemAction],
        });
      });
      this.cdr.detectChanges();
    });
  }
  onSelectedItemsChanged(items: string[]) {
    this.selectedPrograms = items;
  }

  onFiltersChanged(filters: PeDataGridFilterItem[]): void {
    this.selectedFilters = filters;
    this.cdr.detectChanges();
  }

  private getFilteredPrograms(programs, selectedFilters, searchString, selectedSort) {
    const searchRegexp = new RegExp(searchString, 'i');

    const filteredPrograms = (!selectedFilters || selectedFilters.length === 0)
      ? [...programs]
      : programs.filter(cmp => cmp.labels && cmp.labels.includes(selectedFilters[0].key));

    const filteredBySearch = searchString
      ? filteredPrograms.filter(campaign => searchRegexp.test(campaign.title))
      : [...filteredPrograms];

    return selectedSort
      ? this.sortByStringField(filteredBySearch, selectedSort.field, selectedSort.asc)
      : filteredBySearch;
  }

  private onOpenProgram(programId: string) {
    console.log(`open Program: ${programId}`);
  }

  private onDelete(programIds: string[]) {
    this.api.deletePrograms(programIds);
    this.programsUpdatedSubject$.next(null);
    this.selectedPrograms = [];
  }

  private sortByStringField(array: any[], field: string, asc: boolean = true) {
    return array.sort((a, b) => {
      if (asc) {
        return (a[field].toLowerCase() > b[field].toLowerCase())
          ? 1
          : (a[field].toLowerCase() < b[field].toLowerCase())
            ? -1
            : 0;
      }
      return (a[field].toLowerCase() < b[field].toLowerCase())
        ? 1
        : (a[field].toLowerCase() > b[field].toLowerCase())
          ? -1
          : 0;
    });
  }
  onSearchChanged(e) {
    this.searchItems = [...this.searchItems, e];
    this.searchItems.length !== 0 ? (this.isFiltered = true) : (this.isFiltered = false);
    this.filteredItems = filterDataGrid(this.searchItems, this.programs$);
  }
  onSearchRemove(e) {
    this.searchItems.splice(e, 1);
    this.searchItems.length !== 0 ? (this.isFiltered = true) : (this.isFiltered = false);
    this.filteredItems = filterDataGrid(this.searchItems, this.programs$);
  }
  onLayoutTypeChanged(e){
    this.cdr.detectChanges();
  }
  toggleFiltersDisplaying(value?: boolean) {
  }
}
