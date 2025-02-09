import { Overlay } from '@angular/cdk/overlay';
import { EventEmitter } from '@angular/core';
import { async, ComponentFixture, fakeAsync, flush, flushMicrotasks, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EnvService, MessageBus, PeFilterContainsEnum } from '@pe/common';
import { DataGridContextMenuEnum, PeDataGridService, PeDataGridSidebarService } from '@pe/data-grid';
import { LocaleConstantsService, TranslateService } from '@pe/i18n';
import { PePlatformHeaderService } from '@pe/platform-header';
import { orderBy } from 'lodash';
import * as rxjs from 'rxjs';
import { EMPTY, of, Subject, throwError } from 'rxjs';
import { PeCouponsOverlayService } from '../../misc/services/coupons-overlay/coupons-overlay.service';
import { DestroyService } from '../../misc/services/destroy.service';
import { PeCouponsApi } from '../../services/abstract.coupons.api';
import { DataGridService } from '../../services/data-grid.service';
import { PeDeleteConfirmationDialog } from '../dialogs/delete-confirmation-dialog/delete-confirmation.dialog';
import { PeDeleteCouponConfirmationDialog } from '../dialogs/delete-coupon-confirmation-dialog/delete-coupon-confirmation-dialog';
import { PeInfoDialog } from '../dialogs/info-dialog/info.dialog';
import { PeMoveToFolderDialog } from '../dialogs/move-to-folder-dialog/move-to-folder.dialog';
import { PeCouponsFormComponent } from '../form/coupons-form.component';
import { PeCouponsGridComponent } from './coupons-grid.component';

describe('PeCouponsGridComponent', () => {

  let fixture: ComponentFixture<PeCouponsGridComponent>;
  let component: PeCouponsGridComponent;
  let backdropSubject: Subject<void>;
  let overlayRef: any;
  let overlay: jasmine.SpyObj<Overlay>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let messageBus: jasmine.SpyObj<MessageBus>;
  let route: ActivatedRoute;
  let headerService: jasmine.SpyObj<PePlatformHeaderService>;
  let api: jasmine.SpyObj<PeCouponsApi>;
  let localeConstantsService: jasmine.SpyObj<LocaleConstantsService>;
  let overlayService: jasmine.SpyObj<PeCouponsOverlayService>;
  let router: jasmine.SpyObj<Router>;
  let dataGridSidebarService: jasmine.SpyObj<PeDataGridSidebarService>;

  beforeAll(() => {

    Object.defineProperty(rxjs, 'throwError', {
      value: rxjs.throwError,
      writable: true,
    });

  });

  beforeEach(async(() => {

    const apiSpy = jasmine.createSpyObj<PeCouponsApi>('PeCouponsApi', [
      'getCouponsList',
      'getCouponsFolders',
      'getChannels',
      'updateCouponsFolder',
      'updateCouponFolder',
      'postCouponsFolder',
      'createCoupon',
    ]);

    const localConstantsServiceSpy = jasmine.createSpyObj<LocaleConstantsService>('LocaleConstantsService', [
      'getCountryList',
    ]);

    const overlayServiceSpy = jasmine.createSpyObj<PeCouponsOverlayService>('PeCouponsOverlayService', ['open']);

    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    const routeMock = {
      queryParams: of({}),
    };

    backdropSubject = new Subject();
    overlayRef = {
      backdropClick: jasmine.createSpy('backdropClick').and.returnValue(backdropSubject),
      attach: jasmine.createSpy('attach'),
      dispose: jasmine.createSpy('dispose'),
    };
    const overlaySpy = jasmine.createSpyObj<Overlay>('Overlay', {
      create: overlayRef,
      position: {
        flexibleConnectedTo() {
          return {
            withFlexibleDimensions() {
              return {
                withViewportMargin() {
                  return {
                    withPositions() {
                      return { test: 'position.strategy' };
                    },
                  };
                },
              };
            },
          };
        },
      } as any,
    });
    overlaySpy.scrollStrategies = {
      reposition: jasmine.createSpy('reposition').and.returnValue({ test: 'scroll.strategy.reposition' }),
    } as any;

    const messageBusSpy = jasmine.createSpyObj<MessageBus>('MessageBus', {
      listen: EMPTY,
    });

    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['translate']);
    translateServiceSpy.translate.and.callFake(key => (`${key}.translated`));

    const dataGridSidebarServiceMock = {
      toggleFilters$: {
        next: jasmine.createSpy('next'),
      },
    };

    const peDataGridServiceMock = {
      selectedItems$: of(['c-001']),
    };

    const headerServiceSpy = jasmine.createSpyObj<PePlatformHeaderService>('PePlatformHeaderService', [
      'assignConfig',
    ]);

    const destroyMock = new Subject();

    TestBed.configureTestingModule({
      declarations: [PeCouponsGridComponent],
      providers: [
        FormBuilder,
        { provide: PeCouponsApi, useValue: apiSpy },
        { provide: LocaleConstantsService, useValue: localConstantsServiceSpy },
        { provide: PeCouponsOverlayService, useValue: overlayServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: Overlay, useValue: overlaySpy },
        { provide: EnvService, useValue: null },
        { provide: MessageBus, useValue: messageBusSpy },
        { provide: DataGridService, useValue: {} },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: PeDataGridSidebarService, useValue: dataGridSidebarServiceMock },
        { provide: PeDataGridService, useValue: peDataGridServiceMock },
        { provide: PePlatformHeaderService, useValue: headerServiceSpy },
        { provide: DestroyService, useValue: destroyMock },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeCouponsGridComponent);
      component = fixture.componentInstance;

      overlay = TestBed.inject(Overlay) as jasmine.SpyObj<Overlay>;
      translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
      messageBus = TestBed.inject(MessageBus) as jasmine.SpyObj<MessageBus>;
      route = TestBed.inject(ActivatedRoute);
      headerService = TestBed.inject(PePlatformHeaderService) as jasmine.SpyObj<PePlatformHeaderService>;
      api = TestBed.inject(PeCouponsApi) as jasmine.SpyObj<PeCouponsApi>;
      localeConstantsService = TestBed.inject(LocaleConstantsService) as jasmine.SpyObj<LocaleConstantsService>;
      overlayService = TestBed.inject(PeCouponsOverlayService) as jasmine.SpyObj<PeCouponsOverlayService>;
      router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
      dataGridSidebarService = TestBed.inject(PeDataGridSidebarService) as jasmine.SpyObj<PeDataGridSidebarService>;

    });

  }));

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should call listen toggle sidebar on construct', () => {

    const listenSpy = spyOn<any>(PeCouponsGridComponent.prototype, 'listenToggleSidebar');

    fixture = TestBed.createComponent(PeCouponsGridComponent);
    component = fixture.componentInstance;

    expect(listenSpy).toHaveBeenCalled();

  });

  it('should set data grid', () => {

    const nextSpy = spyOn(component.showSidebarStream$, 'next').and.callThrough();
    const dataGridMock = {
      showFilters$: new Subject(),
    };

    /**
     * argument dataGrid is null
     */
    component.setDataGrid = null;

    expect(component.dataGrid).toBeNull();
    expect(nextSpy).not.toHaveBeenCalled();

    /**
     * argument dataGrid is set
     */
    component.setDataGrid = dataGridMock as any;

    expect(component.dataGrid).toEqual(dataGridMock);
    expect(nextSpy).not.toHaveBeenCalled();

    dataGridMock.showFilters$.next(true);
    expect(nextSpy).not.toHaveBeenCalled();

    dataGridMock.showFilters$.next(false);
    expect(nextSpy).toHaveBeenCalledWith(false);

  });

  it('should set/get selected coupons item', () => {

    const ids = ['c-001', 'c-002'];
    const nextSpy = spyOn(component[`selectedCouponsStream$`], 'next').and.callThrough();

    component.selectedCouponsItem = ids;

    expect(nextSpy).toHaveBeenCalledWith(ids);
    expect(component.selectedCouponsItem).toEqual(ids);

  });

  it('should set/get grid items', () => {

    const gridItems = [
      { _id: 'grid-001' },
      { _id: 'grid-002' },
    ];
    const nextSpy = spyOn(component[`gridItemsStream$`], 'next').and.callThrough();

    component.gridItems = gridItems as any;

    expect(nextSpy).toHaveBeenCalledWith(gridItems as any);
    expect(component.gridItems).toEqual(gridItems as any);

  });

  it('should set/get items', () => {

    const items = [
      { _id: 'grid-001' },
      { _id: 'grid-002' },
    ];
    const nextSpy = spyOn(component[`itemsSubject`], 'next').and.callThrough();

    component.items = items as any;

    expect(nextSpy).toHaveBeenCalledWith(items as any);
    expect(component.items).toEqual(items as any);

  });

  it('should set/get unfiltered items', () => {

    const unfilteredItems = [
      { _id: 'grid-001' },
      { _id: 'grid-002' },
    ];
    const nextSpy = spyOn(component[`unfilteredItemsSubject`], 'next').and.callThrough();

    component.unfilteredItems = unfilteredItems as any;

    expect(nextSpy).toHaveBeenCalledWith(unfilteredItems as any);
    expect(component.unfilteredItems).toEqual(unfilteredItems as any);

  });

  it('should set/get folders', () => {

    const folders = [
      { _id: 'f-001' },
      { _id: 'f-002' },
    ];
    const nextSpy = spyOn(component[`foldersSubject`], 'next').and.callThrough();

    component.folders = folders as any;

    expect(nextSpy).toHaveBeenCalledWith(folders as any);
    expect(component.folders).toEqual(folders as any);

  });

  it('should set show sidebar', () => {

    const nextSpy = spyOn(component.showSidebarStream$, 'next');

    component.showSidebar = true;

    expect(nextSpy).toHaveBeenCalledWith(true);

  });

  it('should set grid options on construct', () => {

    expect(component.gridOptions).toEqual({
      nameTitle: 'coupons.translated',
      customFieldsTitles: [
        'filters.labels.channel.translated',
        'filters.labels.category.translated',
        'filters.labels.price.translated',
        'variants.translated / stock.translated',
      ],
    });
    expect(translateService.translate).toHaveBeenCalledWith('coupons');
    expect(translateService.translate).toHaveBeenCalledWith('filters.labels.channel');
    expect(translateService.translate).toHaveBeenCalledWith('filters.labels.category');
    expect(translateService.translate).toHaveBeenCalledWith('filters.labels.price');
    expect(translateService.translate).toHaveBeenCalledWith('variants');
    expect(translateService.translate).toHaveBeenCalledWith('stock');

  });

  it('should set theme on construct', () => {

    const envServiceMock = {
      businessData: null,
    };
    function reCreateComponent() {
      component = new PeCouponsGridComponent(
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        envServiceMock as any,
        messageBus,
        null,
        null,
        translateService,
        null,
        null,
        null,
        new Subject() as any,
      );
    };

    /**
     * envService is null
     */
    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData is null
     */
    reCreateComponent();
    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings is null
     */
    envServiceMock.businessData = { themeSettings: null };

    reCreateComponent();
    expect(component.theme).toEqual('dark');

    /**
     * envService.businessData.themeSettings.theme is set
     */
    envServiceMock.businessData.themeSettings = { theme: 'light' };

    reCreateComponent();
    expect(component.theme).toEqual('light');

  });

  it('should test add actions', () => {

    const openSpy = spyOn(component, 'openCoupon');
    const action = component.addActions.find(a => a.label === 'New Coupon');

    expect(action).toBeDefined();
    action.callback();
    expect(openSpy).toHaveBeenCalled();

  });

  it('should test single selected action', () => {

    const openSpy = spyOn(component, 'openCoupon');

    expect(component.singleSelectedAction.label).toEqual('Open');
    component.singleSelectedAction.callback('c-001');
    expect(openSpy).toHaveBeenCalledWith('c-001');

  });

  it('should sort by actions', () => {

    const items = [
      { title: 'Item 1' },
      { title: 'Item 2' },
      { title: 'Item 3' },
      { title: 'Item 4' },
    ];
    const action = component.sortByActions.find(a => a.label === 'Name');

    component.items = items;

    expect(action).toBeDefined();
    expect(action.icon).toEqual('name' as any);

    /**
     * should be descending
     */
    action.callback();
    expect(component.items).toEqual(orderBy(items, 'title', 'desc'));

    /**
     * should be ascending
     */
    action.callback();
    expect(component.items).toEqual(orderBy(items, 'title', 'asc'));

  });

  it('should focus input', () => {

    const input = document.createElement('input');
    const focusSpy = spyOn(input, 'focus');

    input.classList.add('sidebar-tree__input');

    /**
     * input does not exist in document
     */
    PeCouponsGridComponent[`focusInput`]();

    /**
     * input exists in document
     */
    document.body.appendChild(input);

    PeCouponsGridComponent[`focusInput`]();

    expect(focusSpy).toHaveBeenCalled();

  });

  it('should handle ng init', () => {

    const couponsFoldersMock = [
      { _id: 'f-001' },
      { _id: 'f-002' },
    ];
    const couponsListMock = [
      { _id: 'c-001' },
      { _id: 'c-002' },
    ];
    const initGridSpy = spyOn<any>(component, 'initGrid');
    const initSideBarFiltersSpy = spyOn<any>(component, 'initSideBarFilters');
    const getCountriesSpy = spyOn<any>(component, 'getCountries');
    const getCouponsFoldersSpy = spyOn<any>(component, 'getCouponsFolders').and.returnValue(couponsFoldersMock);
    const getCouponsListSpy = spyOn(component, 'getCouponsList').and.returnValue(couponsListMock as any);
    const setSpy = spyOnProperty(component, 'showSidebar', 'set');

    route.queryParams = of({ test: true });

    component.showSidebar = true;
    component.ngOnInit();

    expect(initGridSpy).toHaveBeenCalled();
    expect(initSideBarFiltersSpy).toHaveBeenCalled();
    expect(getCountriesSpy).toHaveBeenCalled();
    expect(getCouponsFoldersSpy).toHaveBeenCalled();
    expect(getCouponsListSpy).toHaveBeenCalledWith({ test: true });
    expect(component.selectedCoupons).toEqual(['c-001']);
    expect(headerService.assignConfig).toHaveBeenCalled();

    let config = headerService.assignConfig.calls.argsFor(0)[0];
    expect(config.isShowDataGridToggleComponent).toBe(true);
    config.showDataGridToggleItem.onClick();
    expect(setSpy).toHaveBeenCalledWith(false);

  });

  it('should init grid', () => {

    const selectAllSpy = spyOn<any>(component, 'handleSelectAllCoupons');
    const deselectAllSpy = spyOn<any>(component, 'handleDeselectAllCoupons');
    const deleteSpy = spyOn<any>(component, 'handleDeleteCoupons');
    const moveSpy = spyOn<any>(component, 'handleMoveToFolder');
    const ids = ['c-001', 'c-002'];

    component[`initGrid`]();

    expect(component.multipleSelectedActions).toBeDefined();
    expect(component.multipleSelectedActions[0].label).toEqual('Choose action');
    const actions = component.multipleSelectedActions[0].actions;

    /**
     * test select all action
     */
    const selectAllAction = actions.find(a => a.label === 'Select all');

    expect(selectAllAction).toBeDefined();
    selectAllAction.callback(ids);
    expect(selectAllSpy).toHaveBeenCalledWith(ids);

    /**
     * test deselect all action
     */
    const deselectAllAction = actions.find(a => a.label === 'Deselect all');

    expect(deselectAllAction).toBeDefined();
    deselectAllAction.callback(ids);
    expect(deselectAllSpy).toHaveBeenCalledWith(ids);

    /**
     * test delete coupons action
     */
    const deleteAction = actions.find(a => a.label === 'Delete');

    expect(deleteAction).toBeDefined();
    deleteAction.callback(ids);
    expect(deleteSpy).toHaveBeenCalledWith(ids);

    /**
     * test move to folder action
     */
    const moveAction = actions.find(a => a.label === 'Move To Folder');

    expect(moveAction).toBeDefined();
    moveAction.callback(ids);
    expect(moveSpy).toHaveBeenCalledWith(ids);

  });

  it('should init sidebar filters', () => {

    const addClickSpy = spyOn<any>(component, 'handleAddFolderClick');
    const renameClickSpy = spyOn<any>(component, 'handleRenameFolderClick');
    const deleteClickSpy = spyOn<any>(component, 'handleDeleteFolderClick');

    component.formGroup = null;
    component.sidebarProgramsControls = null;
    component[`initSideBarFilters`]();

    expect(component.formGroup).toBeDefined();
    expect(component.formGroup.value).toEqual({
      program: null,
      navigation: [],
      toggle: true,
    });
    expect(component.sidebarProgramsControls).toBeDefined();
    expect(component.sidebarProgramsControls.headItem.title).toEqual('Folder');

    /**
     * test add new folder menu item click
     */
    const addFolderMenuItem = component.sidebarProgramsControls.menuItems.find(mi => mi.title === 'Add New Folder');

    expect(addFolderMenuItem).toBeDefined();
    addFolderMenuItem.onClick();
    expect(addClickSpy).toHaveBeenCalled();

    /**
     * test rename menu item click
     */
    const renameMenuItem = component.sidebarProgramsControls.menuItems.find(mi => mi.title === 'Rename');

    expect(renameMenuItem).toBeDefined();
    renameMenuItem.onClick();
    expect(renameClickSpy).toHaveBeenCalled();

    /**
     * test delete menu item click
     */
    const deleteMenuItem = component.sidebarProgramsControls.menuItems.find(mi => mi.title === 'Delete');

    expect(deleteMenuItem).toBeDefined();
    expect(deleteMenuItem.color).toEqual('red');
    deleteMenuItem.onClick();
    expect(deleteClickSpy).toHaveBeenCalled();

  });

  it('should get coupons list', fakeAsync(() => {

    const filter = {
      parentFolder: 'f-001',
    };
    const items = [
      { _id: 'c-001' },
      { _id: 'c-002' },
    ];
    const pipeSpy = spyOn<any>(component, 'couponGridItemPipe').and.callFake(item => item);

    api.getCouponsList.and.returnValue(of(items) as any);

    component[`folderTreeData`] = [
      { id: 'f-001' },
      { id: 'f-002' },
    ];
    component[`selectedFolder`] = null;
    component[`couponsList`] = null;
    component.items = null;
    component.unfilteredItems = null;
    component[`getCouponsList`](filter);

    flushMicrotasks();

    expect(component[`selectedFolder`]).toEqual({ id: 'f-001' });
    expect(component[`couponsList`]).toEqual(items);
    expect(component.items).toEqual(items as any);
    expect(component.unfilteredItems).toEqual(items as any);
    expect(api.getCouponsList).toHaveBeenCalledWith(filter);

  }));

  it('should get coupons folders', () => {

    const folder = {
      _id: 'f-001',
      name: 'Folder 1',
      children: [{
        _id: 'f-002',
        name: 'Folder 2',
        children: [],
      }],
    };
    const nextSpy = spyOn(component.refreshSubject$, 'next');
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');

    api.getCouponsFolders.and.returnValue(of([folder]));

    component[`folderTreeData`] = null;
    component[`getCouponsFolders`]().subscribe();

    expect(component[`folderTreeData`]).toEqual([{
      ...folder,
      id: folder._id,
      children: [
        {
          ...folder.children[0],
          id: folder.children[0]._id,
        },
      ],
    }]);
    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(detectSpy).toHaveBeenCalled();
    expect(api.getCouponsFolders).toHaveBeenCalled();

  });

  it('should get countries', () => {

    const countriesList = {
      DE: 'Germany',
      AT: ['Austria'],
    };

    localeConstantsService.getCountryList.and.returnValue(countriesList as any);

    component[`getCountries`]();

    expect(component[`countries`]).toEqual([
      { _id: 'DE', title: 'Germany' },
      { _id: 'AT', title: 'Austria' },
    ]);

  });

  it('should handle add folder click', () => {

    const openSpy = spyOn<any>(component, 'openCouponFolder');
    const selectedProgram = {
      id: 'program-001',
      name: 'Program 1',
      image: 'image.jpg',
      parentId: 'f-001',
    };

    /**
     * component.selectedProgram is null
     */
    component.selectedProgram = null;
    component[`handleAddFolderClick`]();

    expect(openSpy).toHaveBeenCalled();

    /**
     * component.selectedProgram is set
     */
    component.selectedProgram = selectedProgram;
    component[`handleAddFolderClick`]();

    expect(openSpy).toHaveBeenCalledTimes(2);

  });

  it('should get channels', () => {

    const channels = [{ _id: 'ch-001' }];
    const logSpy = spyOn(console, 'log');

    api.getChannels.and.returnValue(of(channels));

    component[`getChannels`]();

    expect(api.getChannels).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(channels);

  });

  it('should handle delete folder click', () => {

    const selectedFolder = {
      id: 'f-002',
      name: 'Folder 1',
      image: 'image.jpg',
      parentFolder: 'f-001',
    };
    const closeSpy = spyOn(component, 'closeContextMenu');
    const checkSpy = spyOn<any>(component, 'checkIsEmptyFolder').and.returnValues(false, true);
    const openNotEmptyAlertSpy = spyOn(component, 'openNotEmptyAlert');
    const openConfirmDeleteFolderSpy = spyOn<any>(component, 'openConfirmDeleteFolder');

    /**
     * component.selectedFolder is null
     * checkIsEmptyFolder returns FALSE
     */
    component[`selectedFolder`] = null;
    component[`handleDeleteFolderClick`]();

    expect(closeSpy).toHaveBeenCalled();
    expect(checkSpy).toHaveBeenCalledWith(undefined);
    expect(openNotEmptyAlertSpy).not.toHaveBeenCalled();
    expect(openConfirmDeleteFolderSpy).toHaveBeenCalled();

    /**
     * component.selectedFolder is set
     * checkIsEmptyFolder returns TRUE
     */
    openConfirmDeleteFolderSpy.calls.reset();

    component[`selectedFolder`] = selectedFolder;
    component[`handleDeleteFolderClick`]();

    expect(closeSpy).toHaveBeenCalled();
    expect(checkSpy).toHaveBeenCalledWith('f-002');
    expect(openNotEmptyAlertSpy).toHaveBeenCalled();
    expect(openConfirmDeleteFolderSpy).not.toHaveBeenCalled();

  });

  it('should open not empty alert', () => {

    component.openNotEmptyAlert();

    expect(overlayService.open).toHaveBeenCalledWith({
      data: {
        title: 'Delete Folder',
        infoText: 'You can’t delete this folder, it’s not empty',
      },
      height: 390,
      width: 350,
    }, PeInfoDialog);

  });

  it('should handle rename folder click', () => {

    const closeSpy = spyOn(component, 'closeContextMenu');
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    const selectedFolder = { id: 'f-001', editing: false };

    component[`selectedFolder`] = selectedFolder;
    component[`handleRenameFolderClick`]();

    expect(closeSpy).toHaveBeenCalled();
    expect(detectSpy).toHaveBeenCalled();
    expect(selectedFolder.editing).toBe(true);

  });

  it('should handle rename node', () => {

    const logSpy = spyOn(console, 'log');
    const node = {
      id: 'f-001',
      name: 'Folder 1',
    };
    const updatedFolder = {
      _id: node.id,
      name: 'Folder 1',
    };

    api.updateCouponsFolder.and.returnValue(of(updatedFolder));

    component[`onRenameNode`](node);

    expect(api.updateCouponsFolder).toHaveBeenCalledWith(node.id, { name: node.name });
    expect(logSpy).toHaveBeenCalledWith(updatedFolder);

  });

  it('should handle select all coupons', () => {

    const dataGridMock = {
      selectedItems: null,
    };

    component.items = [
      { id: 'c-001' },
      { id: 'c-002' },
    ];
    component.dataGrid = dataGridMock;
    component[`handleSelectAllCoupons`](null);

    expect(dataGridMock.selectedItems).toEqual(['c-001', 'c-002']);

  });

  it('should handle deselect all coupons', () => {

    const dataGridMock = {
      selectedItems: ['c-001', 'c-002'],
    };

    component.items = [
      { id: 'c-001', selected: true },
      { id: 'c-002', selected: true },
    ];
    component.dataGrid = dataGridMock;
    component[`handleDeselectAllCoupons`](null);

    expect(component.items).toEqual([
      { id: 'c-001', selected: false },
      { id: 'c-002', selected: false },
    ]);
    expect(dataGridMock.selectedItems).toEqual([]);

  });

  it('should handle delete coupons', () => {

    const ids = ['c-001', 'c-002'];
    const openSpy = spyOn<any>(component, 'openConfirmDeleteCoupons');

    component[`handleDeleteCoupons`](ids);

    expect(openSpy).toHaveBeenCalledWith(ids);

  });

  it('should handle move to folder', () => {

    const ids = ['c-001', 'c-002'];
    const closeSpy = spyOn(component, 'closeContextMenu');
    const openSpy = spyOn(component, 'openMoveToFolderDialog');

    component.handleMoveToFolder(ids);

    expect(closeSpy).toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalledWith(ids);

  });

  it('should open move to folder dialog', fakeAsync(() => {

    const folderId = ['f-001', 'f-002'];
    const dialogRef = {
      afterClosed: new Subject(),
    };
    const nextSpy = spyOn(component.loadCoupons, 'next');

    api.updateCouponFolder.and.returnValue(of({}));
    overlayService.open.and.returnValue(dialogRef as any);

    component.selectedCoupons = ['c-001'];
    component.couponId = [];
    component.openMoveToFolderDialog(folderId);

    expect(overlayService.open).toHaveBeenCalledWith({
      data: { id: folderId },
      disableClose: false,
      height: 230,
      width: 550,
    }, PeMoveToFolderDialog);

    /**
     * afterClosed data is null
     */
    dialogRef.afterClosed.next(null);

    expect(api.updateCouponFolder).not.toHaveBeenCalled();
    expect(nextSpy).not.toHaveBeenCalled();
    expect(component.couponId).toEqual([]);

    /**
     * afterClosed data.couponId.length is 0
     */
    dialogRef.afterClosed.next({
      couponId: [],
      folderId: 'f-001',
    });

    flush();

    expect(api.updateCouponFolder).toHaveBeenCalledTimes(1);
    expect(api.updateCouponFolder).toHaveBeenCalledWith({
      parentFolder: 'f-001',
      couponId: 'c-001',
    });
    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(component.couponId).toEqual(['c-001']);

    /**
     * afterClosed data.couponId.length is more than 0
     */
    api.updateCouponFolder.calls.reset();

    dialogRef.afterClosed.next({
      couponId: ['c-002', 'c-003'],
      folderId: 'f-001',
    });

    flush();

    expect(api.updateCouponFolder).toHaveBeenCalledTimes(2);
    expect(api.updateCouponFolder).toHaveBeenCalledWith({
      parentFolder: 'f-001',
      couponId: 'c-002',
    });
    expect(api.updateCouponFolder).toHaveBeenCalledWith({
      parentFolder: 'f-001',
      couponId: 'c-003',
    });
    expect(component.couponId).toEqual(['c-001', 'c-002', 'c-003']);

  }));

  it('should handle move coupon here', fakeAsync(() => {

    const errorSpy = spyOn(console, 'error');
    const selectedCouponNextSpy = spyOn(component.selectedCoupon, 'next').and.callThrough();
    const loadNextSpy = spyOn(component.loadCoupons, 'next');

    api.updateCouponFolder.and.returnValue(of({}));

    /**
     * selectedCoupon is null
     */
    component.handleMoveCouponHere();

    flushMicrotasks();

    expect(api.updateCouponFolder).not.toHaveBeenCalled();
    expect(selectedCouponNextSpy).not.toHaveBeenCalled();
    expect(loadNextSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith('Error in saving the data');

    /**
     * selectedCoupon is set
     */
    component.selectedCoupon.next({ id: 'c-001' });
    component[`selectedFolder`] = { id: 'f-001' };
    selectedCouponNextSpy.calls.reset();

    component.handleMoveCouponHere();

    flushMicrotasks();

    expect(api.updateCouponFolder).toHaveBeenCalledWith({
      parentFolder: 'f-001',
      couponId: 'c-001',
    });
    expect(selectedCouponNextSpy).toHaveBeenCalledWith(null);
    expect(loadNextSpy).toHaveBeenCalledWith(true);

  }));

  it('should open confirm delete coupons', () => {

    const ids = ['c-001'];
    const dialogRef = {
      afterClosed: new Subject(),
    };
    const nextSpy = spyOn(component.loadCoupons, 'next');

    overlayService.open.and.returnValue(dialogRef as any);

    /**
     * argument ids is undefined as default
     */
    component[`openConfirmDeleteCoupons`]();

    expect(overlayService.open).not.toHaveBeenCalled();

    /**
     * argument ids is set
     */
    component[`openConfirmDeleteCoupons`](ids);

    expect(overlayService.open).toHaveBeenCalledWith({
      data: ids,
      height: 475,
      width: 350,
    }, PeDeleteCouponConfirmationDialog);

    /**
     * afterClosed data is null
     */
    dialogRef.afterClosed.next(null);

    expect(nextSpy).not.toHaveBeenCalled();

    /**
     * afterClosed data is set
     */
    dialogRef.afterClosed.next({ test: 'data' });

    expect(nextSpy).toHaveBeenCalled();

  });

  it('should open coupon folder', () => {

    const focusSpy = spyOn<any>(PeCouponsGridComponent, 'focusInput');
    const nextSpy = spyOn(component.refreshSubject$, 'next');

    component[`folderTreeData`] = [];
    component[`openCouponFolder`]();

    expect(component[`folderTreeData`]).toEqual([{
      name: '',
      image: '/assets/icons/switch.png',
      editing: true,
    }]);
    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(focusSpy).toHaveBeenCalled();

  });

  it('should open confirm delete folder', () => {

    const folder = { _id: 'f-001' };
    const dialogRef = {
      afterClosed: new Subject(),
    };
    const nextSpy = spyOn(component.loadFolders, 'next');

    overlayService.open.and.returnValue(dialogRef as any);

    /**
     * argument folder._id is null
     */
    component.selectedProgram = { id: 'program-001' } as any;
    component[`openConfirmDeleteFolder`]({ _id: null });

    expect(overlayService.open).not.toHaveBeenCalled();
    expect(component.selectedProgram).toBeDefined();

    /**
     * argument folder._id is set
     */
    component[`openConfirmDeleteFolder`](folder);

    expect(overlayService.open).toHaveBeenCalledWith({
      data: folder,
      height: 475,
      width: 350,
    }, PeDeleteConfirmationDialog);

    /**
     * afterClosed data is null
     */
    dialogRef.afterClosed.next(null);

    expect(nextSpy).not.toHaveBeenCalled();
    expect(component.selectedProgram).toBeDefined();

    /**
     * afterClosed data is set
     */
    dialogRef.afterClosed.next({ test: 'data' });

    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(component.selectedProgram).toBeNull();

  });

  it('should listen toggle sidebar', () => {

    const messageEmitter = new EventEmitter();
    const toggleSpy = spyOn(component, 'toggleSidebar');

    messageBus.listen.calls.reset();
    messageBus.listen.and.returnValue(messageEmitter);

    component[`listenToggleSidebar`]();

    expect(messageBus.listen).toHaveBeenCalledWith('coupons.toggle.sidebar');
    expect(toggleSpy).not.toHaveBeenCalled();
    messageEmitter.emit();
    expect(toggleSpy).toHaveBeenCalled();

  });

  it('should handle node click', () => {

    const programMock = { id: 'program-001' };

    /**
     * argument data is [] (empty array)
     */
    component[`onNodeClick`]([]);

    expect(component.selectedProgram).toBeUndefined();
    expect(router.navigate).toHaveBeenCalledWith([], {
      queryParams: {
        parentFolder: undefined,
      },
      queryParamsHandling: 'merge',
    });

    /**
     * argument data is set
     */
    component[`onNodeClick`]([programMock] as any);

    expect(component.selectedProgram).toEqual(programMock as any);
    expect(router.navigate).toHaveBeenCalledWith([], {
      queryParams: {
        parentFolder: 'program-001',
      },
      queryParamsHandling: 'merge',
    });

  });

  it('should go to root', () => {

    component.selectedProgram = { id: 'program-001' } as any;
    component.goToRoot();

    expect(component.selectedProgram).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith([], {
      skipLocationChange: false,
    });

  });

  it('should handle node create', () => {

    const node = {
      name: 'Node 1',
      children: [],
      editing: false,
    };
    const nextSpy = spyOn(component.loadFolders, 'next');

    api.postCouponsFolder.and.returnValue(of({}));

    component.onNodeCreate(node);

    expect(api.postCouponsFolder).toHaveBeenCalledWith({
      name: node.name,
      parentFolder: undefined,
      image: '/assets/icons/switch.png',
      children: node.children,
    });
    expect(nextSpy).toHaveBeenCalledWith(true);

  });

  it('should open context menu', () => {

    const event = {
      preventDefault: jasmine.createSpy('preventDefault'),
      stopPropagation: jasmine.createSpy('stopPropagation'),
    };
    const item = { id: 'c-001' };
    const closeSpy = spyOn(component, 'closeContextMenu');

    /**
     * argument event is null
     * item.id does not exist in component.selectedCoupons
     */
    component.selectedCoupons = [];
    component.openContextMenu(null, item, null);

    expect(component.selectedCoupons).toEqual(['c-001']);
    expect(overlay.create).toHaveBeenCalledWith({
      positionStrategy: { test: 'position.strategy' } as any,
      scrollStrategy: { test: 'scroll.strategy.reposition' } as any,
      hasBackdrop: true,
      backdropClass: 'connect-context-menu-backdrop',
    });
    expect(overlay.position).toHaveBeenCalled();
    expect(overlay.scrollStrategies.reposition).toHaveBeenCalled();
    expect(overlayRef.backdropClick).toHaveBeenCalled();
    expect(overlayRef.attach).toHaveBeenCalled();
    expect(closeSpy).not.toHaveBeenCalled();

    /**
     * test backdrop click
     */
    backdropSubject.next();
    expect(closeSpy).toHaveBeenCalled();

    /**
     * argument event is set
     * item.id exists in component.selectedCoupons
     */
    component.selectedCoupons = ['c-001'];
    component.openContextMenu(event, item, null);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();

  });

  it('should handle folder right click', () => {

    const openSpy = spyOn(component, 'openContextMenu');
    const node = { id: 'f-001' };
    const event = { test: 'event' };
    const context = { test: 'context' };

    component[`selectedFolder`] = null;
    component.onFolderRightClick({ event, node }, context);

    expect(component[`selectedFolder`]).toEqual(node);
    expect(openSpy).toHaveBeenCalledWith(event, node, context);

  });

  it('should handle coupon right click', () => {

    const openSpy = spyOn(component, 'openContextMenu');
    const node = { id: 'c-001' };
    const event = { test: 'event' };
    const context = { test: 'context' };

    component[`contextSelectedCoupon`] = null;
    component.onCouponRightClick(event, node, context);

    expect(component[`contextSelectedCoupon`]).toEqual(node);
    expect(openSpy).toHaveBeenCalledWith(event, node, context);

  });

  it('should close context menu', () => {

    /**
     * component.overlayRef is null
     */
    component[`overlayRef`] = null;
    component.closeContextMenu();

    /**
     * component.overlayRef is set
     */
    component[`overlayRef`] = overlayRef;
    component.closeContextMenu();

    expect(overlayRef.dispose).toHaveBeenCalled();

  });

  it('should toggle sidebar', () => {

    component.toggleSidebar();

    expect(dataGridSidebarService.toggleFilters$.next).toHaveBeenCalled();

  });

  it('should open coupon', fakeAsync(() => {

    const couponId = 'c-001';
    const dialogRef = {
      afterClosed: new Subject(),
    };
    const countries = [{ _id: 'DE', title: 'Germany' }];
    const customersSource = [{ id: 'customer-001' }];
    const nextSpy = spyOn(component.loadCoupons, 'next');

    overlayService.open.and.returnValue(dialogRef as any);
    api.updateCouponFolder.and.returnValue(of({}));

    component[`countries`] = countries;
    component[`customersSource`] = customersSource as any;
    component[`selectedFolder`] = { id: 'f-001' };
    component.openCoupon(couponId);

    expect(overlayService.open).toHaveBeenCalledWith({
      data: {
        id: couponId,
        customersSource,
        countries,
      },
      disableClose: true,
    }, PeCouponsFormComponent);

    /**
     * afterClosed data is null
     */
    dialogRef.afterClosed.next(null);

    expect(api.updateCouponFolder).not.toHaveBeenCalled();
    expect(nextSpy).not.toHaveBeenCalled();

    /**
     * afterClosed data.new is FALSE
     */
    dialogRef.afterClosed.next({ new: false });

    expect(api.updateCouponFolder).not.toHaveBeenCalled();
    expect(nextSpy).toHaveBeenCalledWith(true);

    /**
     * afterClosed data.new is TRUE
     */
    nextSpy.calls.reset();
    dialogRef.afterClosed.next({
      new: true,
      data: { _id: couponId },
    });

    flushMicrotasks();

    expect(api.updateCouponFolder).toHaveBeenCalledWith({
      parentFolder: 'f-001',
      couponId,
    });
    expect(nextSpy).toHaveBeenCalledWith(true);

  }));

  it('should test coupon grid item pipe', () => {

    const coupon = {
      _id: 'c-001',
      code: 'code',
      description: 'desc',
      status: 'status',
    };
    const openSpy = spyOn(component, 'openCoupon');

    const {
      id,
      title,
      description,
      labels,
      selected,
      actions,
    } = component[`couponGridItemPipe`](coupon as any);

    expect(id).toEqual(coupon._id);
    expect(title).toEqual(coupon.code);
    expect(description).toEqual(coupon.description);
    expect(labels).toEqual([coupon.status]);
    expect(selected).toBe(false);
    actions.find(a => a.label === 'Edit').callback(coupon._id);
    expect(openSpy).toHaveBeenCalledWith(coupon._id);

  });

  it('should update items', () => {

    const searchItems = [{
      searchText: 'James',
      contains: PeFilterContainsEnum.Contains,
    }];
    const unfilteredItems = [
      {
        id: 'c-001',
        title: 'James Bond',
      },
      {
        id: 'c-002',
        title: 'Batman',
      },
    ];

    /**
     * searchItem.contains is PeFilterContainsEnum.Contains
     */
    component.unfilteredItems = unfilteredItems;
    component.searchItems = searchItems as any;
    component.items = null;
    component.updateItems();

    expect(component.items).toEqual([unfilteredItems[0]]);

    /**
     * searchItem.contains is PeFilterContainsEnum['Does not Contain']
     */
    searchItems[0].contains = PeFilterContainsEnum['Does not Contain'];

    component.items = null;
    component.updateItems();

    expect(component.items).toEqual([unfilteredItems[1]]);

  });

  it('should handle search change', () => {

    const e = {
      searchText: 'search',
      contains: PeFilterContainsEnum.Contains,
      filter: 'filter',
    };
    const updateSpy = spyOn(component, 'updateItems');

    component.searchItems = [];
    component.onSearchChange(e);

    expect(component.searchItems).toEqual([e]);
    expect(updateSpy).toHaveBeenCalled();

  });

  it('should handle search remove', () => {

    const searchItems = [
      {
        searchText: 'search',
        contains: PeFilterContainsEnum.Contains,
        filter: 'filter',
      },
      {
        searchText: 'search 2',
        contains: PeFilterContainsEnum['Does not Contain'],
        filter: 'filter',
      },
    ];
    const updateSpy = spyOn(component, 'updateItems');

    component.searchItems = searchItems;
    component.onSearchRemove(1);

    expect(component.searchItems).toEqual([{
      searchText: 'search',
      contains: PeFilterContainsEnum.Contains,
      filter: 'filter',
    }]);
    expect(updateSpy).toHaveBeenCalled();

  });

  it('should track item', () => {

    const item = { _id: 'c-001' };

    expect(component.trackItem(0, item)).toEqual(item._id);

  });

  it('should handle grid context menu', () => {

    const item = { id: 'c-001' };

    Object.keys(DataGridContextMenuEnum).forEach((key) => {
      const spy = spyOn(component, DataGridContextMenuEnum[key]);
      const data = {
        item,
        event: DataGridContextMenuEnum[key],
      };

      component.onGridContentContextMenu(data);

      expect(spy).toHaveBeenCalledWith(item);
    });

  });

  it('should edit', () => {

    const item = { id: 'c-001' };
    const openSpy = spyOn(component, 'openCoupon');
    const closeSpy = spyOn(component, 'closeContextMenu');

    component.edit(item);

    expect(openSpy).toHaveBeenCalledWith(item.id);
    expect(closeSpy).toHaveBeenCalled();

  });

  it('should copy', () => {

    const item = { id: 'c-001' };
    const body = {
      id: 'c-001',
      parentFolder: 'f-001',
    };
    const dialogRef = {
      afterClosed: new Subject(),
    };
    const prepareSpy = spyOn<any>(component, 'prepareCouponPayload').and.returnValue(body);
    const createSpy = spyOn(component, 'createCoupon');
    const closeSpy = spyOn(component, 'closeContextMenu');

    overlayService.open.and.returnValue(dialogRef as any);

    component.copy(item);

    expect(overlayService.open).toHaveBeenCalledWith({
      data: {
        isCopy: true,
      },
      disableClose: false,
      height: 230,
      width: 550,
    }, PeMoveToFolderDialog);
    expect(closeSpy).toHaveBeenCalled();

    /**
     * afterClosed data is null
     */
    dialogRef.afterClosed.next(null);

    expect(prepareSpy).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();

    /**
     * afterClosed data is set
     */
    dialogRef.afterClosed.next({
      folderId: 'f-001',
    });

    expect(prepareSpy).toHaveBeenCalledWith(item);
    expect(createSpy).toHaveBeenCalledWith({ id: body.id }, 'f-001');

  });

  it('should delete', () => {

    const item = { id: 'c-001' };
    const handleSpy = spyOn<any>(component, 'handleDeleteCoupons');
    const closeSpy = spyOn(component, 'closeContextMenu');

    component.delete(item);

    expect(handleSpy).toHaveBeenCalledWith([item.id]);
    expect(closeSpy).toHaveBeenCalled();

  });

  it('should check is empty folder', () => {

    const couponsList = [
      {
        id: 'c-001',
        parentFolder: 'f-002',
      },
      undefined,
      {
        id: 'c-002',
        parentFolder: 'f-001',
      },
    ];

    /**
     * folder is not empty
     */
    component[`couponsList`] = couponsList;
    expect(component[`checkIsEmptyFolder`]('f-001')).toBe(true);

    /**
     * folder is empty
     */
    couponsList.splice(2, 1);
    expect(component[`checkIsEmptyFolder`]('f-001')).toBe(false);

  });

  it('should duplicate', () => {

    const item = { id: 'c-001' };
    const body = {
      id: 'c-001',
      parentFolder: null,
    };
    const prepareSpy = spyOn<any>(component, 'prepareCouponPayload').and.returnValue(body);
    const createSpy = spyOn(component, 'createCoupon');
    const closeSpy = spyOn(component, 'closeContextMenu');

    /**
     * body.parentFolder is null
     */
    component.duplicate(item);

    expect(prepareSpy).toHaveBeenCalledWith(item);
    expect(createSpy).toHaveBeenCalledWith(body, null);
    expect(closeSpy).toHaveBeenCalled();

    /**
     * body.parentFolder is set
     */
    prepareSpy.calls.reset();
    createSpy.calls.reset();
    closeSpy.calls.reset();
    body.parentFolder = 'f-001';

    component.duplicate(item);

    expect(prepareSpy).toHaveBeenCalledWith(item);
    expect(createSpy).toHaveBeenCalledWith({ id: body.id }, 'f-001');
    expect(closeSpy).toHaveBeenCalled();

  });

  it('should paste', () => {

    const closeSpy = spyOn(component, 'closeContextMenu');

    component.paste(null);

    expect(closeSpy).toHaveBeenCalled();

  });

  it('should test item sorting', () => {

    const item = { id: 'c-001' };

    /**
     * component.selectedCouponsItem is [] (empty array)
     */
    component.selectedCouponsItem = [];
    expect(component.itemSorting(item)).toEqual({
      coupons: ['c-001'],
    });

    /**
     * component.selectedCouponsItem is set
     */
    component.selectedCouponsItem = ['c-002'];
    component.gridItems = [{ id: 'c-002' }];
    expect(component.itemSorting(item)).toEqual({
      coupons: ['c-002'],
    });

  });

  it('should create coupon', fakeAsync(() => {

    const payload = { id: 'c-001' };
    const nextSpy = spyOn(component.loadCoupons, 'next');

    api.updateCouponFolder.and.returnValue(of({}));

    /**
     * api.createCoupon throws error
     */
    api.createCoupon.and.returnValue(throwError('test error'));
    const errorSpy = spyOn(rxjs, 'throwError').and.returnValue(EMPTY);

    component.createCoupon(payload);

    flush();

    expect(api.createCoupon).toHaveBeenCalledWith(payload as any);
    expect(api.updateCouponFolder).not.toHaveBeenCalled();
    expect(nextSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith('test error');

    /**
     * api.createCoupon returns mocked coupon
     * argument folder is undefined as default
     */
    api.createCoupon.and.returnValue(of({ _id: 'c-001' }) as any);

    component.createCoupon(payload);

    flush();

    expect(api.updateCouponFolder).not.toHaveBeenCalled();
    expect(nextSpy).toHaveBeenCalledWith(true);

    /**
     * argument folder is set
     */
    component.createCoupon(payload, 'f-001');

    flush();

    expect(api.updateCouponFolder).toHaveBeenCalledWith({
      parentFolder: 'f-001',
      couponId: 'c-001',
    });

  }));

  it('should prepare coupon payload', () => {

    const item = { id: 'c-001' };
    const date = new Date();
    const coupon = {
      _id: 'c-001',
      code: null,
      updatedAt: null,
      createdAt: null,
      isAutomaticDiscount: null,
      __v: null,
      endDate: date,
    };
    const generateSpy = spyOn<any>(component, 'generateCode').and.callThrough();

    /**
     * body.endDate is set
     */
    component[`couponsList`] = [coupon];
    let preparedData = component[`prepareCouponPayload`](item);

    expect(generateSpy).toHaveBeenCalled();
    expect(preparedData.code).toBeDefined();
    expect(preparedData.code.length).toBe(12);
    expect(preparedData.endDate).toEqual(date);

    /**
     * body.endDate is null
     */
    coupon._id = 'c-001';
    coupon.endDate = null;
    preparedData = component[`prepareCouponPayload`](item);

    expect(preparedData.endDate).toBeUndefined();

  });

});
