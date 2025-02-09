import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, map, take, tap } from 'rxjs/operators';

import { PeDataGridLayoutType } from '@pe/common';

import { Product, ProductsResponse } from '../../shared/interfaces/product.interface';
import { ProductsApiService } from '../../shared/services/api.service';
import { EnvService } from '../../shared/services/env.service';
import { Order } from '../../shared/interfaces/order.interface';
import { PaginationCamelCase } from '../../shared/interfaces/pagination.interface';
import { Direction } from '../../shared/enums/direction.enum';
import { ProductsOrderBy } from '../enums/order-by.enum';
import { Collection, CollectionsLoadedInterface } from '../../shared/interfaces/collection.interface';
import { AbstractService } from '../../misc/abstract.service';

@Injectable()
export class ProductsListService extends AbstractService implements OnDestroy {
  private productsStream$ = new BehaviorSubject<Product[]>([]);
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

  set products(items: Product[]) {
    this.productsStream$.next(items);
  }

  get products(): Product[] {
    return this.productsStream$.value;
  }

  set channelSetProducts(items: Product[]) {
    this.channelSetProductsStream$.next(items);
  }

  get channelSetProducts(): Product[] {
    return this.channelSetProductsStream$.value;
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

  set collections(items: Collection[]) {
    this.collectionsStream$.next(items);
  }

  get collections(): Collection[] {
    return this.collectionsStream$.value;
  }

  get hasNextPage(): boolean {
    return this.pagination.page < this.pagination.pageCount;
  }

  constructor(
    private productsApiService: ProductsApiService,
    private envService: EnvService,
  ) {
    super();
  }

  loadNextPage() {
    if (this.hasNextPage) {
      this.patchPagination({
        page: this.pagination.page + 1,
      });
    }
  }

  toggleOrderByField(field: ProductsOrderBy, direction?: Direction) {
    const updatedDirection =
      direction ??
      (this.order.by === field
        ? this.order.direction === Direction.ASC
          ? Direction.DESC
          : Direction.ASC
        : Direction.DESC);
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

    return this.productsApiService
      .getProducts(
        this.envService.businessUuid,
        filters, [],
        this.searchString,
        this.pagination,
        this.order,
        view,
        first,
        withMarketPlaces)
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

          this.products = loadMore ? [...this.products, ...products] : products;
          this.pagination = {
            page: pagination.page,
            pageCount: pagination.page_count,
            perPage: pagination.per_page,
            itemCount: pagination.item_count,
          };

          if (first) {
            this.envService.country = data.getBusiness.companyAddress.country;
            this.envService.currency = data.getBusiness.currency;
          }
        }),
        finalize(() => (this.loading = false)),
      );
  }

  addProductsToCollection(collectionId: string, selectedIds: string[]): Observable<Collection> {
    return this.productsApiService.addProductsToCollection(collectionId, selectedIds, this.envService.businessUuid);
  }

  resetProducts(view: PeDataGridLayoutType) {
    this.searchString = '';
    return this.loadProducts([], false, view);
  }

  loadCollections(): Observable<CollectionsLoadedInterface> {
    return this.productsApiService.loadCollections(1, this.envService.businessUuid).pipe(
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
      .pipe(take(1), tap(response => {
        this.channelSetProducts = response?.data?.getProductsByChannelSet?.products;
      }));
  }

  ngOnDestroy() {
    this.productsStream$.next([]);
    super.ngOnDestroy();
  }
}
