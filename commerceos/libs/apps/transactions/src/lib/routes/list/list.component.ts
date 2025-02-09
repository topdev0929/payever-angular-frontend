import { Overlay } from '@angular/cdk/overlay';
import { CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, Injector, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { MatMenuTrigger } from '@angular/material/menu';
import { DomSanitizer } from '@angular/platform-browser';
import { ApmService } from '@elastic/apm-rum-angular';
import { SelectSnapshot } from "@ngxs-labs/select-snapshot";
import { isEqual } from 'lodash-es';
import { BehaviorSubject, EMPTY, merge, Observable, of, Subject } from 'rxjs';
import { catchError, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { BusinessAccessOptionsInterface } from '@pe/business';
import {
  EnvironmentConfigInterface,
  EnvService,
  MenuSidebarFooterData,
  PeDataGridLayoutType,
  PeDataGridSingleSelectedAction,
  PeDestroyService,
  PE_ENV,
  PeDataGridSortByActionIcon,
  MessageBus,
  PePreloaderService,
  APP_TYPE,
  AppType,
  UserTypeBusinessEnum,
} from '@pe/common';
import { FolderService, MoveIntoFolderEvent, PeMoveToFolderItem } from '@pe/folders';
import {
  FilterInterface,
  PeCustomMenuInterface,
  PeDataGridLayoutByActionIcon,
  PeDataToolbarOptionIcon, PeGridItem, PeGridItemColumn, PeGridItemContextSelect, PeGridMenu,
  PeGridMenuItem, PeGridSidenavService, PeGridTableDisplayedColumns, PeGridView, PeGridViewportContextSelect,
  PeGridTableService,
  GridSkeletonColumnType,
  PeGridQueryParamsService,
  GridQueryParams,
  PeGridViewportService,
} from '@pe/grid';
import { PeFilterChange } from '@pe/grid/shared';
import { TranslateService } from '@pe/i18n';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { DragAreaTypes, FolderItem, RootFolderItem } from '@pe/shared/folders';
import { BusinessState } from "@pe/user";
import { WindowService } from '@pe/window';

import { ExportTransactionsClass } from '../../classes/export-transactions.class';
import { ApiService } from '../../services/api.service';
import { TransactionsListService } from '../../services/list.service';
import { SettingsService } from '../../services/settings.service';
import { StatusUpdaterService } from '../../services/status-updater.service';
import { TransactionsFoldersService } from '../../services/transactions-folders.service';
import { TransactionsRuleService } from '../../services/transactions-rules.service';
import { FiltersFieldType, HIDDEN_VALUE } from '../../shared';
import { DEFAULT_FOLDERS_VALUE, defaultFolders } from '../../shared/folders-constants';
import {
  ActiveColumnInterface,
  IntegrationInfoInterface,
  ListResponseInterface,
  TransactionInterface,
} from '../../shared/interfaces/list.interface';
import { ResponseValuesInterface } from '../../shared/interfaces/values.interface';

enum OptionsMenu {
  SelectAll = 'select-all',
  DeselectAll = 'deselect-all',
  Duplicate = 'duplicate',
  Delete = 'delete'
}

enum SideNavMenuActions {
  NewFolder = 'new_folder',
  NewHeadline = 'new_headline',
  Rules = 'manage_rules'
}

interface ToolbarMenuInterface {
  optionsMenu: PeGridMenu,
  sortMenu: PeGridMenu,
  customMenus: PeCustomMenuInterface[]
}

@Component({
  selector: 'pe-transactions-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  providers: [
    CurrencyPipe,
    TransactionsFoldersService,
    PeDestroyService,
  ],
})

export class PeListComponent extends ExportTransactionsClass implements OnInit, OnDestroy {
  @SelectSnapshot(BusinessState.businessAccessOptions) businessAccessOptions: BusinessAccessOptionsInterface;

  readonly FiltersFieldType = FiltersFieldType;
  readonly DEFAULT_FOLDERS = defaultFolders;

  selectedItem = null;

  defaultFolderIcon = `${this.envConfig.custom.cdn}/icons-transactions/folder.svg`;

  defaultRightPaneButtons = null;
  isMobile = document.body.clientWidth <= 720;

  refreshSubject$ = new BehaviorSubject(true);
  showSidebarStream$ = new BehaviorSubject<boolean>(true);
  totalValue$ = new BehaviorSubject<string>('');

  singleSelectedAction: PeDataGridSingleSelectedAction = {
    label: this.translateService.translate('transactions.actions.open'),
    callback: (uuid: string) => {
      this.listService.openDetails(uuid);
    },
  };

  rootFolderData: RootFolderItem = {
    _id: null,
    name: this.translateService.translate('transactions.all_transactions'),
    image: this.defaultFolderIcon,
  }

  enableMoveFolderAreas: DragAreaTypes[] = [DragAreaTypes.Above, DragAreaTypes.Center, DragAreaTypes.Below];

  sidebarControls: MenuSidebarFooterData;
  defaultLayout: PeDataGridLayoutType = PeDataGridLayoutType.List;
  movedFolder$ = new Subject<{ folderId: string, transactionId: string }>();
  mobileTitle$ = new BehaviorSubject<string>(this.rootFolderData.name);

  gridLayout: PeGridView;

  itemContextMenu$ = new BehaviorSubject<PeGridMenu>({ items: [] }); // TODO

  viewMenu: PeGridMenu = {
    title: this.translateService.translate('grid.content.toolbar.layout'),
    items: [
      {
        label: this.translateService.translate('grid.content.toolbar.list'),
        value: PeGridView.TableWithScroll,
        defaultIcon: PeDataGridLayoutByActionIcon.ListLayout,
      },
      {
        label: this.translateService.translate('grid.content.toolbar.grid'),
        value: PeGridView.ListWithMobile,
        defaultIcon: PeDataGridLayoutByActionIcon.GridLayout,
        minItemWidth: 290,
        maxColumns: 5,
      },
    ],
  };

  displayedColumns: PeGridTableDisplayedColumns[] = this.getDisplayedColumns(PeGridView.ListWithMobile);
  tableColumns: PeGridTableDisplayedColumns[] = this.getDisplayedColumns(PeGridView.TableWithScroll);

  sidenavMenu: PeGridMenu = {
    title: this.translateService.translate('transactions.folder.title'),
    showCloseButton: false,
    items: [
      {
        label: this.translateService.translate('transactions.folder.new_folder'),
        value: SideNavMenuActions.NewFolder,
      },
      {
        label: this.translateService.translate('transactions.folder.new_headline'),
        value: SideNavMenuActions.NewHeadline,
      },
      {
        label: this.translateService.translate('transactions.folder.rules'),
        value: SideNavMenuActions.Rules,
        hidden: this.settingsService.isPersonal,
      },
    ],
  }

  customMenuItems: PeCustomMenuInterface[] = [
    {
      title: this.translateService.translate('transactions.export.title'),
      items: [
        {
          icon: 'icon-export-csv',
          label: 'CSV',
          onClick: () => {
            this.onExport('csv', this.selectedColumns, this.selectedFolder);
          },
        },
        {
          icon: 'icon-export-xlsx',
          label: 'XLSX',
          onClick: () => {
            this.onExport('xlsx', this.selectedColumns, this.selectedFolder);
          },
        },
        {
          icon: 'icon-export-pdf',
          label: 'PDF',
          onClick: () => {
            this.onExport('pdf', this.selectedColumns, this.selectedFolder);
          },
        },
      ],
    },
  ];

  toolbar: ToolbarMenuInterface = {
    optionsMenu: {
      title: this.translateService.translate('builder-themes.overlay.options'),
      items: [
        {
          label: this.translateService.translate('builder-themes.actions.select_all'),
          value: OptionsMenu.SelectAll,
          defaultIcon: PeDataToolbarOptionIcon.SelectAll,
        },
        {
          label: this.translateService.translate('builder-themes.actions.deselect_all'),
          value: OptionsMenu.DeselectAll,
          defaultIcon: PeDataToolbarOptionIcon.DeselectAll,
        },
        {
          label: this.translateService.translate('builder-themes.actions.duplicate'),
          value: OptionsMenu.Duplicate,
          defaultIcon: PeDataToolbarOptionIcon.Duplicate,
        },
        {
          label: this.translateService.translate('builder-themes.actions.delete'),
          value: OptionsMenu.Delete,
          defaultIcon: PeDataToolbarOptionIcon.Delete,
        },
      ],
    },
    sortMenu: {
      title: this.translateService.translate('transactions.sort.title'),
      items: [
        {
          label: this.translateService.translate('transactions.sort.date_late'),
          value: 'created_at.desc',
          defaultIcon: PeDataGridSortByActionIcon.Descending,
          active: true,
        },
        {
          label: this.translateService.translate('transactions.sort.date_early'),
          value: 'created_at.asc',
          defaultIcon: PeDataGridSortByActionIcon.Ascending,
        },
        {
          label: this.translateService.translate('transactions.sort.customer_name'),
          value: 'customer_name.desc',
          defaultIcon: PeDataGridSortByActionIcon.Descending,
        },
        {
          label: this.translateService.translate('transactions.sort.customer_name'),
          value: 'customer_name.asc',
          defaultIcon: PeDataGridSortByActionIcon.Ascending,
        },
        {
          label: this.translateService.translate('transactions.sort.total_high'),
          value: 'total_left.desc',
          defaultIcon: PeDataGridSortByActionIcon.Descending,
        },
        {
          label: this.translateService.translate('transactions.sort.total_low'),
          value: 'total_left.asc',
          defaultIcon: PeDataGridSortByActionIcon.Ascending,
        },
      ],
    },
    customMenus: this.isNotEmployee ? this.customMenuItems : [],
  };

  integrationsLoaded = false;

  public selectedFolder: FolderItem = null;
  private folderTree$ = new BehaviorSubject<FolderItem[]>(this.DEFAULT_FOLDERS);

  set showSidebar(value: boolean) {
    this.showSidebarStream$.next(value);
  }

  set foldersTreeData(folders: FolderItem[]) {
    const sorted = folders.slice().sort((a, b) => a.position - b.position);
    const newFolders = [...this.DEFAULT_FOLDERS, ...sorted].map(item => ({
      ...item,
      name: this.translateService.translate(item.name),
      children: item.children.map(children =>({
        ...children,
        name: this.translateService.translate(children.name),
      })),
    }));

    this.folderTree$.next(newFolders);
  }

  get foldersTreeData(): FolderItem[] {
    return this.folderTree$.value;
  }

  get foldersTreeData$(): Observable<FolderItem[]> {
    return this.folderTree$.asObservable();
  }

  get hasFilter(): boolean {
    return !!this.searchItems2?.length;
  }

  get isNotEmployee(): boolean{
    return this.businessAccessOptions?.userTypeBusiness !== UserTypeBusinessEnum.Employee;
  }

  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

  constructor(
    public transactionsFoldersService: TransactionsFoldersService,
    public envService: EnvService,
    public apiService: ApiService,
    public translateService: TranslateService,
    public statusUpdaterService: StatusUpdaterService,
    public injector: Injector,
    public listService: TransactionsListService,
    public overlay: Overlay,
    public viewContainerRef: ViewContainerRef,
    @Inject(PE_ENV) public envConfig: EnvironmentConfigInterface,
    private headerService: PePlatformHeaderService,
    private destroy$: PeDestroyService,
    private cdr: ChangeDetectorRef,
    private transactionsRuleService: TransactionsRuleService,
    private folderService: FolderService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private messageBus: MessageBus,
    private gridSidenavService: PeGridSidenavService,
    private settingsService: SettingsService,
    private tableService: PeGridTableService,
    private apmService: ApmService,
    private pePreloaderService: PePreloaderService,
    private gridQueryParamsService: PeGridQueryParamsService,
    @Inject(APP_TYPE) private appType: AppType,
    private peGridViewportService: PeGridViewportService,
    private windowService: WindowService,
  ) {
    super(injector);
    this.pePreloaderService.startLoading(this.appType);
    this.pePreloaderService.initFinishObservers([
      this.isLoading$,
      this.isFoldersLoading$,
    ], this.appType);
    this.listService.cdrComponent = this.cdr;
    this.loadCDNIcons([
      'icon-export-tr',
      'icon-export-csv',
      'icon-export-pdf',
      'icon-export-xlsx',
      'no-orders',
    ]);
  }

  get selectedColumns(): ActiveColumnInterface[] {
    const cols = this.gridLayout === PeGridView.TableWithScroll ? this.tableColumns : this.displayedColumns;

    return cols.reduce((acc, item: any) => {
      if (item?.selected$?.value) {
        return [...acc, {
          name: item.name,
          title: item.title,
        }];
      }

      return acc;
    }, []);
  }

  private enableColumn(view: PeGridView): boolean {
    return view === PeGridView.ListWithMobile && this.isMobile ? true : !this.isMobile;
  }

  private getDisplayedColumns(view: PeGridView): PeGridTableDisplayedColumns[] {
    return [
      {
        name: FiltersFieldType.Channel,
        title: this.translateService.translate(`transactions.filter.labels.${FiltersFieldType.Channel}`),
        cellComponentFactory: this.channelComponentFactory,
        selected$: this.listService.makeBehaviorSubjectWithStorate(FiltersFieldType.Channel, true, view),
        widthCellForMobile: '50px',
        skeletonColumnType: GridSkeletonColumnType.Square,
        positionForMobile: 4,
      },
      {
        name: FiltersFieldType.Total,
        title: this.translateService.translate(`transactions.filter.labels.${FiltersFieldType.Total}`),
        selected$: this.listService.makeBehaviorSubjectWithStorate(FiltersFieldType.Total, true, view),
        disabled: true,
        widthCellForMobile: '80px',
        positionForMobile: 2,
      },
      {
        name: FiltersFieldType.OriginalId,
        title: this.translateService.translate(`transactions.filter.labels.${FiltersFieldType.OriginalId}`),
        selected$: this.listService.makeBehaviorSubjectWithStorate(
          FiltersFieldType.OriginalId,
          this.enableColumn(view),
          view),
        disabled: false,
        widthCellForMobile: '20vw',
        positionForMobile: 14,
        placeholderCondition: this.placeholderCondition,
      },
      {
        name: FiltersFieldType.Reference,
        title: this.translateService.translate(`transactions.filter.labels.${FiltersFieldType.Reference}`),
        selected$: this.listService.makeBehaviorSubjectWithStorate(FiltersFieldType.Reference, false, view),
        widthCellForMobile: '100px',
        positionForMobile: 11,
        placeholderCondition: this.placeholderCondition,
      },
      {
        name: FiltersFieldType.Type,
        title: this.translateService.translate(`transactions.filter.labels.${FiltersFieldType.Type}`),
        selected$: this.listService.makeBehaviorSubjectWithStorate(FiltersFieldType.Type, this.enableColumn(view), view),
        cellComponentFactory: this.paymentComponentFactory,
        widthCellForMobile: '100px',
        skeletonColumnType: GridSkeletonColumnType.Square,
        positionForMobile: 5,
      },
      {
        name: FiltersFieldType.CustomerEmail,
        title: this.translateService.translate(`transactions.filter.labels.${FiltersFieldType.CustomerEmail}`),
        selected$: this.listService.makeBehaviorSubjectWithStorate(FiltersFieldType.CustomerEmail, false, view),
        widthCellForMobile: '100px',
        positionForMobile: 12,
        placeholderCondition: this.placeholderCondition,
      },
      {
        name: FiltersFieldType.CustomerName,
        title: this.translateService.translate(`transactions.filter.labels.${FiltersFieldType.CustomerName}`),
        selected$: this.listService.makeBehaviorSubjectWithStorate(FiltersFieldType.CustomerName, this.enableColumn(view), view),
        widthCellForMobile: '100px',
        positionForMobile: 3,
        placeholderCondition: this.placeholderCondition,
      },
      {
        name: FiltersFieldType.MerchantEmail,
        title: this.translateService.translate(`transactions.filter.labels.${FiltersFieldType.MerchantEmail}`),
        selected$: this.listService.makeBehaviorSubjectWithStorate(FiltersFieldType.MerchantEmail, false, view),
        widthCellForMobile: '100px',
        positionForMobile: 7,
        placeholderCondition: this.placeholderCondition,
      },
      {
        name: FiltersFieldType.MerchantName,
        title: this.translateService.translate(`transactions.filter.labels.${FiltersFieldType.MerchantName}`),
        selected$: this.listService.makeBehaviorSubjectWithStorate(FiltersFieldType.MerchantName, this.enableColumn(view), view),
        widthCellForMobile: '100px',
        positionForMobile: 6,
        placeholderCondition: this.placeholderCondition,
      },
      {
        name: FiltersFieldType.SellerEmail,
        title: this.translateService.translate(`transactions.filter.labels.${FiltersFieldType.SellerEmail}`),
        selected$: this.listService.makeBehaviorSubjectWithStorate(FiltersFieldType.SellerEmail, false, view),
        widthCellForMobile: '100px',
        positionForMobile: 9,
        placeholderCondition: this.placeholderCondition,
      },
      {
        name: FiltersFieldType.SellerName,
        title: this.translateService.translate(`transactions.filter.labels.${FiltersFieldType.SellerName}`),
        selected$: this.listService.makeBehaviorSubjectWithStorate(FiltersFieldType.SellerName, false, view),
        widthCellForMobile: '100px',
        positionForMobile: 8,
        placeholderCondition: this.placeholderCondition,
      },
      {
        name: FiltersFieldType.SellerId,
        title: this.translateService.translate(`transactions.filter.labels.${FiltersFieldType.SellerId}`),
        selected$: this.listService.makeBehaviorSubjectWithStorate(FiltersFieldType.SellerId, false, view),
        widthCellForMobile: '100px',
        positionForMobile: 10,
        placeholderCondition: this.placeholderCondition,
      },
      {
        name: FiltersFieldType.CreatedAt,
        title: this.translateService.translate(`transactions.filter.labels.${FiltersFieldType.CreatedAt}`),
        selected$: this.listService.makeBehaviorSubjectWithStorate(
          FiltersFieldType.CreatedAt,
          this.enableColumn(view) || this.isMobile && view === PeGridView.TableWithScroll,
          view),
        cellComponentFactory: this.createdAtCellComponentFactory,
        widthCellForMobile: '150px',
        positionForMobile: 1,
      },
      {
        name: FiltersFieldType.SpecificStatus,
        title: this.translateService.translate(`transactions.filter.labels.${FiltersFieldType.SpecificStatus}`),
        selected$: this.listService.makeBehaviorSubjectWithStorate(FiltersFieldType.SpecificStatus, false, view),
        cellComponentFactory: this.specificStatusFieldComponentFactory,
        widthCellForMobile: '100px',
        positionForMobile: 13,
      },
      {
        name: FiltersFieldType.Status,
        title: this.translateService.translate(`transactions.filter.labels.${FiltersFieldType.Status}`),
        selected$: this.listService.makeBehaviorSubjectWithStorate(FiltersFieldType.Status, true, view),
        cellComponentFactory: this.statusComponentFactory,
        disabled: true,
        widthCellForMobile: '140px',
        skeletonColumnType: GridSkeletonColumnType.Ellipse,
        positionForMobile: 0,
      },
    ];
  }

  ngOnDestroy(): void {
    this.transactionsRuleService.unsubscribe$.next();
    this.transactionsRuleService.unsubscribe$.complete();
    this.listService.destroy();
    this.statusUpdaterService.resetWidth();
  }

  ngOnInit(): void {

    this.windowService.width$.pipe(
      tap((width)=>{
        this.isMobile = width <= 720;
        this.gridLayout = this.isMobile ? PeGridView.ListWithMobile :
          this.gridQueryParamsService.getQueryParamByName(GridQueryParams.View) as PeGridView || PeGridView.TableWithScroll;
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.headerService.assignConfig({
      mainItem: {
        title: this.translateService.translate('transactions.title'),
        iconType: 'vector',
        icon: '#icon-arrow-left-48',
        iconDimensions: {
          width: '12px',
          height: '20px',
        },
        onClick: () => {
          this.gridSidenavService.toggleViewSidebar();
        },
      },
    } as PePlatformHeaderConfig);

    // As this is triggered for initial call, we also init saved filters
    this.onFiltersChange(this.searchItems2.filter(item => !item.disableRemoveOption));

    this.transactionsRuleService.initRuleListener();
    merge(
      this.peGridViewportService.deviceTypeChange$.pipe(
        tap(({ isMobile }) => {
          this.headerService.assignConfig({
            isShowDataGridToggleComponent: !isMobile,
            isShowMainItem: isMobile,
            isShowSubheader: isMobile,
          } as PePlatformHeaderConfig);
        })
      ),
      this.gridSidenavService.toggleOpenStatus$.pipe(
        tap((open: boolean) => {
          this.headerService.assignConfig({
            isShowMainItem: this.isMobile && !open,
          } as PePlatformHeaderConfig);
        }),
      ),
      this.messageBus.listen('transactions.toggle.sidebar').pipe(
        tap(() => {
          this.gridSidenavService.toggleViewSidebar();
        }),
      ),
      this.apiService.getValues().pipe(
        tap((values: ResponseValuesInterface) => {
          const currency: any = values.filters.find(item => item.fieldName === 'currency');
          currency.options = currency.options.sort((a, b) => {
            if (a.value === 'EUR' || a.value === 'USD' && b.value !== 'EUR') { return -1; }

            return 0;
          });

          const filter: FilterInterface[] = values.filters.filter(item => item?.fieldName !== 'amount_left');
          this.filterItems$.next(filter);
          this.valuesService.valuesData = {
            filters: values.filters,
            channels: values.channels.reduce((acc, item) => ({
              ...acc,
              [item.name]: item,
            }), {}),
            paymentOptions: values.paymentOptions.reduce((acc, item) => ({
              ...acc,
              [item.name]: item,
            }), {}),
          };
        }),
        catchError((error) => {
          return of(error);
        }),
      ),
      this.listService.loadTransactionsTrigger$.pipe(
        filter(d => d !== null && d !== undefined),
        switchMap((reset) => {
          if (Math.ceil(this.paginator.total / this.paginator.perPage) < this.paginator.page) {
            return EMPTY;
          }
          if (reset) {
            this.listService.items = [];
          }

          this.isLoading$.next(true);

          const selectedFolderId = this.selectedFolder?.data?.key !== DEFAULT_FOLDERS_VALUE && this.selectedFolder?._id ;

          return this.apiService.getFolderDocuments(selectedFolderId, this.getSearchData()).pipe(
            tap((resp: ListResponseInterface) => {
              try {
                const items: PeGridItem[] = resp.collection.map(transaction => this.transactionGridItemPipe(transaction));
                this.listService.items = this.listService.items.concat(items);

                if (resp.pagination_data.hasOwnProperty('amount')) {
                  const { amount, amount_currency } = resp.pagination_data;
                  this.totalValue$.next(this.currencyPipe.transform(amount, amount_currency, 'symbol', '1.2-2', this.locale));
                }

                this.setPaginator(resp.pagination_data);
                if (resp.collection.length) {
                  this.statusUpdaterService.triggerUpdateStatus(
                    resp.collection.map(d => d.uuid)
                  );
                }
                this.isLoading$.next(false);

                this.loadIntegrations();
              } catch (err) {
                this.apmService.apm.captureError(
                  `Cant load transactions ERROR ms:\n ${JSON.stringify(err)}`
                );
              }

            }),
            catchError((error) => {
              this.isLoading$.next(false);

              return of(error);
            }),
          );
        }),
        catchError((error) => {
          return of(error);
        }),
      ),
      this.apiService.getTransactionsSettings().pipe(
        tap((resp: any) => {
          this.activeColumns = resp.columns_to_show.map((column: string) => ({
            name: column,
            title: this.translateService.translate(`transactions.filter.labels.${column}`),
          }));
        }),
        catchError((error) => {
          return of(error);
        }),
      ),
      this.listService.loadFolders$.pipe(
        tap(() => this.isFoldersLoading$.next(true)),
        switchMap(() => this.apiService.getFolders().pipe(
          map((resp) => {
            if (!isEqual(this.foldersTreeData, resp)) {
              this.foldersTreeData = resp;
              this.refreshSubject$.next(true);
            }
            this.isFoldersLoading$.next(false);

            return resp;
          }),
          catchError((error) => {
            this.isFoldersLoading$.next(false);

            return of(error);
          }),
        )),
        catchError((error) => {
          return of(error);
        }),
      ),
      this.movedFolder$.pipe(
        tap((data) => {
          if (data?.folderId !== this.selectedFolder._id) {
            this.listService.items = this.listService.items.filter((item: any) => item._id !== data.transactionId);
          }
        }),
        catchError((error) => {
          return of(error);
        }),
      ),
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  onOpenPreview(themeId: PeGridItem): void {
    // TODO
    console.log(themeId);
    //debugger
  }

  loadIntegrations() {
    if (this.settingsService.isPersonal || this.settingsService.isAdmin || this.integrationsLoaded) {
      return;
    }

    this.apiService.getIntegrations(this.businessId).pipe(
      tap((integrations: IntegrationInfoInterface[]) => {
        const installIntegrations: string[] = integrations.reduce((acc, item) => {
          if (item.installed) {
            return [...acc, item.integration.name];
          }

          return acc;
        }, []);

        const type: any = this.valuesService.filters.find(item => item.fieldName === 'type');
        type.options = type.options.filter(item => installIntegrations.includes(item.value));
        this.filterItems$.next(this.valuesService.filters);
        this.integrationsLoaded = true;
      })
    ).subscribe();
  }

  selectSideNavMenu(menuItem: PeGridMenuItem) {
    switch (menuItem.value) {
      case SideNavMenuActions.NewFolder: {
        this.folderService.createFolder('Add folder');
        break;
      }
      case SideNavMenuActions.NewHeadline: {
        this.folderService.createHeadline('Add headline');
        break;
      }
      case SideNavMenuActions.Rules: {
        this.transactionsRuleService.openRules();
        break;
      }
    }
  }

  createByHand(): void {
    // TODO
    //debugger
  }

  actionClick(item: PeGridItem<TransactionInterface>): void {
    let detailId = item.data.original_id;
    if (item.data.original_id !== item.data.uuid) {
      detailId = item.data.uuid;
    }

    this.listService.openDetails(detailId);
  }

  onViewportContextMenu({ menuItem }: PeGridViewportContextSelect): void {
    // TODO
    console.log(menuItem);
    //debugger
  }

  moveToFolder(event: MoveIntoFolderEvent): void {
    // TODO
    console.log(event);
    //debugger
  }

  onItemContentContextMenu({ gridItem, menuItem }: PeGridItemContextSelect) {
    // TODO
    console.log(gridItem);
    console.log(menuItem);
    //debugger
  }

  filtersChange(filters: PeFilterChange[]): void {
    console.log(filters);
    //debugger
  }

  optionsChange(event: OptionsMenu): void {
    console.log(event);
    //debugger
  }

  sortChange(sort: string): void {
    this.paginator.page = 0;
    const splitted = sort.split('.'); // 'customer_name.asc' => ['customer_name', 'asc']
    this.onSortAction(splitted[0], splitted[1]);
  }

  itemsToMove(item: PeGridItem): PeMoveToFolderItem[] { // TODO Do we need that?
    // return [...new Set([ ...this.gridService.selectedItems, item ])];
    return [];
  }

  viewChange(view: PeGridView): void {
    this.gridLayout = view;
  }

  onSelectRootFolder(): void {
    if (this.selectedFolder !== null) {
      this.mobileTitle$.next(this.rootFolderData.name);
      this.selectedFolder = null;
      this.onFiltersChange(this.searchItems2.filter(item => !item.disableRemoveOption));
    }
  }

  onSelectFolder(folder: FolderItem | null): void {
    this.mobileTitle$.next(folder.name);
    this.paginator.page = 0;
    this.selectedFolder = folder;
    const filtersToApply = folder.data?.key === DEFAULT_FOLDERS_VALUE
    ? [folder.data.value, ...this.searchItems2.filter(item => !item.disableRemoveOption)]
    : this.searchItems2.filter(item => !item.disableRemoveOption);
    this.onFiltersChange(filtersToApply);
  }

  onScrollLoad(): void {
    if (!this.isLoading$.value) {
      this.paginator.page += 1;
      this.listService.loadTransactionsTrigger$.next(false);
    }
  }

  getCell(item: PeGridItem, columnName: string): PeGridItemColumn {
    if (!this.tableService.transformColumns[item.id]) {
      return null;
    }

    return this.tableService.transformColumns[item.id][columnName];
  }

  getCellValue(item: PeGridItem, columnName: string): any {
    return this.getCell(item, columnName)?.value;
  }

  private loadCDNIcons(icons: string[]): void {
    icons.forEach((icon) => {
      this.matIconRegistry.addSvgIcon(icon, this.domSanitizer.bypassSecurityTrustResourceUrl(
        `${this.envConfig.custom.cdn}/icons-transactions/${icon}.svg`));
    });
  }

  private placeholderCondition(value: string) {
    return value?.includes(HIDDEN_VALUE);
  }
}
