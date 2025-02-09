import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  Inject,
  Injector,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  ViewContainerRef,
  ViewRef,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, combineLatest, fromEvent } from 'rxjs';
import { debounceTime, map, shareReplay, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { PebWebsocketService } from '@pe/builder/api';
import { BackgroundActivityService } from '@pe/builder/background-activity';
import { isMasterPage, PebPage, PebScreen } from '@pe/builder/core';
import { fromResizeObserver } from '@pe/builder/editor-utils';
import { FontLoaderService } from '@pe/builder/font-loader';
import { PebConnectorProxyService } from '@pe/builder/integrations';
import { PebElement } from '@pe/builder/render-utils';
import { EditorSidebarTypes, PebEditorState } from '@pe/builder/services';
import { PebEditorRightSidebarComponent } from '@pe/builder/sidebar';
import {
  PebDeselectAllAction,
  PebElementsState,
  PebInitShapesAction,
  PebInspectorState,
  PebInspectorStateModel,
  PebOptionsState,
  PebPagesState,
  PebSetScaleAction,
  PebSidebarsState,
  PebSidebarsStateModel,
} from '@pe/builder/state';
import { PeDestroyService, PebDeviceService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { SnackbarService } from '@pe/snackbar';

import { EditorIcons } from './editor-icons';
import { sidebarsAnimations } from './editor.animations';

@Component({
  selector: 'peb-editor',
  templateUrl: './editor.component.html',
  styleUrls: [
    '../../../styles/src/lib/styles/_sidebars.scss',
    './editor.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [sidebarsAnimations],
  providers: [
    PeDestroyService,
  ],
})
export class PebEditor implements OnInit, AfterViewInit, OnDestroy {

  @Select(PebElementsState.selected) private readonly selectedElements$!: Observable<PebElement[]>;
  @Select(PebOptionsState.screen) screen$: Observable<PebScreen>;
  @Select(PebSidebarsState.sidebars) sidebars$!: Observable<PebSidebarsStateModel>;
  @Select(PebInspectorState.inspector) inspectorSidebar$!: Observable<PebInspectorStateModel>;
  @Select(PebPagesState.activePage) private readonly activePage$!: Observable<PebPage>;

  @ViewChild('contentContainerSlot') contentContainerSlotRef: ElementRef;
  @ViewChild('contentContainer') contentContainer: ElementRef;
  @ViewChild('contentContainerSlot', { read: ViewContainerRef }) contentContainerSlot: ViewContainerRef;
  @ViewChild('toolbarSlot', { read: ViewContainerRef, static: true }) public toolbarSlot: ViewContainerRef;
  @ViewChild(PebEditorRightSidebarComponent) public rightSidebar: PebEditorRightSidebarComponent;

  contentContainerInsert$ = new Subject<ComponentRef<any>>();

  readonly sidebarsActivityLayers$ = combineLatest([
    this.sidebars$,
    this.state.sidebarsActivity$,
  ]).pipe(
      map(([state, { layers }]) => state.layers || layers),
      shareReplay(1),
    );

  readonly isMasterPage$ = this.activePage$.pipe(map(page => isMasterPage(page)));

  readonly skeletonPages = Array.from({ length: 2 });

  showMasterPages$ = this.sidebars$.pipe(map(sidebar => sidebar.masterPages));
  showPages$ = this.sidebars$.pipe(map(sidebar => sidebar.navigator));

  constructor(
    public state: PebEditorState,
    public injector: Injector,
    public cfr: ComponentFactoryResolver,
    public deviceService: PebDeviceService,
    private fontLoaderService: FontLoaderService,
    private backgroundActivityService: BackgroundActivityService,
    @Inject(PLATFORM_ID) private platformId: any,
    private readonly destroy$: PeDestroyService,
    private store: Store,
    private readonly websocketService:PebWebsocketService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private authService: PeAuthService,
    private connectorService: PebConnectorProxyService,
    iconRegistry: MatIconRegistry,
    domSanitizer: DomSanitizer,
  ) {
    this.store.dispatch(new PebInitShapesAction());

    Object.entries(EditorIcons).forEach(([name, path]) => {
      iconRegistry.addSvgIcon(name, domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${path}`));
    });

    this.state.reset();

    this.store.dispatch(new PebDeselectAllAction());

    this.fontLoaderService.renderFontLoader();

    if (isPlatformBrowser(this.platformId)) {
      fromEvent(window, 'beforeunload').pipe(
        withLatestFrom(this.backgroundActivityService.hasActiveTasks$),
        tap(([event, hasTasks]) => {
          if (hasTasks) {
            event.returnValue = true;
          }
        }),
        takeUntil(this.destroy$),
      ).subscribe();
    }
  }

  ngOnInit() {
    this.connectorService.initAll();

    this.websocketService.sessionExpired$.pipe(
      debounceTime(500),
      tap(()=>{
        this.snackbarService.toggle(true, {
          content: this.translateService.translate('builder-app.dashboard.warnings.invalid_token'),
          duration: 5000,
          iconColor: '#E2BB0B',
          iconId: 'icon-alert-24',
          iconSize: 24,
        });
        this.authService.logout().subscribe();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngAfterViewInit() {
    this.initScreensForMobileTablet();
  }

  ngOnDestroy() {
    this.store.dispatch(new PebDeselectAllAction());
  }

  initScreensForMobileTablet() {
    if (!this.deviceService.isDesktop) {
      this.initScaleForMobileAndTablet();
    }
    this.initMobileSidebarState();
  }

  initMobileSidebarState() {
    if (!this.deviceService.isMobile || this.deviceService.landscape) {
      return;
    }
    this.state.sidebarsActivity = {
      ...this.state.sidebarsActivity,
      [EditorSidebarTypes.Navigator]: false,
      [EditorSidebarTypes.Inspector]: false,
      [EditorSidebarTypes.Layers]: false,
      [EditorSidebarTypes.MasterPages]: false,
    };
  }

  initScaleForMobileAndTablet() {
    combineLatest([
      fromResizeObserver(this.contentContainer.nativeElement),
      this.screen$,
    ]).pipe(
      map(([contentContainerRect, screen]) =>
        contentContainerRect.width / screen.width),
      tap((scale: number) => {
        this.store.dispatch(new PebSetScaleAction({ scale }));
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }
}

export type DetailView = { view: ViewRef, detail: { back: string, title: string } };
