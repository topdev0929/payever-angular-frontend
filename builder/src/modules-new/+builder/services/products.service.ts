// TODO fix tslint rule
/* tslint:disable:max-file-line-count */
import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { ApolloQueryResult } from 'apollo-client';
import gql from 'graphql-tag';
import { SessionStorage, SessionStorageService } from 'ngx-webstorage';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';

import { pebCreateElement, PebElement, PebElementId, PebElementType, PebPageStore, PebThemeRoute, PebThemeStore } from '@pe/builder-core';
import { EditorState } from '@pe/builder-editor/projects/modules/editor/src/services/editor.state';
import { AbstractElementComponent } from '@pe/builder-editor/projects/modules/elements/src/abstract/abstract.component';
import { Product, ProductDataTypes } from '@pe/builder-editor/projects/modules/elements/src/index';
import { ElementsRegistry } from '@pe/builder-editor/projects/modules/shared/services/elements.registry';
import { DashboardEventEnum, PlatformService } from '@pe/ng-kit/modules/common';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { CurrencySymbolPipe } from '@pe/ng-kit/modules/i18n';
import { OriginalProduct, ProductsApi } from '../../core/api/products-api.service';
import { ThemeData } from '../../core/theme.data';
import { SnackbarComponent } from '../components/snackbar/snackbar.component';
import { BuilderThemeComponent } from '../root/theme.component';
import { SnackbarService } from './snackbar.service';

const PRODUCT_FIELDS = `
  images
  imagesUrl
  uuid
  title
  hidden
  price
  salePrice
  currency
  enabled`;

@Injectable()
export class ProductsService {
  @SessionStorage() widgetProducts: { widgetId?: string; products?: string[]; selectedProducts?: string[] };

  cachedProductsWidgets$ = new BehaviorSubject<{ [key: string]: PebElement[] }>({});
  themeComponent: BuilderThemeComponent;

  constructor(
    private configService: EnvironmentConfigService,
    private currencySymbolPipe: CurrencySymbolPipe,
    private sessionStorageService: SessionStorageService,
    private snackbarService: SnackbarService,
    private platformService: PlatformService,
    private productsApi: ProductsApi,
    private themeData: ThemeData,
    private http: HttpClient,
    private config: EnvironmentConfigService,
    private apollo: Apollo,
    private injector: Injector
  ) { }

  setThemeComponent(comp: BuilderThemeComponent): void {
    this.themeComponent = comp;
  }

  addProduct(pageStore: PebPageStore, editor: EditorState, themeStore: PebThemeStore): void {
    const activeElementId: PebElementId = editor.activeElement;
    const activeElement: PebElement = pageStore.findElement(activeElementId);
    const selectedProductsEl: PebElement[] = activeElement.data.products || [];
    const selectedProducts: PebElementId[] = selectedProductsEl.map((p: any) => p.uuid || p.id || p._id || p) || [];
    const pageId: string = themeStore.activePageSubject$.value.id;
    const themeId: string = themeStore.theme.id;
    const route: PebThemeRoute = themeStore.theme.routing.find((p: PebThemeRoute) => p.pageId === pageId);
    const parents = pageStore.findElementParents(activeElementId);
    const parentId = parents && parents.length ? parents[parents.length - 1].id : null;
    const screen = editor.screen;
    const channelSet = this.themeData.channelSet;

    // FIXME: After introducing service worker this should be changed
    //        Right now we just hope that user won't select product
    this.platformService.dispatchEvent({
      target: DashboardEventEnum.MicroNavigation,
      action: '',
      data: {
        url: 'products/list',
        // FIXME need to check params that pass into products.
        getParams: {
          embedded: true,
          app: 'builder',
          parentAppId: this.themeData.applicationId,
          parentApp: this.themeData.applicationType,
          appId: this.themeData.applicationId,
          pageSlug: route ? route.url : null,
          elementId: activeElementId,
          pageId,
          themeId,
          parentId,
          screen,
          selected: selectedProducts.join(','),
          channelSet,
        },
      },
    });
  }

  initProduct(document: PebPageStore, editor: EditorState, currency: string): void {
    const productsArr: string[] = this.widgetProducts && this.widgetProducts.products;
    const parentId: string = document.state.children.find(
      (elem: PebElement) => (elem.data && elem.data.name) === 'body',
    ).id;

    if (!productsArr) {
      return;
    }

    this.productsApi.fetchProductsById(productsArr).subscribe((raw: Product[]) => {
      this.sessionStorageService.clear('productsForWidget');
      const products: Product[] = raw.map((elem: Product) => ({
        imgSrc: `${this.configService.getCustomConfig().storage}/products/${elem.images[0]}`,
        productPrice: `${Number(elem.price).toFixed(2)} ${this.currencySymbolPipe.transform(currency)}`,
        title: elem.title,
        uuid: elem.uuid,
      }));
      const element: PebElement = pebCreateElement(PebElementType.Product, {
        data: {
          products,
        },
        style: {
          color: 'white',
          width: 320,
          height: Math.max(320, productsArr.length * 320),
        },
      });
      document.appendElement(parentId, element);
      editor.selectedElements = [element.id];
    });
  }

  addEmptyProduct(editor: EditorState, pageStore: PebPageStore): void {
    const parentId = pageStore.state.children.find((elem: PebElement) => (elem.data && elem.data.name) === 'body').id;
    const element = pebCreateElement(PebElementType.Product, {
      data: {
        product: null,
      },
      style: {
        color: 'white',
        width: 320,
        height: 320,
      },
    });
    pageStore.appendElement(parentId, element);
    editor.selectedElements = [element.id];
  }

  addAllProducts(editor: EditorState, pageStore: PebPageStore, registry: ElementsRegistry, pageId: string): void {
    const widgetCmp: AbstractElementComponent = registry.getComponent(editor.activeElement);
    pageStore.updateElement(widgetCmp.id, {
      data: { type: ProductDataTypes.all },
    });

    this.fetchProductsByChannelSet(this.themeData.businessId, this.themeData.channelSet)
      .pipe(
        filter((products: Product[]) => {
          if (!products.length) {
            pageStore.updateElement(widgetCmp.id, { data: { type: null } });
            this.snackbarService.open(SnackbarComponent, 'No products in your shop');
          }

          return !!products.length;
        }),
        tap((products: Product[]) => {
          this.fitAllProducts(products, widgetCmp, pageStore, pageId);
        }),
      )
      .subscribe();
  }

  fitAllProducts(products: Product[], widgetCmp: AbstractElementComponent, pageStore: PebPageStore, pageId: string): void {
    const slicedProducts = products.slice(0, 100);

    const productItemHeight = widgetCmp.element.data && widgetCmp.element.data.itemSize
      ? widgetCmp.element.data.itemSize.height[this.themeComponent.editorComponent.context.editor.screen]
      : 500;
    const sectionHeight = this.themeComponent.editorComponent.getBoundingRect(widgetCmp.parentComponent).height;
    const updatedWidgetHeight = Math.max(275, productItemHeight * slicedProducts.length);
    const widgetTop = parseInt(widgetCmp.styleTop, 10);
    const neededHeight = updatedWidgetHeight + widgetTop;

    if (sectionHeight < neededHeight) {
      pageStore.updateElement(widgetCmp.parentComponent.id, {
        style: {
          height: neededHeight,
        },
      });
    }

    this.cacheProductWidgets([{
      ...widgetCmp.element,
      data: {
        ...widgetCmp.element.data,
        products: slicedProducts.map(p => p._id),
        loadedProducts: slicedProducts,
      },
    }], pageId);
  }

  cacheProductWidgets(widgets: PebElement[], pageId: string): void {
    this.cachedProductsWidgets$.next({
      ...this.cachedProductsWidgets$.value,
      [pageId]: [
        ...(this.cachedProductsWidgets$.value[pageId] ? this.cachedProductsWidgets$.value[pageId] : []),
        ...widgets,
      ],
    });
  }

  addAllCategoryProducts(editor: EditorState, pageStore: PebPageStore, registry: ElementsRegistry): void {
    const widgetCmp: AbstractElementComponent = registry.getComponent(editor.activeElement);
    pageStore.updateElement(widgetCmp.id, { meta: { loading: true } });

    this.productsApi
      .getProductsCategories(this.themeData.businessId)
      .pipe(
        switchMap((categories: { id: string; title: string }[]) =>
          forkJoin([
            this.productsApi.fetchProductsByCategories(this.themeData.businessId, [categories[0].id]),
            this.productsApi.fetchProductsByCategories(this.themeData.businessId, [categories[1].id]),
          ]),
        ),
        // tslint:disable-next-line:typedef
        tap(([firstCategory, secondCategory]) => {
          const products = firstCategory.length ? firstCategory : secondCategory;
          const productItemHeight = 500;
          const sectionHeight = this.themeComponent.editorComponent.getBoundingRect(widgetCmp.parentComponent).height;
          const updatedWidgetHeight = Math.max(275, productItemHeight * products.length);
          const widgetTop = parseInt(widgetCmp.styleTop, 10);
          const neededHeight = updatedWidgetHeight + widgetTop;

          if (sectionHeight < neededHeight) {
            pageStore.updateElement(widgetCmp.parentComponent.id, {
              style: {
                height: neededHeight,
              },
            });
          }

          pageStore.updateElement(widgetCmp.id, {
            meta: { loading: false },
            data: {
              type: ProductDataTypes.category,
              products,
            },
          });
        }),
      )
      .subscribe();
  }

  loadProduct$(id: string, businessId: string): Observable<Product[]> {
    const productsApi: string = this.configService.getBackendConfig().products;

    return this.http
      .post(`${productsApi}/products`, {
        query: `{
          getProducts(businessUuid: "${businessId}", includeIds: [${id}], paginationLimit: 20, pageNumber: 1) {
            products {
              imagesUrl
              _id
              title
              description
              price
              salePrice
              currency
            }
          }
        }
        `,
      })
      .pipe(
        filter((result: any) => result && result.data && result.data.getProducts),
        map(result => result.data.getProducts.products[0]),
      );
  }

  loadProducts$(includeIds: string[], businessId: string): Observable<Product[]> {
    if (!includeIds || !includeIds.length) {
      return of([]);
    }

    const productsApi: string = this.configService.getBackendConfig().products;

    return this.http
      .post(`${productsApi}/products`, {
        query: `{
          getProducts(businessUuid: "${businessId}", includeIds: [${includeIds.map(
          i => `"${i}"`,
        )}], paginationLimit: 20, pageNumber: 1) {
            products {
              imagesUrl
              _id
              title
              description
              price
              salePrice
              currency
            }
          }
        }
        `,
      })
      .pipe(
        filter((result: any) => result && result.data && result.data.getProducts),
        map(result => result.data.getProducts.products),
      );
  }

  fetchProductsByChannelSet(
    businessId: string,
    channelSetId: string,
    filterById: string[] = [],
  ): Observable<Product[]> {
    const productsQuery: any = gql`
          query {
          getProductsByChannelSet (
              businessId: "${businessId}",
              orderBy: "createdAt",
              orderDirection: "desc",
              pageNumber: 1,
              paginationLimit: 20,
              ${channelSetId ? `channelSetId: "${channelSetId}",` : ''}
              existInChannelSet: true,
              filterById: ${JSON.stringify(filterById)},
              ) {
                  products {
                      ${PRODUCT_FIELDS}
                  }
              }
          }
      `;

    this.apollo
      .use('products')
      .getClient()
      .cache.reset();

    return this.apollo
      .use('products')
      .query({ query: productsQuery })
      .pipe(map((response: ApolloQueryResult<any>) => response.data.getProductsByChannelSet.products));
  }

  getProductsCategories(businessId: string): Observable<{ id: string; title: string }[]> {
    const productsQuery: any = gql`
          query {
            getCategories (
              businessUuid: "${businessId}",
            ) {
              id
              title
            }
          }
      `;

    this.apollo
      .use('products')
      .getClient()
      .cache.reset();

    return this.apollo
      .use('products')
      .query({ query: productsQuery })
      .pipe(map((response: ApolloQueryResult<any>) => response.data.getCategories));
  }

  fetchProductsByCategories(businessId: string, categories: string[]): Observable<Product[]> {
    const productsQuery: any = gql`
          query {
            getProductsByCategories (
              businessUuid: "${businessId}",
              pageNumber: 1,
              paginationLimit: 1000,
              categories: [${categories.map((c: string) => `"${c}"`)}],
            ) {
              products {
                ${PRODUCT_FIELDS}
              }
            }
          }
      `;

    this.apollo
      .use('products')
      .getClient()
      .cache.reset();

    return this.apollo
      .use('products')
      .query({ query: productsQuery })
      .pipe(map((response: ApolloQueryResult<any>) => response.data.getProductsByCategories.products));
  }

  loadProductsByCategory$(businessId: string): Observable<Product[]> {
    const categoryTitle = '';

    return this.getProductsCategories(businessId).pipe(
      switchMap(categories => {
        const category: { id: string, title: string } = categories.find(c =>
          c.title.toLowerCase().replace(/\s/g, '') === categoryTitle,
        ) || categories[0];

        return this.fetchProductsByCategories(businessId, [category.id]);
      }),
    );
  }

  fetchProductsByBusiness(businessId: string): Observable<OriginalProduct[]> {
    const productsQuery: any = gql`
          query {
            getProductsByBusiness (
              businessUuid: "${businessId}",
            ) {
                ${PRODUCT_FIELDS}
              }
          }
      `;

    this.apollo
      .use('products')
      .getClient()
      .cache.reset();

    return this.apollo
      .use('products')
      .query({ query: productsQuery })
      .pipe(map((response: ApolloQueryResult<any>) => response.data.getProductsByBusiness));
  }
}
