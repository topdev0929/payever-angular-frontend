import { Directive, Injector, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TemplatePortal } from '@angular/cdk/portal';
import { ConnectionPositionPair, Overlay, OverlayRef } from '@angular/cdk/overlay';

import { BehaviorSubject, combineLatest, interval, Observable, Subscription, timer } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, filter, finalize, map, skip, take, takeUntil, tap } from 'rxjs/operators';

import { SessionStorageService } from 'ngx-webstorage';

import { TranslateService } from '@pe/i18n';
import { PeDataGridComponent } from '@pe/data-grid';
import { TreeSidebarFilterComponent } from '@pe/sidebar';
import {
  MenuSidebarFooterData,
  PeDataGridAdditionalFilter,
  PeDataGridButtonItem,
  PeDatagridCustomField,
  PeDataGridItem,
  PeDataGridLayoutType,
  PeDataGridListOptions,
  PeDataGridSingleSelectedAction,
  PeSearchItem,
  TreeFilterNode
} from '@pe/common';

import { IntegrationInfoWithStatusInterface, IntegrationCategory, CustomIntegrationsFolder } from '../interfaces';
import { IntegrationsStateService, DeviceType, WindowService, IntegrationsApiService, DataGridService } from '../services';
import { BaseListComponent } from './base-list.component';

interface PeDataGridItemWithCard extends PeDataGridItem {
  _cardItem: IntegrationInfoWithStatusInterface;
  subscriptionId?: string;
}

interface CustomFilterNode extends TreeFilterNode {
  integrations?: string[];
  children?: CustomFilterNode[];
}

enum Column {
  Title = 'title',
  Category = 'category',
  Developer = 'developer',
  Languages = 'languages',
  AppSupport = 'app_support',
  Website = 'website',
  Pricing = 'pricing',
  Action = 'action'
}

export enum Categories {
  all = 'all',
  payments = 'payments',
  accounting = 'accountings',
  shipping = 'shippings',
  shopsystem = 'shopsystems',
  products = 'products',
  communication = 'communications'
}

enum MainTreeFilters {
  my_apps = 'my_apps',
  categories = 'categories'
}

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

// tslint:disable-next-line:max-line-length
const columnsDesktop: Column[] = [Column.Title, Column.Category, Column.Developer, Column.Languages, Column.Action];
const columnsMobile: Column[] = [Column.Title, Column.Action];

@Directive()
export class BaseListCommonComponent extends BaseListComponent implements OnInit {

  @ViewChild('contextMenu') contextMenu: TemplateRef<any>;
  @ViewChild('foldersContextMenu') foldersContextMenu: TemplateRef<any>;
  @ViewChild('treeMyAppsFilter') treeMyAppsFilter: TreeSidebarFilterComponent;
  @ViewChild('treeCategoryFilter') treeCategoryFilter: TreeSidebarFilterComponent;

  private overlayRef: OverlayRef;

  private loading: boolean;

  allowUninstallAction: boolean = false;

  currentPage: number = 1;
  totalCount: string = '';
  onScrollStream$ = new BehaviorSubject<Event>(null);

  deviceType: typeof DeviceType = DeviceType;
  mainTreeFilters: typeof MainTreeFilters = MainTreeFilters;

  theme: string = 'dark';
  viewMode: PeDataGridLayoutType;
  displayedColumns$: Observable<Column[]> = new BehaviorSubject([]);

  gridItems$: BehaviorSubject<PeDataGridItemWithCard[]> = new BehaviorSubject([]);
  gridOptions$: BehaviorSubject<PeDataGridListOptions> = new BehaviorSubject(null);

  showOnlyInstalledIntegrations: boolean;
  dataGridFilters: PeDataGridAdditionalFilter[];

  itemsInViewCount: number = 0;
  isInitialImageState: boolean = true;

  myAppsTreeData: CustomFilterNode[] = [];
  categoriesTreeData: TreeFilterNode[] = [];

  selectedCustomFilter: CustomFilterNode;
  rightClickedCustomFilter: CustomFilterNode;
  selectedIntegrations: PeDataGridItemWithCard[] = [];
  copiedIntegrations: PeDataGridItemWithCard[] = [];
  navbarRightPaneButtons: PeDataGridButtonItem[] = [];

  refreshFiltersSubject$ = new BehaviorSubject(true);
  readonly refreshFilters$ = this.refreshFiltersSubject$.asObservable();
  activeTreeFilter$: BehaviorSubject<MainTreeFilters> = new BehaviorSubject(null);

  hiddenDefaultFilters = [{
    label: null,
    labelCallback: () => {
    }
  }];

  sidebarFooterData: MenuSidebarFooterData = {
    menuItems: [
      {
        title: 'Add Folder', onClick: () => {
          this.addFolder();
        },
      },
    ],
  };

  formGroup: FormGroup = null;

  searchItems: PeSearchItem[] = [];

  showSidebar$ = new BehaviorSubject<boolean>(false);

  private getCategoryIntegrationsSub: Subscription = null;

  protected dataGridService: DataGridService = null;
  protected windowService: WindowService = null;
  protected integrationsApiService: IntegrationsApiService = null;
  protected integrationsStateService: IntegrationsStateService = null;
  protected translateService: TranslateService = null;
  protected fb: FormBuilder = null;
  protected domSanitizer: DomSanitizer = null;
  protected sessionStorageService: SessionStorageService = null;
  protected route: ActivatedRoute = null;
  protected overlay: Overlay = null;
  protected viewContainerRef: ViewContainerRef = null;

  constructor(injector: Injector) {
    super(injector);

    this.dataGridService = this.injector.get(DataGridService);
    this.windowService = this.injector.get(WindowService);
    this.integrationsApiService = this.injector.get(IntegrationsApiService);
    this.integrationsStateService = this.injector.get(IntegrationsStateService);
    this.translateService = this.injector.get(TranslateService);
    this.fb = this.injector.get(FormBuilder);
    this.domSanitizer = this.injector.get(DomSanitizer);
    this.sessionStorageService = this.injector.get(SessionStorageService);
    this.route = this.injector.get(ActivatedRoute);
    this.overlay = this.injector.get(Overlay);
    this.viewContainerRef = this.injector.get(ViewContainerRef);

    this.formGroup = this.fb.group({
      myApps: [],
      categories: []
    });
  }

  get showReturnButton() {
    const saveReturn = this.sessionStorageService.retrieve('connect-integration-return');
    return saveReturn && saveReturn.indexOf('fullpage') !== -1;
  }

  ngOnInit(): void {
    this.gridItems$ = this.dataGridService.gridItems$;

    this.dataGridService.chooseFiltersEmit.pipe(
      tap(() => {
        this.chooseFilters();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();

    this.dataGridSidebarService.animationDone$.pipe(
      tap(() => {
        this.showSidebar$.next(!this.showSidebar$.value);
      }),
      takeUntil(this.destroyed$)
    ).subscribe();

    super.ngOnInit();
    this.initSubscriptionsLimit();

    this.viewMode = this.sessionStorageService.retrieve('connectAppViewMode') || this.viewMode || PeDataGridLayoutType.Grid;

    this.displayedColumns$ = this.windowService.deviceType$.pipe(
      takeUntil(this.destroyed$),
      map((deviceType: DeviceType) => {
        let result: Column[];
        switch (deviceType) {
          case this.deviceType.Mobile:
            result = columnsMobile;
            break;
          default:
            result = columnsDesktop;
        }
        return result;
      }),
      distinctUntilChanged(),
    );

    // emits scroll event after items load to trigger initial image loading
    this.gridItems$.asObservable()
      .pipe(debounceTime(200), takeUntil(this.destroyed$))
      .subscribe(() => {
        this.totalCount = `${this.gridItems$.value?.length} ${this.translateService.translate('actions.of')} ${this.integrationsStateService.getSubscriptionsTotal()}`;
        this.onScrollStream$.next(null);
        this.cdr.detectChanges();
      });

    this.onScrollStream$.asObservable().pipe(
      filter(event => !!event),
      skip(1),
      takeUntil(this.destroyed$)
    ).subscribe(event => {
      if (event && !this.loading) {
        this.isInitialImageState = false;
        if (
          this.integrationsStateService.getSubscriptionsTotal()
          && this.integrationsStateService.getSubscriptionsTotal() > this.gridItems$.value.length) {
          this.loading = true;
          this.currentPage += 1;
          if (this.formGroup.controls?.categories?.value?.length) {
            this.onTreeFilterChange(this.formGroup.controls.categories.value);
          } else {
            this.loadCategoryList();
          }
        }
      }
    });

    this.initTreeFilters();
    this.initCustomApps();
  }

  toggleSidebar() {
    this.dataGridSidebarService.toggleFilters$.next();
  }

  getBaseFilterCategories(): IntegrationCategory[] {
    return null;
  }

  onChangeView(view: PeDataGridLayoutType): void {
    this.viewMode = view;
    this.initSubscriptionsLimit();
    this.currentPage = 0;
    const integrationName = this.route.snapshot.queryParams.integrationName;
    if (!integrationName) {
      this.sessionStorageService.store('connectAppViewMode', this.viewMode);
    }

    // emits scroll event after changing view load to trigger initial image loading
    interval(200).pipe(take(1)).subscribe(() => this.onScrollStream$.next({} as Event));
  }

  saveReturn(): void {
    const businessId = this.integrationsStateService.getBusinessId();
    this.navigationService.saveReturn(`business/${businessId}/connect`);
  }

  back() {
    this.navigationService.returnBack();
  }

  handleOpen(integration: IntegrationInfoWithStatusInterface, isLoading = null): void {
    if (integration._status && integration._status.installed) {
      this.saveReturn();
      this.paymentsStateService.openInstalledIntegration(integration);
    }
  }

  initSubscriptionsLimit() {
    this.currentPage = 1;
    if (window.innerWidth >= 1440) {
      this.integrationsStateService.setSubscriptionsLimit(this.viewMode === PeDataGridLayoutType.List ? 48 : 24);
    } else {
      this.integrationsStateService.setSubscriptionsLimit(this.viewMode === PeDataGridLayoutType.List ? 24 : 12);
    }
  }

  loadCategoryList(categories?: IntegrationCategory[]): void {
    const integrationName = this.route.snapshot.queryParams.integrationName;

    if (this.getCategoryIntegrationsSub) {
      this.getCategoryIntegrationsSub.unsubscribe();
      this.getCategoryIntegrationsSub = null;
    }

    const categoryIntegrations$ =
      this.integrationsStateService.getCategoryIntegrations(
        this.showOnlyInstalledIntegrations,
        categories,
        true,
        this.currentPage,
        this.searchItems
      ).pipe(
        takeUntil(this.destroyed$),
        filter(d => !!d),
        take(1),
        map((items: any) => {
          return items.filter((item) => {
            return item.name !== integrationName;
          });
        })
      );

    this.initGridItems(categoryIntegrations$);
  }

  initGridItems(integrationsSource: Observable<IntegrationInfoWithStatusInterface[]>) {
    this.getCategoryIntegrationsSub = combineLatest([
      integrationsSource,
      this.displayedColumns$.pipe(filter(a => !!a))
    ]).subscribe(dd => {
        const data: IntegrationInfoWithStatusInterface[] = dd[0];
        const columns: Column[] = dd[1];

        const translate = a => this.translateService.translate(a);

        const fieldsTitles: string[] = [];

        for (let i = 0; i < columns.length; i++) {
          const column = columns[i];
          if (column === Column.Website) {
            continue;
          }

          fieldsTitles.push(column === Column.Action ? '' : translate(`installation.labels.${column}`));

          this.filterItems(translate, data, columns);

          this.gridOptions$.next({
            nameTitle: fieldsTitles[0],
            customFieldsTitles: fieldsTitles.slice(1)
          });

          this.selectedIntegrations = [];
          this.loading = false;
        }
      }
    );
  }

  loadMyAppsList(nodes: TreeFilterNode[]): void {
    if (nodes[0]?.id) {
      this.initGridItems(this.integrationsStateService.getFolderIntegrations(nodes[0].id, this.searchItems));
    }
  }

  filterItems(translate, data, columns) {
    const integrations = data
      .map((item, index) => {
        const io = item?.installationOptions;
        const fieldsValues: (PeDatagridCustomField)[] = [];
        for (let inc = 0; inc < columns.length; inc++) {
          const gridColumn = columns[inc];
          switch (gridColumn) {
            case Column.Title:
              fieldsValues.push(
                {
                  content: this.trustHtml(
                    `<svg class="icon icon-18"><use xlink:href="${item?.displayOptions?.icon}"></use></svg> &nbsp; `
                    + translate(item?.displayOptions?.title)
                  ),
                }
              );
              break;
            case Column.Category:
              fieldsValues.push(
                {
                  content: translate(io?.category)
                }
              );
              break;
            case Column.Developer:
              fieldsValues.push(
                {
                  content: translate(io?.developer)
                }
              );
              break;
            case Column.Languages:
              fieldsValues.push(
                {
                  content: translate(io?.languages)
                }
              );
              break;
            case Column.Action:
              fieldsValues.push(this.getListItemActions(item));
              fieldsValues.push(this.getListItemSecondActions(item));
              break;
            case Column.AppSupport:
              fieldsValues.push(
                {
                  content: this.trustHtml(
                    `<a href="${translate(io.appSupport)}" target="_blank">${translate('installation.labels.app_support')}</a>`
                  )
                }
              );
              break;
            case Column.Pricing:
              fieldsValues.push(
                {
                  content: io.pricingLink ? this.trustHtml(
                    `<a href="${translate(io.pricingLink)}" target="_blank">${translate('installation.labels.pricing')}</a>`
                  ) : ''
                }
              );
              break;
            default:
          }
        }
        if (index > this.itemsInViewCount) {
          item.loadImageLazy = true;
        }
        return {
          id: item?._id,
          subscriptionId: item.subscriptionId,
          title: fieldsValues[0].content,
          customFields: fieldsValues.slice(1),
          actions: this.getItemActions(item),
          _cardItem: item,
        };
      });
    if (this.currentPage > 1) {
      const concatIntegrations = [...this.gridItems$.value];
      integrations.forEach(integration => {
        const index = concatIntegrations.findIndex(item => item.id === integration.id);
        if (index >= 0) {
          concatIntegrations[index] = integration;
        } else {
          concatIntegrations.push(integration);
        }
      });
      this.gridItems$.next(concatIntegrations);
    } else {
      this.gridItems$.next(integrations);
    }
  }

  getListItemActions(item: IntegrationInfoWithStatusInterface): PeDatagridCustomField {
    const isOpenLoading = new BehaviorSubject(false);
    if (item._status.installed) {
      return {
        callback: () => {
          this.onOpenCallback(item._id, isOpenLoading);
        },
        content: this.trustHtml(
          `<button type="button" class="connect-list__action-button">${this.translateService.translate('actions.open')}</button>`
        )
      };
    } else {
      return {
        callback: () => {
          this.onInstallCallback(item._id, isOpenLoading);
        },
        content: this.trustHtml(
          `<button type="button" class="connect-list__action-button">${this.translateService.translate('actions.install')}</button>`
        )
      };
    }
  }

  getListItemSecondActions(item: IntegrationInfoWithStatusInterface): PeDatagridCustomField {
    return {
      content: ''
    };
  }

  getItemActions(item: IntegrationInfoWithStatusInterface): PeDataGridSingleSelectedAction[] {
    const isOpenLoading = new BehaviorSubject(false);
    const isLoading = new BehaviorSubject(false);
    if (item._status.installed) {
      const open = {
        label: this.translateService.translate('actions.open'),
        isLoading$: isOpenLoading.asObservable(),
        callback: (id: string) => {
          this.onOpenCallback(id, isOpenLoading);
        }
      };
      return !this.allowUninstallAction ?
        [open] :
        [open, {
          label: this.translateService.translate('actions.uninstall'),
          isLoading$: isLoading.asObservable(),
          callback: (id: string) => {
            this.onUninstallCallback(id, isLoading);
          }
        }];
    } else {
      return [
        {
          label: this.translateService.translate('actions.install'),
          isLoading$: isLoading.asObservable(),
          callback: (id: string) => {
            this.onInstallCallback(id, isLoading);
          }
        }
      ];
    }
  }

  trustHtml(text: string): SafeHtml {
    return this.domSanitizer.bypassSecurityTrustHtml(text);
  }

  selectMainTreeFilter(mainTreeFilter: MainTreeFilters, updateFilers: boolean = false): void {

    this.initSubscriptionsLimit();

    if (this.activeTreeFilter$.value === mainTreeFilter) {
      return;
    }
    this.activeTreeFilter$.next(mainTreeFilter);

    if (mainTreeFilter === MainTreeFilters.my_apps) {
      this.showOnlyInstalledIntegrations = true;
      this.treeCategoryFilter?.updateValue([]);
    }

    if (mainTreeFilter === MainTreeFilters.categories) {
      this.showOnlyInstalledIntegrations = false;
      this.treeMyAppsFilter?.updateValue([]);
    }

    this.refreshFiltersSubject$.next(true);

    if (updateFilers) {
      this.loadCategoryList();
    }
  }

  onMainFilterClick(mainTreeFilter: MainTreeFilters) {
    if (this.activeTreeFilter$.value === mainTreeFilter && this.activeTreeFilter$.value === MainTreeFilters.categories) {
      return;
    }
    if (mainTreeFilter === MainTreeFilters.my_apps) {
      this.selectMainTreeFilter(mainTreeFilter);
      this.treeMyAppsFilter?.updateValue([]);
      this.loadCategoryList();
    } else {
      this.showOnlyInstalledIntegrations = false;
      this.formGroup.controls.categories.patchValue([this.categoriesTreeData.find(item => item.data === 'all')]);
    }
  }

  onTreeFilterChange(tree: TreeFilterNode[]) {
    tree = tree ?? [];
    this.loadCategoryList(tree.some(node => node.data === Categories.all) ? [] : tree.map(node => Categories[node.data]));
  }

  onMyAppsFolderChange(tree: TreeFilterNode[]) {
    tree = tree ?? [];
    this.loadMyAppsList(tree);
  }

  onSearchChange(e: PeSearchItem) {
    this.searchItems = [...this.searchItems, e];
    this.initSubscriptionsLimit();
    this.onSearchUpdate();
  }

  onSearchRemove(e: number) {
    this.searchItems.splice(e, 1);
    this.initSubscriptionsLimit();
    this.onSearchUpdate();

  }

  chooseFilters() {
    interval(100).pipe(take(1)).subscribe(_ => {
      this.onTreeFilterChange(this.formGroup.controls.categories.value);
    });
  }

  onInViewportChange({target, visible}: { target: Element; visible: boolean }) {
    if (visible && this.isInitialImageState) {
      this.itemsInViewCount++;
    }
  }

  renameFolder(node?: CustomFilterNode) {
    if (node) {
      node.editing = true;
    } else {
      this.selectedCustomFilter.editing = true;
    }
    this.refreshFiltersSubject$.next(true);
    this.focusInput();
  }

  deleteFolder() {
    this.integrationsApiService.deleteCustomFolder(this.integrationsStateService.getBusinessId(), this.selectedCustomFilter.id)
      .subscribe(() => {
        this.myAppsTreeData = this.deleteNodeById(this.myAppsTreeData, this.selectedCustomFilter.id);
        this.selectedCustomFilter = null;
        this.refreshFiltersSubject$.next(true);
        this.showOnlyInstalledIntegrations = true;
        this.selectMainTreeFilter(this.mainTreeFilters.my_apps, true);
      });
  }

  isIntegrationSelected(integration: PeDataGridItemWithCard): boolean {
    return this.selectedIntegrations.some(item => item.id === integration.id);
  }

  copyIntegration() {
    this.closeContextMenu();
    this.copiedIntegrations = this.selectedIntegrations;
  }

  removeIntegration() {
    this.closeContextMenu();
    if (this.selectedIntegrations.length) {
      this.deleteIntegrationsFromFolder(this.selectedIntegrations, this.selectedCustomFilter);
    }
  }

  pasteIntegrationToFolder() {
    this.closeContextMenu();
    if (this.copiedIntegrations.length && this.rightClickedCustomFilter) {
      this.addIntegrationsToFolder(this.copiedIntegrations, this.rightClickedCustomFilter);
      this.copiedIntegrations = [];
    }
  }

  addIntegrationsToFolder(integrations: PeDataGridItemWithCard[], folder: TreeFilterNode) {
    const customFolder = this.getNodeById(this.myAppsTreeData, folder.id);
    if (customFolder) {
      this.integrationsStateService.getFolderIntegrations(customFolder.id, this.searchItems).subscribe(folderIntegrations => {
        const folderIntegrationsIds = folderIntegrations.map(item => item.subscriptionId);
        const integrationsIds = integrations
          .map(integration => integration.subscriptionId)
          .filter(integration => !folderIntegrationsIds.includes(integration));
        customFolder.integrations = [...folderIntegrationsIds, ...integrationsIds];

        this.updateNode(customFolder).subscribe(() => {
        }, () => {
          this.initCustomApps();
        });
      });
    }
  }

  deleteIntegrationsFromFolder(integrations: PeDataGridItemWithCard[], folder: TreeFilterNode) {
    const customFolder = this.getNodeById(this.myAppsTreeData, folder.id);
    if (customFolder) {
      const integrationsIds = integrations.map(integration => integration.subscriptionId);
      customFolder.integrations = this.gridItems$.value.map(item => item.subscriptionId);
      customFolder.integrations = customFolder.integrations.filter(integration => !integrationsIds.includes(integration));
    }
    this.updateNode(customFolder).subscribe(() => {
      if (this.selectedCustomFilter?.id === folder.id) {
        this.loadMyAppsList([this.selectedCustomFilter]);
      }
    }, () => {
      this.initCustomApps();
    });
  }

  onUpdateNode(node: CustomFilterNode) {
    this.updateNode(node).subscribe(() => {
    }, () => {
      this.initCustomApps();
    });
  }

  onCreateNode(node: CustomFilterNode) {
    node.editing = false;
    const parent = this.selectedCustomFilter ? this.selectedCustomFilter.id : null;
    this.integrationsApiService.createCustomFolder(
      this.integrationsStateService.getBusinessId(),
      this.mapCustomNodeToFolder(node, parent)
    ).subscribe(folder => {
      if (parent) {
        this.selectedCustomFilter.children.find(child => !child.id && child.name === folder.name).id = folder._id;
      } else {
        this.myAppsTreeData.find(child => !child.id && child.name === folder.name).id = folder._id;
      }
    }, () => {
      this.initCustomApps();
    });
  }

  openContextMenu(event: any, item, context) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    this.selectedIntegrations = item ? [item] : this.selectedIntegrations;

    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .flexibleConnectedTo(event)
        .withFlexibleDimensions(false)
        .withViewportMargin(10)
        .withPositions(OVERLAY_POSITIONS),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: true,
      backdropClass: 'connect-context-menu-backdrop'
    });

    this.overlayRef.backdropClick().pipe(
      tap(() => this.closeContextMenu()),
    ).subscribe();

    // TODO: Need fix after live
    // this.overlayRef.attach(new TemplatePortal(context, this.viewContainerRef));
  }

  onContentRightClick(event: MouseEvent) {
    if (this.copiedIntegrations.length) {
      this.rightClickedCustomFilter = this.selectedCustomFilter;
      this.openContextMenu(event, null, this.foldersContextMenu);
    }
  }

  onFolderRightClick({event, node}) {
    if (this.copiedIntegrations.length) {
      this.rightClickedCustomFilter = node;
      this.openContextMenu(event, null, this.foldersContextMenu);
    }
  }

  closeContextMenu() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }

  protected onOpenCallback(selectedId: string, isLoading: BehaviorSubject<boolean>) {
    isLoading.next(true);
    const integration = this.gridItems$?.value.find(int => int.id === selectedId)?._cardItem;
    if (integration) {
      this.handleOpen(integration, isLoading);
    }
  }

  protected onInstallCallback(selectedId: string, isLoading: BehaviorSubject<boolean>) {
    isLoading.next(true);
    const integration = this.gridItems$?.value.find(int => int.id === selectedId);
    if (integration) {
      this.paymentsStateService.installIntegrationAndGoToDone(true, integration._cardItem)
        .subscribe(data => {
          this.router.navigate([
            `business/${this.integrationsStateService.getBusinessId()}/connect/${integration._cardItem.category}/integrations/${integration._cardItem.name}/done`
          ]).then(() => {
            integration._cardItem._status.installed = data.installed;
            integration.actions = this.getItemActions(integration._cardItem);
            isLoading.next(false);
            this.chooseFilters();
          });
        }, error => {
          console.error('Cant install', error);
          isLoading.next(false);
          this.paymentsStateService.handleError(error, true);
          this.chooseFilters();
        });
    }
  }

  protected onUninstallCallback(selectedId: string, isLoading: BehaviorSubject<boolean>) {
    isLoading.next(true);
    const integration = this.gridItems$?.value.find(int => int.id === selectedId);
    if (integration) {
      this.paymentsStateService.installIntegrationAndGoToDone(false, integration._cardItem)
        .subscribe(data => {
            this.router.navigate([
              `business/${this.integrationsStateService.getBusinessId()}/connect/${integration._cardItem.category}/integrations/${integration._cardItem.name}/done`
            ]).then(() => {
              integration._cardItem._status.installed = data.installed;
              integration.actions = this.getItemActions(integration._cardItem);
              isLoading.next(false);
              this.chooseFilters();
            });
          },
          error => {
            console.error('Cant uninstall', error);
            isLoading.next(false);
            this.paymentsStateService.handleError(error, true);
            this.chooseFilters();
          });
    }
  }

  private initTreeFilters(): void {
    this.categoriesTreeData = Object.keys(Categories).map(category => {
      return {
        name: this.translateService.translate(`categories.${category}.title`),
        data: category,
        image: `/assets/icons/${category}-icon-filter.svg`,
        noToggleButton: true,
      };
    });

    let previousCategory = [];

    combineLatest(this.windowService.deviceType$, this.formGroup.controls.categories.valueChanges)
      .pipe(
        takeUntil(this.destroyed$),
        filter(data => !!data[1].length),
        tap(data => {
          this.initSubscriptionsLimit();
          this.scrollTopOfList();
          const deviceType = data[0];
          const currentCategory = data[1];
          let activeTreeFilterChanges = false;
          if (currentCategory?.length && this.activeTreeFilter$.value !== MainTreeFilters.categories) {
            this.selectMainTreeFilter(MainTreeFilters.categories);
            activeTreeFilterChanges = true;
          }
          if (activeTreeFilterChanges
            || !(this.isCategoriesContainAllIntegrations(previousCategory) && this.isCategoriesContainAllIntegrations(currentCategory))
          ) {
            this.onTreeFilterChange(currentCategory);
          }
          previousCategory = currentCategory;
        }),
      ).subscribe();

    if (this.route.snapshot.queryParams.integrationName) {
      const selectedCategory = this.categoriesTreeData.find(category => {
        return Categories[category.data] === this.route.snapshot.queryParams.integrationName;
      });
      this.formGroup.controls.categories.patchValue([selectedCategory]);
    } else {
      this.formGroup.controls.categories.patchValue([this.categoriesTreeData[0]]);
      this.treeCategoryFilter?.updateValue([this.categoriesTreeData[0]]);
    }
  }

  private updateNode(node: CustomFilterNode): Observable<CustomIntegrationsFolder> {
    return this.integrationsApiService.updateCustomFolder(
      this.integrationsStateService.getBusinessId(),
      node.id,
      this.mapCustomNodeToFolder(node, node.parentId)
    );
  }

  private isCategoriesContainAllIntegrations(categories: TreeFilterNode[]): boolean {
    return !categories.length || categories.some(cat => cat.data === Categories.all);
  }

  private getNodeById(nodes: CustomFilterNode[], id: string): CustomFilterNode {
    return nodes.reduce((acc, curr) => {
      if (acc) {
        return acc;
      }
      if (curr.id === id) {
        return curr;
      }
      if (curr?.children.length) {
        return this.getNodeById(curr.children, id);
      }
      return null;
    }, null);
  }

  private initCustomApps() {
    this.integrationsApiService.getCustomFolders(this.integrationsStateService.getBusinessId())
      .subscribe(folders => this.myAppsTreeData = this.initMyAppsFolders(folders));
    let previousCategory = [];

    combineLatest(this.windowService.deviceType$, this.formGroup.controls.myApps.valueChanges)
      .pipe(
        takeUntil(this.destroyed$),
        filter(data => !!data[1].length),
        tap(data => {
          this.initSubscriptionsLimit();
          this.scrollTopOfList();
          const deviceType = data[0];
          const currentFolder = data[1];
          this.selectedCustomFilter = currentFolder[0] ?? null;
          if (this.selectedCustomFilter) {
            this.sidebarFooterData = {
              menuItems: [
                {
                  title: this.translateService.translate('folders.addFolder'),
                  onClick: () => {
                    this.addFolder();
                  },
                },
                {
                  title: this.translateService.translate('folders.deleteFolder'),
                  onClick: () => {
                    this.deleteFolder();
                  },
                  color: '#eb4653'
                },
              ],
            };

            if (!this.selectedCustomFilter?.children?.length) {
              this.sidebarFooterData.menuItems.unshift(
                {
                  title: this.translateService.translate('folders.renameFolder'),
                  onClick: () => {
                    this.renameFolder();
                  },
                }
              );
            }
          } else {
            this.sidebarFooterData = {
              menuItems: [
                {
                  title: this.translateService.translate('folders.addFolder'),
                  onClick: () => {
                    this.addFolder();
                  },
                }
              ],
            };
          }
          if (currentFolder?.length && this.activeTreeFilter$.value !== MainTreeFilters.my_apps) {
            this.selectMainTreeFilter(MainTreeFilters.my_apps);
          }
          this.onMyAppsFolderChange(currentFolder);
          previousCategory = currentFolder;
        }),
      ).subscribe();
  }

  private initMyAppsFolders(folders: CustomIntegrationsFolder[]): CustomFilterNode[] {
    let customFolders = [...folders];
    const customFiltersNodes = [];
    customFolders = customFolders.filter(folder => {
      if (!folder.parent) {
        customFiltersNodes.push(this.mapFolderToCustomNode(folder));
        return false;
      }
      return true;
    });
    while (customFolders.length) {
      customFolders = customFolders.filter(folder => {
        const parent = this.getNodeById(customFiltersNodes, folder.parent);
        if (parent) {
          this.getNodeById(customFiltersNodes, folder.parent).children.push(this.mapFolderToCustomNode(folder));
          return false;
        }
        return true;
      });
    }
    return customFiltersNodes;
  }

  private onSearchUpdate() {
    if (
      !this.activeTreeFilter$.value
      || this.activeTreeFilter$.value === this.mainTreeFilters.categories
      || (this.activeTreeFilter$.value === this.mainTreeFilters.my_apps && !this.formGroup.controls.myApps?.value?.length)
    ) {
      this.onTreeFilterChange(this.formGroup.controls.categories.value);
    } else {
      this.onMyAppsFolderChange(this.formGroup.controls.myApps.value);
    }
  }

  private mapFolderToCustomNode(folder: CustomIntegrationsFolder): CustomFilterNode {
    return {
      id: folder._id,
      name: folder.name || '',
      image: folder.icon || '/assets/icons/all-icon-filter.svg',
      children: [],
      parentId: folder.parent,
      integrations: folder.integrations || []
    };
  }

  private mapCustomNodeToFolder(node: CustomFilterNode, parent: string = null): CustomIntegrationsFolder {
    return {
      _id: node.id,
      folderId: node.id,
      businessId: this.integrationsStateService.getBusinessId(),
      parent: parent,
      name: node.name,
      tags: [],
      integrations: node.integrations || []
    };
  }

  private addFolder() {
    if (this.selectedCustomFilter) {
      this.selectedCustomFilter.children = this.selectedCustomFilter.children || [];
      this.selectedCustomFilter.children.push({
        name: '',
        image: '/assets/icons/all-icon-filter.svg',
        editing: true,
        integrations: [],
        parentId: this.selectedCustomFilter.id
      });
      this.treeMyAppsFilter.expandNode(this.selectedCustomFilter);
    } else {
      this.myAppsTreeData.push({
        name: '',
        image: '/assets/icons/all-icon-filter.svg',
        editing: true,
        integrations: []
      });
    }
    this.refreshFiltersSubject$.next(true);
    this.focusInput();
  }

  private focusInput() {
    setTimeout(() => {
      const input = document.querySelector('.sidebar-tree__input') as HTMLInputElement;
      if (input) {
        input.focus();
      }
    });
  }

  private deleteNodeById(nodes: CustomFilterNode[], nodeId: string): CustomFilterNode[] {
    return nodes.reduce((acc, curr) => {
      const result = curr.id === nodeId ? acc : [...acc, curr];
      if (curr.id !== nodeId && curr?.children?.length) {
        curr.children = this.deleteNodeById(curr.children, nodeId);
      }
      return result;
    }, []);
  }

  private scrollTopOfList() {
    document.querySelector('.scrollbar')?.scrollTo({top: 0});
  }
}
