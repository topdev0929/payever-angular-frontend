import { Injectable, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Select } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, map, take, tap } from 'rxjs/operators';

import { EnvService, PeDataGridLayoutType, TreeFilterNode } from '@pe/common';
import { PeGridItem, PeGridItemType } from '@pe/grid';
import { CurrencySymbolPipe } from '@pe/i18n';
import { TranslateService } from '@pe/i18n-core';
import { MediaContainerType, MediaUrlPipe } from '@pe/media';
import { FolderItem } from '@pe/shared/folders';
import { ProductsAppState } from '@pe/shared/products';
import { SnackbarService } from '@pe/snackbar';

import { Direction } from '../../shared/enums/direction.enum';
import { Collection, CollectionsLoadedInterface } from '../../shared/interfaces/collection.interface';
import { Order } from '../../shared/interfaces/order.interface';
import { PaginationCamelCase } from '../../shared/interfaces/pagination.interface';
import { Product, ProductsResponse } from '../../shared/interfaces/product.interface';
import { ProductsApiService } from '../../shared/services/api.service';
import { DefaultCountryService } from '../../shared/services/country.service';
import { CurrencyService } from '../../shared/services/currency.service';
import { ProductsOrderBy } from '../enums/order-by.enum';

@Injectable()
export class ProductsListService implements OnDestroy {
  skus: any;

  private productsStream$ = new BehaviorSubject<PeGridItem[]>([]);
  private channelSetProductsStream$ = new BehaviorSubject<Product[]>([]);
  private loadingStream$ = new BehaviorSubject<boolean>(false);
  private searchStringStream$ = new BehaviorSubject<string>(null);
  private orderStream$ = new BehaviorSubject<Order>({
    by: 'createdAt',
    direction: Direction.DESC,
  });

  private paginationStream$ = new BehaviorSubject<PaginationCamelCase>({
    page: 1,
    pageCount: 1,
    perPage: 20,
    itemCount: 20,
  });

  private collectionsStream$ = new BehaviorSubject<Collection[]>([]);

  products$ = this.productsStream$.asObservable();
  channelSetProducts$ = this.channelSetProductsStream$.asObservable();
  searchString$ = this.searchStringStream$.asObservable();
  order$ = this.orderStream$.asObservable();
  collections$ = this.collectionsStream$.asObservable();
  pagination$ = this.paginationStream$.asObservable();
  loading$ = this.loadingStream$.asObservable();

  set products(items: PeGridItem[]) {
    this.productsStream$.next(items);
  }

  get products(): PeGridItem[] {
    return this.productsStream$.value;
  }

  set channelSetProducts(items: Product[]) {
    this.channelSetProductsStream$.next(items);
  }

  set loading(value: boolean) {
    this.loadingStream$.next(value);
  }

  get loading(): boolean {
    return this.loadingStream$.value;
  }

  set searchString(value: string) {
    this.searchStringStream$.next(value);
  }

  get searchString(): string {
    return this.searchStringStream$.value;
  }

  set order(value: Order) {
    this.orderStream$.next(value);
  }

  get order(): Order {
    return this.orderStream$.value;
  }

  set pagination(value: PaginationCamelCase) {
    this.paginationStream$.next(value);
  }

  get pagination(): PaginationCamelCase {
    return this.paginationStream$.value;
  }

  folders$: Observable<any[]>;
  appTheme = 'dark';
  activeNode: TreeFilterNode;
  tree: TreeFilterNode[];
  formGroup: FormGroup;
  collections: any[];

  private folderList: FolderItem[] = [];

  @Select(ProductsAppState.folders) productFolders$: Observable<any[]>;
  @SelectSnapshot(ProductsAppState.popupMode) popupMode: boolean;

  constructor(
    private productsApiService: ProductsApiService,
    private envService: EnvService,
    private mediaUrlPipe: MediaUrlPipe,
    private translateService: TranslateService,
    private snackBarService: SnackbarService,
    private currencyService: CurrencyService,
    private countryService: DefaultCountryService,
    private currencySymbolPipe: CurrencySymbolPipe,
  ) {
    this.folders$ = this.productFolders$.pipe(map((folders) => {
      this.collections = folders;

      return folders;
    }));
  }

  toggleOrderByField(field: ProductsOrderBy, direction?: Direction) {
    const toggleDirection = this.order.direction === Direction.ASC ? Direction.DESC : Direction.ASC;
    const updatedDirection =
      direction ?? (this.order.by === field ? toggleDirection : Direction.DESC);
    this.order = {
      by: field,
      direction: updatedDirection,
    };
  }

  loadProducts(
    filters: any[],
    loadMore = false,
    view = PeDataGridLayoutType.Grid,
    first = false,
    withMarketPlaces = false): Observable<ProductsResponse> {
    this.loading = true;

    return this.productsApiService.getProducts({
      businessId: this.envService.businessId,
      filters,
      search: this.searchString,
      pagination: this.pagination,
      order: this.order,
      view,
      first,
      withMarketPlaces
      })
      .pipe(
        map((data: ProductsResponse) => ({
          ...data,
          data: {
            ...data.data,
            getProducts: {
              ...data.data.getProducts,
              products: data.data.getProducts.products.filter(Boolean),
            },
          },
        })),
        tap(({ data }: ProductsResponse) => {
          const { info, products } = data.getProducts;
          const pagination = info.pagination;

          this.products = products.map(product => this.productToItemMapper(product));
          this.pagination = {
            page: pagination.page,
            pageCount: pagination.page_count,
            perPage: pagination.per_page,
            itemCount: pagination.item_count,
          };

          if (first) {
            this.countryService.country = data.getBusiness.companyAddress.country;
            this.currencyService.currency = data.getBusiness.currency;
          }
        }),
        finalize(() => this.loading = false),
      );
  }

  loadCollections(): Observable<CollectionsLoadedInterface> {
    return this.productsApiService.loadCollections(1, this.envService.businessId).pipe(
      tap((data: CollectionsLoadedInterface) => {
        this.collectionsStream$.next(data.collections);
      }),
    );
  }

  patchPagination(value: Partial<PaginationCamelCase>) {
    this.pagination = {
      ...this.pagination,
      ...value,
    };
  }

  loadProductsByChannelSet(businessId: string) {
    return this.productsApiService.getProductsByChannelSet(businessId)
      .pipe(take(1), tap((response) => {
        this.channelSetProducts = response?.data?.getProductsByChannelSet?.products;
      }));
  }

  ngOnDestroy() {
    this.productsStream$.next([]);
  }

  productToItemMapper = (product): PeGridItem => {
    if (!product) {
      return null;
    }

    const imageUrl = product.imagesUrl?.length
        ? this.mediaUrlPipe.transform(product?.imagesUrl[0], MediaContainerType.Products, 'grid-thumbnail' as any)
        : './assets/icons/folder-grid.png';

    return {
      id: product.serviceEntityId || product._id || product.id,
      type: PeGridItemType.Item,
      additionalInfo: [
        `${this.currencySymbolPipe.transform(this.currencyService.currency)}${product.price?.toFixed(2)
          .replace(/\d(?=(\d{3})+\.)/g, '$&,')}`,
        `${this.skus?.[product.sku] ?? 0}
         ${this.translateService.translate('in_stock')}`,
      ],
      data: {
        serviceEntityId: product.serviceEntityId,
        _id: product._id,
        id: product.id,
        isProduct: true,
        isDraggable: true,
      },
      itemLoader$: new BehaviorSubject<boolean>(false),
      title: product.title,
      image: product?.images?.length
        ? this.mediaUrlPipe.transform(product?.images[0], MediaContainerType.Products, 'grid-thumbnail' as any)
        : imageUrl,
      action: this.popupMode ? null : {
        label: this.translateService.translate('open'),
      },
      columns: [
        {
          name: 'name',
          value: 'name',
        },
        {
          name: 'action',
          value: 'action',
        },
      ],
    };
  };

  openSnackbar(text: string, success: boolean): void {
    this.snackBarService.toggle(true, {
      content: text,
      duration: 2500,
      useShowButton: false,
      iconId: success ? 'icon-commerceos-success' : 'icon-alert-24',
      iconSize: 24,
      iconColor: success ? '#00B640' : '#E2BB0B',
    });
  }

  clearFolderList(): void {
    this.folderList = [];
  }

  folderTreeMapper(tree: FolderItem[]): FolderItem[] {
    const treeMapped = tree.reduce((acc, item) => {
      if (item?.children?.length) {
        item.children = [...this.folderTreeMapper(item?.children)];
      }
      this.folderList.push(item);

      return [
        ...acc,
        {
          ...item,
          image: item.image,
        },
      ];
    }, []);

    return treeMapped;
  }

  folderToItemMapper(folder): PeGridItem {
    const imageURL = folder.image
      ?? this.mediaUrlPipe.transform(folder.images?.get(0), MediaContainerType.Products, 'grid-thumbnail' as any);

    return {
      id: folder._id,
      type: PeGridItemType.Folder,
      image: imageURL,
      title: folder.name,
      data: {
        isFolder: true,
        position: folder.position,
        description: folder.description,
      },
      action: {
        label: this.translateService.translate('open').toLowerCase(),
        color: null,
        backgroundColor: null,
      },
      columns: [
        {
          name: 'name',
          value: 'name',
        },
        {
          name: 'action',
          value: 'action',
        },
      ],
    };
  }

  getFolderById(id: string | number): FolderItem {
    return this.folderList.find(item => item._id === id);
  }
}
