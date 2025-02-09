import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { ConnectionPositionPair, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatMenuTrigger } from '@angular/material/menu';
import { BehaviorSubject, merge, Observable, of } from 'rxjs';
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
import { NestedTreeControl } from '@angular/cdk/tree';
import { Store } from '@ngxs/store';
import { get } from 'lodash-es';

import { TranslateService } from '@pe/i18n';
import { MediaService } from '@pe/media';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import {
  AppThemeEnum,
  EnvironmentConfigInterface,
  PE_ENV,
  PeDataGridButtonAppearance,
  PeDataGridButtonItem,
  PeDataGridFilterItem,
  PeDataGridItem,
  PeDataGridLayoutType,
  PeDataGridMultipleSelectedAction, SaveProducts, TreeFilterNode,
} from '@pe/common';
import {
  DataGridContextMenuEnum,
  PeDataGridComponent,
  PeDataGridService,
  PeDataGridSidebarService,
} from '@pe/data-grid';
import { PebEnvService } from '@pe/builder-core';
import { PeContextMenuService } from '@pe/ui';
import { SnackbarService } from '@pe/snackbar';
// @ts-ignore
import { TreeSidebarFilterComponent } from '@pe/sidebar';

import { AbstractComponent } from '../../../misc/abstract.component';
import { ProductsResponse } from '../../../shared/interfaces/product.interface';
import { ProductsListService } from '../../services/products-list.service';
import { ImportApiService } from '../../services/import/import-api.service';
import { CollectionsLoadedInterface } from '../../../shared/interfaces/collection.interface';
import { DataGridService } from '../../services/data-grid/data-grid.service';
import { EnvService } from '../../../shared/services/env.service';
import { ImportEventPayload } from '../import-menu/import-menu.component';
import { ChannelsService } from '../../../product-editor';
import { ProductsApiService } from '../../../shared/services/api.service';
import { CollectionModel } from '../../../shared/interfaces/collection-model';

import { saveAs } from 'file-saver';

export const OVERLAY_POSITIONS: ConnectionPositionPair[] = [
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
  },
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
  },
  {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
  },
  {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
  },
];

enum FileType {
  CSV,
  XML,
}

const Dropshipping = 'payever-dropshipping';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'pf-products-list',
  templateUrl: 'products-list.component.html',
  styleUrls: ['products-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ProductsListComponent extends AbstractComponent implements OnInit, OnDestroy {
  viewMode: PeDataGridLayoutType;
  FileType = FileType;
  private overlayRef: OverlayRef;

  gridItems: Array<PeDataGridItem & { company }>;
  selectedItem: PeDataGridItem;
  private treeControl: NestedTreeControl<TreeFilterNode>;

  @ViewChild('csvFileInput') csvFileInput: ElementRef<HTMLInputElement>;
  @ViewChild('collectionsTree', { read: TreeSidebarFilterComponent }) collectionsTree: TreeSidebarFilterComponent;
  @ViewChild('channelTree', { read: TreeSidebarFilterComponent }) channelTree: TreeSidebarFilterComponent;
  @ViewChild('xmlFileInput') xmlFileInput: ElementRef<HTMLInputElement>;

  @ViewChild('dataGridComponent') set setDataGrid(dataGrid: PeDataGridComponent) {
    if (dataGrid?.showFilters$) {
      dataGrid.showFilters$.pipe(takeUntil(this.destroyed$)).subscribe(value => {
        if (value !== this.dataGridService.showFilters) {
          this.dataGridService.showFilters = value;
        }
      });
    }
  }

  @ViewChild('contextMenu') contextMenu: TemplateRef<any>;

  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

  searchItems = [];
  searchPlaceholder = 'Search products';
  myDropshippingId: string;
  payeverDropshippingId: string;

  theme = this.pebEnvService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.pebEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  // TODO
  private overwriteExistingStream$ = new BehaviorSubject<boolean>(false);
  navbarLeftPaneButtons: PeDataGridButtonItem[] = [
    {
      title: this.translateService.translate('header.import'),
      onClick: () => {
        this.menuTrigger.openMenu();
      },
      children: null,
    },
  ];

  viewModeSubj$: BehaviorSubject<PeDataGridLayoutType> = new BehaviorSubject<PeDataGridLayoutType>(null);
  viewMode$: Observable<PeDataGridLayoutType> = this.viewModeSubj$.asObservable();

  overwrite = false;
  showCSVTooltip = false;
  showXMLTooltip = false;
  filters: any;

  selectedItems: string[];
  collectionsMenuState = false;

  multipleSelectedActions: PeDataGridMultipleSelectedAction[] = [
    {
      label: 'Options',
      appearance: PeDataGridButtonAppearance.Button,
      actions: [
        {
          label: 'Select all',
          callback: () => {
            const items = this.gridItems.length ? this.gridItems.map(theme => theme.id) : [];
            this.peDataGridService.setSelected$.next(items);
          },
        },
        {
          label: 'Deselect all',
          callback: () => {
            this.peDataGridService.setSelected$.next([]);
          },
        },
        // {
        //   label: 'Add to collection',
        //   callback: () => {
        //     this.collectionsMenuState = true;
        //   },
        // },
        {
          label: 'Delete',
          callback: () => {
            this.dataGridService.deleteSelected(
              [],
              this.dataGridService.selectedProducts,
              this.viewMode,
            );
          },
        },
      ],
    },
  ];

  /** Refresh Subject */
  refreshSubject$ = new BehaviorSubject(true);
  readonly refresh$ = this.refreshSubject$.asObservable();
  channels: TreeFilterNode[];

  constructor(
    public  envService: EnvService,
    public dataGridService: DataGridService,
    public dataGridSidebarService: PeDataGridSidebarService,
    public peDataGridService: PeDataGridService,
    public productsListService: ProductsListService,
    private cdr: ChangeDetectorRef,
    private mediaService: MediaService,
    private importApiService: ImportApiService,
    private snackBarService: SnackbarService,
    private httpClient: HttpClient,
    private translateService: TranslateService,
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private channelsService: ChannelsService,
    private pebEnvService: PebEnvService,
    private contextMenuService: PeContextMenuService,
    private store: Store,
    private productsApiService: ProductsApiService,
    @Inject(PE_ENV) public env: EnvironmentConfigInterface,
    @Optional() private platformHeader: PePlatformHeaderService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.viewMode = this.viewMode ? this.viewMode : PeDataGridLayoutType.Grid;
    this.dataGridService.getTreeData();
    this.dataGridService.gridItems$.pipe(
      tap((items: Array<PeDataGridItem & { company }>) => {
        this.gridItems = items.map(item => {
          item.subtitle = item.subtitle.replace(/([^A-Za-z0-9.])/g, '$1 ');
          return item;
        });
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.peDataGridService.selectedItems$.pipe(
      tap(items => this.selectedItems = items),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.setPlatformHeaderConfig();

    this.cdr.detectChanges();
    this.loadCollections();
    this.productsListService.loadProducts([], false, this.viewMode, true)
      .pipe(take(1), tap(() => {
        if (!this.dataGridService.gridFolders.length) {
          this.multipleSelectedActions[0].actions.splice(2, 1);
        }
      })).subscribe();
    this.channelsService.channels$.pipe(
      take(1),
      map(sets => {
        const types = [];

        sets.forEach(set => {
          if (!types.find(type => type === set.type)) {
            return types.push(set.type);
          }
        });

        return types;
      }),
    ).subscribe();

    this.dataGridService.filtersFormGroup.get('tree').valueChanges.pipe(
      tap(() => this.peDataGridService.setSelected$.next([])),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.dataGridService.allFilters$
      .pipe(
        debounceTime(100),
        skip(1),
        switchMap(filters => {
          if (!this.payeverDropshippingId || filters[0]?.value[0] !== this.payeverDropshippingId) {
            this.filters = filters;
            this.productsListService.patchPagination({
              page: 1,
            });
            return this.productsListService.loadProducts(filters, false, this.viewMode);
          } else {
            return of([]);
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.productsListService.products$
      .pipe(
        tap(products => {
          this.dataGridService.gridItems = products.map(product => this.dataGridService.createDataGridItem(product));
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.productsListService.channelSetProducts$
      .pipe(
        tap(products => {
          this.dataGridService.gridItems =
            products?.map(product => this.dataGridService.createDataGridItem(product)) || [];
          this.dataGridService.gridFolders = [];
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.productsListService.collections$.pipe(
      tap(collections => {
        const gridFolders = collections
          .filter(collection => this.dataGridService.selectedFolder ?
            collection?.parent === this.dataGridService.selectedFolder : !collection.parent)
          .map(collection => this.dataGridService.createDataGridFolder(collection));
        this.dataGridService.gridFolders = gridFolders;
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    merge(
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
        takeUntil(this.destroyed$),
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
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.dataGridService.expandTree$.pipe(takeUntil(this.destroyed$), skip(1))
      .subscribe(data => {
        if (data.expand) {
          this.expandNode(data.item._id || data.item.id);
        }
      });
  }

  selectImportFile(type: FileType, payload: ImportEventPayload): void {
    this.overwriteExistingStream$.next(payload.overwrite);
    if (type === FileType.CSV && this.csvFileInput) {
      this.csvFileInput.nativeElement.click();
    } else if (type === FileType.XML && this.xmlFileInput) {
      this.xmlFileInput.nativeElement.click();
    }
  }

  /**
   * Opens dashboard context menu
   *
   * @param event click event
   */
  openDashboardContextMenu(event, type?) {
    event.event.preventDefault();
    event.event.stopPropagation();
    if (event.node.slug !== Dropshipping) {
      const list = [
        { label: this.translateService.translate('Delete'), value: 'delete', red: true },
      ];
      if (type !== 'channel') {
        list.push({ label: this.translateService.translate('Edit'), value: 'edit', red: false });
      }
      const data = {
        list,
        title: 'Options',
      };
      const dialogRef = this.contextMenuService.open(event.event, { data, theme: this.theme });
      dialogRef.afterClosed.pipe(take(1)).subscribe((d) => {
        const collectionIndex = this.dataGridService.collections.findIndex(item => item.id === event.node.id);
        if (collectionIndex === -1) {
          return;
        }
        switch (d) {
          case 'edit':
            this.dataGridService.collectionEdit(this.dataGridService.collections[collectionIndex].id);
            break;
          case 'delete':
            this.dataGridService.deleteSelected(
              [this.dataGridService.collections[collectionIndex].id], [], this.viewMode);
            break;
          default:
            break;
        }
      });
    }
  }

  importFile(e: any): void {
    const fileList: FileList = e.target.files;
    const file: File = fileList.item(0);
    if (file) {
      this.mediaService
        .uploadFile(file)
        .pipe(
          filter(result => result instanceof HttpResponse),
          switchMap((result: HttpResponse<{ id: string; url: string }>) => {
            return this.importApiService.importFromFile(
              this.envService.businessUuid,
              result.body.url,
              this.overwriteExistingStream$.value,
            );
          }),
          tap(() => this.showSnackbar('Upload in progress. You will be informed by email')),
          catchError((err: HttpErrorResponse) => {
            this.snackBarService.toggle(
              true,
              {
                content: err.error?.message ? `Error: ${err.error?.message}` : 'Upload of products failed',
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
  }

  downloadFile(event: Event, name: string) {
    event.preventDefault();
    this.httpClient
      .get(`${this.env.custom.cdn}/${name}`, {
        responseType: 'blob',
      })
      .pipe(
        take(1),
        tap(resp => {
          saveAs(resp, name);
        }),
      )
      .subscribe();
  }

  onMenuClosed() {
    this.showCSVTooltip = false;
    this.showXMLTooltip = false;
    this.overwrite = false;
  }

  onSelectedItemsChanged(ids: string[]): void {
    this.dataGridService.selectedProducts = ids;
    const products = [];
    this.selectedItems.forEach((itemId: any) => {
      products.push(this.gridItems.find(element => element.id === itemId));
    });
    if (products) {
      this.store.dispatch(new SaveProducts(products));
    }
  }

  scrollOnBottom(event: any): void {
    if (this.productsListService.hasNextPage) {
      const pos = (event.target.scrollTop as number) + (event.target.clientHeight as number);
      const max = event.target.scrollHeight;
      if (pos >= max) {
        this.productsListService.loadNextPage();
      }
    }
  }

  onLayoutChanged(layout: PeDataGridLayoutType) {
    if (this.viewMode !== layout) {
      this.productsListService.loadProducts(this.filters, false, layout).pipe(take(1)).subscribe();
      this.dataGridService.layout = layout;
    }
    this.viewMode = layout;
    this.viewModeSubj$.next(layout);
  }

  onFiltersChanged(filterItems: PeDataGridFilterItem[]) {
    // IF FILTER ITEMS IS NULL RESET BUTTON WAS CLICKED
    if (filterItems === null && this.dataGridService.conditionFormattedFilters.length) {
      this.resetProducts().pipe(take(1)).subscribe();
    }
  }

  onSearchChanged(event) {
    const condition = this.dataGridService.filterConditions.find(c => c.filterName === event.filter);
    const fotmatterFilter = {
      key: condition.filterKey,
      value: event.searchText,
      condition: event.contains === 0 ? condition.filterKey === 'price' ? 'is' : 'contains' : 'isNot',
    };

    if (this.searchItems.find(item => item.filter === event.filter)) {
      const index = this.searchItems.findIndex(item => item.filter === event.filter);
      this.searchItems.splice(index, 1);
    }

    this.searchItems = [...this.searchItems, event];
    this.dataGridService.applyFilterToFormattedFilters(fotmatterFilter);
  }

  onSearchRemove(event) {
    const searchItem = this.searchItems[event];
    const condition = this.dataGridService.filterConditions.find(c => c.filterName === searchItem.filter);
    const formattedFilter = { key: condition.filterKey, value: '', condition: '' };

    this.searchItems.splice(event, 1);
    this.dataGridService.applyFilterToFormattedFilters(formattedFilter);
  }

  toggleFiltersDisplaying(value?: boolean) {
    this.dataGridService.toggleFiltersDisplaying(true);
    this.dataGridService.toggleFiltersDisplaying(false);
    this.cdr.detectChanges();
  }

  onGridContentContextMenu(data) {
    switch (data.event) {
      case DataGridContextMenuEnum.Edit:
        this.edit(data.item);
        break;
      case DataGridContextMenuEnum.Copy:
        this.copy(data.item);
        break;
      case DataGridContextMenuEnum.Paste:
        if (data.item) {
          this.paste(data.item);
          break;
        } else {
          const collectionId = this.dataGridService.filtersFormGroup.get('tree').value[0]?.id;
          const collection = this.productsListService.collections.find(c => c._id === collectionId);
          if (collection) {
            const folder = this.dataGridService.createDataGridFolder(collection);
            this.paste(folder);
            break;
          }
          this.paste(null);
          break;
        }
      case DataGridContextMenuEnum.Duplicate:
        this.duplicate(data.item);
        break;
      case DataGridContextMenuEnum.Delete:
        this.delete(data.item);
        break;
    }
  }

  closeContextMenu() {
    this.selectedItem = undefined;

    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }

  edit(item) {
    if (item.data?.isFolder) {
      this.dataGridService.collectionEdit(item.id);
    } else {
      this.dataGridService.productEdit(item.id);
    }
    this.closeContextMenu();
  }

  copy(item) {
    this.dataGridService.copiedCollections = [];
    this.dataGridService.copiedProducts = [];

    const { collections, products } = this.itemSorting(item);

    this.dataGridService.copiedCollections = collections;
    this.dataGridService.copiedProducts = products;

    this.closeContextMenu();
  }

  delete(item) {
    const { collections, products } = this.itemSorting(item);

    this.dataGridService.deleteSelected(collections, products, this.viewMode);

    this.closeContextMenu();
  }

  duplicate(item) {
    const { collections, products } = this.itemSorting(item);

    this.dataGridService.copiedCollections = collections;
    this.dataGridService.copiedProducts = products;

    const parentId = this.dataGridService.filtersFormGroup.get('tree').value[0]?.id;

    this.dataGridService.pasteItems(parentId, 'duplicate');

    this.closeContextMenu();
  }

  paste(item) {
    if (item && item.data?.isFolder) {
      this.dataGridService.pasteItems(item.id);
    } else {
      this.dataGridService.pasteItems();
    }
    this.closeContextMenu();
  }

  itemSorting(item): { collections: string[], products: string[] } {
    const collections = [];
    const products = [];

    if (this.dataGridService.selectedProducts.length > 0) {
      this.dataGridService.selectedProducts.forEach(id => {
        const gridItem = this.dataGridService.gridItems.find(i => i.id === id) ??
          this.dataGridService.gridFolders.find(folder => folder.id === id);
        if (gridItem.data?.isFolder) {
          collections.push(gridItem.id);
        } else {
          products.push(gridItem.id);
        }
      });
    } else {
      if (item.data?.isFolder) {
        collections.push(item.id);
      } else {
        products.push(item.id);
      }
    }

    return { collections, products };
  }

  private loadCollections(): void {
    this.productsListService
      .loadCollections()
      .pipe(
        tap((data: CollectionsLoadedInterface) => {

          const actions = data.collections?.map(collection => {
            if (collection.slug === Dropshipping) {
              this.channels = [collection];
              this.payeverDropshippingId = collection._id;
            } else if (collection.slug === 'My_Dropshipping') {
              this.myDropshippingId = collection._id;
            }
            return {
              label: collection.name,
              callback: (selectedIds: string[]) => {
                this.addSelectedToCollection(selectedIds, collection._id);
              },
            };
          });
          this.dataGridService.actionAddToCollection.push(...actions);
          this.cdr.detectChanges();
        }),
        take(1),
      ).subscribe();
  }

  private setPlatformHeaderConfig() {
    this.platformHeader.setFullHeader();
    this.platformHeader.assignConfig({
      ...this.platformHeader.config,
      isShowSubheader: false,
      mainDashboardUrl: `/business/${this.envService.businessUuid}/info/overview`,
      currentMicroBaseUrl: `/business/${this.envService.businessUuid}/products`,
      isShowShortHeader: false,
      mainItem: null,
      isShowMainItem: false,
      showDataGridToggleItem: {
        onClick: () => {
          this.dataGridSidebarService.toggleFilters$.next();
          this.cdr.detectChanges();
        },
      },
      isShowDataGridToggleComponent: true,
      closeItem: {
        title: 'Back to apps',
        icon: '#icon-apps-header',
        iconType: 'vector',
        iconSize: '22px',
        isActive: true,
        class: 'products-header-close',
        showIconBefore: true,
      },
      isShowCloseItem: true,
    } as PePlatformHeaderConfig);
  }

  private resetProducts(): Observable<ProductsResponse> {
    this.dataGridService.conditionFormattedFilters = [];
    this.dataGridService.filtersFormGroup.get('tree').patchValue([]);
    return this.productsListService.resetProducts(this.viewMode);
  }

  addSelectedToCollection(selectedIds: string[], collectionId: string) {
    this.productsListService
      .addProductsToCollection(collectionId, selectedIds)
      .pipe(
        take(1),
        switchMap(() => {
          this.peDataGridService.setSelected$.next([]);
          this.showSnackbar('Products have been successfully added to collection');
          return this.productsListService.resetProducts(this.viewMode);
        }),
      )
      .subscribe();
  }

  onAddItemClick(event: MouseEvent) {
    this.dataGridService.addProduct();
  }

  onOpenItemClick(item: PeDataGridItem & { company }, event?: MouseEvent) {
    event?.stopPropagation();
    event?.preventDefault();
    if (item.company && item.company !== this.envService.business.name) {
      this.getProductItem(item.id);
    } else {
      item.actions[0].callback(item.id);
    }
    if (item?.data?.isFolder) {
      this.expandNode(item.id);
    }
  }

  private expandNode(id, toggle = true) {
    const collection = this.dataGridService.collections.find(c => c.id === id);
    if (collection.parentId) {
      this.expandNode(collection.parentId, false);
    }
    const toggleButton = document.getElementById(`drop-list${collection.parentId || collection.id}`);
    if (toggle) {
      this.collectionsTree.allowToggle = false;
      this.collectionsTree.nodeToggle(collection);
      this.collectionsTree.allowToggle = true;
    } else {
      this.collectionsTree.expandNode(collection);
    }
    const expanded = toggleButton?.parentElement?.getAttribute('aria-expanded');
    if (expanded === 'false') {
      toggleButton?.getElementsByTagName('button')[0]?.click();
    }
    this.cdr.detectChanges();
  }

  get headerName(): string {
    const folderId = this.dataGridService.selectedFolder;
    const collection = this.dataGridService.collections.find(c => c.id === folderId);
    return collection ? collection.name : this.translateService.translate('header.list');
  }

  onNodeClick(event: Array<TreeFilterNode<any>>) {
    if (event?.length) {
      if (event.length === 1 && !event[0]) {
        return;
      }
      if (this.channelTree) {
        this.channelTree.initialSelectedTree = null;
      }
      // @ts-ignore
      this.dataGridService.selectedFolder = event[0].id;
      this.dataGridService.filtersFormGroup.get('tree').setValue(event);
      this.dataGridService.filtersFormGroup.updateValueAndValidity();
      this.cdr.detectChanges();
    } else {
      if (this.channelTree) {
        this.channelTree.initialSelectedTree = null;
      }
      this.dataGridService.selectedFolder = undefined;
      this.dataGridService.filtersFormGroup.get('tree').setValue([]);
      this.dataGridService.filtersFormGroup.updateValueAndValidity();
      this.cdr.detectChanges();
    }
  }

  onCreateTreeControl(treeControl): void {
    this.treeControl = treeControl;
  }

  onChannelClick(event: Array<TreeFilterNode<any>>) {
    if (event?.length) {
      if (event.length === 1 && !event[0]) {
        return;
      }
      // @ts-ignore
      if (event[0].slug === Dropshipping) {
        if (this.collectionsTree && this.channelTree) {
          this.dataGridService.selectedFolder = event[0].id;
          this.channelTree.initialSelectedTree = this.dataGridService.channelTreeData[0];
          this.collectionsTree.initialSelectedTree = null;
        }
        this.getProductsByChannelSet();
      } else {
        this.collectionsTree.initialSelectedTree = null;
        this.dataGridService.filtersFormGroup.get('tree').setValue(event);
        this.dataGridService.filtersFormGroup.updateValueAndValidity();
      }
    }
  }

  private getProductItem(id: string) {
    this.productsApiService.getProduct(id)
      .pipe(
        take(1),
        map(response => {
          const product = response.data.product;
          const channelTree = this.dataGridService.channelTreeData;
          product.company = this.envService.business.name;
          product.channelSets = [];
          product.sku = `${product.sku}-${Date.now()}`;
          product.id = null;
          this.dataGridService.selectedFolder = channelTree[0].id;
          if (channelTree?.length && channelTree[0].children.length) {
            this.dataGridService.selectedFolder = channelTree[0].children[0].id;
            product.collections = [{
              _id: channelTree[0].children[0].id,
              // @ts-ignore
              description: channelTree[0].children[0].description,
              name: channelTree[0].children[0].name,
            }];
            this.addProduct(product).subscribe(r => {
              this.showSnackbar(this.translateService.translate('product_saved_successfully'));
            });
            this.cdr.detectChanges();
          } else {
            return this.productsApiService
              .createOrUpdateCollection(
                {
                  id: null,
                  image: '',
                  images: [],
                  conditions: null,
                  products: [],
                  name: 'My Dropshipping',
                  parent: this.dataGridService.selectedFolder,
                } as CollectionModel,
                this.envService.businessUuid,
              )
              .pipe(map((collection) => {
                product.collections = [collection];
                this.myDropshippingId = collection._id;
                this.dataGridService.updateGrid(collection);
                setTimeout(() => {
                  this.addProduct(product).subscribe(r => {
                    this.showSnackbar(this.translateService.translate('product_saved_successfully'));
                  });
                }, 0);
              })).subscribe();
          }
        }),
      ).subscribe();
  }

  private showSnackbar(message) {
    this.snackBarService.toggle(
      true,
      {
        content: message,
        duration: 5000,
        iconId: 'icon-check-rounded-16',
        iconSize: 24,
      });
  }

  getProductsByChannelSet() {
    this.productsListService.loadProductsByChannelSet(this.envService.businessUuid)
      .pipe(tap(d => this.cdr.detectChanges())).subscribe();
  }

  addProduct(product) {
    return this.productsApiService
      .createProduct(
        product,
        this.envService.businessUuid,
      )
      .pipe(
        take(1),
        tap(createdProduct => {
          const productId = get(createdProduct, 'data.createProduct.id');
          const collectionId = this.dataGridService.selectedFolder;

          if (collectionId) {
            this.productsApiService.addProductsToCollection(
              collectionId,
              [productId], this.envService.businessUuid)
              .pipe(take(1)).subscribe();
          }
          this.dataGridService.updateGrid('product');
        }),
      );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.dataGridService.loadingProductId = null;
  }
}
