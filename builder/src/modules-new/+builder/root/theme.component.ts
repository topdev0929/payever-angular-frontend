import { AfterViewInit, Component, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, forkJoin, merge, Observable, of, Subject } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, filter, first, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import {
  CreatePageEvent,
  PebAppType,
  PebElement,
  PebElementType,
  pebFindElementChildren,
  PebPage,
  PebPageId,
  PebPageType,
  PebSnapshotStatus,
  PebThemeStore,
} from '@pe/builder-core';
import { EditorComponent } from '@pe/builder-editor/projects/modules/editor/src/components/editor/editor.component';
import { Product } from '@pe/builder-editor/projects/modules/elements/src';
import { AbstractElementComponent } from '@pe/builder-editor/projects/modules/elements/src/abstract/abstract.component';
import { AbstractComponent } from '@pe/ng-kit/modules/common';
import { MediaService } from '@pe/ng-kit/modules/media';
import { SnackBarService } from '@pe/ng-kit/modules/snack-bar';
import { PeStepperService, PeWelcomeStepAction, PeWelcomeStepperAction } from '@pe/stepper';
import { AppModelInterface } from '../../../interfaces';
import { ApplicationApiService } from '../../core/api/application-api.service';
import { ThemeData } from '../../core/theme.data';
import { BuilderMediaSidebarApi } from '../api/media-sidebar.api';
import { PageRoutingInterface } from '../entities/navbar';
import { ProductsService } from '../services/products.service';
import { ThemeContextStore } from '../utils/context.store';
import { PlatformHeaderService, PlatfromHeaderInterface, PlatfromHeaderControlInterface, CloseConfigInterface } from '@pe/ng-kit/src/kit/platform-header';
import { NavbarControlType } from '@pe/ng-kit/src/kit/navbar';
import { TranslateService } from '@pe/ng-kit/src/kit/i18n';

export enum ProductDataTypes {
  All = 'All Products',
  Category = 'All category products',
  Custom = 'Custom Selection',
}

const factory = (rootCmp: BuilderThemeComponent) => {
  return rootCmp.editorComponent;
};

@Component({
  selector: 'pe-builder-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss'],
  providers: [
    PebThemeStore,

    // {
    //   provide: 'BUILDER_EDITOR_COMPONENT',
    //   useFactory: factory,
    //   deps: [BuilderThemeComponent],
    //   // useValue: this.editorComponent,
    // },
    ProductsService,
  ],
})
export class BuilderThemeComponent extends AbstractComponent implements OnInit, AfterViewInit {
  @ViewChild(EditorComponent, { static: false })
  editorComponent: EditorComponent;

  pageRoutings$: Observable<PageRoutingInterface[]> = combineLatest([
    this.themeStore.theme$,
    this.themeStore.activePage$,
  ]).pipe(
    map(([theme, activePage]) =>
      theme.brief
        .map(brief => {
          const routing = theme.routing
            .filter(route => !!route.id && brief.type === activePage.type)
            .find(route => route.pageId === brief.id);

          return {
            name: brief.name,
            routingId: routing ? routing.id : null,
          } as PageRoutingInterface;
        })
        .filter(pageRoute => !!pageRoute.routingId),
    ),
  );

  activeLogo$: Subject<{url: string}> = new Subject();

  PebPageType = PebPageType;

  PebElementType = PebElementType;

  activePageType = PebPageType.Replica;

  cachedPageProductWidgets$: Observable<PebElement[]>;

  activeComponent$ = new BehaviorSubject<AbstractElementComponent>(null);

  sidebarOpenedNotByUser = false;

  private lastEditedPage: PebPageId;

  constructor(
    public viewRef: ViewContainerRef,
    public themeStore: PebThemeStore,
    public productsService: ProductsService,
    public applicationApiService: ApplicationApiService,
    public mediaService: MediaService,
    public route: ActivatedRoute,
    private readonly themeContext: ThemeContextStore,
    private readonly router: Router,
    private readonly themeData: ThemeData,
    private readonly peStepperService: PeStepperService,
    private readonly snackBarService: SnackBarService,
    private platformHeaderService: PlatformHeaderService,
    private translateService: TranslateService,
  ) {
    super();

    const platformHeader: PlatfromHeaderInterface = {
      microCode: 'builder',
      appDetails: null,
      controls: [
        {
          type: NavbarControlType.Text,
          title: 'Shop editing',
          classes: 'text-visited',
        } as PlatfromHeaderControlInterface,
      ],
      hideProfileMenu: true,
      disableSubheader: true,
      closeConfig: {
        showClose: true,
        text: this.translateService.translate('close'),
        tooltipText: this.translateService.translate('close'),
        callbackId: this.platformHeaderService.registerCallback(
          () => this.onDisableEditMode(),
        ),
      } as CloseConfigInterface,
    };
    this.platformHeaderService.setPlatformHeader(platformHeader);

    this.productsService.setThemeComponent(this);
    (window as any).builderThemeCmp = this;

    if (this.peStepperService.isActiveStored) {
      this.peStepperService.dispatch(PeWelcomeStepperAction.ChangeIsActive, false);
      this.peStepperService.dispatch(PeWelcomeStepperAction.NextStepLoaded, this.peStepperService.currentStep);
    }
  }

  onDisableEditMode(): void {
    this.router.navigate(['../viewer'], {
      relativeTo: this.route,
    }).then().catch();
  }

  ngOnInit(): void {

    this.route.data
      .pipe(
        tap(({ theme }) => {
          if (!theme) {
            return this.router
              .navigate([
                'business',
                this.themeContext.businessId,
                'builder',
                'shop',
                this.themeContext.applicationId,
                'builder',
                'themes',
              ])
              .then();
          }
          this.themeStore.init(theme);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    this.cachedPageProductWidgets$ = combineLatest([
      this.themeStore.activePage$,
      this.productsService.cachedProductsWidgets$,
    ]).pipe(
      map(([page, widgets]) => widgets[page.id] ? widgets[page.id] : []),
    );

    const { businessId, appId, appType } = this.themeStore.theme;
    let application$: Observable<AppModelInterface>;

    if (appType === PebAppType.shop) {
      application$ = this.applicationApiService.getShop(businessId, appId);
    } else {
      application$ = this.applicationApiService.getTerminal(businessId, appId);
    }
    application$.pipe(
      tap((data: AppModelInterface) => {
        const isMaster = this.themeStore.activePage && this.themeStore.activePage.type === PebPageType.Master;
        const url = !isMaster && data.logo ? this.mediaService.getMediaUrl(data.logo, 'images') : null;
        this.activeLogo$.next({url});
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  ngAfterViewInit(): void {
    combineLatest(this.themeStore.activePageSubject$, this.editorComponent.editorService.screen$)
      .pipe(
        debounceTime(100),
        filter(([p, s]) => !!p && !!s),
        distinctUntilChanged((prev, curr) => prev[0].id === curr[0].id && prev[0].state === curr[0].state && prev[1] === curr[1]),
        switchMap(([page]) => this.getProductsWidgets$(page)),
        filter(w => !!w && !!w.length),
        tap(w => {
          this.productsService.cacheProductWidgets(w, this.themeStore.activePage.id);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    merge(
      this.editorComponent.editorService.activeElement$,
      this.editorComponent.editorService.editedElement$,
    ).pipe(
      takeUntil(this.destroyed$),
      map(id => this.editorComponent.editorService.registry.getComponent(id)),
      tap(component => this.activeComponent$.next(component)),
      tap(component => this.checkNeedToOpenSidebar(component)),
    ).subscribe();
  }

  onCreatePage(event: CreatePageEvent): void {
    if (event.type === PebPageType.Master) {
      this.themeStore.createMasterPage();
    }
    if (event.type === PebPageType.Replica) {
      this.themeStore.createPage(event);
    }
  }

  onDeletePage(pageId: string): void {
    this.themeStore.deletePage(pageId);
  }

  onCopyPage(pageId: string): void {
    const newName: string = this.getNameOfCopiedPage(pageId);
    this.themeStore.copyPage(pageId, newName);
  }

  onPageChange(content: any): void {
    this.themeStore.updatePageActions(content);
  }

  onPageSelect(pageId: PebPageId): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        pageId,
      },
      queryParamsHandling: 'merge',
    });
  }

  applyMasterChanges(manually: boolean): void {
    console.log('applyMasterChanges', manually);
    this.themeStore.saveChangedMasterPages(manually).pipe(
      tap(() => this.onTogglePagesType()),
      first(),
    ).subscribe();
  }

  changeReplicaMergeStatus(save: boolean): void {
    const { activePage } = this.themeStore;

    save ?
      this.themeStore.mergeMasterToReplica(activePage.masterId, activePage.id) :
      this.themeStore.updatePageData(activePage.id, { waitingForMerge: false });
  }

  onTogglePagesType(): void {

    const { theme, activePage } = this.themeStore;

    if (this.activePageType === PebPageType.Replica) {
      this.lastEditedPage = activePage.id;

      let nextMasterId: PebPageId = activePage.masterId;

      if (!nextMasterId) {
        const firstMasterPage = theme.brief.find(p => p.type === PebPageType.Master);
        nextMasterId = firstMasterPage ? firstMasterPage.id : null;
      }

      if (nextMasterId) {
        this.onPageSelect(nextMasterId);
      }

      this.activePageType = PebPageType.Master;

      return;
    }

    if (this.activePageType === PebPageType.Master) {
      const redirectPage = this.lastEditedPage || theme.brief.find(p => p.type === PebPageType.Replica).id;

      this.themeStore.snapshotCompilingStatus = PebSnapshotStatus.Compiling;
      of(null).pipe(
        delay(1000),
        tap(() => this.themeStore.snapshotCompilingStatus = PebSnapshotStatus.Default),
        tap(() => this.onPageSelect(redirectPage)),
      ).subscribe();

      this.lastEditedPage = null;
      this.activePageType = PebPageType.Replica;

      return;
    }
  }

  updateStepperStatus(): void {
    this.peStepperService.dispatch(PeWelcomeStepperAction.EnableContinue, true);
    this.peStepperService.dispatch(PeWelcomeStepperAction.ShowLoading, false);
  }

  private getNameOfCopiedPage(pageId: PebPageId): string {
    const brief = this.themeStore.theme.brief.find(brVal => brVal.id === pageId);
    let newName = '';
    let i = 0;

    do {
      newName = i > 0 ? `${brief.name} (Copy) ${i}` : `${brief.name} (Copy)`;
      i++;
    } while (this.themeStore.theme.brief.some(brVal => brVal.name === newName));

    return newName;
  }

  private getProductsWidgets$(page: PebPage): Observable<PebElement[]> {
    if (!page) {
      return of(null);
    }

    const productWidgets: PebElement[] = pebFindElementChildren(
      page.snapshot,
      element => element.type === PebElementType.Product,
    )
      .filter(w => (w.data && w.data.products && !w.data.loadedProducts) || w.data.type === ProductDataTypes.All)
      .filter(w =>
        !this.productsService.cachedProductsWidgets$.value[page.id] ||
        !this.productsService.cachedProductsWidgets$.value[page.id].find(v => v.id === w.id),
      );

    if (!productWidgets.length) {
      return of(null);
    }

    return forkJoin(this.getProductWidgetsData$(productWidgets));
  }

  private getProductWidgetsData$(widgets: PebElement[]): Observable<PebElement>[] {
    return widgets
      .filter(w => w.data)
      .reduce((acc: Observable<PebElement>[], widget: PebElement) => {
        let products$: Observable<Product[]>;
        switch (widget.data.type as ProductDataTypes) {
          case ProductDataTypes.Category:
            products$ = this.productsService.loadProductsByCategory$(this.themeContext.businessId);
            break;
          case ProductDataTypes.All:
            products$ = this.productsService.fetchProductsByChannelSet(this.themeData.businessId, this.themeData.channelSet).pipe(
              tap(((products: Product[]) => {
                const widgetCmp: AbstractElementComponent = this.editorComponent.context.registry.getComponent(widget.id);
                this.productsService.fitAllProducts(products, widgetCmp, this.editorComponent.pageStore, this.themeStore.activePage.id);
              })),
            );
            break;
          case ProductDataTypes.Custom:
          default:
            if (widget.data.products && widget.data.products.length) {
              products$ = this.productsService.loadProducts$(
                // tslint:disable-next-line:no-string-literal
                widget.data.products.map((product: Product) => product.uuid || product['_id'] || product['id'] || product),
                this.themeContext.businessId,
              );
            }
            break;
        }

        const updatedProductWidget$ = products$.pipe(
          map(loadedProducts => ({
            ...widget,
            data: {
              ...widget.data,
              // tslint:disable-next-line:no-string-literal
              products: loadedProducts.map(p => p.uuid || p['_id'] || p['id'] || p),
              loadedProducts,
            },
          })),
        );

        return [...acc, updatedProductWidget$];
      }, []);
  }

  private checkNeedToOpenSidebar(component: AbstractElementComponent): void {
    if (!component || !component.element || !component.element.type) {
      return;
    }

    const needToOpen = (
      component.element.type === PebElementType.Image
      // component.element.type === PebElementType.Video
    );

    const sidebarOpenedNotByUser = (
      this.sidebarOpenedNotByUser ||
      !this.editorComponent.context.editor.sidebarsDisplay.right
    ) && needToOpen;

    this.editorComponent.context.editor.sidebarsDisplay = {
      left: this.editorComponent.context.editor.sidebarsDisplay.left,
      right: needToOpen || (this.sidebarOpenedNotByUser ? false : this.editorComponent.context.editor.sidebarsDisplay.right),
    };

    this.sidebarOpenedNotByUser = sidebarOpenedNotByUser;
  }

}
