import { ChangeDetectorRef, Component, ElementRef, Inject, Injector, NgZone, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { find } from 'lodash-es';
import { SessionStorage } from 'ngx-webstorage';
import { combineLatest, Observable, of } from 'rxjs';
import { delay, distinctUntilChanged, filter, map, take, takeUntil, tap } from 'rxjs/operators';
import { cloneDeep } from 'lodash-es';

import { AuthService } from '@pe/ng-kit/modules/auth';
import {
    DataGridAbstractComponent,
    DataGridFilterInterface,
    DataGridFilterSchemaInterface,
    DataGridFilterSelectOptionInterface,
    DataGridFilterType,
    DataGridTableColumnInterface,
    DataViewModeType
} from '@pe/ng-kit/modules/data-grid';
import { DATE_TIME_FORMAT, TranslateService } from '@pe/ng-kit/modules/i18n';
import {
  ApiService,
  FiltersFieldType,
  FiltersOptionsSourcesType,
  ListInterface,
  ListResponseInterface,
  notToggleableColumns,
  PaginationInterface,
  SettingsService,
  IconsService,
  TransactionsFilterSchemaInterface,
  StatusType, PaymentType
} from '../../../shared';
import {
    activeColumnsSelector,
    activeFiltersSelector,
    addFilter,
    addSearchQuery,
    businessChannelsConditionsSelector,
    businessCurrenciesConditionsSelector,
    businessCurrencySelector,
    businessPaymentOptionsConditionsSelector,
    changeSortDirection,
    filtersSchemaSelector,
    GlobalStateInterface,
    initFiltersSchema,
    loadMore,
    nextPage,
    paginationSelector,
    removeFilter,
    specificStatusesConditionsSelector,
    statusesConditionsSelector,
    storesConditionsSelector,
    transactionsListDataSelector,
    updateColumns
} from '../../../shared/state-management';
import { StatusUpdaterService } from '../../../shared';

interface SortItem extends Sort {
  label: string;
}

const transactionsListSortOptions: SortItem[] = [
  {
    label: 'customer_name',
    active: 'customer_name',
    direction: 'asc'
  },
  {
    label: 'total_high',
    active: 'total',
    direction: 'desc'
  },
  {
    label: 'total_low',
    active: 'total',
    direction: 'asc'
  },
  {
    label: 'date',
    active: 'created_at',
    direction: 'desc'
  }
];

@Component({
  selector: 'or-transactions-list',
  templateUrl: 'transactions-list.component.html',
  styleUrls: ['transactions-list.component.scss']
})
export class TransactionsListComponent extends DataGridAbstractComponent<ListInterface> {

  @ViewChild('channelEl', { read: ElementRef }) channelEl: ElementRef;
  @ViewChild('createdAtEl', { read: ElementRef }) createdAtEl: ElementRef;
  @ViewChild('customerEmailEl', { read: ElementRef }) customerEmailEl: ElementRef;
  @ViewChild('customerNameEl', { read: ElementRef }) customerNameEl: ElementRef;
  @ViewChild('merchantEmailEl', { read: ElementRef }) merchantEmailEl: ElementRef;
  @ViewChild('merchantNameEl', { read: ElementRef }) merchantNameEl: ElementRef;
  @ViewChild('sellerEmailEl', { read: ElementRef }) sellerEmailEl: ElementRef;
  @ViewChild('sellerNameEl', { read: ElementRef }) sellerNameEl: ElementRef;
  @ViewChild('originalIdEl', { read: ElementRef }) originalIdEl: ElementRef;
  @ViewChild('referenceEl', { read: ElementRef }) referenceEl: ElementRef;
  @ViewChild('specificStatusEl', { read: ElementRef }) specificStatusEl: ElementRef;
  @ViewChild('statusEl', { read: ElementRef }) statusEl: ElementRef;
  @ViewChild('totalEl', { read: ElementRef }) totalEl: ElementRef;
  @ViewChild('typeEl', { read: ElementRef }) typeEl: ElementRef;
  @ViewChild('matSortEl', { read: MatSort }) matSortEl: MatSort;

  isMobile: boolean;
  isIpad: boolean;
  isDesktopLg: boolean;

  activeFilters$: Observable<DataGridFilterInterface[]> = null;
  activeFiltersVisible$: Observable<DataGridFilterInterface[]> = null;
  activeColumns$: Observable<string[]> = null;
  currency$: Observable<string> = of('EUR');
  displayedColumns$: Observable<any>;
  columns$: Observable<DataGridTableColumnInterface[]> = null;
  items$: Observable<ListResponseInterface> = null;
  pagination$: Observable<PaginationInterface> = null;
  searchValue$: Observable<string>;
  filtersSchema$: Observable<DataGridFilterSchemaInterface[]>;
  filtersSchemaCloned$: Observable<DataGridFilterSchemaInterface[]>;
  filtersSchemaWithSearch$: Observable<DataGridFilterSchemaInterface[]>;
  gridOrder: any;

  sortOptions: SortItem[] = transactionsListSortOptions;
  activeSort: SortItem;

  dataViewMode: typeof DataViewModeType = DataViewModeType;
  viewMode: DataViewModeType = this.dataViewMode.List;
  isEmbeddedMode: boolean;

  pageSize: number = 20;

  isLoading: boolean = true;
  /*
    embeddedModeColumns: any[] = [
      FiltersFieldType.Type,
      FiltersFieldType.CustomerName,
      FiltersFieldType.Total,
      FiltersFieldType.CreatedAt,
      FiltersFieldType.Status,
      FiltersFieldType.OriginalId
    ];
  */
  sizes: any = {};

  @SessionStorage() private columnsCached: DataGridTableColumnInterface[];

  constructor(
    injector: Injector,
    private apiService: ApiService,
    private authService: AuthService,
    private changeDetectorRef: ChangeDetectorRef,
    private iconsService: IconsService,
    private settingsService: SettingsService,
    private store: Store<GlobalStateInterface>,
    private translateService: TranslateService,
    private statusUpdaterService: StatusUpdaterService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private ngZone: NgZone,
    @Inject(DATE_TIME_FORMAT) public dateTimeFormat: string
  ) {
    super(injector);
    (window as any).PayeverStatic?.SvgIconsLoader?.loadIcons([
      // TODO Load only if channel is presented in list. Also we need to migrate all icons to this loading approach.
      'channel-whatsapp',
      'channel-instagram',
      'channel-fb-messenger',
      'channel-fb'
    ]);
  }

  ngOnInit(): void {
    this.isEmbeddedMode = this.settingsService.isEmbeddedMode;
    this.columns$ = this.store.select(activeColumnsSelector).pipe(
      takeUntil(this.destroyed$),
      filter((data: DataGridTableColumnInterface[]) => !!data),
      map((data: DataGridTableColumnInterface[]) => {
        return data.map((tableColumn: DataGridTableColumnInterface) => {
          tableColumn.title = this.translateService.translate(`form.filter.labels.${tableColumn.name}`);
          return tableColumn;
        });
      }),
      map((columns: DataGridTableColumnInterface[]) => {
        // restoring active columns from value saved in local session
        if (this.columnsCached) {
          columns.forEach((column: DataGridTableColumnInterface) => {
            const savedColumn: DataGridTableColumnInterface = this.columnsCached.find(colCached => colCached.name === column.name);
            if (savedColumn) {
              column.isActive = savedColumn.isActive;
            }
          });
        }
        return columns;
      })
    );
    this.activeColumns$ = this.columns$.pipe(
      takeUntil(this.destroyed$),
      map((columns: DataGridTableColumnInterface[]) => {
        return this.getColumns(columns);
      }),
      tap(() => {
        this.sizes = {
          channel: this.channelEl ? this.channelEl.nativeElement.offsetWidth : 0,
          originalId: this.originalIdEl ? this.originalIdEl.nativeElement.offsetWidth : 0,
          reference: this.referenceEl ? this.referenceEl.nativeElement.offsetWidth : 0,
          createdAt: this.createdAtEl ? this.createdAtEl.nativeElement.offsetWidth : 0,
          customerName: this.customerNameEl ? this.customerNameEl.nativeElement.offsetWidth : 0,
          customerEmail: this.customerEmailEl ? this.customerEmailEl.nativeElement.offsetWidth : 0,
          merchantName: this.merchantNameEl ? this.merchantNameEl.nativeElement.offsetWidth : 0,
          merchantEmail: this.merchantEmailEl ? this.merchantEmailEl.nativeElement.offsetWidth : 0,
          sellerName: this.sellerNameEl ? this.sellerNameEl.nativeElement.offsetWidth : 0,
          sellerEmail: this.sellerEmailEl ? this.sellerEmailEl.nativeElement.offsetWidth : 0,
          status: this.statusEl ? this.statusEl.nativeElement.offsetWidth : 0,
          specificStatus: this.specificStatusEl ? this.specificStatusEl.nativeElement.offsetWidth : 0,
          type: this.typeEl ? this.typeEl.nativeElement.offsetWidth : 0,
          total: this.totalEl ? this.totalEl.nativeElement.offsetWidth : 0
        };
        this.changeDetectorRef.detectChanges();
      })
    );
    this.items$ = this.store.select(transactionsListDataSelector).pipe(
      takeUntil(this.destroyed$),
      filter((data: ListResponseInterface) => !!data && !!data.collection),
      map((data: ListResponseInterface) => {
        data = cloneDeep(data);
        if (data.collection.length) {
          this.statusUpdaterService.triggerUpdateStatus(
            data.collection.map(d => d.uuid)
          );
        }
        data.collection = data.collection.map((item: ListInterface) => {
          // this.hideSpecificStatus(item); // temp hide specific_status for some payments
          // this.setColor(item);

          return item;
        });
        return data;
      }),
      tap(() => {
        this.isLoading = false;
        this.updateFiltersSchema();
      })
    );

    this.activeFilters$ = this.store.select(activeFiltersSelector).pipe(
      takeUntil(this.destroyed$),
      filter(Boolean)
    ) as Observable<DataGridFilterInterface[]>;

    this.activeFiltersVisible$ = this.activeFilters$.pipe(
      takeUntil(this.destroyed$),
      map((a: DataGridFilterInterface[]) => {
        return a.filter(b => b.key !== 'channel_set_uuid');
      })
    );

    this.searchValue$ = this.activeFilters$.pipe(
      takeUntil(this.destroyed$),
      map((filters: DataGridFilterInterface[]) => {
        const searchFilter: DataGridFilterInterface = filters.find(filter => filter.key === 'search');
        return searchFilter ? searchFilter.value : '';
      })
    );

    this.pagination$ = this.store.select(paginationSelector).pipe(
      takeUntil(this.destroyed$),
      filter((data: PaginationInterface) => !!data),
      map((data: PaginationInterface) => {
        return Object.assign({}, data);
      })
    );

    this.windowService.isMobile$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe((isMobile: boolean) => {
      this.isMobile = isMobile;
    });

    this.windowService.isIpad$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe((isIpad: boolean) => {
      this.isIpad = isIpad;
    });

    this.windowService.isDesktopLg$.pipe(
      takeUntil(this.destroyed$)
    ).subscribe((isDesktopLg: boolean) => {
      this.isDesktopLg = isDesktopLg;
    });

    this.items$.pipe(
      takeUntil(this.destroyed$),
      delay(300)
    ).subscribe(() => {
      this.sizes = {
        channel: this.channelEl ? this.channelEl.nativeElement.offsetWidth : 0,
        createdAt: this.createdAtEl ? this.createdAtEl.nativeElement.offsetWidth : 0,
        customerEmail: this.customerEmailEl ? this.customerEmailEl.nativeElement.offsetWidth : 0,
        customerName: this.customerNameEl ? this.customerNameEl.nativeElement.offsetWidth : 0,
        merchantEmail: this.merchantEmailEl ? this.merchantEmailEl.nativeElement.offsetWidth : 0,
        merchantName: this.merchantNameEl ? this.merchantNameEl.nativeElement.offsetWidth : 0,
        originalId: this.originalIdEl ? this.originalIdEl.nativeElement.offsetWidth : 0,
        reference: this.referenceEl ? this.referenceEl.nativeElement.offsetWidth : 0,
        specificStatus: this.specificStatusEl ? this.specificStatusEl.nativeElement.offsetWidth : 0,
        status: this.statusEl ? this.statusEl.nativeElement.offsetWidth : 0,
        total: this.totalEl ? this.totalEl.nativeElement.offsetWidth : 0,
        type: this.typeEl ? this.typeEl.nativeElement.offsetWidth : 0
      };
      this.changeDetectorRef.detectChanges();
    });

    this.displayedColumns$ = combineLatest(this.activeColumns$, this.windowService.width$).pipe(
      takeUntil(this.destroyed$),
      map((data) => {
        const activeColumns: any = data[0];
        /*
        if (this.isEmbeddedMode) {
          if (this.isMobile) {
            const columns: string[] = this.mobileColumns.slice();
            // removing channel as not relevant for embed mode
            columns.splice(columns.indexOf(FiltersFieldType.Channel), 1);
            return columns;
          } else if (this.isIpad) {
            const columns: string[] = this.ipadColumns.slice();
            // removing channel as not relevant for embed mode
            columns.splice(columns.indexOf(FiltersFieldType.Channel), 1);
            return columns;
          } else {
            return this.embeddedModeColumns;
          }
        } else {*/
        if (this.isMobile) {
          return this.mobileColumns;
        } else if (this.isIpad) {
          return this.ipadColumns;
        } else {
          return activeColumns;
        }
        // }
      }),
      distinctUntilChanged()
    );

    this.currency$ = this.store.select(businessCurrencySelector).pipe(
      takeUntil(this.destroyed$)
    );
    this.filtersSchema$ = this.store.select(filtersSchemaSelector).pipe(
      takeUntil(this.destroyed$)
    );
    this.filtersSchemaCloned$ = this.filtersSchema$.pipe(map(filter => {
      // We have to clone because ng-kit filter can translate labels and we get access error (not possible to fix inside ng-kit now)
      return cloneDeep(filter);
    }));
    this.filtersSchemaWithSearch$ = this.store.select(filtersSchemaSelector).pipe(
      takeUntil(this.destroyed$),
      map((filtersSchema: DataGridFilterSchemaInterface[]) => {
        const updatedSchema: DataGridFilterSchemaInterface[] = filtersSchema.slice();
        updatedSchema.push({
          field: 'search',
          fieldLabel: `form.filter.labels.search`,
          type: DataGridFilterType.Text
        });
        return updatedSchema;
      })
    );

    const dateOption: SortItem = find(this.sortOptions, { label: 'date' })
    this.onDropdownSort(dateOption);
  }

  get mobileColumns(): FiltersFieldType[] {
    return [
      FiltersFieldType.Channel,
      FiltersFieldType.Type,
      this.authService.isAdmin() ? FiltersFieldType.MerchantName : FiltersFieldType.CustomerName,
      FiltersFieldType.Total,
      FiltersFieldType.OriginalId
    ];
  }

  get ipadColumns(): FiltersFieldType[] {
    return [
      FiltersFieldType.Channel,
      FiltersFieldType.Type,
      FiltersFieldType.OriginalId,
      this.authService.isAdmin() ? FiltersFieldType.MerchantName : FiltersFieldType.CustomerName,
      FiltersFieldType.Total,
      FiltersFieldType.CreatedAt,
      FiltersFieldType.Status
    ];
  }

  getStatusLoading$(item: ListInterface): Observable<boolean> {
    return this.statusUpdaterService.isLoading$(item.uuid);
  }

  getStatus$(item: ListInterface): Observable<StatusType> {
    return this.statusUpdaterService.getStatus$(item.uuid).pipe(map(s => s || item.status));
  }

  getStatusColor$(item: ListInterface): Observable<string> {
    return this.getStatus$(item).pipe(map(s => this.getColor(s)));
  }

  getSpecificStatus$(item: ListInterface): Observable<string> {
    return this.statusUpdaterService.getSpecificStatus$(item.uuid).pipe(
      map(s => s || item.specific_status),
      map(s => this.isHideSpecificStatus(item.type) ? null : s)
    );
  }

  onClickFilterRemove(chip: DataGridFilterInterface): void {
    this.isLoading = true;
    this.store.dispatch(removeFilter(chip));
  }

  onColumnsChange(columns: DataGridTableColumnInterface[]): void {
    this.columnsCached = columns;
    this.store.dispatch(updateColumns(columns));
  }

  onSearch(searchQuery: string): void {
    this.isLoading = true;
    this.store.dispatch(addSearchQuery(searchQuery));
  }

  onSort(sort: Sort): void {
    this.store.select(businessCurrencySelector).pipe(take(1)).subscribe(currency => {
      if (currency) { // Currency check is the small hack to avoid additional request on page load
        this.isLoading = true;
        this.gridOrder = {
          orderBy: sort.active,
          direction: sort.direction
        };
        this.store.dispatch(changeSortDirection(this.gridOrder));
      }
    });
  }

  onDropdownSort(sort: SortItem): void {
    // reset columns sort
    if (this.matSortEl) {
      // since there's no need to fully reset to default when sorting on dropdown, only change direction to prevent http request.
      this.matSortEl.direction = '';
      this.matSortEl._stateChanges.next();
    }

    // direction toggle should happen only when repeatedly sorting by date
    if (this.activeSort && sort.label === 'date' && this.activeSort.label == sort.label) {
      this.toggleSortDirection(sort);
    }

    this.activeSort = sort;
    this.onSort(sort);
  }

  toggleSortDirection(sort: SortItem): void {
    sort.direction = sort.direction === 'asc' ? 'desc' : 'asc';
  }

  onRowClick(transaction: any): void {
      this.router.navigate(['../', transaction.uuid], {
        queryParamsHandling: 'merge',
        relativeTo: this.activatedRoute
      });
  }

  onFilterAdded(filter: DataGridFilterInterface): void {
    this.isLoading = true;
    this.store.dispatch(addFilter(filter));
  }

  onLoadMore(): void {
    this.store.dispatch(loadMore());
  }

  openTransaction(uuid: string): void {
    // NOTE: somewhy simple navigation run outside of zone
    this.ngZone.run(() => {
      this.router.navigate(['..', uuid], { relativeTo: this.activatedRoute, queryParamsHandling: 'merge' });
    });
  }

  getTransactions(currentPage: number): void {
    this.isLoading = true;
    this.store.dispatch(nextPage(`${currentPage + 1}`));
  }

  getPaymentMethodIconId(paymentMethodType: string): string {
    return this.iconsService.getPaymentMethodIconId(paymentMethodType);
  }

  getChannelIconId(channelType: string): string {
    return this.iconsService.getChannelIconId(channelType);
  }

  private getColumns(columns: DataGridTableColumnInterface[]): string[] {
    const columnNames: FiltersFieldType[] = columns
      .filter((column: DataGridTableColumnInterface) => column.isActive)
      .map((column: DataGridTableColumnInterface) => column.name as FiltersFieldType);
    return notToggleableColumns.concat(columnNames);
  }

  private getOptions(optionsSource: FiltersOptionsSourcesType): DataGridFilterSelectOptionInterface[] {
    let selector: any = null;
    switch (optionsSource) {
      case FiltersOptionsSourcesType.Channels:
        selector = businessChannelsConditionsSelector;
        break;
      case FiltersOptionsSourcesType.Currencies:
        selector = businessCurrenciesConditionsSelector;
        break;
      case FiltersOptionsSourcesType.PaymentMethods:
        selector = businessPaymentOptionsConditionsSelector;
        break;
      case FiltersOptionsSourcesType.Statuses:
        selector = statusesConditionsSelector;
        break;
      case FiltersOptionsSourcesType.SpecificStatuses:
        selector = specificStatusesConditionsSelector;
        break;
      case FiltersOptionsSourcesType.Stores:
        selector = storesConditionsSelector;
        break;
      default:
        selector = null;
    }
    let options: DataGridFilterSelectOptionInterface[] = null;
    if (selector) {
      this.store.select(selector).pipe(
        take(1))
        .subscribe((data: DataGridFilterSelectOptionInterface[]) => {
          options = data;
        });
    } else {
      options = [];
    }
    return options;
  }

  private updateFiltersSchema(): void {
    const filtersSchema: TransactionsFilterSchemaInterface[] = cloneDeep(this.settingsService.filters.slice());
    filtersSchema.forEach((filter: TransactionsFilterSchemaInterface) => {
      if (filter.type === DataGridFilterType.Select) {
        filter.options = this.getOptions(filter.optionsSource);
      }
    });
    this.store.dispatch(initFiltersSchema(filtersSchema));
  }

  private getColor(status: StatusType): string {
    let color: string = null;
    switch (status) {
      case 'STATUS_ACCEPTED':
      case 'STATUS_PAID':
        color = 'green';
        break;
      case 'STATUS_FAILED':
      case 'STATUS_CANCELLED':
      case 'STATUS_DECLINED':
        color = 'red';
        break;
      default:
        color = 'yellow';
        break;
    }
    return  color;
  }

  private isHideSpecificStatus(type: PaymentType): boolean {
    let hide: boolean = false;
    switch (type) {
      case 'sofort':
      case 'santander_factoring_de':
      case 'santander_pos_factoring_de':
      case 'santander_invoice_de':
      case 'santander_pos_invoice_de':
        hide = true;
        break;
      default:
    }
    return hide;
  }
}
