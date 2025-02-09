import { Overlay } from '@angular/cdk/overlay';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Inject,
  OnDestroy,
  OnInit, TemplateRef, ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject, combineLatest, EMPTY, merge, of } from 'rxjs';
import { catchError, delay, map, skip, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import {
  MessageBus,
  PE_ENV,
  PeDataGridPaginator,
  PeDestroyService,
} from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import {
  MoveIntoFolderEvent,
  PeMoveToFolderItem,
} from '@pe/folders';
import {
  getPaginationResult,
  PeCustomMenuInterface,
  PeGridItem,
  PeGridItemContextSelect,
  PeGridMenu,
  PeGridMenuItem,
  PeGridService,
  PeGridSidenavService,
  PeGridStoreActions,
  PeGridTableDisplayedColumns,
  PeGridView,
} from '@pe/grid';
import { OutputImportedFileInterface } from '@pe/grid/extensions/import-file';
import { BaseGridClassDirective, PeFilterChange } from '@pe/grid/shared';
import { TranslateService } from '@pe/i18n';
import { PePlatformHeaderService } from '@pe/platform-header';
import {
  FolderItem,
  RootFolderItem,
} from '@pe/shared/folders';
import { ProductsAppState } from '@pe/shared/products';
import { SnackbarService } from '@pe/snackbar';

import {
  GridExpandAnimation, groupQueryParam,
  MobileSidebarAnimation,
  positionQueryParam,
  SidebarAnimation,
} from '../../misc/constants';
import { GridSortingFieldsEnum } from '../../misc/enum';
import { EmployeeStatusEnum } from '../../misc/interfaces';
import { ApiService, BusinessEnvService } from '../../services';

import {
  CATEGORY,
  DISPLAYED_COLUMNS,
  LSFolder,
  LSView,
  PARAM,
  SIDENAV_MENU,
  TOOLBAR_CONFIG,
  VIEW_MENU,
} from './constants';
import { FolderEnum } from './enums';
import { ContextEnum, EmployeesIcons, OptionsMenu } from './enums/navbar-filter-keys.enum';
import { IGroupItemInterface } from './interfaces/employee-group.interface';
import { EmployeesGridItemInterface } from './interfaces/employees-grid-item.interface';
import {
  PebBusinessEmployeesStorageService,
  PebBusinessEmployeesService,
  PebEmployeeDialogOpenerService,
  PebEmployeeSidebarService, EmployeeGroupService, EmployeeFolderService,
} from './services';
import { PebEmployeesState } from './state/employees';

const SIDENAV_NAME = 'app-settings-employees-sidenav';

@Component({
  selector: 'peb-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
  animations: [SidebarAnimation, MobileSidebarAnimation, GridExpandAnimation],
  encapsulation: ViewEncapsulation.None,
})
export class EmployeesComponent extends BaseGridClassDirective implements OnInit, AfterViewInit, OnDestroy {
  @SelectSnapshot(ProductsAppState.popupMode) popupMode: boolean;

  @HostBinding('class') class = 'pe-employess-component';

  @ViewChild('importMenu', { static: true }) importMenuRef: TemplateRef<HTMLElement>;

  defaultFolderIcon = `${this.env.custom.cdn}/icons-transactions/folder.svg`;

  rootFolderData: RootFolderItem = {
    _id: null,
    name: this.translationService.translate('pages.employees.sidebar.title'),
    image: this.defaultFolderIcon,
  };

  gridLayout = localStorage.getItem(LSView) ?? PeGridView.List;

  totalItems$ = new BehaviorSubject<number>(0);
  selectedFolder: FolderItem;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  paginator: PeDataGridPaginator = {
    page: 1,
    perPage: getPaginationResult(),
    total: 10,
  };

  mobileTitle$ = new BehaviorSubject<string>('');

  sidenavMenu = SIDENAV_MENU;
  toolbar = TOOLBAR_CONFIG;
  viewMenu: PeGridMenu = VIEW_MENU;
  displayedColumns: PeGridTableDisplayedColumns[] = DISPLAYED_COLUMNS;
  toolbarCustomMenu$ = new BehaviorSubject<PeCustomMenuInterface[]>([]);

  filters: PeFilterChange[] = [];
  optionsMenu$ = combineLatest([
    this.route.queryParams,
    this.gridService.selectedItems$,
  ]).pipe(
    map(([params, selectedItems]) => {
      const items = this.toolbar.optionsMenu.items.reduce((acc, item) => {
        switch (item.value) {
          case OptionsMenu.Resend:
            if (!selectedItems.find(item => item.data.status === EmployeeStatusEnum.active)) {
              acc.push(item);
            }
            break;
          case OptionsMenu.DeleteFromGroup:
            if (params.param === groupQueryParam && params.category) {
              acc.push(item);
            }
            break;
          default:
            acc.push(item);
        }

        return acc;
      }, []);

      return Object.assign({ ...this.toolbar.optionsMenu }, { items });
    }),
  );

  albumId: string;

  initialized = false;
  isLoading = true;

  currentSidebarItemSelected = '';
  isPositionSelected = null;

  sidebarCategories: FolderItem[] = [];

  // grid items
  items: EmployeesGridItemInterface[] = [];

  public readonly gridItems$ = this.store.select(PebEmployeesState.selectedFolderItems)
    .pipe(
      skip(1),
      startWith([]),
      tap((items) => {
        this.items = items;
        this.paginator.total = this.employeesStorage.totalEmployees;
        this.totalItems$.next(this.paginator.total);
        this.cdr.detectChanges();
      }));

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sidebarService: PebEmployeeSidebarService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private employeesService: PebBusinessEmployeesService,
    private businessEnvService: BusinessEnvService,
    private translationService: TranslateService,
    private messageBus: MessageBus,
    private gridService: PeGridService,
    private destroy$: PeDestroyService,
    private snackbarService: SnackbarService,
    private confirmScreenService: ConfirmScreenService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private headerService: PePlatformHeaderService,
    private peGridSidenavService: PeGridSidenavService,
    private translateService: TranslateService,
    private employeeGroupService: EmployeeGroupService,
    private employeeFolderService: EmployeeFolderService,
    private store: Store,
    protected viewContainerRef: ViewContainerRef,
    protected overlay: Overlay,
    protected employeeDialogService: PebEmployeeDialogOpenerService,
    protected employeesStorage: PebBusinessEmployeesStorageService,
    @Inject(PE_ENV) private env,
  ) {
    super();
  }

  ngOnInit() {
    this.initIcons();
    this.addSidenavItem();
    merge(
      this.route.queryParams.pipe(
        tap((params) => {
          const param = params[PARAM];
          const category = params[CATEGORY];

          this.isPositionSelected = param === positionQueryParam;

          this.employeesService.loadEmployees({ param, category }, this.paginator);
        }),
      ),
      this.peGridSidenavService.toggleOpenStatus$.pipe(
        tap((active: boolean) => {
          this.headerService.toggleSidenavActive(SIDENAV_NAME, active);
        })
      ),
      this.apiService.getBusinessEmployeeGroupList(this.businessEnvService.businessUuid).pipe(
        tap((res) => {
          this.employeesStorage.groups = res;
          this.sidebarCategories = this.sidebarService.sidebarCategories(res?.data);

          if (this.route.snapshot.queryParams[PARAM]) {
            const folderIdStorage = localStorage.getItem(LSFolder);
            this.selectedFolder = this.findCategory(this.sidebarCategories, folderIdStorage);
          }

          this.cdr.markForCheck();
        }),
      ).pipe(
        //need wait until folder emit selectedRootFolder during initialization
        delay(1000),
        tap(() => {
          this.initialized = true;
        }),
      ),
      this.messageBus.listen('settings.resend.employee.invitation').pipe(
        tap((id: string) => {
          this.employeesService.inviteEmployeeToGroups(id);
        }),
      ),
      this.messageBus.listen('settings.resend.employee.approve').pipe(
        switchMap((gridItem: EmployeesGridItemInterface) =>
          this.employeesService.approveEmployee(gridItem?.id).pipe(
            tap(() => {
              gridItem.badge = {
                label: this.translateService.translate(
                  `pages.employees.datagrid.list.${EmployeeStatusEnum[EmployeeStatusEnum.active]}`
                ),
                color: '#ffffff',
              };
              this.cdr.markForCheck();
            }),
        )),
      ),
      this.messageBus.listen('settings.edit.employee').pipe(
        tap((id: string) => {
          this.employeesService.editEmployee(id);
        }),
      ),
      this.gridItems$
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngAfterViewInit(): void {
    if (!this.popupMode) {
      this.toolbarCustomMenu$.next([{
        title: this.translateService.translate('pages.employees.datagrid.common.import'),
        templateRef: this.importMenuRef,
      }]);
    }
  }

  onScrollLoad(): void {
    if (Math.ceil(this.paginator.total / this.paginator.perPage) < this.paginator.page) {
      return;
    }
    if (!this.isLoading$.value) {
      this.paginator.page += 1;

      const param = this.route.snapshot.queryParams[PARAM];
      const category = this.route.snapshot.queryParams[CATEGORY];

      this.employeesService.loadEmployees({ param, category }, this.paginator, true);
    }
  }

  initIcons() {
    Object.values(EmployeesIcons).forEach((icon) => {
      this.matIconRegistry.addSvgIcon(
        icon,
        this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${icon}.svg`)
      );
    });
  }

  openNewUserDialog() {
    this.employeesService.createEmployee(this.isPositionSelected
      ? null
      : this.employeesStorage.groups?.data.find(group => group.name === this.currentSidebarItemSelected)?._id,
    );
  }

  openEditUserDialog(id) {
    this.employeesService.editEmployee(id);
  }

  onEmployeesPositionSelect(node = null) {
    const nodeData = node;

    if (!nodeData) {
      this.router.navigate([]);

      return;
    }

    const queryParams = {};
    nodeData?.data?.param && (queryParams[PARAM] = nodeData?.data?.param);
    nodeData?.data?.category && (queryParams[CATEGORY] = nodeData?.data?.category);

    this.router.navigate([], { queryParams });
  }

  onDeleteEmployeeGroup = (e) => {
    this.employeeGroupService.removeGroup(e.data._id).pipe(
      tap(() => {
        this.sidebarCategories = this.sidebarService.sidebarCategories(this.employeesStorage.groups.data);
        this.onSelectRootFolder();
        this.cdr.detectChanges();
      }),
    ).subscribe();
  }

  openDialogAddEmployeeGroup(id: string = null, data: PeGridItem = null) {
    this.employeeGroupService.openDialogAddEmployeeGroup(id, data).pipe(
      tap((isGroupCreated) => {
        if (isGroupCreated) {
          this.sidebarCategories = this.sidebarService.sidebarCategories(this.employeesStorage.groups?.data);
          this.cdr.detectChanges();
        }
      }),
    ).subscribe();
  }

  onOpenEmployeeGroup(event) {
    this.openDialogAddEmployeeGroup(event.data._id, event.data);
  }

  onCreateEmployeeGroup(event) {
    this.employeeGroupService.createEmployeeGroup(event).pipe(
      takeUntil(this.destroy$),
      catchError(() => {
        this.cdr.detectChanges();

        return EMPTY;
      }),
    ).subscribe();
  }

  onEditEmployeeGroup(event) {
    this.sidebarService.updateEmployeeGroupFromTree(event.data).pipe(
      tap(result=> event.apply(result)),
      takeUntil(this.destroy$),
      catchError(() => {
        this.cdr.detectChanges();

        return EMPTY;
      }),
    ).subscribe();
  }

  showConfirmationDeleteDialog(action, ids) {
    const headings: Headings = {
      title: this.translationService.translate('dialogs.item_delete.title'),
      subtitle: this.translationService.translate('dialogs.item_delete.label'),
      declineBtnText: this.translationService.translate('dialogs.item_delete.decline'),
      confirmBtnText: this.translationService.translate('dialogs.item_delete.confirm'),
    };
    this.confirmScreenService.show(headings, true).pipe(
      tap((dismiss) => {
        if (dismiss === true) {
          action(ids);
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  removeEmployees = (ids) => {
    this.employeesService.deleteSelectedEmployees(ids);
    this.cdr.detectChanges();
  }

  onDeleteFromGroup = (id) => {
    this.showConfirmationDeleteDialog(this.removeEmployeesFromGroup, [id]);
  }

  removeEmployeesFromGroup = (employeesIds) => {
    this.employeeGroupService.removeEmployeesFromGroup(employeesIds, this.route.snapshot.queryParams[CATEGORY]).pipe(
      tap(() => this.cdr.markForCheck()),
      take(1),
    ).subscribe();
  }

  selectSideNavMenu(menuItem: PeGridMenuItem) {
    if (menuItem.value === FolderEnum.NewGroup) {
      this.openDialogAddEmployeeGroup();
    }
  }

  optionsChange(event: OptionsMenu) {
    switch (event) {
      case OptionsMenu.SelectAll:
        this.employeesService.selectAllEmployees();
        this.gridService.selectedItems = this.employeesService.getEmployees() as PeGridItem[];
        break;
      case OptionsMenu.Delete:
        this.deleteSelectedItems();
        this.gridService.selectedItems = [];
        break;
      case OptionsMenu.DeleteFromGroup:
        this.removeEmployeesFromGroup(this.gridService.selectedItems.map(item => item.id));
        break;
      case OptionsMenu.Resend:
        this.gridService.selectedItems.forEach((item) => {
          if (item.data.status !== EmployeeStatusEnum.active) {
            this.employeesService.inviteEmployeeToGroups(item.id);
          }
        });
        break;
      case OptionsMenu.DeselectAll:
      default:
        this.employeesService.deselectEmployee();
        this.gridService.selectedItems = [];
        break;
    }

    this.cdr.detectChanges();
  }

  onItemContentContextMenu({ gridItem, menuItem }: PeGridItemContextSelect) {
    switch (menuItem?.value) {
      case ContextEnum.Resend:
        this.messageBus.emit('settings.resend.employee.invitation', gridItem?.id);
        break;
      case ContextEnum.Approve:
        this.messageBus.emit('settings.resend.employee.approve', gridItem);
        break;
      case ContextEnum.Delete:
        if (!gridItem?.data?.isFolder) {
          this.showConfirmationDeleteDialog(this.removeEmployees, [gridItem?.id]);
        }
        break;
      case ContextEnum.DeleteFrom:
        this.onDeleteFromGroup(gridItem?.id);
        break;
    }
  }

  itemsToMove(item: PeGridItem): PeMoveToFolderItem[] {
    return [...new Set([...this.gridService.selectedItems, item])];
  }

  moveToFolder(event: MoveIntoFolderEvent): void {
    const { folder, moveItems } = event;
    if (moveItems?.length) {
      this.isLoading = true;
      const ids = moveItems.map((item) => {
        return item.id;
      });
      this.apiService.createBusinessEmployeeInGroup(
        this.businessEnvService.businessUuid,
        folder._id,
        ids
      ).pipe(
        tap((result: IGroupItemInterface) => {
          this.employeesStorage.groups.data.find(group => group._id === result._id).employees = result.employees;
        }),
      ).subscribe();
    }
  }

  onSelectRootFolder(): void {
    if (this.initialized) {
      localStorage.removeItem(LSFolder);
      this.onEmployeesPositionSelect();
    }
    this.mobileTitle$.next(this.rootFolderData.name);
  }

  selectFolder(folder): void {
    localStorage.setItem(LSFolder, folder._id);
    this.mobileTitle$.next(folder.name);
    this.onEmployeesPositionSelect(folder);
  }

  deleteSelectedItems() {
    const selectedItems = this.gridService.selectedItems;
    this.showConfirmationDeleteDialog(this.removeEmployees, selectedItems.map(item => item.id));
  }

  sortChange(sort: GridSortingFieldsEnum): void {
    this.employeesService.sortEmployees(sort);
  }

  filtersChange(filters: PeFilterChange[]) {
    this.filters = filters;
    const param = this.route.snapshot.queryParams[PARAM];
    const category = this.route.snapshot.queryParams[CATEGORY];
    this.employeesService.loadEmployees({ param, category }, this.paginator);
    this.implementFilters(filters);
  }

  implementFilters(filters: PeFilterChange[]) {
    if (filters.length) {
      filters.forEach((filter) => {
        this.items = this.items.filter((item) => {
          const isFound = new RegExp((filter.search as string).toLowerCase())
            .test((item.title as string).toLowerCase());

          return filter.contain === 'contains' ? isFound : !isFound;
        });
      });
    } else {
      this.items = this.store.selectSnapshot(PebEmployeesState.selectedFolderItems);
    }
  }

  viewChange(event: PeGridView): void {
    localStorage.setItem(LSView, event);
  }

  actionClick(event) {
    this.openEditUserDialog(event.id);
  }

  itemContextMenu(item: EmployeesGridItemInterface): PeGridMenu {
    const menu = {
      title: this.translationService.translate('form.create_form.employee.context_menu.title'),
      items: [
        {
          label: this.translationService.translate('pages.employees.datagrid.list.approve'),
          value: ContextEnum.Approve,
        },
        {
          label: this.translationService.translate('dialogs.item_delete.confirm'),
          value: ContextEnum.Delete,
        },
      ],
    };

    (item.data.status === EmployeeStatusEnum.invited || item.data.status === EmployeeStatusEnum.inactive)
    && menu.items.unshift({
      label: this.translationService.translate('pages.employees.datagrid.list.resend'),
      value: ContextEnum.Resend,
    });

    const param = this.route.snapshot.queryParams[PARAM];
    const category = this.route.snapshot.queryParams[CATEGORY];

    if (param === groupQueryParam && category) {
      menu.items.push({
        value: ContextEnum.DeleteFrom,
        label: this.translationService.translate('actions.delete_from_group'),
      });
    }

    return menu;
  }

  chosenFileForImport(data: OutputImportedFileInterface): void {
    this.apiService.importFromFile(this.businessEnvService.businessUuid, data.file).pipe(
      tap((items) => {
        this.employeesService.addImportedEmployees(items);
        this.showSnackbar(this.translateService.translate('pages.employees.datagrid.common.successful_imported'));
        this.cdr.markForCheck();
      }),
      catchError((err: HttpErrorResponse) => {
        this.snackbarService.toggle(
          true,
          {
            content: err.error?.message
              ? `${this.translateService.translate('errors.title')}: ${err.error?.message}`
              : this.translateService.translate('upload_failed'),
            duration: 5000,
            iconId: 'icon-alert-24',
            iconSize: 24,
          },
        );

        return of(err);
      }),
    ).subscribe();
  }

  ngOnDestroy() {
    this.employeesStorage.isEmployeesLoaded = false;
    this.headerService.removeSidenav(SIDENAV_NAME);
    this.store.dispatch(new PeGridStoreActions.Clear());
  }

  toggleSidebar(): void {
    this.peGridSidenavService.toggleViewSidebar();
    this.cdr.detectChanges();
  }

  private showSnackbar(message) {
    this.snackbarService.toggle(
      true,
      {
        content: message,
        duration: 5000,
        iconId: 'icon-commerceos-success',
        iconSize: 24,
      });
  }

  private addSidenavItem(): void {
    this.headerService.assignSidenavItem({
      name: SIDENAV_NAME,
      active: this.peGridSidenavService.toggleOpenStatus$.value,
      item: {
        title: this.translationService.translate('sidebar.sections.navigation.panels.employees'),
        iconType: 'vector',
        icon: '#icon-arrow-left-48',
        iconDimensions: {
          width: '12px',
          height: '20px',
        },
        onClick: () => {
          this.toggleSidebar();
        },
      },
    });
  }
}
