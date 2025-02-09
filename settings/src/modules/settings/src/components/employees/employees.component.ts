import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  OnDestroy,
  OnInit, QueryList, ViewChild, ViewContainerRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PeDataGridSidebarService, SidebarFiltersWrapperComponent, TreeSidebarFilterComponent } from '@pe/sidebar';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { PebEmployeeSidebarService } from './services/sidebar/employee-sidebar.service';

import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { NestedTreeControl } from '@angular/cdk/tree';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import {
  AppThemeEnum, MenuSidebarFooterData,
  MessageBus,
  PeDataGridButtonAppearance,
  PeDataGridFilterItem,
  PeDataGridFilterType,
  PeDataGridMultipleSelectedAction,
  PeDataGridSingleSelectedAction,
  PeDataGridSortByAction,
  PeDataGridSortByActionIcon, PeDragDropService, PeSearchItem, TreeFilterNode,
} from '@pe/common';
import { PeDataGridComponent } from '@pe/data-grid';
import { TranslateService } from '@pe/i18n';
import { takeUntil, tap } from 'rxjs/internal/operators';
import { delay, filter, pluck } from 'rxjs/operators';
import {
  closeConfirmationQueryParam,
  GridExpandAnimation,
  MobileSidebarAnimation,
  SidebarAnimation, SidebarAnimationProgress,
} from '../../misc/constants';
import { OVERLAY_POSITIONS } from '../../misc/constants/position';
import { PositionsEnum } from '../../misc/enum';
import { ApiService, BusinessEnvService } from '../../services';
import { AbstractComponent } from '../abstract';
import { DeleteWindowsConfirmationComponent } from '../dialogs/delete-item-confirm/delete-confirm.component';
import { CloseWindowsConfirmationComponent } from '../dialogs/exit-confirm/exit-confirm.component';
import { positionQueryParam } from './constants';
import { GridSortingFieldsEnum } from './enums/grid-sorting-fields.enum';
import { ContextEnum, navbarFilterKeysEnum } from './enums/navbar-filter-keys.enum';
import { SidebarCategoryInterface } from './interfaces';
import { IGroupItemInterface } from './interfaces/employee-group.interface';
import { EmployeesGridItemInterface } from './interfaces/employees-grid-item.interface';
import { PebBusinessEmployeesStorageService } from './services/business-employees-storage/business-employees-storage.service';
import { PebBusinessEmployeesService } from './services/business-employees/business-employees.service';
import { PebEmployeeDialogOpenerService } from './services/employee-dialog-opener/peb-employee-dialog-opener.service';

@Component({
  selector: 'peb-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [SidebarAnimation, MobileSidebarAnimation, GridExpandAnimation],
})
export class EmployeesComponent extends AbstractComponent implements OnInit, AfterViewInit, OnDestroy {

  theme = this.businessEnvService.businessData$?.themeSettings?.theme
    ? AppThemeEnum[this.businessEnvService.businessData$?.themeSettings?.theme]
    : AppThemeEnum.default;
  @ContentChildren(SidebarFiltersWrapperComponent)
  sidebarFilters: QueryList<SidebarFiltersWrapperComponent>;
  @ViewChild(TreeSidebarFilterComponent) filterComponent: TreeSidebarFilterComponent;

  private readonly gridAnimationProgressStream$ = new Subject<SidebarAnimationProgress>();

  contextActions = [];
  sidebarContextActions = [];
  contextRef: OverlayRef;
  contextMenuClickedItem: any;
  currentSidebarItemSelected = '';
  isPositionSelected = null;

  private showSidebarStream$ = new BehaviorSubject<boolean>(true);
  @ViewChild('dataGridComponent') datagrid: PeDataGridComponent;
  @ViewChild('dataGridComponent') set setDataGrid(dataGrid: PeDataGridComponent) {
    if (dataGrid?.showFilters$) {
      dataGrid.showFilters$.subscribe(value => {
        if (value !== this.showSidebarStream$.value) {
          this.showSidebarStream$.next(value);
        }
      });
    }
  }

  showSidebar$ = this.showSidebarStream$.asObservable().pipe(delay(0));
  isFilterCreating = false;

  set showSidebar(value: boolean) {
    this.showSidebarStream$.next(value);
  }

  filters: PeDataGridFilterType[] = [
    {
      title: 'Albums',
      items: [
        {
          key: '1',
          title: 'Test filter 1',
          image: './assets/icons/album-icon-filter@3x.png',
        },
        {
          key: '2',
          title: 'Test filter 2',
          image: './assets/icons/album-icon-filter@3x.png',
        },
      ],
    },
    {
      title: 'Color',
      items: [
        {
          key: '21sdgf',
          image: './assets/icons/album-icon-filter@3x.png',
          title: 'Red',
        },
        {
          key: '21sdgf',
          image: './assets/icons/album-icon-filter@3x.png',
          title: 'Green',
        },
      ],
    },
  ];

  sidebarCategories: SidebarCategoryInterface[] = [];
  groupCategories: SidebarCategoryInterface[] = [];

  formGroup = this.fb.group({
    tree: [[]],
    toggle: [false],
  });

  gridOptions = {
    nameTitle: 'Name',
    customFieldsTitles: ['Position', 'Mail', 'Status'],
  };

  refreshSubject$ = new BehaviorSubject(true);
  private treeControl: NestedTreeControl<TreeFilterNode>;

  set gridAnimationProgress(value: SidebarAnimationProgress) {
    this.gridAnimationProgressStream$.next(value);
  }

  addItemAction: PeDataGridSingleSelectedAction = {
    label: 'Add New Employee',
    callback: () => {
      this.openNewUserDialog();
    },
  };

  addNewItem = {
    title: 'Add new',
    actions: [this.addItemAction],
  };
  // grid items
  items$: Observable<EmployeesGridItemInterface[]>;
  selectedItems$: Observable<string[]>;

  // navbar items
  searchItems$: Observable<PeSearchItem[]>;

  // Items selection handlers
  multipleSelectedActions: PeDataGridMultipleSelectedAction[] = [
    {
      label: this.translationService.translate('pages.employees.datagrid.common.choose_action'),
      appearance: PeDataGridButtonAppearance.Button,
      actions: [
        {
          label: this.translationService.translate('pages.employees.datagrid.common.select_all'),
          callback: () => {
            this.employeesService.selectAllEmployees();
          },
        },
        {
          label: this.translationService.translate('pages.employees.datagrid.common.unselect'),
          callback: (ids: string[]) => {
            this.employeesService.deselectEmployee(ids);
          },
        },
        {
          label: this.translationService.translate('pages.employees.datagrid.common.delete_employees'),
          callback: (ids: string[]) => {
            this.showConfirmationDeleteDialog(this.removeEmployees, ids);
          },
        },
      ],
    },
  ];

  editEmployee: PeDataGridSingleSelectedAction = {
    label: '',
    callback: (id) => {
      this.openEditUserDialog(id);
    },
  };
  // Sort by handlers
  sortByActions: PeDataGridSortByAction[] = [
    {
      label: this.translationService.translate('pages.employees.datagrid.common.sort_actions.name'),
      icon: PeDataGridSortByActionIcon.Name,
      callback: () => {
        this.employeesService.sortEmployees(GridSortingFieldsEnum.Name);
      },
    },
    {
      label: this.translationService.translate('pages.employees.datagrid.common.sort_actions.positions'),
      icon: PeDataGridSortByActionIcon.Ascending,
      callback: () => {
        this.employeesService.sortEmployees(GridSortingFieldsEnum.Position);
      },
    },
    {
      label: this.translationService.translate('pages.employees.datagrid.common.sort_actions.email'),
      icon: PeDataGridSortByActionIcon.Descending,
      callback: () => {
        this.employeesService.sortEmployees(GridSortingFieldsEnum.Email);
      },
    },
    {
      label: this.translationService.translate('pages.employees.datagrid.common.sort_actions.status'),
      icon: PeDataGridSortByActionIcon.Date,
      callback: () => {
        this.employeesService.sortEmployees(GridSortingFieldsEnum.Status);
      },
    },
  ];

  // filters
  filterItems: PeDataGridFilterItem[] | any[] = [
    {
      label: this.translationService.translate('pages.employees.datagrid.navbar_filters.name'),
      value: navbarFilterKeysEnum.Name,
    },
  ];

  sidebarFooterData: MenuSidebarFooterData = {
    headItem: {
      title: this.translationService.translate('pages.employees.datagrid.sidebar.menu_title'),
    },
    menuItems: [
        {
          title: 'New group',
          onClick: () => {
            this.openAddEmployeeGroup();
          },
        },
    ],
  };

  employeesSidebarControl = this.fb.control([]);

  businessId: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private sidebarService: PebEmployeeSidebarService,
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private dataGridSidebarService: PeDataGridSidebarService,
    private dragDropService: PeDragDropService,
    private domSanitizer: DomSanitizer,
    private employeesService: PebBusinessEmployeesService,
    private businessEnvService: BusinessEnvService,
    private translationService: TranslateService,
    protected overlay: Overlay,
    private dialog: MatDialog,
    private messageBus: MessageBus,
    protected viewContainerRef: ViewContainerRef,
    protected employeeDialogService: PebEmployeeDialogOpenerService,
    protected employeesStorage: PebBusinessEmployeesStorageService,
  ) {
    super();
  }

  toggleSidebar() {
    this.sidebarService.toggleSidebar();
  }

  navigateTolLink(e) {
    this.onEmployeesPositionSelect(e);
  }

  ngOnInit() {
    this.fillGridContextMenu();
    this.fillSidebarContextMenu();
    this.getEmployeeGroupList();
    this.sidebarCategories = [this.sidebarService.getEmployeePositionsTree()];
    this.items$ = this.employeesService.getEmployeesObservable$();
    this.selectedItems$ = this.employeesService.getSelectedObservable$();
    this.searchItems$ = this.employeesService.getNavbarFiltersObservable$();

    this.apiService.getBusinessEmployeeGroupList(this.businessEnvService.businessUuid).subscribe(
      res => {
        this.employeesStorage.groups = res;
        this.groupCategories = [this.sidebarService.getEmployeeGroupsTree(res?.data)];
        this.cdr.detectChanges();
      },
    );

    this.route.queryParams.pipe(
      takeUntil(this.destroyed$),
    ).subscribe(params => {
      const position = params[positionQueryParam];
      this.currentSidebarItemSelected = this.currentSidebarItemSelected !== position ? position : '';

      this.isPositionSelected = Object.values(PositionsEnum).find(value => value === this.currentSidebarItemSelected) || !this.currentSidebarItemSelected;
      if (!this.isPositionSelected) {
        if (!this.contextActions.find(action => action?.id === ContextEnum.DeleteFrom)) {
          this.contextActions.push({
            id: ContextEnum.DeleteFrom,
            label: this.translationService.translate('actions.delete_from_group'),
            callback: this.onDeleteFromGroup,
          });
        }
      } else {
        const searchAction = this.contextActions.find(action => action?.id === ContextEnum.DeleteFrom);
        if (searchAction) {
          this.contextActions.splice(this.contextActions.indexOf(searchAction, 1));
        }
      }

      if (this.datagrid) {
        this.datagrid.selectedItems = [];
      }

      this.employeesService.loadEmployees(position, this.isPositionSelected);
    });

    this.messageBus.listen('settings.edit.employee').pipe(takeUntil(this.destroyed$)).subscribe((id: string) => {
      this.employeesService.editEmployee(id);
    });

    this.messageBus.listen('settings.resend.employee.invitation').pipe(takeUntil(this.destroyed$)).subscribe((id: string) => {
      this.employeesService.inviteEmployeeToGroups(id);
    });

    this.dragDropService.dragDropChange$.pipe(takeUntil(this.destroyed$)).subscribe(data => {
      if (data?.dragItem?.id && data.dropItem?.id) {
        this.apiService.createBusinessEmployeeInGroup(
          this.businessEnvService.businessUuid,
          data.dropItem.id,
          [data.dragItem.id]).subscribe((result: IGroupItemInterface) => {
          this.employeesStorage.groups.data.find(group => group._id === result._id).employees = result.employees;
        });
      }
    });
    this.employeesSidebarControl.valueChanges
      .pipe(takeUntil(this.destroyed$))
      .subscribe(value => this.onEmployeesPositionSelect(value));

    this.route.queryParams.pipe(
      pluck(closeConfirmationQueryParam),
      filter(showDialog => !!showDialog),
      takeUntil(this.destroyed$),
    ).subscribe( () => {
      this.showConfirmationDialog('');
    });
    this.dataGridSidebarService.toggleFilters$.next();
  }

  ngAfterViewInit() {
    const initialPosition = this.route.snapshot.queryParams[positionQueryParam];
    const selectedNode = this.sidebarCategories[0].tree.find(item => item.name === initialPosition);

    if (selectedNode) {
      this.filterComponent.nodeToggle(selectedNode, new Event('click'));
    }
  }

  onSearchRemove(deletingIndex: number) {
    this.employeesService.deleteNavbarFilter(deletingIndex);
  }

  onSearchChanged(searchItem: PeSearchItem) {
    this.employeesService.addNewNavbarFilter(searchItem);
  }

  onBranchCreate(name, category) {
    category.title = name;
  }

  onFilterCreate(name) {
    this.isFilterCreating = false;
    const albums: any = this.filters[0];
    albums.items = [
      ...albums.items,
      {
        key: '3',
        title: name,
        image: './assets/icons/album-icon-filter@3x.png',
      },
    ];
  }

  onToggleSidebar() {
    this.dataGridSidebarService.toggleFilters$.next();
  }

  onCreateTreeControl(treeControl) {
    this.treeControl = treeControl;
  }

  openNewUserDialog() {
    this.employeesService.createEmployee( this.isPositionSelected
      ? null
      : this.employeesStorage.groups?.data.find(group => group.name === this.currentSidebarItemSelected)?._id,
    );
  }

  openEditUserDialog(id) {
    this.employeesService.editEmployee(id);
  }

  onEmployeesPositionSelect(node) {
    const nodeData = node;
    if (!nodeData) {
      this.router.navigate([]);

      return;
    }

    const queryParams = {};
    queryParams[positionQueryParam] = this.currentSidebarItemSelected !== nodeData?.data?.category ? nodeData?.data?.category : '';

    this.router.navigate([], {queryParams});
  }

  onDeleteItem = (e) => {
    this.showConfirmationDeleteDialog(this.removeEmployees, [this.contextMenuClickedItem.id]);
    this.closeContextMenu();
  }

  onDeleteFromGroup = () => {
    this.showConfirmationDeleteDialog(this.removeEmployeesFromGroup, [this.contextMenuClickedItem.id]);
    this.closeContextMenu();
  }

  onEditItem = (e) => {
    this.openEditUserDialog(this.contextMenuClickedItem.id);
    this.closeContextMenu();
  }

  fillGridContextMenu() {
    this.contextActions = [
      {
        id: ContextEnum.Edit,
        label: this.translationService.translate('actions.edit'),
        callback: this.onEditItem,
      },
      {
        id: ContextEnum.Delete,
        label: this.translationService.translate('actions.delete'),
        callback: this.onDeleteItem,
      },
    ];
  }

  fillSidebarContextMenu() {
    this.sidebarContextActions = [
      {
        id: ContextEnum.Edit,
        label: this.translationService.translate('actions.edit'),
        callback: this.onEditEmployeeGroup,
      },
      {
        id: ContextEnum.Delete,
        label: this.translationService.translate('actions.delete'),
        callback: this.onDeleteEmployeeGroup,
      },
    ];
  }

  closeContextMenu() {
    if (this.contextRef) {
      this.contextRef.dispose();
    }
  }

  openContextMenu(event: any, item, context) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();

      this.contextMenuClickedItem = item || null;
      this.contextRef = this.overlay.create({
        positionStrategy: this.overlay
          .position()
          .flexibleConnectedTo(event)
          .withFlexibleDimensions(false)
          .withViewportMargin(10)
          .withPositions(OVERLAY_POSITIONS),
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
        hasBackdrop: true,
        backdropClass: 'connect-context-menu-backdrop',
      });

      this.contextRef.backdropClick().pipe(
        tap(() => this.closeContextMenu()),
      ).subscribe();

      this.contextRef.attach(new TemplatePortal(context, this.viewContainerRef));
    } else {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  openAddEmployeeGroup(id: string = null) {
    if (id) {
      this.sidebarService.editEmployeeGroup(id, this.employeesStorage.groups.data.find(group => group._id === id))
        .pipe(takeUntil(this.destroyed$))
        .subscribe(updatedGroup => {
        this.employeesStorage.groups.data.find(group => group._id === updatedGroup._id).name = updatedGroup.name;
        this.groupCategories = [this.sidebarService.getEmployeeGroupsTree(this.employeesStorage.groups?.data)];
        this.cdr.detectChanges();
      });
    } else {
      this.sidebarService.createEmployeeGroup().pipe(takeUntil(this.destroyed$)).subscribe(createdGroup => {
        if (createdGroup) {
          this.employeesStorage.groups.data.push(createdGroup);
          this.groupCategories = [this.sidebarService.getEmployeeGroupsTree(this.employeesStorage.groups?.data)];
          this.cdr.detectChanges();
        }
      });
    }
  }

  onDeleteEmployeeGroup = (e) => {
    this.showConfirmationDeleteDialog(this.removeGroup, this.contextMenuClickedItem.id);
    this.closeContextMenu();
  }

  onEditEmployeeGroup = (e) => {
    this.openAddEmployeeGroup(this.contextMenuClickedItem.id);
    this.closeContextMenu();
  }

  showConfirmationDialog = (data) => {
    const dialogRef = this.dialog.open(CloseWindowsConfirmationComponent, {
      panelClass: [ 'settings-dialog', this.theme],
      data,
      hasBackdrop: false,
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(result => {
        if (result.exit) {
          this.employeeDialogService.dialogRef.close();
        }
        this.route.queryParams.pipe(takeUntil(this.destroyed$)).subscribe(
          res => {
            const queryParams = {};
            if (res[positionQueryParam]) {
              queryParams[positionQueryParam] = res[positionQueryParam];
            }

            this.router.navigate([], { queryParams });
          });
      });
  }

  showConfirmationDeleteDialog(action, ids) {
    const dialogRef = this.dialog.open(DeleteWindowsConfirmationComponent, {
      panelClass: [ 'settings-dialog', this.theme],
      data: ids,
      hasBackdrop: false,
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(result => {
        if (result.exit) {
          action(ids);
        }
        this.route.queryParams.pipe(takeUntil(this.destroyed$)).subscribe(
          res => {
            const queryParams = {};
            if (res[positionQueryParam]) {
              queryParams[positionQueryParam] = res[positionQueryParam];
            }

            this.router.navigate([], { queryParams });
          });
      });
  }

  removeEmployees = (ids) => {
    this.employeesService.deleteSelectedEmployees(ids);
    this.datagrid.selectedItems = [];
    this.cdr.detectChanges();
  }

  removeEmployeesFromGroup = (employeeId) => {
    const group = this.employeesStorage.groups?.data.find(res => res.name === this.currentSidebarItemSelected);
    this.apiService.deleteEmployeeFromGroup(this.businessEnvService.businessUuid, group._id, employeeId).subscribe(res => {
      const employees = this.employeesStorage.groups.data.find(gr => gr._id === group._id).employees;
      employees.splice(employees.indexOf(employees.find(employee => employee === employeeId)));
      this.employeesStorage.groups.data.find(item => item._id === group._id).employees = employees;
      this.employeesService.refreshExistEmployees();
    });
    this.datagrid.selectedItems = [];
    this.cdr.detectChanges();
  }

  removeGroup = (id) => {
    this.apiService.deleteEmployeeGroup(this.businessEnvService.businessUuid, id).subscribe(
      res => {
        this.employeesStorage.groups.data.splice(
          this.employeesStorage.groups.data.indexOf(this.employeesStorage.groups.data.find(group => group.name === res.name)), 1);
        this.groupCategories = [this.sidebarService.getEmployeeGroupsTree(this.employeesStorage.groups.data)];
        this.cdr.detectChanges();
      });
  }

  getEmployeeGroupList() {
    this.apiService.getBusinessEmployeeGroupList(this.businessEnvService.businessUuid)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((groups) => {
        this.employeesStorage.groups = groups;
      });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.employeesStorage.isEmployeesLoaded = false;
  }

  endDrag($event, item = null) {
    if (item) {
      this.dragDropService.setDropItem(item);
    }
  }

  startDrag(item) {
    this.dragDropService.setDragItem(item);
  }
}
