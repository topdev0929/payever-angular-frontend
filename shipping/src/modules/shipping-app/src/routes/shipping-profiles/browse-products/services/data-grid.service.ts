import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationExtras, Router } from '@angular/router';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { distinctUntilChanged, map, startWith, switchMap, take, tap, withLatestFrom } from 'rxjs/operators';
import { FormBuilder } from '@angular/forms';

import { sumBy, uniq, map as lodmap, cloneDeep, isEqual, isArray } from 'lodash-es';

import {
  MenuSidebarFooterData,
  PeDataGridApplyFilterCondition,
  PeDataGridButtonAppearance,
  PeDataGridFilterConditionType,
  PeDataGridFilterWithConditions,
  PeDataGridItem,
  PeDataGridListOptions,
  PeDataGridMultipleSelectedAction,
  PeDataGridSingleSelectedAction,
  PeDataGridSortByAction,
  PeDataGridSortByActionIcon,
  TreeFilterNode,
  EnvService,
} from '@pe/common';
import { MediaContainerType, MediaUrlPipe } from '@pe/media';
import { LocaleConstantsService, TranslateService } from '@pe/i18n';
import { AbstractService } from '../../../../services/abstract.service';
import { Product, ProductStockInfo } from '../../../../interfaces/products/product.interface';
import { ProductsOrderBy } from '../../../../interfaces/products/order-by.enum';
import { Direction } from '../../../../interfaces/products/direction.enum';
import { TEXT_CONDITIONS, NUMBER_CONDITIONS } from '../filters';
import { Filter } from '../../../../interfaces/products/filter.interface';
import { FieldFilterKey } from '../../../../interfaces/products/filter.enum';
import { InventoryInterface } from '../../../../interfaces/products/section.interface';
import { ChannelTypeIconService } from './channel-type-icon.service';
import { ProductsListService } from './products-list.service';
import { ConfirmDialogService } from '../dialogs/dialog-data.service';
import { Collection } from '../../../../interfaces/products/collection.interface';
import { getTrackableProductInventory } from '../product-utils';
import { convertStock } from '../stock-formatter';
import { ProductsApiService } from './api.service';

@Injectable()
export class DataGridService extends AbstractService implements OnDestroy {
  actionAddToCollection: any[] = [];
  addActions: PeDataGridSingleSelectedAction[] = [
    {
      label: this.translateService.translate('shipping-app.products.actions.add_product'),
      callback: () => {
        this.router.navigate(['../products-editor'], this.getNavigateParams());
      },
    },
    {
      label: this.translateService.translate('shipping-app.products.actions.add_collection'),
      callback: () => {
        this.router.navigate(['../collections-editor'], this.getNavigateParams());
      },
    },
  ];
  openAction: PeDataGridSingleSelectedAction = {
    label: this.translateService.translate('shipping-app.actions.open'),
    callback: (e: string) => {},
  };

  dataGridListOptions: PeDataGridListOptions = {
    nameTitle: this.translateService.translate('shipping-app.products.order'),
    customFieldsTitles: [
      this.translateService.translate('shipping-app.products.channel'),
      this.translateService.translate('shipping-app.products.category'),
      this.translateService.translate('shipping-app.products.price'),
      `${this.translateService.translate('Variants')} / ${this.translateService.translate('Stock')}`,
    ],
  };

  multipleSelectedActions: PeDataGridMultipleSelectedAction[] = [
    {
      label: this.translateService.translate('shipping-app.products.actions.add_to_collection'),
      appearance: PeDataGridButtonAppearance.Button,
      callback: () => {},
      actions: this.actionAddToCollection,
    },
    {
      label: this.translateService.translate('shipping-app.products.actions.choose_action'),
      appearance: PeDataGridButtonAppearance.Link,
      actions: [
        {
          label: this.translateService.translate('shipping-app.products.actions.select_all'),
          callback: () => {
            this.selectedProductsStream$.next(this.productsListService.products.map((product: Product) => product.id));
          },
        },
        {
          label: this.translateService.translate('shipping-app.products.actions.deselect_all'),
          callback: () => {
            this.selectedProductsStream$.next([]);
          },
        },
        {
          label: this.translateService.translate('shipping-app.actions.delete'),
          callback: (ids?: string[]) => {
            this.deleteSelectedProducts(ids);
            this.selectedProductsStream$.value.forEach(() => {});
          },
        },
      ],
    },
  ];

  singleSelectedAction: PeDataGridSingleSelectedAction = {
    label: this.translateService.translate('shipping-app.actions.open'),
    callback: (id: string) => {
      this.productEdit(id);
    },
  };

  addSelectedAction: PeDataGridSingleSelectedAction = {
    label: this.translateService.translate('shipping-app.actions.add'),
    callback: (id: string) => {
    },
  };

  sortByActions: PeDataGridSortByAction[] = [
    {
      label: this.translateService.translate('shipping-app.products.sort.name'),
      callback: () => {
        this.productsListService.toggleOrderByField(ProductsOrderBy.Title);
      },
      icon: PeDataGridSortByActionIcon.Name,
    },
    {
      label: this.translateService.translate('shipping-app.products.sort.price_asc'),
      callback: () => {
        this.productsListService.toggleOrderByField(ProductsOrderBy.Price, Direction.ASC);
      },
      icon: PeDataGridSortByActionIcon.Ascending,
    },
    {
      label: this.translateService.translate('shipping-app.products.sort.price_desc'),
      callback: () => {
        this.productsListService.toggleOrderByField(ProductsOrderBy.Price, Direction.DESC);
      },
      icon: PeDataGridSortByActionIcon.Descending,
    },
  ];

  filterConditions: PeDataGridFilterWithConditions[] = [
    {
      filterName: 'Product ID',
      filterKey: 'id',
      type: PeDataGridFilterConditionType.Text,
      conditions: cloneDeep(TEXT_CONDITIONS),
      applyFilter: (condition: PeDataGridApplyFilterCondition) => {
        const formattedFilter: Filter = {
          key: FieldFilterKey.Id,
          value: condition.condition.conditionFields[0].inputValue.toString(),
          condition: condition.condition.conditionValue,
        };
        this.applyFilterToFormattedFilters(formattedFilter);
      },
    },
    {
      filterName: 'Product Name',
      filterKey: 'name',
      type: PeDataGridFilterConditionType.Text,
      conditions: cloneDeep(TEXT_CONDITIONS),
      applyFilter: (condition: PeDataGridApplyFilterCondition) => {
        const formattedFilter: Filter = {
          key: FieldFilterKey.Name,
          value: condition.condition.conditionFields[0].inputValue.toString(),
          condition: condition.condition.conditionValue,
        };
        this.applyFilterToFormattedFilters(formattedFilter);
      },
    },
    {
      filterName: 'Price',
      filterKey: 'price',
      type: PeDataGridFilterConditionType.Number,
      conditions: cloneDeep(NUMBER_CONDITIONS),
      applyFilter: (condition: PeDataGridApplyFilterCondition) => {
        const formattedFilter: Filter = {
          key: FieldFilterKey.Price,
          value: condition.condition.conditionFields[0].inputValue.toString(),
          condition: condition.condition.conditionValue,
        };
        this.applyFilterToFormattedFilters(formattedFilter);
      },
    },
    {
      filterName: 'Channel',
      filterKey: 'channel',
      type: PeDataGridFilterConditionType.Text,
      conditions: cloneDeep(TEXT_CONDITIONS),
      applyFilter: (condition: PeDataGridApplyFilterCondition) => {
        const formattedFilter: Filter = {
          key: FieldFilterKey.Channel,
          value: condition.condition.conditionFields.map((field) => {
            return field.inputValue.toString();
          }),
          condition: condition.condition.conditionValue,
        };
        this.applyFilterToFormattedFilters(formattedFilter);
      },
    },
    {
      filterName: 'Category',
      filterKey: 'category',
      type: PeDataGridFilterConditionType.Text,
      conditions: cloneDeep(TEXT_CONDITIONS),
      applyFilter: (condition: PeDataGridApplyFilterCondition) => {
        const formattedFilter: Filter = {
          key: FieldFilterKey.Category,
          value: condition.condition.conditionFields[0].inputValue.toString(),
          condition: condition.condition.conditionValue,
        };
        this.applyFilterToFormattedFilters(formattedFilter);
      },
    },
    {
      filterName: 'Variant Name',
      filterKey: 'variant_name',
      type: PeDataGridFilterConditionType.Text,
      conditions: cloneDeep(TEXT_CONDITIONS),
      applyFilter: (condition: PeDataGridApplyFilterCondition) => {
        const formattedFilter: Filter = {
          key: FieldFilterKey.VariantName,
          value: condition.condition.conditionFields[0].inputValue.toString(),
          condition: condition.condition.conditionValue,
        };
        this.applyFilterToFormattedFilters(formattedFilter);
      },
    },
  ];

  addItem: PeDataGridItem = {
    id: '0',
    image: '',
    selected: false,
  };

  filtersFormGroup = this.fb.group({
    tree: [[]],
    toggle: [false],
  });

  private conditionFormattedFiltersStream$ = new BehaviorSubject<Filter[]>([]);
  private loadingProductIdStream$ = new BehaviorSubject<string>(null);
  private selectedProductsStream$ = new BehaviorSubject<string[]>([]);
  private gridItemsStream$ = new BehaviorSubject<PeDataGridItem[]>([]);
  private gridFoldersStream$ = new BehaviorSubject<PeDataGridItem[]>([]);
  private showAddItemStream$ = new BehaviorSubject<boolean>(true);
  private showFiltersStream$ = new BehaviorSubject<boolean>(true);

  private initialSidebarFooterData: MenuSidebarFooterData = {
    headItem: {
      title: this.translateService.translate('shipping-app.products.collection'),
    },
    menuItems: [
      {
        title: this.translateService.translate('shipping-app.actions.add'),
        onClick: () => this.router.navigate(['../collections-editor'], this.getNavigateParams()),
      },
    ],
  };

  loadingProductId$ = this.loadingProductIdStream$.asObservable();
  showAddItem$ = this.showAddItemStream$.asObservable();
  conditionFormattedFilters$ = this.conditionFormattedFiltersStream$.asObservable();
  gridItems$ = this.gridItemsStream$.asObservable();
  gridFolders$ = this.gridFoldersStream$.asObservable();
  selectedProducts$ = this.selectedProductsStream$.asObservable();
  showFilters$ = this.showFiltersStream$.asObservable();

  treeData$ = this.productsListService.collections$.pipe(
    map((collections: any) =>
      collections.map((collection) => ({
        name: collection.name,
        id: collection._id,
        image: this.mediaUrlPipe.transform(collection.image, MediaContainerType.Products),
      })),
    ),
  );

  collectionFilters$ = this.filtersFormGroup.get('tree').valueChanges.pipe(
    startWith([]),
    tap((collections: TreeFilterNode[]) => this.showAddItemStream$.next(!collections.length)),
    map((collections: TreeFilterNode[]) => this.getCollectionsFilters(collections)),
  );
  allFilters$ = combineLatest([this.conditionFormattedFilters$, this.collectionFilters$]).pipe(
    distinctUntilChanged(
      ([conditionalFilters1, collectionFilter1], [conditionalFilters2, collectionFilter2]) =>
        isEqual(conditionalFilters1, conditionalFilters2) && isEqual(collectionFilter1, collectionFilter2),
    ),
    map(([conditionalFilters, collectionFilter]) => [...conditionalFilters, collectionFilter]),
  );
  sidebarFooterData$ = this.filtersFormGroup.get('tree').valueChanges.pipe(
    startWith(this.initialSidebarFooterData),
    map((tree: TreeFilterNode[]) => {
      let footerData: MenuSidebarFooterData;
      if (tree.length) {
        footerData = {
          headItem: {
            title: tree[0].name,
          },
          menuItems: [
            {
              title: this.translateService.translate('shipping-app.actions.edit'),
              onClick: () =>
                this.router.navigate(['../collections-editor', tree[0].id], {
                  relativeTo: this.activatedRoute,
                }),
            },
            {
              title: this.translateService.translate('shipping-app.actions.delete'),
              onClick: () => this.deleteCollections(),
            },
          ],
        };
      } else {
        footerData = this.initialSidebarFooterData;
      }

      return footerData;
    }),
  );

  get gridItems(): PeDataGridItem[] {
    return this.gridItemsStream$.value;
  }

  set gridItems(items: PeDataGridItem[]) {
    this.gridItemsStream$.next(items);
  }

  get gridFolders(): PeDataGridItem[] {
    return this.gridFoldersStream$.value;
  }

  set gridFolders(folders: PeDataGridItem[]) {
    this.gridFoldersStream$.next(folders);
  }

  set loadingProductId(value: string) {
    this.loadingProductIdStream$.next(value);
  }

  get selectedProducts(): string[] {
    return this.selectedProductsStream$.value;
  }

  set selectedProducts(ids: string[]) {
    this.selectedProductsStream$.next(ids);
  }

  get showAddItem(): boolean {
    return this.showAddItemStream$.value;
  }

  set conditionFormattedFilters(filters: Filter[]) {
    const validatedFilters = filters.filter(
      (filter) =>
        !!filter.value &&
        (!isArray(filter.value) || (filter.value as any[]).some((val) => val !== undefined && val !== null && val !== '')),
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

  private inventories: InventoryInterface[] = [];

  constructor(
    private router: Router,
    private mediaUrlPipe: MediaUrlPipe,
    private channelTypeIconService: ChannelTypeIconService,
    private envService: EnvService,
    private activatedRoute: ActivatedRoute,
    private productsApiService: ProductsApiService,
    private productsListService: ProductsListService,
    private localeConstantsService: LocaleConstantsService,
    private fb: FormBuilder,
    private confirmDialog: ConfirmDialogService,
    private translateService: TranslateService,
    private sanitizer: DomSanitizer,
  ) {
    super();
  }

  createDataGridItem(product: Product): PeDataGridItem {
    const formattedPrice = new Intl.NumberFormat(this.localeConstantsService.getLocaleId(), {
      style: 'currency',
      currency: product.currency ?? 'EUR',
    }).format(product.price);

    return {
      id: product.id,
      image: this.mediaUrlPipe.transform(product.images[0], MediaContainerType.Products, 'grid-thumbnail' as any),
      title: product.title,
      subtitle: formattedPrice,
      description: product.variants.length + ' ' + convertStock(this.getProductStockInfo(product)),
      customFields: [
        { content: this.getChannelData(product) },
        { content: product.categories.map((cat) => cat.title).join('/') },
        { content: formattedPrice },
        { content: product.variants.length + ' ' + convertStock(this.getProductStockInfo(product)) },
      ],
      selected: false,
      actions: [{ ...this.singleSelectedAction, isLoading$: this.loadingProductId$.pipe(map((id) => id === product.id)) }],
    };
  }

  createDataGridFolder(collection: Collection): PeDataGridItem {
    return {
      id: collection._id,
      image: this.mediaUrlPipe.transform(collection.image, MediaContainerType.Products),
      title: collection.name,
      customFields: [{ content: '' }, { content: '' }, { content: '' }, { content: '' }],
      data: {
        isFolder: true,
      },
    };
  }

  productEdit(id: string) {
    this.loadingProductIdStream$.next(id);
    this.router.navigate(['../products-editor', id], this.getNavigateParams());
  }

  toggleFiltersDisplaying(value?: boolean) {
    const showFilter = value ?? !this.selectedProductsStream$.value;
    this.showFiltersStream$.next(showFilter);
  }

  ngOnDestroy() {
    this.filtersFormGroup.get('tree').patchValue([]);
    this.conditionFormattedFilters = [];
    this.gridItems = [];
    this.gridFolders = [];
    super.ngOnDestroy();
  }

  private getCollectionsFilters(collections: TreeFilterNode[]): Filter {
    const values = collections.map((collection) => collection.id);

    return {
      key: FieldFilterKey.Collections,
      condition: 'is',
      value: values,
    };
  }

  private getProductStockInfo(product: Product): ProductStockInfo {
    const productInventory: InventoryInterface[] = getTrackableProductInventory(product, this.inventories);
    return {
      stock: sumBy(productInventory, (inventory) => inventory.stock || 0),
      isTrackable: productInventory.length > 0,
    };
  }

  private getChannelData(product: Product): SafeHtml {
    const dist: string[] = uniq(lodmap(product.channelSets, 'type'));
    return this.channelTypeIconService.getIconAsSafeHtml(dist);
  }

  deleteSelectedProducts(ids: string[]): void {
    this.confirmDialog.open({
      title: this.translateService.translate('shipping-app.products.confirm_dialog.deleting_products'),
      subtitle: this.translateService.translate('shipping-app.products.confirm_dialog.do_you_want_to_delete'),
      cancelButtonTitle: this.translateService.translate('shipping-app.actions.no'),
      confirmButtonTitle: this.translateService.translate('shipping-app.actions.yes'),
    });

    this.confirmDialog
      .onConfirmClick()
      .pipe(
        take(1),
        switchMap(() => this.productsApiService.removeStoreItem(ids)),
        withLatestFrom(this.allFilters$),
        switchMap(([_, filters]) => {
          this.selectedProducts = this.selectedProducts.filter((id) => !ids.includes(id));
          return this.productsListService.loadProducts(filters);
        }),
      )
      .subscribe();
  }

  private applyFilterToFormattedFilters(formattedFilter: Filter) {
    const formattedFilterValue: Filter[] = !this.conditionFormattedFilters.some((filter) => filter.key === formattedFilter.key)
      ? [...this.conditionFormattedFilters, formattedFilter]
      : this.conditionFormattedFilters.map((filter) => (filter.key === formattedFilter.key ? formattedFilter : filter));
    this.conditionFormattedFilters = formattedFilterValue;
  }

  private deleteCollections() {
    const ids = this.filtersFormGroup.value.tree.map((item: TreeFilterNode) => item.id);
    this.confirmDialog.open({
      title: this.translateService.translate('shipping-app.products.confirm_dialog.deleting_collections'),
      subtitle: this.translateService.translate('shipping-app.products.confirm_dialog.do_you_want_to_delete_collections'),
      cancelButtonTitle: this.translateService.translate('shipping-app.actions.no'),
      confirmButtonTitle: this.translateService.translate('shipping-app.actions.yes'),
    });

    this.confirmDialog
      .onConfirmClick()
      .pipe(
        take(1),
        switchMap(() => this.productsApiService.deleteCollections(ids, this.envService.businessId)),
        switchMap(() => {
          this.filtersFormGroup.get('tree').patchValue([]);
          return this.productsListService.loadCollections();
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
      navigateParams.queryParams.prevProductsPath = this.activatedRoute.snapshot.url[0]?.path ?? '';
    }
    navigateParams.queryParamsHandling = 'merge';
    return navigateParams;
  }

  private canUseRelativeNavigate(): boolean {
    return this.activatedRoute.snapshot.pathFromRoot.filter((route: ActivatedRouteSnapshot) => route.url.length > 0).length > 0;
  }
}
