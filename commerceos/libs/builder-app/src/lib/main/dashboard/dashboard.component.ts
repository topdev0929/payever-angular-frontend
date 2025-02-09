import { Clipboard } from '@angular/cdk/clipboard';
import { AfterViewInit, Compiler, Component, ElementRef, HostBinding, OnDestroy, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { PeAppEnv } from '@pe/app-env';
import { PebEditorApi } from '@pe/builder/api';
import {
  PebScreen,
  PebRenderContainer,
  PebLanguage,
  BUILDER_CORE_VERSION,
  PebDefaultScreens,
  PEB_ROOT_SCREEN_KEY,
  PebContainerType,
  PebRenderElementModel,
  PebPage,
  PebElementDef,
} from '@pe/builder/core';
import { PebQuillRenderer } from '@pe/builder/delta-renderer';
import { FontLoaderService } from '@pe/builder/font-loader';
import { PebConnectorProxyService, PebIntegrationMessageHandler } from '@pe/builder/integrations';
import { PebElement, flattenContexts, flattenELements } from '@pe/builder/render-utils';
import { PebRendererService } from '@pe/builder/renderer';
import { PebEditorState, PebElementsState, PebOptionsState, PebSetActivePage } from '@pe/builder/state';
import {
  PebRenderSetRootElementAction,
  PebViewContainerSetAction,
  PebViewContextRenderAllAction,
  PebViewContextSetAction,
  PebViewElementClickedAction,
  PebViewElementMouseEnteredAction,
  PebViewElementMouseLeavedAction,
  PebViewPageRenderingAction,
  PebViewPageScrollReadyAction,
  PebViewPageSetAction,
  PebViewResetContainerAction,
  PebViewScreenSetAction,
  PebViewThemeSetAction,
} from '@pe/builder/view-actions';
import { PebViewContextRenderService } from '@pe/builder/view-handlers';
import { PebViewState } from '@pe/builder/view-state';
import { BusinessInterface } from '@pe/business';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';
import { BusinessState } from '@pe/user';

import { PeQrPrintComponent, PeQrPrintModule } from './qr-print';

@Component({
  selector: 'pe-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [
    './dashboard.component.scss',
  ],
  providers: [
  ],
})
export class PeDashboardComponent implements AfterViewInit, OnDestroy {
  @Select(PebElementsState.document) private readonly document$!: Observable<PebElement>;
  @Select(PebEditorState.elements) private readonly elementDefs$!: Observable<{ [id: string]: PebElementDef }>;
  @Select(PebOptionsState.screen) private readonly screen$!: Observable<PebScreen>;
  @Select(PebEditorState.activePage) private readonly activePage$!: Observable<PebPage>;
  @Select(PebViewState.elements) elements$!: Observable<{ [id: string]: PebRenderElementModel }>;
  private readonly language$ = new BehaviorSubject<PebLanguage>(undefined);

  @HostBinding('attr.peb-core-version') get version(): string {
    return BUILDER_CORE_VERSION;
  }

  @SelectSnapshot(BusinessState.businessData) businessData!: BusinessInterface;

  @ViewChild('itemMenuTrigger', { read: MatMenuTrigger }) itemMenuTrigger: MatMenuTrigger;
  @ViewChild('container', { static: true }) container: ElementRef<HTMLElement>;

  destroy$ = new Subject<void>();

  render$ = this.document$.pipe(
    filter(document => !!document),
    withLatestFrom(this.activePage$, this.elementDefs$),
    map(([document, page, elementDefs]) => {
      const recursive = (elm: PebElement): PebRenderElementModel => {
        const viewElement = this.rendererService.renderElement(elm);

        if (!viewElement) {
          return undefined;
        }

        const children = [];
        for (const child of elm.children) {
          const viewElement = recursive(child);
          viewElement && children.push(viewElement);
        }
        const pebStyles = elementDefs[elm.id]?.styles;
        const screenStyles = { [viewElement.screenKey]: viewElement.style };

        return {
          ...viewElement,
          text: viewElement.text ? PebQuillRenderer.render(viewElement.text) : undefined,
          children, container: this.renderContainer,
          page: page.id,
          defs: { pebStyles, screenStyles },
         };
      };

      const element = recursive(document);
      const theme = this.store.selectSnapshot(PebEditorState.theme);

      this.store.dispatch([
        new PebViewContainerSetAction(this.renderContainer),
        new PebViewThemeSetAction(theme),
        new PebViewScreenSetAction(element.screenKey),
        new PebViewPageSetAction(element.page),
        new PebViewPageRenderingAction(flattenELements(element)),
        new PebRenderSetRootElementAction(element.id),
      ]);

      return element;
    }),
    switchMap(rootElement => this.renderContext$(rootElement)),
    takeUntil(this.destroy$),
  );

  width$ = this.screen$.pipe(
    filter(screen => !!screen),
    map(screen => screen.width + 2 * screen.padding),
  );

  preview: any;

  shop: any;
  themeActiveVersion: any;

  url$ = this.editorApi.getApp().pipe(
    filter(app => !!app),
    map(app => `${app.accessConfig.internalDomain}.${this.appEnv.host}`),
    takeUntil(this.destroy$),
  );

  renderContainer: PebRenderContainer = { key: PebContainerType.Dashboard, editMode: false, renderScripts: false };
  defaultScreen = PebDefaultScreens[PEB_ROOT_SCREEN_KEY];

  constructor(
    public appEnv: PeAppEnv,
    private clipboard: Clipboard,
    private snackBar: SnackbarService,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private fontLoaderService: FontLoaderService,
    private overlayService: PeOverlayWidgetService,
    private compiler: Compiler,
    private rendererService: PebRendererService,
    private editorApi: PebEditorApi,
    private contextRenderService: PebViewContextRenderService,
    private store: Store,
    private connectorService: PebConnectorProxyService,
    private messageHandler: PebIntegrationMessageHandler,
  ) {
    this.fontLoaderService.renderFontLoader();
    this.connectorService.initAll();

    this.route.queryParams.pipe(takeUntil(this.destroy$), tap((queryParams) => {
      const { pageId, lang } = queryParams;

      if (lang) {
        const languages = this.store.selectSnapshot(PebEditorState.languages);
        this.language$.next(languages[queryParams.lang]);
      } else {
        const language = this.store.selectSnapshot(PebOptionsState.language);
        this.language$.next(language);
      }

      if (pageId) {
        this.store.dispatch(new PebSetActivePage(pageId));
        this.container?.nativeElement?.scrollTo({ left: 0, top: 0 });
      }

    })).subscribe();

    this.render$.pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngAfterViewInit(): void {
    this.store.dispatch(new PebViewPageScrollReadyAction(this.renderContainer.key, this.container.nativeElement));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(new PebViewResetContainerAction());
    this.messageHandler.removeMessageComponent();
  }

  onOpenItemMenu() {
    import('@pe/apps/connect')
      .then(({ ConnectModule }) => this.compiler.compileModuleAsync(ConnectModule))
      .then(() => this.itemMenuTrigger.openMenu());
  }

  onEditClick(): void {
    this.router.navigate(['..', 'edit'], { relativeTo: this.route }).then();
  }

  onOpenClick(): void {
    if (!this.shop?.accessConfig.isLive) {
      const msg = this.translateService.translate(`${this.appEnv.type}-app.info.app_offline`);
      this.snackBar.toggle(true, {
        content: msg,
      }, {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: 'shop-snack',
      });

      return;
    }
    if (this.shop?.accessConfig?.internalDomain) {
      window.open(`https://${this.shop.accessConfig.internalDomain}.${this.appEnv.host}`);
    }
  }

  onLinkCopy(): void {
    this.clipboard.copy(this.shop?.accessConfig.internalDomain + '.' + this.appEnv.host);
    const msg = this.translateService.translate(`${this.appEnv.type}-app.errors.link_copied`);
    this.snackBar.toggle(true, {
      content: msg,
      iconId: 'icon-commerceos-success',
      iconSize: 24,
      iconColor: '#00B640',
    }, {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: 'shop-snack',
    });
  }

  onDownloadQR(): void {
    const config: PeOverlayConfig = {
      data: { shop: this.shop },
      hasBackdrop: true,
      backdropClass: 'channels-modal',
      panelClass: 'qr-print-modal',
      headerConfig: {
        title: this.translateService.translate(`${this.appEnv.type}-app.connect.qr_title`),
        backBtnTitle: this.translateService.translate(`${this.appEnv.type}-app.actions.cancel`),
        backBtnCallback: () => {
          this.overlayService.close();
        },
        doneBtnTitle: this.translateService.translate(`${this.appEnv.type}-app.actions.done`),
        doneBtnCallback: () => {
          this.overlayService.close();
        },
      },
      component: PeQrPrintComponent,
      lazyLoadedModule: PeQrPrintModule,
    };
    this.overlayService.open(config);
  }

  elementClicked(element: PebRenderElementModel, htmlElement: HTMLElement) {
    this.store.dispatch(new PebViewElementClickedAction(element));
  }

  elementMouseEntered(element: PebRenderElementModel, htmlElement: HTMLElement) {
    this.store.dispatch(new PebViewElementMouseEnteredAction(element));
  }

  elementMouseLeaved(element: PebRenderElementModel, htmlElement: HTMLElement) {
    this.store.dispatch(new PebViewElementMouseLeavedAction(element));
  }

  renderContext$(rootElement: PebRenderElementModel): Observable<any> {

    return this.contextRenderService.resolveContext$(rootElement).pipe(
      tap((context) => {
        this.store.dispatch(new PebViewContextSetAction(flattenContexts(context)));
        this.store.dispatch(new PebViewContextRenderAllAction());
      }),
    );
  }
}
