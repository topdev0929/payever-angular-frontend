import { OverlayRef } from '@angular/cdk/overlay';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  Optional, TemplateRef, ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { Select, Store } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { cloneDeep } from 'lodash-es';
import { BehaviorSubject, EMPTY, forkJoin, merge, Observable, of, throwError } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  skip,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import {
  EnvironmentConfigInterface,
  PE_ENV,
  PeDataGridItem,
  PeDataGridLayoutType,
  PeDataGridSortByActionIcon,
  PeDataGridPaginator,
  PeDestroyService,
  MessageBus,
  EnvService,
  PePreloaderService,
  AppType,
} from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import {
  PeDataGridService,
} from '@pe/data-grid';
import {
  FolderService,
  MoveIntoFolderEvent,
  MoveIntoRootFolderEvent,
  PeFolderEditorComponent,
  PeFolderEditorDataToSaveInterface,
  PeFoldersApiService,
  PeMoveToFolderItem,
} from '@pe/folders';
import {
  GridQueryParams,
  GridSkeletonColumnType,
  MIN_ITEM_WIDTH,
  PeCustomMenuInterface, PeDataGridLayoutByActionIcon,
  PeDataToolbarOptionIcon,
  PeGridItem,
  PeGridItemContextSelect,
  PeGridItemType,
  PeGridMenu,
  PeGridMenuDivider,
  PeGridMenuItem,
  PeGridQueryParamsService,
  PeGridService,
  PeGridSidenavService,
  PeGridTableActionCellComponent,
  PeGridTableDisplayedColumns,
  PeGridTableTitleCellComponent,
  PeGridView,
  PeGridViewportContextSelect,
  PeGridViewportService,
} from '@pe/grid';
import { OutputImportedFileInterface } from '@pe/grid/extensions/import-file';
import {
  PeFilterConditions,
  PeFilterType,
  PeFilterChange,
} from '@pe/grid/shared';
import { TranslateService } from '@pe/i18n';
import { MediaService } from '@pe/media';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import {
  FolderItem,
  FolderOutputEvent,
  PeFoldersActionsEnum,
  RootFolderItem,
} from '@pe/shared/folders';
import {
  AddFolder,
  AddItem,
  AddItems,
  ClearStore,
  DeleteItems,
  EditItem,
  InitLoadFolders,
  OpenFolder,
  ProductsAppState,
  AddProducts,
} from '@pe/shared/products';
import { SnackbarService } from '@pe/snackbar';

import { Direction } from '../../../shared/enums/direction.enum';
import { ProductsFolderAction } from '../../../shared/interfaces/folder.interface';
import {
  ProductModel,
  SearchFilterInterface,
  SearchFiltersInterface,
} from '../../../shared/interfaces/product.interface';
import { ProductsApiService } from '../../../shared/services/api.service';
import { CurrencyService } from '../../../shared/services/currency.service';
import { ProductsOrderBy } from '../../enums/order-by.enum';
import { DataGridService } from '../../services/data-grid/data-grid.service';
import { ImportApiService } from '../../services/import/import-api.service';
import { ProductsFoldersService } from '../../services/products-folder.service';
import { ProductsListService } from '../../services/products-list.service';
import { ProductsRuleService } from '../../services/products-rules.service';
import { ValuesService } from '../../services/values.service';

enum SideNavMenuActions {
  NewFolder = 'new_folder',
  NewHeadline = 'new_headline',
  Rules = 'manage_rules'
}

enum OptionsMenu {
  SelectAll = 'select-all',
  DeselectAll = 'deselect-all',
  Duplicate = 'duplicate',
  Delete = 'delete'
}

enum ContextMenu {
  Edit = 'edit',
  Settings = 'settings',
  Rename = 'rename',
  Copy = 'copy',
  Paste = 'paste',
  Duplicate = 'duplicate',
  AddFolder = 'add_folder',
  Delete = 'delete'
}

enum ThemesIcons {
  'alert-icon' = 'alert.svg',
  'image-placeholder' = 'image-placeholder.svg',
  'add-theme' = 'add-theme.svg',
}

@Component({
  selector: 'pf-products-list',
  templateUrl: 'products-list.component.html',
  styleUrls: ['products-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    ProductsFoldersService,
    PeDestroyService,
  ],
})
export class ProductsListComponent implements OnInit, OnDestroy, AfterViewInit {
  @SelectSnapshot(ProductsAppState.popupMode) popupMode: boolean;

  @ViewChild('importMenu', { static: true }) importMenuRef: TemplateRef<HTMLElement>;

  viewMode: PeDataGridLayoutType;
  private overlayRef: OverlayRef;
  selectedItem: PeDataGridItem;

  searchItems = [];

  filters: any;
  selectedItems: string[];

  sidenavMenu = {
    title: this.translateService.translate('sidebar.category'),
    showCloseButton: false,
    items: [
      {
        label: this.translateService.translate('sidebar.new_folder'),
        value: SideNavMenuActions.NewFolder,
      },
      {
        label: this.translateService.translate('sidebar.new_headline'),
        value: SideNavMenuActions.NewHeadline,
      },
      {
        label: this.translateService.translate('sidebar.rules'),
        value: SideNavMenuActions.Rules,
      },
    ],
  }

  toolbar = {
    filterConfig: [{
      fieldName: ProductsOrderBy.Title,
      filterConditions: [
        PeFilterConditions.Contains,
        PeFilterConditions.DoesNotContain,
      ],
      label: this.translateService.translate('sorters.name'),
      type: PeFilterType.String,
    }],
    optionsMenu: {
      title: this.translateService.translate('toolbar.options.title'),
      items: [
        {
          label: this.translateService.translate('toolbar.options.select_all'),
          value: OptionsMenu.SelectAll,
          defaultIcon: PeDataToolbarOptionIcon.SelectAll,
        },
        {
          label: this.translateService.translate('toolbar.options.deselect_all'),
          value: OptionsMenu.DeselectAll,
          defaultIcon: PeDataToolbarOptionIcon.DeselectAll,
        },
        {
          label: this.translateService.translate('toolbar.options.duplicate'),
          value: OptionsMenu.Duplicate,
          defaultIcon: PeDataToolbarOptionIcon.Duplicate,
        },
        {
          label: this.translateService.translate('toolbar.options.delete'),
          value: OptionsMenu.Delete,
          defaultIcon: PeDataToolbarOptionIcon.Delete,
        },
      ],
    },
    sortMenu: {
      title: this.translateService.translate('sorters.title'),
      activeValue: Direction.ASC,
      items: [
        {
          label: this.translateService.translate('grid.toolbar.sort_menu.a_z'),
          value: {
            orderBy: ProductsOrderBy.TitleRAW,
            direction: Direction.ASC,
          },
          defaultIcon: PeDataGridSortByActionIcon.Ascending,
          active: true,
        },
        {
          label: this.translateService.translate('grid.toolbar.sort_menu.z_a'),
          value: {
            orderBy: ProductsOrderBy.TitleRAW,
            direction: Direction.DESC,
          },
          defaultIcon: PeDataGridSortByActionIcon.Descending,
        },
        {
          label: this.translateService.translate('grid.toolbar.sort_menu.newest'),
          value: {
            orderBy: ProductsOrderBy.CreatedAt,
            direction: Direction.DESC,
          },
          defaultIcon: PeDataGridSortByActionIcon.Ascending,
        },
        {
          label: this.translateService.translate('grid.toolbar.sort_menu.oldest'),
          value: {
            orderBy: ProductsOrderBy.CreatedAt,
            direction: Direction.ASC,
          },
          defaultIcon: PeDataGridSortByActionIcon.Descending,
        },
        {
          label: this.translateService.translate('grid.toolbar.sort_menu.price.l_h'),
          value: {
            orderBy: ProductsOrderBy.Price,
            direction: Direction.ASC,
          },
          defaultIcon: PeDataGridSortByActionIcon.Descending,
        },
        {
          label: this.translateService.translate('grid.toolbar.sort_menu.price.h_l'),
          value: {
            orderBy: ProductsOrderBy.Price,
            direction: Direction.DESC,
          },
          defaultIcon: PeDataGridSortByActionIcon.Ascending,
        },
      ],
    },
  };

  viewMenu: PeGridMenu = {
    title: this.translateService.translate('grid.content.toolbar.layout'),
    items: [
      {
        label: this.translateService.translate('grid.content.toolbar.list'),
        value: PeGridView.Table, defaultIcon: PeDataGridLayoutByActionIcon.ListLayout,
      },
      {
        label: this.translateService.translate('grid.content.toolbar.grid'),
        value: PeGridView.BigListCover, defaultIcon: PeDataGridLayoutByActionIcon.GridLayout,
        minItemWidth: 290,
        maxColumns: 5,
      },
    ],
  };

  viewportTitle = this.translateService.translate('payever_products');
  defaultFolderIcon = `${this.env.custom.cdn}/icons-transactions/folder.svg`;
  gridLayout = PeGridView.BigListCover;
  updateItem = null;
  defaultLayout = PeDataGridLayoutType.Grid;
  saveFolderSubject$ = new BehaviorSubject(null);
  saveProductSubject$ = new BehaviorSubject(null);

  rootFolderData: RootFolderItem;

  private initRootFolder(): void {
    this.peFoldersApiService.getRootFolder().pipe(
      tap((data) => {
        const rootFolder ={
          ...data,
          name: this.translateService.translate('sidebar.all_products'),
        };

        this.rootFolderData = rootFolder;
        this.selectedFolder = null;
        this.openFolder(null);
      })
    ).subscribe();
  }

  mobileTitle$ = new BehaviorSubject<string>(this.translateService.translate('sidebar.all_products'));

  copiedItem = null;

  private itemContextMenu: PeGridMenu = {
    title: this.translateService.translate('toolbar.options.title'),
    items: [{
      label: this.translateService.translate('edit'),
      value: ContextMenu.Edit,
    },
    {
      label: this.translateService.translate('copy'),
      value: ContextMenu.Copy,
    },
    {
      label: this.translateService.translate('toolbar.options.duplicate'),
      value: ContextMenu.Duplicate,
    },
    {
      label: this.translateService.translate('paste'),
      value: ContextMenu.Paste,
      disabled: true,
    },
    {
      label: this.translateService.translate('add_folder'),
      value: ContextMenu.AddFolder,
      dividers: [PeGridMenuDivider.Top, PeGridMenuDivider.Bottom],
    },
    {
      label: this.translateService.translate('toolbar.options.delete'),
      value: ContextMenu.Delete,
    }],
  }

  viewportContextMenu: PeGridMenu = {
    title: this.translateService.translate('toolbar.options.title'),
    items: [{
      label: this.translateService.translate('paste'),
      value: ContextMenu.Paste,
      disabled: true,
    },
    {
      label: this.translateService.translate('add_folder'),
      value: ContextMenu.AddFolder,
      dividers: [PeGridMenuDivider.Top],
    }],
  }

  itemContextMenu$ = new BehaviorSubject<PeGridMenu>(this.itemContextMenu);
  viewportContextMenu$ = new BehaviorSubject<PeGridMenu>(this.viewportContextMenu);

  gridItems: PeGridItem[];
  paginator: PeDataGridPaginator = {
    page: 0,
    perPage: this.perPageCount,
    total: 10,
  }

  @Select(ProductsAppState.folders) productFolders$: Observable<FolderItem[]>;
  @Select(ProductsAppState.gridItems) gridItems$: Observable<PeGridItem[]>;

  get perPageCount() {
    const items = Math.ceil(window.innerWidth / MIN_ITEM_WIDTH * (window.innerHeight / MIN_ITEM_WIDTH));

    return Math.ceil(items + items / 4);
  }

  displayedColumns: PeGridTableDisplayedColumns[] = [
    {
      name: 'name',
      title: this.translateService.translate('sorters.name'),
      cellComponent: PeGridTableTitleCellComponent,
      skeletonColumnType: GridSkeletonColumnType.ThumbnailWithName,
    },
    {
      name: 'action',
      title: '',
      cellComponent: PeGridTableActionCellComponent,
      skeletonColumnType: GridSkeletonColumnType.Rectangle,
    },
  ];

  toolbarCustomMenu$ = new BehaviorSubject<PeCustomMenuInterface[]>([]);

  folders: FolderItem[] = null;
  selectedFolder: FolderItem;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isFoldersLoading$ = new BehaviorSubject<boolean>(false);
  filterConfiguration: SearchFiltersInterface;
  order = {
    direction: Direction.ASC,
    orderBy: ProductsOrderBy.Title,
  };

  isAllSelectable = false;
  isLoadMore = false;

  private readonly deviceTypeChange$ = this.peGridViewportService.deviceTypeChange$
    .pipe(
      tap(({ isMobile }) => {
        !this.popupMode && this.pePlatformHeaderService.assignConfig({
          isShowDataGridToggleComponent: !isMobile,
          isShowMainItem: isMobile,
          isShowSubheader: isMobile,
        } as PePlatformHeaderConfig);
      })
    );

  private readonly toggleOpenStatus$ = this.gridSidenavService.toggleOpenStatus$
    .pipe(
      filter(() => !this.popupMode),
      tap((open: boolean) => {
        this.pePlatformHeaderService.assignConfig({
          isShowMainItem: this.peGridViewportService.isMobile && !open,
        } as PePlatformHeaderConfig);
      }),
    );

  constructor(
    public dataGridService: DataGridService,
    public peDataGridService: PeDataGridService,
    public valuesService: ValuesService,
    public productsListService: ProductsListService,
    private cdr: ChangeDetectorRef,
    private currencyService: CurrencyService,
    private mediaService: MediaService,
    private importApiService: ImportApiService,
    private snackBarService: SnackbarService,
    private translateService: TranslateService,
    private envService: EnvService,
    private store: Store,
    private apmService: ApmService,
    private gridService: PeGridService,
    private peFolderService: FolderService,
    private productsApiService: ProductsApiService,
    public productsFoldersService: ProductsFoldersService,
    private gridQueryParamsService: PeGridQueryParamsService,
    private iconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private overlayWidget: PeOverlayWidgetService,
    private router: Router,
    private route: ActivatedRoute,
    private messageBus: MessageBus,
    private confirmScreenService: ConfirmScreenService,
    private destroy$: PeDestroyService,
    private gridSidenavService: PeGridSidenavService,
    private peGridViewportService: PeGridViewportService,
    private productsRulesService: ProductsRuleService,
    private pePreloaderService: PePreloaderService,
    private peFoldersApiService: PeFoldersApiService,


    @Inject(PE_ENV) public env: EnvironmentConfigInterface,
    @Optional() private pePlatformHeaderService: PePlatformHeaderService,
  ) {

    this.pePreloaderService.startLoading(AppType.Products);
    this.pePreloaderService.initFinishObservers([
      this.isLoading$,
      this.isFoldersLoading$,
    ], AppType.Products);

    const view = this.gridQueryParamsService.getQueryParamByName(GridQueryParams.View);
    this.gridLayout = this.popupMode ? PeGridView.List : <PeGridView>view || PeGridView.BigListCover;
    Object.entries(ThemesIcons).forEach(([name, path]) => {
      this.iconRegistry.addSvgIcon(
        name,
        this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${path}`),
      );
    });

    merge(
      this.productFolders$.pipe(tap((data) => {
        this.folders = cloneDeep(data);
        this.cdr.markForCheck();
        const selectedFolderId = this.gridQueryParamsService.getQueryParamByName(GridQueryParams.SelectedFolder);
        if (selectedFolderId) {
          const folder = this.productsListService.getFolderById(selectedFolderId);
          setTimeout(() => {
            this.mobileTitle$.next(this.rootFolderData.name);
            this.selectedFolder = folder;
            this.openFolder(this.selectedFolder);
          });
        }
      })),
      this.gridItems$.pipe(tap((data) => {
        if (this.gridItems?.length && !this.isLoadMore && data?.length !== this.paginator.perPage) {
          this.paginator.total -= this.gridItems?.length - data.length;
        }
        this.isLoadMore = false;
        this.gridItems = data || [];

        if (this.isAllSelectable) {
          this.gridService.selectedItems = this.gridItems;
        }

        const scrollTop = this.gridQueryParamsService.getQueryParamByName(GridQueryParams.ScrollTop);
        if (scrollTop) {
          this.gridService.restoreScroll$.next(true);
        }
      })),
      this.productsFoldersService.folderChange$.pipe(tap(({ folder, action }) => {
        const itemData = this.productsListService.folderToItemMapper(folder);
        this.changeStoreItem(itemData, folder, action);
      })),
      this.gridService.selectedItems$.pipe(
        tap((items) => {
          this.store.dispatch(new AddProducts(items));
        }),
        takeUntil(this.destroy$),
      )
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  changeStoreItem(itemData: PeGridItem, newItem: ProductModel | FolderItem, action: ProductsFolderAction): void {
    switch (action) {
      case ProductsFolderAction.Add: {
        if (itemData.type === PeGridItemType.Folder) {
          this.store.dispatch(new AddFolder(itemData));
        } else {
          this.store.dispatch(new AddItem(itemData));
        }
        break;
      }
      case ProductsFolderAction.Update: {
        this.store.dispatch(new EditItem(itemData));

        break;
      }
      case ProductsFolderAction.Delete: {
        this.store.dispatch(new DeleteItems([itemData.id]));
        break;
      }
    }
  }

  initProducts(): void {
    this.isFoldersLoading$.next(true);
    this.productsApiService.getFolders()
      .pipe(
        map((tree) => {
          this.productsListService.clearFolderList();

          return this.productsListService.folderTreeMapper([...tree]);
        })
      ).subscribe({
        next: (folders: FolderItem[]) => {
          this.folders = folders;
          const group = this.defaultLayout === PeDataGridLayoutType.List;
          this.store.dispatch(new InitLoadFolders({ tree: folders }, group));
          this.isFoldersLoading$.next(false);
        },
      });
  }


  ngAfterViewInit(): void {
    if (!this.popupMode) {
      this.toolbarCustomMenu$.next([{
        title: this.translateService.translate('header.import'),
        templateRef: this.importMenuRef,
      }]);
    }
  }

  ngOnInit(): void {
    this.initRootFolder();
    this.sidenavMenu = this.popupMode ? null : this.sidenavMenu;
    this.store.dispatch(new ClearStore());

    if (this.popupMode) {
      this.viewMenu.items[1].value = PeGridView.List;
      this.viewMenu.items[1].minItemWidth = 230;
    }

    this.initProducts();
    this.productsRulesService.initRuleListener().pipe(
      takeUntil(this.destroy$)
    ).subscribe();
    this.gridQueryParamsService.pageToParams(1);

    this.setPlatformHeaderConfig();

    this.cdr.detectChanges();

    this.dataGridService.updatedGridItem$.pipe(
      tap((data) => {
        if (data) {
          setTimeout(() => {
            this.productsApiService.getSkusStock([data.item.sku]).pipe(
              tap((res) => {
                this.productsListService.skus[data.item.sku] = res[data.item.sku];
                const itemData = this.productsListService.productToItemMapper(data.item);

                if (data.isEdit) {
                  this.store.dispatch(new EditItem(itemData));
                } else {
                  this.paginator.page = 0;
                  this.openFolder(this.selectedFolder);
                }
              }),
              takeUntil(this.destroy$)
            ).subscribe();
          }, 1000);
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.dataGridService.duplicatedGridItem$.pipe(
      tap((data) => {
        if (data && this.gridItems?.length) {
          setTimeout(() => {
            this.productsApiService.getSkusStock([data?.sku]).pipe(
              tap((res) => {
                this.productsListService.skus[data?.sku] = res[data?.sku];
                const itemData = this.productsListService.productToItemMapper(data);
                this.store.dispatch(new AddItem(itemData));
              }),
              takeUntil(this.destroy$)
            ).subscribe();
          }, 1000);
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.dataGridService.filtersFormGroup.get('tree').valueChanges.pipe(
      tap(() => this.peDataGridService.setSelected$.next([])),
      takeUntil(this.destroy$),
    ).subscribe();

    this.dataGridService.allFilters$
      .pipe(
        debounceTime(100),
        skip(1),
        switchMap((filters) => {
          this.filters = filters;
          this.valuesService.valuesData = filters;
          this.productsListService.patchPagination({
            page: 1,
          });

          return this.productsListService.loadProducts(filters, false, this.viewMode);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();

    this.productsListService.channelSetProducts$
      .pipe(
        tap((products) => {
          this.dataGridService.gridItems =
            products?.map(product => this.dataGridService.createDataGridItem(product)) || [];
          this.dataGridService.gridFolders = [];
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();

    this.productsListService.collections$.pipe(
      tap((collections) => {
        const gridFolders = collections
          .filter(collection => this.dataGridService.selectedFolder ?
            collection?.parent === this.dataGridService.selectedFolder : !collection.parent)
          .map(collection => this.dataGridService.createDataGridFolder(collection));
        this.dataGridService.gridFolders = gridFolders;
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    merge(
      this.productsApiService.getBusinessSetting().pipe(tap((res) => {
        this.currencyService.currency = res.currency;
      })),
      this.productsListService.searchString$.pipe(distinctUntilChanged()).pipe(skip(1)),
      this.productsListService.order$.pipe(
        skip(1),
        distinctUntilChanged(
          (order1, order2) => order1.by === order2.by && order1.direction === order2.direction),
      ),
    )
      .pipe(
        withLatestFrom(this.dataGridService.allFilters$),
        switchMap(([_, filters]) => this.productsListService.loadProducts(filters, false, this.viewMode)),
        tap(() => {
          if (this.dataGridService.order.by === 'name') {
            this.dataGridService.gridFolders
              .sort(({ title: titleA }, { title: titleB }) => {
                const isDesc = this.dataGridService.order.direction === 'desc';

                // @ts-ignore
                return isDesc ? titleA.localCompare(titleB) : titleB.localCompare(titleA);
              });
          }
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();

    this.productsListService.pagination$
      .pipe(
        skip(2),
        map(pagination => pagination.page),
        distinctUntilChanged(),
      )
      .pipe(
        withLatestFrom(this.dataGridService.allFilters$),
        switchMap(([page, filters]) => {
          return this.productsListService.loadProducts(filters, page !== 1, this.viewMode);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();

    merge(
      this.saveFolderSubject$.pipe(
        tap((data: PeFolderEditorDataToSaveInterface) => {
          if (!data?.updatedFolder) {
            return;
          }

          const itemData = this.productsListService.folderToItemMapper(data.updatedFolder);
          switch (data.actionType) {
            case PeFoldersActionsEnum.Update:
              this.peFolderService.updateFolder$.next({
                _id: data.updatedFolder._id,
                name: data.updatedFolder.name,
                image: itemData.image,
              });
              this.changeStoreItem(itemData, data.updatedFolder, ProductsFolderAction.Update);
              break;
            case PeFoldersActionsEnum.Create:
              this.peFolderService.addFolder$.next({
                _id: data.updatedFolder._id,
                name: data.updatedFolder.name,
                image: itemData.image,
                parentFolderId: data.updatedFolder?.parentFolderId,
              });
              this.changeStoreItem(itemData, data.updatedFolder, ProductsFolderAction.Add);
              break;
          }
          this.cdr.detectChanges();
        })
      ),
      this.saveProductSubject$.pipe(
        switchMap((data) => {
          if (data?.updatedItem) {

            return this.productsApiService.getSkusStock(data?.updatedItem.sku).pipe(
              tap((res) => {
                this.productsListService.skus[data?.updatedItem.sku] = res[data?.updatedItem.sku];
                const itemData = this.productsListService.productToItemMapper(data?.updatedItem);
                this.store.dispatch(new EditItem(itemData));
              }));

          }

          return EMPTY;
        })
      )
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  selectSideNavMenu(menuItem: PeGridMenuItem) {
    switch (menuItem.value) {
      case SideNavMenuActions.NewFolder: {
        this.createFolder();
        break;
      }
      case SideNavMenuActions.NewHeadline: {
        this.createHeadline();
        break;
      }
      case SideNavMenuActions.Rules: {
        this.productsRulesService.openRules();
        break;
      }
    }
  }

  createFolder() {
    this.peFolderService.createFolder(this.translateService.translate('sidebar.folder_name'));
  }

  createHeadline() {
    this.peFolderService.createHeadline(this.translateService.translate('sidebar.headline_name'));
  }

  scrollBottom() {
    this.paginator.page += 1;
    this.loadMore();
  }

  onContentDelete({ proudctIds, folderIds }): void {
    this.deleteItems(proudctIds, folderIds);
  }

  loadMore() {
    this.isLoadMore = true;

    if (Math.ceil(this.paginator.total / this.paginator.perPage) < this.paginator.page) {
      return;
    }

    this.reloadGrid();
  }

  reloadGrid() {
    this.isLoading$.next(true);
    const request = this.productsApiService.getFolderDocuments(
      this.dataGridService.selectedFolder,
      this.getSearchData()
    );

    request.pipe(
      switchMap((products) => {
        const skus = [];
        products.collection.forEach((res) => {
          skus.push(res.sku);
        });

        return this.productsApiService.getSkusStock(skus).pipe(
          tap((res) => {
            this.productsListService.skus = res;

            let folderItems = products.collection.map(item => item.isFolder
              ? this.productsListService.folderToItemMapper(item)
              : this.productsListService.productToItemMapper(item)
            );
            this.setPaginator(products.pagination_data);

            if (this.paginator.page > 0) {
              this.store.dispatch(new AddItems(folderItems));
            }
            this.isLoading$.next(false);
            this.cdr.detectChanges();
          }),
          takeUntil(this.destroy$)
        );
      }),
      catchError((error) => {
        this.isLoading$.next(false);
        this.apmService.apm.captureError(error);

        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  onSelectRootFolder(): void {
    if (this.selectedFolder?._id) {
      this.gridQueryParamsService.pageToParams(1);
      this.gridQueryParamsService.deleteQueryParamByName(GridQueryParams.SelectedFolder);
    }
    this.mobileTitle$.next(this.rootFolderData.name);
    this.dataGridService.selectedFolder = null;
    this.selectedFolder = null;
    this.paginator.page = 0;
    this.openFolder(null);
  }

  onSelectFolder(folder: FolderItem): void {
    this.dataGridService.selectedFolder = folder?._id;
    this.selectedFolder = folder;
    this.productsListService.activeNode = folder;
    this.paginator.page = 0;
    this.mobileTitle$.next(folder.name);
    setTimeout(() => {
      this.gridQueryParamsService.pageToParams(1);
      this.gridQueryParamsService.folderToParams(folder._id);
      this.gridQueryParamsService.scrollPositionToParams(0);
      this.openFolder(folder);
    }, 10);
  }

  openFolder(folder: FolderItem) {
    this.gridItems = [];
    this.isLoading$.next(true);
    const request = this.productsApiService.getFolderDocuments(folder?._id, this.getSearchData());

    request.pipe(
      switchMap((products) => {
        const skus = [];
        products.collection.forEach((res, i) => {
          if (res.sku) {
            skus.push(res.sku);
            if (res.sku === this.productsApiService.lastCreatedProductSku) {
              products.collection.unshift(products.collection.splice(i, 1)[0]);
              this.productsApiService.lastCreatedProductSku = null;
            }
          }
        });

        return this.productsApiService.getSkusStock(skus).pipe(
          tap((res) => {
            this.productsListService.skus = res;

            let folderItems = products.collection.map(item => item.isFolder
              ? this.productsListService.folderToItemMapper(item)
              : this.productsListService.productToItemMapper(item)
            );
            this.gridItems = folderItems;

            this.setPaginator(products.pagination_data);
            this.store.dispatch(new OpenFolder(folderItems));
            this.isLoading$.next(false);
            this.cdr.detectChanges();
          })
        );
      }),
      catchError((error) => {
        this.isLoading$.next(false);
        this.apmService.apm.captureError(error);

        return EMPTY;
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  setPaginator(data: any) {
    this.paginator = {
      ...this.paginator,
      page: data.page - 1,
      total: data.total,
    };
  }

  getSearchData() {
    const { page, perPage } = this.paginator;

    return {
      page: page + 1,
      perPage,
      direction: this.order.direction,
      orderBy: this.order.orderBy,
      configuration: this.filterConfiguration,
    };
  }

  moveToRootFolder(event: MoveIntoRootFolderEvent) {
    const { moveItems } = event;
    if (moveItems?.length) {
      moveItems.forEach((item) => {
        if (item.type === PeGridItemType.Item) {
          this.productsApiService.moveToRoot(item.data._id).subscribe();
        }

        if (this.selectedFolder?._id) {
          this.store.dispatch(new DeleteItems([item.id]));
        }
      });
    }
  }

  moveToFolder(event: MoveIntoFolderEvent): void {
    const { folder, moveItems } = event;
    if (moveItems?.length) {
      moveItems.forEach((item) => {
        if (item.type === PeGridItemType.Item) {
          if (!folder.isHeadline) {
            this.productsApiService.moveToFolder(folder._id, item.data._id).subscribe();
          }
        } else if (item.type === PeGridItemType.Folder) {
          this.peFolderService.folderIntoFolder$.next({
            intoId: folder._id,
            moveId: item.id,
          });
        }
        if (folder._id !== this.selectedFolder?._id) {
          this.store.dispatch(new DeleteItems([item.id]));
        }
      });
    }
  }

  onViewportContextMenu({ menuItem }: PeGridViewportContextSelect) {
    switch (menuItem?.value) {
      case ContextMenu.Paste:
        this.paste(this.copiedItem);
        break;
      case ContextMenu.AddFolder:
        this.addFolder(this.copiedItem);
        break;
    }
  }

  createByHand(): void {
    if (this.popupMode) {
      return;
    }

    this.dataGridService.selectedFolder = this.selectedFolder?._id || null;
    this.dataGridService.addProduct();
  }

  filtersChange(filters: PeFilterChange[]): void {
    this.filterConfiguration = null;

    filters.forEach((filterItem) => {
      const filterID = filterItem.filter;
      const searchFilter: SearchFilterInterface = {
        condition: filterItem.contain,
        value: [filterItem.search.toString().toLowerCase()],
      };
      const issetFilter = this.filterConfiguration?.hasOwnProperty(filterID);
      const conditionIndex = issetFilter ?
        this.filterConfiguration[filterID]
          .findIndex((filter: SearchFilterInterface) => filter.condition === searchFilter.condition) :
        -1;

      if (!issetFilter || conditionIndex === -1) {
        this.filterConfiguration = {
          ...this.filterConfiguration,
          [filterID]: !issetFilter ?
            [searchFilter] :
            [
              ...this.filterConfiguration[filterID] as [],
              searchFilter,
            ],
        };
      } else if (issetFilter && conditionIndex !== -1) {
        this.filterConfiguration = {
          ...this.filterConfiguration,
          [filterID]: [{
            ...this.filterConfiguration[filterID][conditionIndex],
            value: [
              ...(this.filterConfiguration[filterID][conditionIndex] as SearchFilterInterface).value,
              ...searchFilter.value,
            ],
          }],
        };
      }
    });

    this.paginator.page = 0;

    this.openFolder(this.selectedFolder);
  }

  itemsToMove(item: PeGridItem): PeMoveToFolderItem[] {
    return [...new Set([...this.gridService.selectedItems, item])];
  }

  optionsChange(event: OptionsMenu): void {
    this.isAllSelectable = false;

    if (event === OptionsMenu.SelectAll) {
      this.isAllSelectable = true;
      this.gridService.selectedItems = this.gridItems;
      this.cdr.detectChanges();
    } else if (event === OptionsMenu.DeselectAll) {
      this.unselectAllItems();
    } else if (event === OptionsMenu.Duplicate) {
      if (this.gridService.selectedItemsIds) {
        this.dataGridService.copiedProducts = this.gridService.selectedItemsIds;
        this.duplicateItems();
      }
      if (this.gridService.selectedFoldersIds) {
        this.gridService.selectedFoldersIds.forEach(folderId =>
          this.peFolderService.duplicateFolder$.next(folderId)
        );
      }
      this.unselectAllItems();
    } else if (event === OptionsMenu.Delete) {
      this.deleteItems(this.gridService.selectedItemsIds, this.gridService.selectedFoldersIds);
      this.unselectAllItems();
    }
  }

  unselectAllItems() {
    this.gridService.selectedItems = [];
    this.cdr.detectChanges();
  }

  duplicateItems() {
    this.dataGridService.pasteItems(this.selectedFolder?._id, 'duplicate');
  }

  sortChange(sort): void {
    this.order = sort;
    this.paginator.page = 0;
    this.openFolder(this.selectedFolder);
  }

  viewChange(): void {
    this.cdr.detectChanges();
  }

  chosenFileForImport(data: OutputImportedFileInterface): void {
    this.mediaService
      .uploadFile(data.file)
      .pipe(
        filter(result => result instanceof HttpResponse),
        switchMap((result: HttpResponse<{ id: string; url: string }>) => {
          return this.importApiService.importFromFile(
            this.envService.businessId,
            result.body.url,
          );
        }),
        tap(() => this.showSnackbar(this.translateService.translate('import_message'))),
        catchError((err: HttpErrorResponse) => {
          this.snackBarService.toggle(
            true,
            {
              content: err.error?.message
                ? `${this.translateService.translate('errors.title')}: ${err.error?.message}`
                : this.translateService.translate('upload_failed'),
              duration: 5000,
              iconId: 'icon-alert-24',
              iconSize: 24,
            },
          );

          return of(err);
        }),
      )
      .subscribe();
  }

  onItemContentContextMenu({ gridItem, menuItem }: PeGridItemContextSelect) {
    switch (menuItem?.value) {
      case ContextMenu.Edit:
        this.edit(gridItem);
        break;
      case ContextMenu.Copy:
        this.copy(gridItem);
        break;
      case ContextMenu.Paste:
        this.paste(gridItem);
        break;
      case ContextMenu.Duplicate:
        this.duplicate(gridItem);
        break;
      case ContextMenu.Delete:
        this.delete(gridItem);
        break;
      case ContextMenu.AddFolder:
        this.addFolder(null);
        break;
    }
  }

  closeContextMenu() {
    this.selectedItem = undefined;

    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }

  private edit(item: PeGridItem) {
    if (item.data?.isFolder) {
      this.openOverlay({
        actionType: PeFoldersActionsEnum.Update,
        activeItem: this.selectedFolder
      }, item);
    } else {
      this.dataGridService.productEdit(item.id);
    }
    this.closeContextMenu();
  }

  private copy(item: PeGridItem) {
    this.copiedItem = item;
    this.itemContextMenu$.next(this.enableMenuItem(this.itemContextMenu, ContextMenu.Paste, true));
    this.viewportContextMenu$.next(this.enableMenuItem(this.viewportContextMenu, ContextMenu.Paste, true));

    this.dataGridService.copiedCollections = this.gridService.selectedFoldersIds;
    this.dataGridService.copiedProducts = this.gridService.selectedItemsIds;
  }

  private paste(item?: PeGridItem) {
    if (this.copiedItem) {
      if (this.copiedItem.type === PeGridItemType.Folder) {
        this.peFolderService.duplicateFolder$.next(this.copiedItem.id);
      } else if (item) {
          this.dataGridService.copiedProducts = [this.copiedItem.id];
          this.onDuplicate(this.selectedFolder?._id);
      } else {
        const copyItem = cloneDeep(this.copiedItem);
        this.productsApiService.moveToFolder(this.selectedFolder?._id, this.copiedItem.id).subscribe({
          next: () => this.store.dispatch(new AddItem(copyItem)),
        });
      }
    }

    this.copiedItem = null;
    this.itemContextMenu$.next(this.enableMenuItem(this.itemContextMenu, ContextMenu.Paste, false));
    this.viewportContextMenu$.next(this.enableMenuItem(this.viewportContextMenu, ContextMenu.Paste, false));
  }

  private deleteItems(productIds: string[], folderIds: string[]): void {
    this.showDeleteConfirmDialog();
    this.messageBus.listen('confirm').pipe(
      take(1),
      switchMap((confirm) => {
        if (confirm) {
          const requests = [
            this.productsApiService.removeStoreItem(productIds).pipe(
              switchMap(res => res.errors ? throwError({ status: res.errors[0].statusCode }) : of(res)),
            ),
            ...folderIds.map(id => this.productsApiService.deleteFolder(id)),
          ];
          let deleteTypeKey: string;
          if (productIds.length && folderIds.length) {
            deleteTypeKey = 'items';
          } else if (productIds.length) {
            deleteTypeKey = productIds.length > 1 ? 'products' : 'product';
          } else if (folderIds.length) {
            deleteTypeKey = folderIds.length > 1 ? 'folders' : 'folder';
          }
          const type = this.translateService.translate(deleteTypeKey);

          return forkJoin(requests).pipe(
              tap(() => {
                this.store.dispatch(new DeleteItems([...productIds, ...folderIds]));
                folderIds?.forEach((folderId) => {
                  this.peFolderService.deleteNode$.next(folderId);
                });
                this.productsListService.openSnackbar(this.translateService.translate('success.delete', { type }), true);
                this.gridService.removeSelected(productIds);
              }),
            );
        }

        return  EMPTY;
      }),
      catchError(err => this.handleDeleteErrors(err)),
    ).subscribe();
  }

  private delete(item: PeGridItem) {
    if (item.type === 'folder') {
      this.peFolderService.deleteFolder$.next(item.id);

      return;
    }

    this.onDelete([item.id]);
  }

  private onDelete(productIds: string[]): void {
    this.showDeleteConfirmDialog();
    this.messageBus.listen('confirm').pipe(
      take(1),
      filter(confirm => confirm),
      switchMap(() => this.productsApiService.removeStoreItem(productIds)
        .pipe(
          switchMap(res => res.errors ? throwError({ status: res.errors[0].statusCode }) : of(res)),
          tap((res) => {
            this.store.dispatch(new DeleteItems(productIds));
            this.productsListService.openSnackbar(this.translateService.translate('success.product_delete'), true);
          }),
        )
      ),
      catchError(err => this.handleDeleteErrors(err)),
    ).subscribe();
  }

  private showDeleteConfirmDialog() {
    const headings: Headings = {
      title: this.translateService.translate('confirm_modal.title'),
      subtitle: this.translateService.translate('confirm_modal.subtitle'),
      confirmBtnText: this.translateService.translate('confirm_modal.confirm_text'),
      declineBtnText: this.translateService.translate('confirm_modal.decline_text'),
    };

    this.confirmScreenService.show(headings);
  }

  handleDeleteErrors(err) {
    const message = err.status === 403 ? 'errors.forbidden' : 'errors.cannot_delete';
    this.productsListService.openSnackbar(this.translateService.translate(message), false);

    return throwError(err);
  }

  private duplicate(item: PeGridItem) {
    if (item.type === 'folder') {
      this.peFolderService.duplicateFolder$.next(item.id);
    } else {
      this.dataGridService.copiedProducts = [item.id];
      this.onDuplicate(this.selectedFolder?._id);
    }
  }

  private onDuplicate(folderId?: string): void {
    this.dataGridService.pasteItems(folderId, 'duplicate');
  }

  updateFolder(event: FolderOutputEvent) {
    const folderEvent = {
      ...event,
      data: {
        ...event.data,
        parentFolderId: event.data.parentFolderId || this.rootFolderData?._id,
      },
    };

    this.productsFoldersService.onUpdateFolder(folderEvent);
  }

  private enableMenuItem(menuItems: PeGridMenu, menuItemValue: ContextMenu, enable: boolean): PeGridMenu {
    const menu: PeGridMenu = {
      ...menuItems,
      items: menuItems.items.map((item) => {
        if (item.value === menuItemValue) {
          return {
            ...item,
            disabled: !enable,
          };
        }

        return item;
      }),
    };

    return menu;
  }

  private addFolder(node = null) {
    this.openOverlay({
      actionType: PeFoldersActionsEnum.Create,
      activeItem: this.selectedFolder,
    }, node);
  }

  onDeleteFolder(event: FolderOutputEvent): void {
    this.productsFoldersService.onDeleteFolder(event).pipe(
      tap(() => {
        const type = this.translateService.translate('folder');
        const notify = this.translateService.translate('success.delete', { type });
        this.productsListService.openSnackbar(notify, true);
        this.initProducts();
      }),
    ).subscribe();
  }

  openOverlay(data, node, isFolder = true) {
    this.updateItem = node;
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      component: PeFolderEditorComponent,
      data: { ...data, item: node, nextPosition: this.peFolderService.nextPosition },
      backdropClass: 'settings-backdrop',
      panelClass: 'studio-widget-panel',
      headerConfig: {
        title: node?.name || node?.title || this.translateService.translate('sidebar.new_folder'),
        backBtnTitle: this.translateService.translate('cancel'),
        removeContentPadding: false,
        backBtnCallback: () => {
          this.showConfirmationDialog();
        },
        cancelBtnTitle: '',
        cancelBtnCallback: () => {
          this.showConfirmationDialog();
        },
        doneBtnTitle: this.translateService.translate('done'),
        doneBtnCallback: () => {
          this.overlayWidget.close();
        },
        onSaveSubject$: isFolder ? this.saveFolderSubject$ : this.saveProductSubject$,
      },
    };
    this.overlayWidget.open(
      config,
    );
  }

  private showConfirmationDialog(): void {
    const headings: Headings = {
      title: this.translateService.translate('cancel_modal.title'),
      subtitle: this.translateService.translate('cancel_modal.subtitle'),
      confirmBtnText: this.translateService.translate('cancel_modal.confirm_text'),
      declineBtnText: this.translateService.translate('cancel_modal.decline_text'),
    };

    this.confirmScreenService.show(headings);
    this.messageBus.listen('confirm').pipe(
      tap((confirm) => {
        if (confirm) {
          this.overlayWidget.close();
        }
        this.router.navigate(['.'], { relativeTo: this.route });
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private setPlatformHeaderConfig() {
    this.pePlatformHeaderService.setFullHeader();
    !this.popupMode && this.pePlatformHeaderService.assignConfig({
      ...this.pePlatformHeaderService.config,
      mainDashboardUrl: `/business/${this.envService.businessId}/info/overview`,
      currentMicroBaseUrl: `/business/${this.envService.businessId}/products`,
      isShowShortHeader: false,
      mainItem: this.popupMode ? {} : {
        title: this.translateService.translate('sidebar.products'),
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
      showDataGridToggleItem: {
        onClick: () => {
          this.gridSidenavService.toggleViewSidebar();
          this.cdr.detectChanges();
        },
      },
      isShowDataGridToggleComponent: true,
      closeItem: {
        title: this.translateService.translate('header.back_to_apps'),
        icon: '#icon-apps-header',
        iconType: 'vector',
        iconSize: '22px',
        isActive: true,
        class: 'products-header-close',
        showIconBefore: true,
      },
      isShowCloseItem: true,

    } as PePlatformHeaderConfig);

    merge(
      this.deviceTypeChange$,
      this.toggleOpenStatus$,
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  actionClick(item): void {
    if (this.popupMode && item.type === 'item') {
      if (this.gridService.selectedItems?.length > 0) {
        this.gridService.selectedItems.push(item);
        this.gridService.selectedItems$.pipe(
          tap((items) => {
            this.store.dispatch(new AddProducts(items));
          }),
          takeUntil(this.destroy$),
        ).pipe(
        takeUntil(this.destroy$)
      ).subscribe();
      } else {
        this.gridService.selectedItems = [item];
      }

      return;
    }

    if (item.type === 'item') {
      !this.popupMode && this.dataGridService.productEdit(item.id);
    }
    if (item.type === 'folder') {
      this.selectedFolder = {
        ...item,
        _id: item.id,
      };
      this.paginator.page = 0;
      this.openFolder(this.selectedFolder);
    }
  }

  get headerName(): string {
    const folderId = this.dataGridService.selectedFolder;
    const collection = this.dataGridService.collections.find(c => c.id === folderId);

    return collection ? collection.name : this.translateService.translate('header.list');
  }

  private showSnackbar(message) {
    this.snackBarService.toggle(
      true,
      {
        content: message,
        duration: 5000,
        iconId: 'icon-commerceos-success',
        iconSize: 24,
      });
  }

  ngOnDestroy() {
    this.dataGridService.loadingProductId = null;
    this.store.dispatch(new ClearStore());
    this.unselectAllItems();
    this.selectedItems =[];
    this.cdr.detectChanges();
  }
}
