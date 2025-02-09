import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  Inject,
  Injector,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { isEqual, orderBy } from 'lodash';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, delay, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ConnectionPositionPair,
  Overlay,
  OverlayRef,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';

import {
  AppThemeEnum,
  MenuSidebarFooterData,
  MessageBus,
  EnvService,
  PeDataGridButtonAppearance,
  PeDataGridFilterType, PeDataGridItem,
  PeDataGridListOptions,
  PeDataGridMultipleSelectedAction,
  PeDataGridSingleSelectedAction,
  PeDataGridSortByAction,
  PeDataGridSortByActionIcon,
  PeSearchItem,
  TreeFilterNode,
} from '@pe/common';
import { LocaleConstantsService, TranslateService } from '@pe/i18n';
import {
  DataGridContextMenuEnum,
  PeDataGridComponent,
  PeDataGridService,
  PeDataGridSidebarService,
} from '@pe/data-grid';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';

import { PeCoupon } from '../../misc/interfaces/coupon.interface';
import { PeCouponCustomer } from '../../misc/interfaces/coupon-customer.interface';
import { PeCouponCountry } from '../../misc/interfaces/coupon-country.interface';
import { PeCouponsApi } from '../../services/abstract.coupons.api';
import { PeCouponsOverlayService } from '../../misc/services/coupons-overlay/coupons-overlay.service';
import { PeCouponsFormComponent } from '../form/coupons-form.component';
import { PeFolder } from '../../misc/interfaces/folder.interface';
import { PeDeleteConfirmationDialog } from '../dialogs/delete-confirmation-dialog/delete-confirmation.dialog';
import { PeDeleteCouponConfirmationDialog } from '../dialogs/delete-coupon-confirmation-dialog/delete-coupon-confirmation-dialog';
import { PeMoveToFolderDialog } from '../dialogs/move-to-folder-dialog/move-to-folder.dialog';
import { DataGridService } from '../../services/data-grid.service';
import { PeInfoDialog } from '../dialogs/info-dialog/info.dialog';
import { DestroyService } from '../../misc/services/destroy.service';


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

@Component({
  selector: 'pe-coupons-grid',
  templateUrl: './coupons-grid.component.html',
  styleUrls: ['./coupons-grid.component.scss'],
  providers: [
    DestroyService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeCouponsGridComponent
  implements OnInit {

  dataGrid: any;

  @ViewChild(PeDataGridComponent) set setDataGrid(
    dataGrid: PeDataGridComponent,
  ) {
    console.log('dataGridComponent ', dataGrid);
    this.dataGrid = dataGrid;
    if (dataGrid?.showFilters$) {
      dataGrid.showFilters$.subscribe((value) => {
        if (value !== this.showSidebarStream$.value) {
          this.showSidebarStream$.next(value);
        }
      });
    }
  }

  constructor(
    private apiService: PeCouponsApi,
    private formBuilder: FormBuilder,
    private localConstantsService: LocaleConstantsService,
    private overlayService: PeCouponsOverlayService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    public route: ActivatedRoute,
    private overlay: Overlay,
    private envService: EnvService,
    private messageBus: MessageBus,
    public dataGridService: DataGridService,
    private viewContainerRef: ViewContainerRef,
    private translateService: TranslateService,
    private dataGridSidebarService: PeDataGridSidebarService,
    private peDataGridService: PeDataGridService,
    private headerService: PePlatformHeaderService,
    private readonly destroy$: DestroyService,
  ) {
    this.listenToggleSidebar();
  }

  get selectedCouponsItem(): string[] {
    return this.selectedCouponsStream$.value;
  }

  set selectedCouponsItem(ids: string[]) {
    this.selectedCouponsStream$.next(ids);
  }

  get gridItems(): PeDataGridItem[] {
    return this.gridItemsStream$.value;
  }

  set gridItems(items: PeDataGridItem[]) {
    this.gridItemsStream$.next(items);
  }

  get items() {
    return this.itemsSubject.getValue();
  }

  set items(items) {
    this.itemsSubject.next(items);
  }

  get unfilteredItems() {
    return this.unfilteredItemsSubject.getValue();
  }

  set unfilteredItems(items) {
    this.unfilteredItemsSubject.next(items);
  }

  get folders() {
    return this.foldersSubject.getValue();
  }

  set folders(items) {
    this.foldersSubject.next(items);
  }

  set showSidebar(value) {
    this.showSidebarStream$.next(value);
  }
  public folderTreeData = [];

  public filters: PeDataGridFilterType[] = [];

  public gridOptions: PeDataGridListOptions = {
    nameTitle: this.translateService.translate('coupons'),
    customFieldsTitles: [
      this.translateService.translate('filters.labels.channel'),
      this.translateService.translate('filters.labels.category'),
      this.translateService.translate('filters.labels.price'),
      `${this.translateService.translate('variants')} / ${this.translateService.translate('stock')}`,
    ],
  };
  public multipleSelectedActions: PeDataGridMultipleSelectedAction[];
  public sidebarProgramsControls: MenuSidebarFooterData;
  public formGroup: FormGroup;
  public selectedProgram: TreeFilterNode;
  public refreshSubject$ = new BehaviorSubject(true);
  public selectedItems: PeDataGridItem[] = [];
  public showSidebarStream$ = new BehaviorSubject<boolean>(true);
  public showSidebar$ = this.showSidebarStream$.asObservable().pipe(delay(0));
  public theme = this.envService?.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;
  public leftPaneButtons = [];
  public selectedCoupon = new BehaviorSubject<PeDataGridItem>(null);

  private itemsSubject = new BehaviorSubject<PeDataGridItem[]>([]);
  private unfilteredItemsSubject = new BehaviorSubject<PeDataGridItem[]>([]);
  private foldersSubject = new BehaviorSubject<PeFolder[]>([]);
  private gridItemsStream$ = new BehaviorSubject<PeDataGridItem[]>([]);
  private selectedCouponsStream$ = new BehaviorSubject<string[]>([]);
  private customersSource: PeCouponCustomer[];
  private countries: PeCouponCountry[];
  private overlayRef: OverlayRef;
  private selectedFolder: any;
  private contextSelectedCoupon: any;
  private couponsList: any[] = [];

  searchItems: PeSearchItem[] = [];
  couponId: Array<PeCoupon | string> = [];
  folderId: Array<PeFolder | string | Array<TreeFilterNode<any>>> = [];

  @ViewChild('couponContextMenu') contextMenu: TemplateRef<any>;
  @ViewChild('foldersContextMenu') foldersContextMenu: TemplateRef<any>;
  @ViewChild('nodeImageTemplate') nodeImageTemplate: TemplateRef<any>;

  loadFolders = new BehaviorSubject<boolean>(null);
  loadCoupons = new BehaviorSubject<boolean>(null);
  selectedCoupons = [];

  readonly items$ = this.itemsSubject.asObservable();

  addItem: PeDataGridItem = {
    selected: false,
  };

  public addActions: PeDataGridSingleSelectedAction[] = [
    {
      label: 'New Coupon',
      callback: () => {
        this.openCoupon();
      },
    },
  ];

  public singleSelectedAction: PeDataGridSingleSelectedAction = {
    label: 'Open',
    callback: (id: string) => {
      this.openCoupon(id);
    },
  };

  public sortByActions: PeDataGridSortByAction[] = [
    {
      label: 'Name',
      callback: () => {
        const desc = orderBy(this.items, ['title'], ['desc']);
        const asc = orderBy(this.items, ['title'], ['asc']);

        this.items = isEqual(this.items, desc) ? asc : desc;
      },
      icon: PeDataGridSortByActionIcon.Name,
    },
  ];

  filterItems = [];

  private static focusInput() {
    const input = document.querySelector(
      '.sidebar-tree__input',
    ) as HTMLInputElement;
    if (input) {
      input.focus();
    }
  }

  ngOnInit() {
    of([''])
    .pipe(
      switchMap(() => {
        this.initGrid();
        this.initSideBarFilters();

        this.getCountries();
        return this.loadFolders.pipe(switchMap(() => this.getCouponsFolders()));
      }),
      switchMap(() => {
        return this.loadCoupons.pipe(
          switchMap(() => {
            return this.route.queryParams.pipe(switchMap(params => this.getCouponsList(params)));
          }),
        );
      }),
      switchMap(() => {
        return this.peDataGridService.selectedItems$.pipe(
          tap((items: string[]) => {
            this.selectedCoupons = items;
          }),
        );
      }),
      takeUntil(this.destroy$),
    ).subscribe();
    // this._getChannels();


    this.headerService.assignConfig({
      isShowDataGridToggleComponent: true,
      showDataGridToggleItem: {
        onClick: () => {
          this.showSidebar = !this.showSidebarStream$.value;
        },
      },
    } as PePlatformHeaderConfig);
  }

  private initGrid() {
    this.multipleSelectedActions = [
      {
        label: 'Choose action',
        appearance: PeDataGridButtonAppearance.Button,
        actions: [
          {
            label: 'Select all',
            callback: (ids: string[]) => {
              this.handleSelectAllCoupons(ids);
            },
          },
          {
            label: 'Deselect all',
            callback: (ids: string[]) => {
              this.handleDeselectAllCoupons(ids);
            },
          },
          {
            label: 'Delete',
            callback: (ids: string[]) => {
              this.handleDeleteCoupons(ids);
            },
          },
          {
            label: 'Move To Folder',
            callback: (ids: string[]) => {
              this.handleMoveToFolder(ids);
            },
          },
        ],
      },
    ];
  }

  private initSideBarFilters() {
    this.formGroup = this.formBuilder.group({
      program: [],
      navigation: [[]],
      toggle: [true],
    });

    this.sidebarProgramsControls = {
      headItem: {
        title: 'Folder',
      },
      menuItems: [
        {
          title: 'Add New Folder',
          onClick: () => {
            this.handleAddFolderClick();
          },
        },
        {
          title: 'Rename', onClick: () => {
            this.handleRenameFolderClick();
          },
        },
        {
          title: 'Delete',
          color: 'red',
          onClick: () => {
            this.handleDeleteFolderClick();
          },
        },
      ],
    };

    // this.formGroup.valueChanges.pipe(tap(() => {})).subscribe();
  }

  async getCouponsList(filter?: any) {
    this.selectedFolder = this.folderTreeData.find(folder => folder.id === filter.parentFolder);
    this.couponsList = await this.apiService.getCouponsList(filter).toPromise();
    const items = this.couponsList.map(coupon =>
      this.couponGridItemPipe(coupon),
    );
    this.items = items;
    this.unfilteredItems = items;
  }

  private getCouponsFolders() {
    const mapTreeNodeToFolder = (couponsFolderTree) => {
      return couponsFolderTree.map((treeFolder) => {
        treeFolder.id = treeFolder._id;
        treeFolder.name = treeFolder.name;
        treeFolder.children = mapTreeNodeToFolder(treeFolder.children);
        return treeFolder;
      });
    };
    return this.apiService
      .getCouponsFolders()
      .pipe(
        takeUntil(this.destroy$),
        tap((couponsFolderTree) => {
          this.folderTreeData = [...mapTreeNodeToFolder(couponsFolderTree)];
          this.refreshSubject$.next(true);
          this.cdr.detectChanges();
        }),
      );
  }

  private getCountries() {
    const countryList = this.localConstantsService.getCountryList();

    this.countries = [];

    Object.keys(countryList).map((countryKey) => {
      this.countries.push({
        _id: countryKey,
        title: Array.isArray(countryList[countryKey])
          ? countryList[countryKey][0]
          : countryList[countryKey],
      });
    });
  }

  private handleAddFolderClick() {
    const selectedFolder: PeFolder = {
      name: this.selectedProgram?.name,
      image: this.selectedProgram?.image,
      _id: this.selectedProgram?.id,
      parentFolder: this.selectedProgram?.parentId,
    };
    this.openCouponFolder();
  }

  private getChannels() {
    this.apiService
      .getChannels()
      .pipe(
        map((request) => {
          console.log(request);
        }),
        tap(),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  public handleDeleteFolderClick() {
    const selectedFolder: PeFolder = {
      name: this.selectedFolder?.name,
      image: this.selectedFolder?.image,
      _id: this.selectedFolder?.id,
      parentFolder: this.selectedFolder?.parentId,
    };
    this.closeContextMenu();
    if (this.checkIsEmptyFolder(this.selectedFolder?.id)) {
      this.openNotEmptyAlert();
    } else {
      this.openConfirmDeleteFolder(selectedFolder);
    }
  }

  openNotEmptyAlert() {
    const dialogRef = this.overlayService.open(
      { data: {
        title: 'Delete Folder',
        infoText: 'You can’t delete this folder, it’s not empty',
      }, height: 390 as any, width: 350 },
      PeInfoDialog,
    );
  }

  public handleRenameFolderClick() {
    this.closeContextMenu();
    this.selectedFolder.editing = true;
    this.cdr.detectChanges();
  }

  private onRenameNode(node: any) {
    this.apiService.updateCouponsFolder(node.id, { name: node.name })
    .pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: resp => {
        console.log(resp);
      }
    });
  }

  private handleSelectAllCoupons(ids: string[]) {
    this.dataGrid.selectedItems = this.items.reduce((acc, item) => [...acc, item.id], [] );
  }

  private handleDeselectAllCoupons(ids: string[]) {
    this.items = this.items.map(item => ({...item, selected: false}));
    this.dataGrid.selectedItems = [];
  }

  private handleDeleteCoupons(ids: string[]) {
    this.openConfirmDeleteCoupons(ids);
  }

  handleMoveToFolder(ids: string[]) {
    this.closeContextMenu();
    this.openMoveToFolderDialog(ids);
    // this.selectedCoupon.next(this.contextSelectedCoupon.id);
  }

  openMoveToFolderDialog(folderId?: string[]) {
    const data = {
      id: folderId,
    };

    console.log('openMoveToFolderDialog ', this.selectedCoupons);

    const dialogRef = this.overlayService.open(
      { data, disableClose: false, height: 230 as any, width: 550 },
      PeMoveToFolderDialog,
    );

    dialogRef.afterClosed
      .pipe(
        switchMap(async (data) => {
          console.log('openMoveToFolderDialog close: ', data);
          if (data) {
            for (const element of (data.couponId.length ? data.couponId : this.selectedCoupons)) {
              this.couponId = [...this.couponId, element];
              await this.apiService.updateCouponFolder(
                { parentFolder: data.folderId, couponId: element }).toPromise();
            }
            this.loadCoupons.next(true);
          }
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  async handleMoveCouponHere() {
    const selectedCoupon = await this.selectedCoupon.pipe(take(1)).toPromise();
    console.log('handleMoveCouponHere ', selectedCoupon);
    try {
      if (!selectedCoupon) throw new Error('No coupon selected');

      await this.apiService.updateCouponFolder(
        { parentFolder: this.selectedFolder.id, couponId: selectedCoupon.id }).toPromise();
      this.selectedCoupon.next(null);
      this.loadCoupons.next(true);
    } catch (e) {
      console.error('Error in saving the data');
    }


  }

  private openConfirmDeleteCoupons(ids?: string[]) {
    if (ids) {
      const dialogRef = this.overlayService.open(
        { data: ids, height: 475 as any, width: 350 },
        PeDeleteCouponConfirmationDialog,
      );
      dialogRef.afterClosed
        .pipe(
          tap((data) => {
            if (data) {
              this.loadCoupons.next(true);
            }
          }),
          takeUntil(this.destroy$),
        )
        .subscribe();
    }
  }

  private openCouponFolder() {
    this.folderTreeData.push({
      name: '',
      image: '/assets/icons/switch.png',
      editing: true,
    });
    this.refreshSubject$.next(true);
    PeCouponsGridComponent.focusInput();
  }

  private openConfirmDeleteFolder(folder?: PeFolder) {
    if (folder._id) {
      const dialogRef = this.overlayService.open(
        { data: folder, height: 475 as any, width: 350 },
        PeDeleteConfirmationDialog,
      );
      dialogRef.afterClosed
        .pipe(
          tap((data) => {
            if (data) {
              this.loadFolders.next(true);
              this.selectedProgram = null;
            }
          }),
          takeUntil(this.destroy$),
        )
        .subscribe();
    }
  }

  private listenToggleSidebar() {
    this.messageBus
      .listen('coupons.toggle.sidebar')
      .pipe(
        tap(() => this.toggleSidebar()),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  public onNodeClick(data: Array<TreeFilterNode<any>>) {
    this.selectedProgram = data[0];
    this.router.navigate([], {
      queryParams: {
        parentFolder: this.selectedProgram?.id,
      },
      queryParamsHandling: 'merge',
    });
  }

  public goToRoot() {
    this.selectedProgram = null;
    this.router.navigate([], {
      skipLocationChange: false,
    });
  }

  public onNodeCreate(node: TreeFilterNode<any>) {
    node.editing = true;
    const body = {
      name: node.name,
      parentFolder: undefined,
      image: '/assets/icons/switch.png',
      children: node.children,
    };
    this.apiService
      .postCouponsFolder(body)
      .pipe(
        tap(() => this.loadFolders.next(true)),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  openContextMenu(event: any, item, context) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!this.selectedCoupons.includes(item.id)) {
      this.selectedCoupons.push(item.id);
    }

    this.overlayRef = this.overlay.create({
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

    this.overlayRef
      .backdropClick()
      .pipe(tap(() => this.closeContextMenu()))
      .subscribe();

    this.overlayRef.attach(new TemplatePortal(context, this.viewContainerRef));
  }

  onFolderRightClick({ event, node }, context) {
    this.selectedFolder = node;
    this.openContextMenu(event, node, context);
  }

  onCouponRightClick(event, node, context) {
    this.contextSelectedCoupon = node;
    this.openContextMenu(event, node, context);
  }

  closeContextMenu() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }

  toggleSidebar() {
    this.dataGridSidebarService.toggleFilters$.next();
  }

  openCoupon(couponId?: string) {
    const data = {
      id: couponId,
      customersSource: this.customersSource,
      countries: this.countries,
    };

    const dialogRef = this.overlayService.open(
      { data, disableClose: true },
      PeCouponsFormComponent,
    );

    dialogRef.afterClosed
      .pipe(
        switchMap(async (data) => {
          if (data) {
            if (data.new && this.selectedFolder) {
              await this.apiService.updateCouponFolder(
                { parentFolder: this.selectedFolder.id, couponId: data.data._id }).toPromise();
            }

            this.loadCoupons.next(true);
          }
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  private couponGridItemPipe(coupon: PeCoupon) {
    return {
      id: coupon._id,
      title: coupon.code,
      description: coupon.description,
      labels: [coupon.status],
      selected: false,
      actions: [
        {
          label: 'Edit',
          callback: (id: string) => this.openCoupon(id),
        },
      ],
    };
  }

  updateItems(): void {
    let items = [...this.unfilteredItems];
    this.searchItems.forEach((filter) => {
      items = items.filter(coupon =>
        filter.contains !== 1
          ? (coupon.title as string).includes(filter.searchText)
          : !(coupon.title as string).includes(filter.searchText),
      );
    });
    this.items = items;
  }

  onSearchChange(e: PeSearchItem) {
    this.searchItems = [...this.searchItems, e];
    this.updateItems();
  }

  onSearchRemove(e: number) {
    this.searchItems.splice(e, 1);
    this.updateItems();
  }

  trackItem(index: number, item: any) {
    return item._id;
  }

  onGridContentContextMenu(data) {
    switch (data.event) {
      case DataGridContextMenuEnum.Edit:
        this.edit(data.item);
        break;
      case DataGridContextMenuEnum.Copy:
        this.copy(data.item);
        break;
      case DataGridContextMenuEnum.Paste:
        this.paste(data.item);
        break;
      case DataGridContextMenuEnum.Duplicate:
        this.duplicate(data.item);
        break;
      case DataGridContextMenuEnum.Delete:
        this.delete(data.item);
        break;
    }
  }

  edit(item: PeFolder) {
    this.openCoupon(item.id);
    this.closeContextMenu();
  }

  copy(item: PeFolder) {

    const dialogRef = this.overlayService.open({
      data: {
        isCopy: true,
      },
      disableClose: false,
      height: 230 as any,
      width: 550,
    },
    PeMoveToFolderDialog,
    );

    dialogRef.afterClosed
      .pipe(
        switchMap(async (data) => {
          if (data) {
            const body = this.prepareCouponPayload(item);
            delete body.parentFolder;
            this.createCoupon(body, data.folderId);
          }
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
    this.closeContextMenu();
  }

  delete(item: PeFolder) {
    this.handleDeleteCoupons([item.id]);
    this.closeContextMenu();
  }

  private checkIsEmptyFolder(folderId: string): boolean {
    return this.couponsList.findIndex(el => el?.parentFolder === folderId) !== -1;
  }

  duplicate(item: PeFolder) {
    const body = this.prepareCouponPayload(item);
    let folder = null;

    if (body.parentFolder) {
      folder = body.parentFolder;
      delete body.parentFolder;
    }

    this.createCoupon(body, folder);
    this.closeContextMenu();
  }

  paste(item: PeFolder) {
    this.closeContextMenu();
  }

  itemSorting(item: { id: any; }): { coupons: string[] } {

    const coupons = [];

    if (this.selectedCouponsItem.length > 0) {
      this.selectedCouponsItem.forEach((id) => {
        const couponId = this.gridItems.find(itemId => itemId.id === id);
        coupons.push(couponId.id);
      });
    } else {
      coupons.push(item.id);
    }
    return { coupons };
  }

  createCoupon(payload: any, folder = null) {
    this.apiService.createCoupon(payload).pipe(
      catchError((response) => {
        return throwError(response);
      }),
      takeUntil(this.destroy$),
    ).subscribe(async (coupon) => {
      if (folder) {
        await this.apiService.updateCouponFolder(
          { parentFolder: folder, couponId: coupon._id }).toPromise();
      }
      this.loadCoupons.next(true);
    });
  }



  private prepareCouponPayload(item): any {
    const body = this.couponsList.find(el => el._id === item.id);
    body.code = this.generateCode();
    delete body.updatedAt;
    delete body.createdAt;
    delete body.isAutomaticDiscount;
    delete body._id;
    delete body.__v;

    if (!body.endDate) {
      delete body.endDate;
    }

    return body;
  }

  private generateCode(): string {
    const codeLength = 12;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let result = '';

    for (let i = 0; i < codeLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
  }
}
