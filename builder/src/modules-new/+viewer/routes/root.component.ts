import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, UrlSegment } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of, throwError } from 'rxjs';
import { catchError, filter, first, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import {
  pebCreateElement,
  PebDocument,
  PebElement,
  PebElementType,
  pebFindElementChildren,
  pebMapElementDeep,
  PebPage,
  PebThemeRoute,
} from '@pe/builder-core';
import {
  Product,
  ProductDataTypes,
  ProductPageData,
  TextTypes,
} from '@pe/builder-editor/projects/modules/elements/src/index';
import { CartData, EditorEventInterface } from '@pe/builder-editor/projects/modules/shared/interfaces';
import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { TranslateService } from '@pe/ng-kit/modules/i18n';
import { SnackBarService, SnackBarVerticalPositionType } from '@pe/ng-kit/modules/snack-bar';
import { PeStepperService, PeWelcomeStepAction, PeWelcomeStepperAction } from '@pe/stepper';
import { BuilderApi } from '../../core/api/builder-api.service';
import { OriginalProduct, ProductsApi } from '../../core/api/products-api.service';
import { BaseThemeVersionInterface, ProductVariant } from '../../core/core.entities';
import { ThemeData } from '../../core/theme.data';

interface Theme extends BaseThemeVersionInterface {
  data: any;
  routing: PebThemeRoute[];
  pages: PebPage[];
}

@Component({
  selector: 'pe-builder-viewer-container',
  templateUrl: 'root.component.html',
  styleUrls: ['root.component.scss'],
})
export class RootComponent extends AbstractComponent implements OnInit, OnDestroy {
  activeProduct$: Observable<ProductPageData>;
  cartData$: Observable<CartData> = of({ // TODO: import cartData interface
    quantity: 0,
    showDot: true,
    showQuantity: false,
  });

  theme: Theme;

  private readonly documentSubject$: BehaviorSubject<PebDocument> = new BehaviorSubject(null);
  private readonly pageUrlSubject$: BehaviorSubject<string> = new BehaviorSubject('');
  private tempStyleEl: HTMLStyleElement;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly envConfigService: EnvironmentConfigService,
    private readonly http: HttpClient,
    private readonly productsApiService: ProductsApi,
    private readonly router: Router,
    private readonly snackbarService: SnackBarService,
    private readonly translateService: TranslateService,
    private builderApi: BuilderApi,
    private themeData: ThemeData,
    private renderer: Renderer2,
    public peStepperService: PeStepperService,
  ) {
    super();

    activatedRoute.data
      .pipe(
        filter((data: any) => data.theme),
        tap((data: any) => (this.theme = data.theme)),
        takeUntil(this.destroyed$),
        catchError(err => {
          return this.errorHandler(err, true);
        }),
      )
      .subscribe();

    activatedRoute.firstChild.url
      .pipe(
        map((segments: UrlSegment[]) => segments.map((s: UrlSegment) => s.path).join('/')),
        tap((url: string) => this.pageUrlSubject$.next(url)),
        takeUntil(this.destroyed$),
        catchError(err => {
          return this.errorHandler(err, true);
        }),
      )
      .subscribe();

    // TODO: only for DEMO
    const productsApi = this.envConfigService.getBackendConfig().products;
    const imagesHost = this.envConfigService.getCustomConfig().storage;

    this.activeProduct$ = activatedRoute.queryParamMap.pipe(
      map((q: ParamMap) => q.get('id')),
      filter((id: string) => !!id),
      switchMap((id: string) =>
        this.http
          .post(`${productsApi}/products`, {
            operationName: 'getProducts',
            query: `query getProducts {
            product(id: "${id}") {
              businessUuid
              imagesUrl
              _id
              title
              description
              price
              salePrice
              currency
              variants {
                id
                title
                description
                price
                salePrice
                images
                options {
                  _id
                  name
                  value
                }
              }
            }
          }
          `,
            variables: {},
          })
          .pipe(
            filter((result: any) => result && result.data && result.data.product),
            map((result: any) => result.data.product),
            map((p: Product) => ({
              ...p,
              variants: p.variants.map((v: ProductVariant) => ({
                ...v,
                imagesUrl: v.images.map((i: string) => `${imagesHost}/products/${i}`),
              })),
            } as any)), // TODO it is ProductPageDat but need to refactor to compile it
            takeUntil(this.destroyed$),
            catchError(err => {
              return this.errorHandler(err);
            }),
          ),
      ),
      catchError(err => {
        return this.errorHandler(err, true);
      }),
    );

    this.pageUrlSubject$
      .pipe(
        map(slug => slug === '' ? '/' : ''),
        map((slug: string) => {
          if (!this.theme) {
            return pebCreateElement(PebElementType.Document);
          }

          const route = this.theme.routing.find(r => r.url === slug) || this.theme.routing[0];

          return this.theme.pages.find(p => p.id === route.pageId) || this.theme.pages[0];
        }),
        filter((page: PebPage) => !!page && !!page.snapshot),
        // switchMap((document: PebDocument) => this.appendProductsIntoWidgets(document)),
        // map((document: PebDocument) => this.appendSlugIntoTextWidgets(document)),
        tap((page: PebPage) => this.documentSubject$.next(page.snapshot)),
        takeUntil(this.destroyed$),
        catchError(err => this.errorHandler(err, true)),
      )
      .subscribe();
  }

  appendSlugIntoTextWidgets(document: PebDocument): PebDocument {
    const categoryTitle = this.pageUrlSubject$.value.charAt(0).toUpperCase() + this.pageUrlSubject$.value.slice(1);

    return pebMapElementDeep(document, (el: PebElement) => {
      if (el.type === PebElementType.Text && el.data && el.data.type === TextTypes.category) {
        // FIXME returned object heere is not PebElement because PebElement has "text" string property,
        // But here text is object
        // tslint:disable-next-line:no-object-literal-type-assertion
        return {
          ...el,
          text: Object.keys(el.text).reduce(
            (acc: {}, screen: string) => ({
              ...acc,
              [screen]: (el.text[screen] as string).replace(/>([^<]*)</gm, t =>
                t.length === 2 ? t : `>${categoryTitle}<`,
              ),
            }),
            {},
          ),
        } as PebElement;
      }

      return el;
    });
  }

  appendProductsIntoWidgets(document: PebDocument): Observable<PebElement> {
    const productWidgets = pebFindElementChildren(document, element => element.type === PebElementType.Product);
    if (
      !productWidgets.length ||
      !productWidgets.every(w => w.data && (w.data.products || w.data.type === ProductDataTypes.category))
    ) {
      return of(document);
    }

    const productSources = productWidgets.reduce((acc, widget) => {
      if (!widget || !widget.data || !widget.data.products || !widget.data.products.length) {
        return [];
      }

      const productIds = widget.data.products.map(p => p.id || p.uuid || p.id);

      const source =
        widget.data.type === ProductDataTypes.category ? this.getCategoryProducts() : this.getProducts(productIds);

      return [...acc, source.pipe(map(products => ({ ...widget, data: { ...widget.data, products } })))];
    }, []);

    return combineLatest(productSources).pipe(
      map((widgets: PebElement[]) => {
        return pebMapElementDeep(document, el =>
          el.type !== PebElementType.Product ? el : widgets.find((w: PebElement) => w.id === el.id),
        );
      }),
      catchError(err => {
        return this.errorHandler(err, true);
      }),
    );
  }

  ngOnInit(): void {
    if (
      this.peStepperService.currentStep &&
      (
        this.peStepperService.currentStep.action === PeWelcomeStepAction.UploadProduct ||
        this.peStepperService.currentStep.action === PeWelcomeStepAction.ShopPreview
      )
    ) {
      if (this.peStepperService.currentStep.action === PeWelcomeStepAction.UploadProduct) {
        this.peStepperService.dispatch(PeWelcomeStepperAction.NextStepLoaded, this.peStepperService.currentStep);
      }

      this.peStepperService.dispatch(PeWelcomeStepperAction.ChangeIsActive, true);
      this.peStepperService.dispatch(PeWelcomeStepperAction.EnableContinue, false);
    } else {
      this.peStepperService.dispatch(PeWelcomeStepperAction.ChangeIsActive, false);
    }

    this.peStepperService.continue$.pipe(
      takeUntil(this.destroyed$),
      filter(n => n !== null),
      switchMap(n =>
        n.skipping ? of(null) : this.builderApi.getShopDomains(this.themeData.context.businessId, this.themeData.context.applicationId),
      ),
      tap(domains => {
        if (!domains) {
          this.peStepperService.dispatch(PeWelcomeStepperAction.ChangeIsActive, false);
          this.onDisablePreviewMode();

          return;
        }

        this.openShop();

        this.peStepperService.dispatch(PeWelcomeStepperAction.ShowLoading, false);
      }),
    ).subscribe();

    this.tempStyleEl = document.createElement('style');
    this.tempStyleEl.innerText = '.pe-bootstrap .mat-snack-bar-container { background: none !important; }';
    document.head.appendChild(this.tempStyleEl);
  }

  openShop(): void {
    this.builderApi.getShopDomains(this.themeData.context.businessId, this.themeData.context.applicationId).pipe(
      first(),
      tap(domains => {
        const domain = domains.find(d => d.isLive);

        if (!domain) {
          console.error('There are no domains');
        }

        const host = this.envConfigService.getConfig().primary.shopHost;
        this.openNewTab(`https://${domain.name}.${host}`);
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    this.tempStyleEl.remove();
  }

  onEvent(event: EditorEventInterface): void {
    switch (event.type) {
      case 'link-click':
        if (typeof event.payload === 'string') {
          this.onClickLink(event.payload);
        }
        break;
      case 'cart-click':
        break;
      case 'add-product-to-cart':
        this.snackbarService.show('Product added to cart', { position: SnackBarVerticalPositionType.Bottom });
        break;
      default:
        break;
    }
  }

  get document$(): Observable<PebDocument> {
    return this.documentSubject$.asObservable();
  }

  onClickLink(link: string): void {
    this.router.navigate(['../viewer', link], {
      relativeTo: this.activatedRoute.parent,
    })
    .then()
    .catch(err => this.errorHandler(err));
  }

  onDisablePreviewMode(): void {
    const url = this.pageUrlSubject$.getValue();

    this.router.navigate(['../editor', url], {
      relativeTo: this.activatedRoute.parent,
    })
    .then()
    .catch(err => this.errorHandler(err));
  }

  getCategoryProducts(): Observable<OriginalProduct[]> {
    const categoryTitle = this.pageUrlSubject$.value.toLowerCase().replace(/\s/g, '');

    return this.productsApiService.getProductsCategories(this.themeData.context.businessId).pipe(
      switchMap(categories => {
        const category =
          categories.find(c => c.title.toLowerCase().replace(/\s/g, '') === categoryTitle) || categories[0];

        return this.productsApiService.fetchProductsByCategories(this.themeData.context.businessId, [category.id]);
      }),
      catchError(err => {
        return this.errorHandler(err, true);
      }),
    );
  }

  // FIXME check return type
  getProducts(includeIds: string[]): Observable<any> {
    const productsApi = this.envConfigService.getBackendConfig().products;

    return this.http
      .post(`${productsApi}/products`, {
        query: `{
          getProducts(businessUuid: "${this.themeData.context.businessId}", includeIds: [${includeIds.map(
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
        takeUntil(this.destroyed$),
        catchError(err => {
          return this.errorHandler(err, true);
        }),
      );
  }

  private openNewTab(url: string): void {
    // Fix for iOS/MacOS Safari
    const a = this.renderer.createElement('a');
    a.target = '_blank';
    a.href = url;

    const e = window.document.createEvent('MouseEvents');
    e.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, true, false, false, false, 0, null);
    a.dispatchEvent(e);
  }

  private errorHandler(error: any, showSnack?: boolean): Observable<never> {
    if (error.status === 403) {
      error.message = this.translateService.translate('errors.forbidden');
    }
    if (showSnack) {
      this.snackbarService.show(error.message, { position: SnackBarVerticalPositionType.Bottom });
    }

    return throwError(error);
  }
}
