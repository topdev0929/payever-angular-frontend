/* tslint:disable:no-string-literal */
// tslint:disable: member-ordering
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, forkJoin, Observable, of, Subject } from 'rxjs';
import { filter, map, mergeMap, share, shareReplay, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import {
  PebAppType,
  PebDocument,
  PebElement,
  PebElementType,
  pebFindElementChildren,
  pebMapElementDeep,
  PebPage,
  PebPageId,
  PebPageVariant,
  PebThemeRoute,
  PebVersionShort,
} from '@pe/builder-core';
import {
  Product,
  ProductData,
  ProductPageData,
  ProductPageVariant,
  TextTypes,
} from '@pe/builder-editor/projects/modules/elements/src';
import { EnvironmentStateInterface } from '@pe/builder-editor/projects/modules/elements/src/common/interfaces';
import { ENVIRONMENT_STATE } from '@pe/builder-editor/projects/modules/elements/src/constants';
// import { findChildren, mapDeep } from '@pe/builder-editor/projects/modules/editor/src/services/document.utils';
import { CartData, DispatchEvents, EditorEventInterface, Locales } from '@pe/builder-editor/projects/modules/shared/interfaces';
import { AuthService } from '@pe/ng-kit/modules/auth';
import { AbstractComponent, PlatformService } from '@pe/ng-kit/modules/common';
import { EnvironmentConfigService } from '@pe/ng-kit/modules/environment-config';
import { LocaleService, TranslateService, TranslationLoaderService } from '@pe/ng-kit/modules/i18n';
import { MediaService } from '@pe/ng-kit/modules/media';
import { SnackBarService, SnackBarVerticalPositionType } from '@pe/ng-kit/modules/snack-bar';
import { WindowService } from '@pe/ng-kit/modules/window';
import { DomainInterface, PasswordConfigInterface } from '../../../../../ssr/interfaces';
import { ApiService, SeoService, ClientLauncherService, NotFound } from '../../../../app/services';
import { ProductDataTypes } from '../../../../interfaces/interfaces-v2';
import { CartEventInterface } from '../../../checkout/interfaces';
import { NewCartService } from '../../../checkout/services/cart.service';
import { NewCheckoutService } from '../../../checkout/services/checkout.service';
import { ApplicationApiService, EnvService, PasswordControlService } from '../../services';
import { ProductsApi } from '../../services/products-api.service';
import { CookieBarLabels } from '../cookie-bar/cookie-bar.component';

@Component({
  selector: 'client-container',
  templateUrl: 'client-container.component.html',
  styleUrls: ['client-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContainerComponent extends AbstractComponent implements OnInit {

  cartData$: Observable<CartData> = this.cartService.itemsEvent$.pipe(
    map((event: CartEventInterface) => ({
      quantity: event.items.length,
    } as CartData)),
  );

  cartModeShown$: Observable<string> = this.checkoutService.cartShownMode$.pipe(
    share(),
  );

  passwordDialogShown$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  storeLockDialogShown$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  backgroundImageShown$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  backgroundImage = this.envService.backgroundImageUrl;

  productWidgetSourcesSubject$ = new BehaviorSubject<PebElement[]>([]);

  private themeSubj$ = new BehaviorSubject<PebVersionShort>(null);
  /**
   * Get page only after activated route params changed
   */
  themePage$: Observable<PebPage> = combineLatest([
    this.themeSubj$,
    this.activatedRoute.params,
  ])
    .pipe(
      filter(([theme, params]) => !!theme),
      switchMap(([theme, params]) => {
        // const fixtureTheme = window['fixture'];
        return this.getPageByRoute$(theme, params);
      }),
      map((page: PebPage) => appendSlugIntoTextWidgets(page, this.slug)),
      tap((page: PebPage) => { this.setSeoData(page); }),
      tap((page: PebPage) => {
        this.fillProductWidgetsByProducts$(page).pipe(
          tap((productWidgets: PebElement[]) => {
            this.productWidgetSourcesSubject$.next(productWidgets);
          }),
        ).subscribe();
      }),
      shareReplay(1),
    );

  page$ = combineLatest([this.productWidgetSourcesSubject$, this.themePage$]).pipe(
    map(([widgetSources, page]: [PebElement[], PebPage]) => addProdcutsToPage(widgetSources, page)),
    shareReplay(1),
  );

  passwordConfig$: Observable<PasswordConfigInterface> = this.themePage$.pipe(
    switchMap((page: PebPage) => this.passwordControlService.getPasswordConfig(this.envService.appId, this.envService.business)),
  );

  activeProduct$: Observable<ProductPageData>;

  defaultLocale$ = new BehaviorSubject<Locales>(Locales.en);

  cookieBarLabels$: Subject<CookieBarLabels> = new Subject();

  private readonly activeLogo$: BehaviorSubject<{url: string}> = new BehaviorSubject(null);

  isShopApplication = false;

  state: EnvironmentStateInterface = this.injector.get<EnvironmentStateInterface>(ENVIRONMENT_STATE, null);

  private localeService: LocaleService = this.injector.get(LocaleService);
  private slug = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private changeDetectionRef: ChangeDetectorRef,
    private envConfigService: EnvironmentConfigService,
    private envService: EnvService,
    private router: Router,
    private seoService: SeoService,
    private injector: Injector,
    private translationLoaderService: TranslationLoaderService,
    private translateService: TranslateService,

    private applicationApiService: ApplicationApiService,
    private readonly mediaService: MediaService,
    public checkoutService: NewCheckoutService,
    private cartService: NewCartService,
    private platformService: PlatformService,
    private snackbarService: SnackBarService,
    // private viewerDialogService: ViewerDialogService,
    private windowService: WindowService,
    private http: HttpClient,
    private productsApiService: ProductsApi,
    private launcherService: ClientLauncherService,
    private passwordControlService: PasswordControlService,
    private authService: AuthService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.isShopApplication = this.envService.app === PebAppType.shop;
    let domainData: DomainInterface;
    const token = this.authService.token;

    if (token && token.length) {
      this.checkAccess(token);
    } else if (this.envService.loadingPasswordedStore) {
      this.passwordDialogShown$.next(true);
    }

    this.activatedRoute.data.pipe(
      filter((data: { domainData: DomainInterface }) => !!data.domainData || !!this.envService['domainData']),
      tap((data: { domainData: DomainInterface }) => {
        if (data.domainData) {
          this.envService['domainData'] = data.domainData;
        }
        // TEMP HACK
        domainData = data.domainData || this.envService['domainData'];

        this.envService.business = domainData.business;
      }),
      take(1),
      mergeMap((data: { domainData: DomainInterface }) => {
        return this.apiService.getPublishedVersion(domainData.app).pipe(
          tap((theme: PebVersionShort) => {
            if (!theme) {
              this.launcherService.notFound = NotFound.Page;
              this.router.navigate(['404'], { skipLocationChange: true }).then().catch();

              return;
            }
          }),
          map((theme: PebVersionShort) => ([ theme, domainData ])),
        );
      }),
      mergeMap(([version, domain]: [PebVersionShort, DomainInterface]) => {
        let application$: Observable<any>;

        if (domain.type === PebAppType.shop) {
          // FIXME here have to get shop, cos need to have channel set for checkout
          application$ = this.applicationApiService.getShop(domainData.business, domainData.app);
        } else if (domain.type === PebAppType.pos) {
          application$ = this.applicationApiService.getTerminal(domainData.business, domainData.app);
        }

        if (application$) {
          return application$.pipe(
            tap((app: any) => {
              if (app) {
                if (!app.live) {
                  this.backgroundImageShown$.next(true);
                  this.passwordDialogShown$.next(true);
                  this.passwordDialogShown$.complete();
                  this.envService.isLive$.next(false);

                  return;
                }

                this.backgroundImageShown$.next(false);
                this.defaultLocale$.next(app.defaultLocale);
                this.localeService.currentLocale$.next({ code: app.defaultLocale } as any);
                this.envService.channelSet = app.channelSet;

                this.initCheckout(app.channelSet);
                this.themeSubj$.next(version);
                const url = app.logo ? this.mediaService.getMediaUrl(app.logo, 'images') : null;
                this.activeLogo$.next({url});
              }
            }),
          );
        }

        return of(null);
      }),
      mergeMap((app: any) => {
        let obs$: Observable<boolean>;

        if (app) {
          obs$ = this.translationLoaderService.reloadTranslations(app.defaultLocale).pipe(tap(() => {
            const agreement: string = this.translateService.translate('cookies_label', { appName: app.name });
            const link: string = this.translateService.translate('cookies_link');
            this.cookieBarLabels$.next({
              agreement,
              link,
            });
          }));
        } else {
          obs$ = of(null);
        }

        return obs$;
      }),
      takeUntil(this.destroyed$),
    )
      .subscribe();

    this.activeProduct$ = this.activatedRoute.queryParamMap.pipe(
      map((params: ParamMap) => params.get('id')),
      filter(id => !!id),
      switchMap(id => this.getProductPageData$(id)),
      tap(product => {
        if (!product || product['businessUuid'] !== this.envService.business) {
          this.launcherService.notFound = NotFound.Page;
          this.router.navigate(['404'], { skipLocationChange: true }).then().catch();
        }
      }),
    );

    this.themeSubj$.pipe(
      filter(v => !!v),
      tap((theme: PebVersionShort) => {
        this.state.routing = theme.routing;
        this.state.brief = theme.brief as any; // FIXME update brief type in EnvironmentStateInterface
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.passwordConfig$.pipe(
      tap((data => {
        this.passwordControlService.passwordEnabled = data.enabled;
        this.passwordControlService.passwordLock = data.passwordLock;
        this.passwordControlService.message$.next(data.message);

        if (this.envService.defaultStoreLoading) {
          this.storeLockDialogShown$.next(true);
          this.storeLockDialogShown$.complete();

          return;
        }

        if (data.passwordLock) {
          this.storeLockDialogShown$.next(true);

          return;
        }

        if (data.enabled) {
          this.passwordDialogShown$.next(true);
        }
      })),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.passwordControlService.passwordEntered$.pipe(
      tap((passwordEntered => {
        if (passwordEntered) {
          this.storeLockDialogShown$.next(false);
          this.passwordDialogShown$.next(false);
          this.storeLockDialogShown$.complete();
          this.passwordDialogShown$.complete();
        }
      })),
      takeUntil(this.destroyed$),
    ).subscribe();

    if (this.envService.loadBackgroundImage) {
      this.storeLockDialogShown$.next(true);
      this.backgroundImageShown$.next(true);
    }
  }

  checkAccess(token: string): void {
    this.passwordControlService.checkToken(this.envService.domain, token).pipe(
      filter(success => !!success),
      tap(() => this.passwordControlService.passwordEntered$.next(true)),
      takeUntil(this.destroyed$),
    )
    .subscribe();
  }

  onEvent(event: EditorEventInterface): void {
    if (!event) {
      return;
    }

    switch (event.type) {
      case DispatchEvents.LinkClick:
        const link: string = event.payload as any;

        if (isValidUrl(link)) {
          window.open(link, '_blank');
          break;
        }

        if (typeof link === 'string') {
          let routing: PebThemeRoute = this.themeSubj$.value.routing
            .find((route: PebThemeRoute) => route.id === link);

          // TODO temp for old themes on live
          if (!routing) {
            routing = this.themeSubj$.value.routing
              .find((route: PebThemeRoute) => route.pageId === link);
          }

          if (routing) {
            this.router.navigate([routing.url]).then().catch();
          }
        }
        break;
      case DispatchEvents.ProductClick:
        if (typeof event.payload === 'string') {
          this.onClickProduct(event.payload);
        }
        break;
      case DispatchEvents.CartClick:
        this.checkoutService.checkoutMode = 'cart';
        break;
      case DispatchEvents.AmountClick:
        this.checkoutService.checkoutMode = 'amount';
        break;
      case DispatchEvents.AddProductToCart:
        this.onAddProductToCart(event);
        break;
      default:
        break;
    }
  }

  private fillProductWidgetsByProducts$(page: PebPage): Observable<PebElement[]> {
    const productWidgets: PebElement[] = pebFindElementChildren(
      page.snapshot,
      (element => element.type === PebElementType.Product),
    );

    const productSources$: Observable<PebElement>[] = productWidgets.reduce(
      (accumulatedValue: Observable<PebElement>[], widget: PebElement) => {
        let products$: Observable<Product[]>;
        switch (widget.data.type as ProductDataTypes) {
          case ProductDataTypes.Category:
            products$ = this.loadProductsByCategory$();
            break;
          case ProductDataTypes.All:
            products$ = this.loadProductsByChannelSet$();
            break;
          case ProductDataTypes.Custom:
          default:
            products$ = of([]);
            if ((widget.data as ProductData).products) {
              const productIds: string[] = ((widget.data as ProductData).products as Product[])
                .map((product: Product) => product.uuid || product._id || product['id'] || product);
              products$ = this.loadProducts$(productIds);
            }
            break;
        }

        const updatedProductWidget$: Observable<PebElement> = products$.pipe(
          map(loadedProducts => ({
            ...widget,
            data: {
              ...widget.data,
              loadedProducts,
            },
          })),
        );

        return [...accumulatedValue, updatedProductWidget$];
      },
      [],
    );

    return forkJoin(productSources$);
  }

  /**
   * Get page from theme depends on opened route
   */
  private getPageByRoute$(version: PebVersionShort, params: any): Observable<PebPage> {
    let pageId: PebPageId;
    const paramKeys: string[] = Object.keys(params);

    let openedRoute: PebThemeRoute;
    if (paramKeys.length === 0) {
      const defaultRoute = version.routing.find(route => route.default)
        || version.routing.find(route => ['', '/'].indexOf(route.url) > -1);
      openedRoute = defaultRoute;
    } else {
      const slug = getPageSlugFromRoute(params);
      openedRoute = version.routing.find((route: PebThemeRoute) => route.url === slug);
    }

    if (openedRoute) {
      pageId = openedRoute.pageId;
      this.slug = openedRoute.url;
    } else {
      this.launcherService.notFound = NotFound.Page;
      this.router.navigate(['404'], { skipLocationChange: true }).then().catch();

      return null;
    }

    if (pageId) {
      return this.apiService.getPage(this.envService.appId, pageId);
    }

    const categoryRoute: PebThemeRoute = version.routing.find(route => route.variant === PebPageVariant.Category);
    if (categoryRoute) {
      return this.apiService.getPage(this.envService.appId, categoryRoute.pageId);
    }

    return of(null);
  }

  private setSeoData(page: PebPage): void {
    this.seoService.setData({
      title: page.title || page.name,
      description: page.description,
      canonicalUrl: page.canonical,
      noIndex: !page.showInSearchResults,
      jsonLd: page.markup,
    });

    if (page.tags) {
      this.seoService.addMarkupToHead(page.tags);
    }
  }

  // TODO the same code as in viewer of builder
  private initCheckout(channelSet: string): void {
    // FIXME pass correct currency
    this.checkoutService.createFlows(false, channelSet);

    this.windowService.messageEvent$
      .pipe(
        filter(event => !!event),
        tap((event: Event) => {
          const eventType: string = event['data'].event;

          if (eventType === 'payeverCheckoutClose'
            || (event['data'] && event['data'].indexOf && event['data'].indexOf('pe:os:checkout:close:') === 0)) {
            this.checkoutService.checkoutMode = null;
            this.changeDetectionRef.markForCheck();
          }
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();
  }

  private onAddProductToCart(event: EditorEventInterface): void {
    const label: string = this.translateService.translate('added_to_cart');
    this.snackbarService.show(label, { position: SnackBarVerticalPositionType.Bottom });
    const { product, selectedVariantIndex } = event.payload as { product: ProductPageData, selectedVariantIndex: number };

    const selectedVariant: ProductPageVariant = product && product.variants && product.variants.length
      ? product.variants[selectedVariantIndex]
      : null;

    const title: string = product.title;

    const imageUrl: string = selectedVariant && selectedVariant.imagesUrl && selectedVariant.imagesUrl.length
      ? selectedVariant.imagesUrl[0]
      : product.imagesUrl[0];

    const itemId: string = selectedVariant
      ? selectedVariant.id || selectedVariant['id'] || selectedVariant['uuid']
      : product.id || product['_id'] || product['uuid'];

    const price: number = selectedVariant
      ? selectedVariant.price
      : product.price;

    const sku: string = selectedVariant
      ? selectedVariant['sku']
      : product['sku'];

    this.cartService.addToCart({
      count: 1,
      image: imageUrl,
      itemId,
      price,
      sku,
      title,
      quantity: 1,
      subTitle: '',
      thumbnail: '',
    });
  }

  private onClickProduct(productId: string): void {
    const version: PebVersionShort = this.themeSubj$.getValue();

    const productRoute: PebThemeRoute = version.routing.find(route => route.variant === PebPageVariant.Product);

    if (productRoute) {
      this.router.navigate([productRoute.url], { queryParams: { id: productId } }).then().catch();
    }
  }

  private loadProductsByChannelSet$(): Observable<Product[]> {
    return this.productsApiService.fetchProductsByChannelSet(
      this.envService.business,
      this.envService.channelSet,
    );
  }

  private loadProductsByCategory$(): Observable<Product[]> {
    const categoryTitle: string = this.slug.toLowerCase().replace(/\s/g, '');

    return this.productsApiService.getProductsCategories(this.envService.business).pipe(
      switchMap(categories => {
        const category: { id: string, title: string } = categories.find(c =>
          c.title.toLowerCase().replace(/\s/g, '') === categoryTitle,
        ) || categories[0];

        return this.productsApiService.fetchProductsByCategories(this.envService.business, [category.id]);
      }),
    );
  }

  private loadProducts$(includeIds: string[]): Observable<Product[]> {
    const productsApi: string = this.envConfigService.getBackendConfig().products;

    return this.http.post(`${productsApi}/products`, {
      query: `{
          getProducts(businessUuid: "${this.envService.business}", includeIds: [${includeIds.map(i => `"${i}"`)}], paginationLimit: 20, pageNumber: 1) {
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
    }).pipe(
      filter((result: any) => result && result.data && result.data.getProducts),
      map(result => result.data.getProducts.products),
      takeUntil(this.destroyed$),
    );
  }

  private getProductPageData$(productId: string): Observable<ProductPageData> {
    // TODO: only for DEMO
    const productsApi: string = this.envConfigService.getBackendConfig().products;
    const imagesHost: string = this.envConfigService.getCustomConfig().storage;

    return this.http.post(`${productsApi}/products`, {
      operationName: 'getProducts',
      query: `query getProducts {
        product(id: "${productId}") {
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
            sku
          }
        }
      }
      `,
      variables: {},
    }).pipe(
      map((result: any) => (result && result.data && result.data.product ?
        {
          ...result.data.product,
          variants: result.data.product.variants.map(v => ({
            ...v,
            imagesUrl: v.images.map(i => `${imagesHost}/products/${i}`),
          })),
        } : null)),
    );
  }
}

/**
 * Component can be opened on different routes: ":page", ":page1/:page2".
 * Construct page slug depends on activated route params
 */
function getPageSlugFromRoute(params: any): string {
  const routeValues: string[] = [];

  // TODO bad solution, but keep it for now
  const nestedRoutesMaxLength = 6;
  for (let i = 1; i <= nestedRoutesMaxLength; i += 1) {
    const routeName = `page${i}`;
    if (!params[routeName]) {
      break;
    }

    routeValues.push(params[routeName]);
  }

  return `/${routeValues.join('/')}`;
}

function addProdcutsToPage(widgets: PebElement[], page: PebPage): PebPage {
  if (!widgets || !widgets.length) {
    return page;
  }

  page.snapshot = pebMapElementDeep(page.snapshot, (elementDef: PebElement) => {
    if (elementDef.type !== PebElementType.Product) {
      return elementDef;
    }

    const widget: PebElement = widgets.find((w: PebElement) => w.id === elementDef.id);

    if (!widget) {
      return elementDef;
    }

    return {
      ...elementDef,
      data: {
        ...elementDef.data,
        ...widget.data,
      },
    };
  });

  return page;
}

function appendSlugIntoTextWidgets(page: PebPage, slug: string): PebPage {
  const categoryTitle: string = slug.charAt(0).toUpperCase() + slug.slice(1);
  const document: PebDocument = pebMapElementDeep(page.snapshot, el => {
    if (el.type === PebElementType.Text && el.data && el.data.type === TextTypes.category) {
      return {
        ...el,
        text: el.text.replace(/>([^<]*)</gm, t => t.length === 2 ? t : `>${categoryTitle}<`),
        //   Object.keys(el.text).reduce((acc, screen) => ({
        //     ...acc,
        //     [screen]: (el.text[screen] as string)
        //                 .replace(/>([^<]*)</gm, (t) => t.length === 2 ? t : `>${categoryTitle}<`)
        //   }), {}
        // )
      };
    }

    return el;
  });

  page.snapshot = document;

  return page;
}

function isValidUrl(value: string): boolean {
  // tslint:disable-next-line:max-line-length
  return /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/.test(value);
}
