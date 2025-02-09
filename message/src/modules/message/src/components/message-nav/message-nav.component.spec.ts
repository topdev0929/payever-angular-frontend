import { NO_ERRORS_SCHEMA, Pipe } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PeDestroyService, PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PeContextMenuService } from '@pe/ui';
import { EMPTY, of, Subject } from 'rxjs';
import { PeMessageContextMenu } from '../../enums';
import {
  PeMessageApiService,
  PeMessageChatRoomListService,
  PeMessageNavService,
  PeMessageService,
} from '../../services';
import { PeMessageNavComponent } from './message-nav.component';

@Pipe({
  name: 'translate',
})
class TranslatePipeMock {

  transform() { }

}

describe('PeMessageNavComponent', () => {

  let fixture: ComponentFixture<PeMessageNavComponent>;
  let component: PeMessageNavComponent;
  let contextRef: any;
  let peContextMenuService: jasmine.SpyObj<PeContextMenuService>;
  let peMessageApiService: jasmine.SpyObj<PeMessageApiService>;
  let peMessageNavService: jasmine.SpyObj<PeMessageNavService>;
  let peMessageChatRoomListService: jasmine.SpyObj<PeMessageChatRoomListService>;
  let peMessageService: jasmine.SpyObj<PeMessageService>;
  let peOverlayWidgetService: jasmine.SpyObj<PeOverlayWidgetService>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let styleElem: HTMLStyleElement;

  beforeEach(waitForAsync(() => {

    const destroyServiceMock = new Subject();

    const peMessageNavServiceMock = {
      folderTree: null,
      activeFolder: null,
    };

    contextRef = {
      afterClosed: new Subject(),
    };
    const peContextMenuServiceSpy = jasmine.createSpyObj<PeContextMenuService>('PeContextMenuService', {
      open: contextRef,
    });

    const peOverlayWidgetServiceSpy = jasmine.createSpyObj<PeOverlayWidgetService>('PeOverlayWidgetService', [
      'open',
      'close',
    ]);

    const peMessageApiServiceSpy = jasmine.createSpyObj<PeMessageApiService>('PeMessageApiService', [
      'postFolder',
      'deleteFolder',
      'getFolderList',
      'patchFolder',
    ]);
    peMessageApiServiceSpy.getFolderList.and.returnValue(EMPTY);

    const peMessageChatRoomListServiceSpy = jasmine.createSpyObj<PeMessageChatRoomListService>(
      'PeMessageChatRoomListService',
      ['getConversationList'],
    );

    const peMessageServiceMock = {
      isLiveChat: false,
      currSettings$: new Subject(),
    };

    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['translate']);
    translateServiceSpy.translate.and.callFake((key: string) => `${key}.translated`);

    const envServiceMock = {
      custom: {
        cdn: 'c-cdn',
      },
    };

    TestBed.configureTestingModule({
      declarations: [
        PeMessageNavComponent,
        TranslatePipeMock,
      ],
      providers: [
        { provide: PeDestroyService, useValue: destroyServiceMock },
        { provide: PeMessageNavService, useValue: peMessageNavServiceMock },
        { provide: PeContextMenuService, useValue: peContextMenuServiceSpy },
        { provide: PeOverlayWidgetService, useValue: peOverlayWidgetServiceSpy },
        { provide: PeMessageApiService, useValue: peMessageApiServiceSpy },
        { provide: PeMessageChatRoomListService, useValue: peMessageChatRoomListServiceSpy },
        { provide: PeMessageService, useValue: peMessageServiceMock },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: PE_ENV, useValue: envServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeMessageNavComponent);
      component = fixture.componentInstance;

      peContextMenuService = TestBed.inject(PeContextMenuService) as jasmine.SpyObj<PeContextMenuService>;
      peMessageApiService = TestBed.inject(PeMessageApiService) as jasmine.SpyObj<PeMessageApiService>;
      peMessageNavService = TestBed.inject(PeMessageNavService) as jasmine.SpyObj<PeMessageNavService>;
      peMessageChatRoomListService = TestBed.inject(PeMessageChatRoomListService) as
        jasmine.SpyObj<PeMessageChatRoomListService>;
      peMessageService = TestBed.inject(PeMessageService) as jasmine.SpyObj<PeMessageService>;
      peOverlayWidgetService = TestBed.inject(PeOverlayWidgetService) as jasmine.SpyObj<PeOverlayWidgetService>;
      translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

      /**
       * added style elem to DOM to avoid error on descruction
       */
      styleElem = document.createElement('style');
      styleElem.className = 'style-nav-folder-menu';

      document.head.appendChild(styleElem);

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set menu data on construct', () => {

    const openSpy = spyOn<any>(component, 'openFolderFormOverlay');
    const folder = { _id: 'f-001' };

    expect(component.menuData.headItem?.title).toEqual('message-app.sidebar.add_new.translated');
    expect(component.menuData.menuItems?.[0].title).toEqual('message-app.sidebar.folder.translated');
    expect(translateService.translate).toHaveBeenCalledTimes(2);
    expect(translateService.translate.calls.all().map(c => c.args[0])).toEqual([
      'message-app.sidebar.add_new',
      'message-app.sidebar.folder',
    ]);

    /**
     * handle menuItem onClick callback
     * component.folderControl.value is null
     */
    component.folderControl.patchValue(null);
    component.menuData.menuItems?.[0].onClick?.();

    expect(openSpy).toHaveBeenCalledWith(PeMessageContextMenu.Create, { _id: null });

    /**
     * component.folderControl.value is set
     */
    component.folderControl.patchValue([folder]);
    component.menuData.menuItems?.[0].onClick?.();

    expect(openSpy).toHaveBeenCalledWith(PeMessageContextMenu.Create, { _id: folder._id });

  });

  it('should handle window resize', () => {

    const setSpy = spyOn(component, 'setDynamicGlobalStyle');

    window.dispatchEvent(new Event('resize'));

    expect(setSpy).toHaveBeenCalled();

  });

  it('should handle ng init', () => {

    const getFolderListSpy = spyOn<any>(component, 'getFolderList');
    const getFolderTreeSpy = spyOn<any>(component, 'getFolderTree').and.returnValue([{ _id: 'f-001' }]);
    const cdrSpies = {
      mark: spyOn(component[`changeDetectorRef`], 'markForCheck'),
      detect: spyOn(component[`changeDetectorRef`], 'detectChanges'),
    };
    const handleSpy = spyOn<any>(component, 'handleActiveFolder');

    /**
     * peMessageService.isLiveChat is FALSE
     */
    peMessageService.isLiveChat = false;

    component.messageAppColor = null as any;
    component.folderList = null as any;
    component.ngOnInit();

    expect(component.messageAppColor).toBeNull();
    expect(component.folderList).toBeNull();
    expect(peMessageNavService.folderTree).toBeNull();
    expect(getFolderListSpy).toHaveBeenCalled();
    expect(getFolderTreeSpy).not.toHaveBeenCalled();
    Object.values(cdrSpies).forEach(spy => expect(spy).not.toHaveBeenCalled());

    /**
     * peMessageService.isLiveChat is TRUE
     * peMessageService.currSettings$ emits mocked data with settings.messageAppColor as null
     */
    getFolderListSpy.calls.reset();
    peMessageService.isLiveChat = true;

    component.ngOnInit();

    expect(component.messageAppColor).toBeNull();
    expect(component.folderList).toEqual([{ id: 1, name: 'Support' }]);
    expect(peMessageNavService.folderTree).toEqual([{ _id: 'f-001' }] as any);
    expect(getFolderListSpy).not.toHaveBeenCalled();
    expect(getFolderTreeSpy).toHaveBeenCalledWith([{ id: 1, name: 'Support' }]);
    Object.values(cdrSpies).forEach(spy => expect(spy).toHaveBeenCalled());

    (peMessageService.currSettings$ as Subject<any>).next({
      settings: { messageAppColor: null },
    });
    expect(component.messageAppColor).toEqual('');

    (peMessageService.currSettings$ as Subject<any>).next({
      settings: { messageAppColor: '#333333' },
    });
    expect(component.messageAppColor).toEqual('#333333');

  });

  it('should set dynamic global style', () => {

    /**
     * removing created in beforeEach styleElem from DOM
     * so it will not interfere with test code
     */
    document.head.removeChild(styleElem);

    /**
     * starting test
     */
    const styleEl = document.createElement('style') as HTMLStyleElement;
    const element = {
      nativeElement: {
        getBoundingClientRect() {
          return { width: 500 };
        },
      },
    };
    const createSpy = spyOn(document, 'createElement').and.returnValue(styleEl);

    component[`element`] = element;
    component.setDynamicGlobalStyle();

    expect(createSpy).toHaveBeenCalledWith('style');
    expect(document.head.querySelector('.style-nav-folder-menu')).toEqual(styleEl);
    expect(styleEl.className).toEqual('style-nav-folder-menu');
    expect(styleEl.innerHTML).toContain('width: 500px!important');

  });

  it('should open context menu', () => {

    const event = {
      preventDefault: jasmine.createSpy('preventDefault'),
      stopPropagation: jasmine.createSpy('stopPropagation'),
    };
    const folder = { _id: 'f-001' };
    const openSpy = spyOn<any>(component, 'openFolderFormOverlay');
    const deleteSpy = spyOn<any>(component, 'deleteFolder');

    translateService.translate.calls.reset();

    component.openContextMenu(event as any, folder);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(peContextMenuService.open).toHaveBeenCalledWith(event as any, {
      theme: 'dark',
      data: {
        title: 'message-app.sidebar.options.translated',
        list: [
          { label: 'message-app.sidebar.create.translated', value: PeMessageContextMenu.Create },
          { label: 'message-app.sidebar.edit.translated', value: PeMessageContextMenu.Edit },
          { label: 'message-app.sidebar.delete.translated', value: PeMessageContextMenu.Delete, red: true },
        ],
      },
    });
    expect(translateService.translate).toHaveBeenCalledTimes(4);
    expect(translateService.translate.calls.all().map(c => c.args[0])).toEqual([
      'message-app.sidebar.options',
      'message-app.sidebar.create',
      'message-app.sidebar.edit',
      'message-app.sidebar.delete',
    ]);

    /**
     * emit context menu afterClosed
     * event is PeMessageContextMenu.Create
     */
    contextRef.afterClosed.next(PeMessageContextMenu.Create);

    expect(openSpy).toHaveBeenCalledWith(PeMessageContextMenu.Create, folder);
    expect(deleteSpy).not.toHaveBeenCalled();

    /**
     * event is PeMessageContextMenu.Edit
     */
    openSpy.calls.reset();
    contextRef.afterClosed.next(PeMessageContextMenu.Edit);

    expect(openSpy).toHaveBeenCalledWith(PeMessageContextMenu.Edit, folder);
    expect(deleteSpy).not.toHaveBeenCalled();

    /**
     * event is PeMessageContextMenu.Delete
     * folder._id is null
     */
    openSpy.calls.reset();
    folder._id = null as any;
    contextRef.afterClosed.next(PeMessageContextMenu.Delete);

    expect(openSpy).not.toHaveBeenCalled();
    expect(deleteSpy).not.toHaveBeenCalled();

    /**
     * folder._id is set
     */
    folder._id = 'f-001';
    contextRef.afterClosed.next(PeMessageContextMenu.Delete);

    expect(openSpy).not.toHaveBeenCalled();
    expect(deleteSpy).toHaveBeenCalledWith(folder._id);

  });

  it('should create folder', () => {

    const folder = { _id: 'f-001' };
    const createdFolder = { ...folder, name: 'Folder 1' };
    const getSpy = spyOn<any>(component, 'getFolderTree').and.returnValue([createdFolder]);
    const detectSpy = spyOn(component[`changeDetectorRef`], 'detectChanges');

    peMessageApiService.postFolder.and.returnValue(of(createdFolder));

    component.folderList = [];
    component[`createFolder`](folder);

    expect(peMessageApiService.postFolder).toHaveBeenCalledWith(folder);
    expect(component.folderList).toEqual([createdFolder]);
    expect(peMessageNavService.folderTree).toEqual([createdFolder]);
    expect(getSpy).toHaveBeenCalledWith([createdFolder]);
    expect(detectSpy).toHaveBeenCalled();

  });

  it('should delete folder', () => {

    const folders = [
      { _id: 'f-001' },
      { _id: 'f-002' },
    ];
    const getSpy = spyOn<any>(component, 'getFolderTree').and.callFake((folderList: any[]) => {
      return folderList.map(folder => ({
        ...folder,
        name: `Folder ${folder._id.charAt(folder._id.length - 1)}`
      }));
    });
    const detectSpy = spyOn(component[`changeDetectorRef`], 'detectChanges');

    peMessageApiService.deleteFolder.and.returnValue(of(folders[0]));

    component.folderList = folders;
    component[`deleteFolder`]('f-001');

    expect(component.folderList).toEqual([folders[1]]);
    expect(peMessageNavService.folderTree).toEqual([{
      _id: 'f-002',
      name: 'Folder 2',
    }] as any);
    expect(getSpy).toHaveBeenCalledWith([folders[1]]);
    expect(detectSpy).toHaveBeenCalled();

  });

  it('should get folder list', () => {

    const folders = [{ _id: 'f-001' }];
    const getSpy = spyOn<any>(component, 'getFolderTree').and.returnValue(folders);
    const detectSpy = spyOn(component[`changeDetectorRef`], 'detectChanges');

    peMessageApiService.getFolderList.and.returnValue(of(folders));

    component.folderList = [];
    component[`getFolderList`]();

    expect(component.folderList).toEqual(folders);
    expect(peMessageNavService.folderTree).toEqual(folders as any);
    expect(getSpy).toHaveBeenCalledWith(folders);
    expect(detectSpy).toHaveBeenCalled();

  });

  it('should get folder tree', () => {

    const folders = [
      {
        _id: 'f-001',
        image: 'image.jpg',
        parentFolder: null,
      },
      {
        _id: 'f-002',
        image: null,
        parentFolder: 'f-001',
      },
    ];

    expect(component[`getFolderTree`](folders)).toEqual([{
      _id: 'f-001',
      image: 'image.jpg',
      parentFolder: null,
      noToggleButton: false,
      children: [{
        _id: 'f-002',
        image: 'c-cdn/icons-png/dashboard-filter-copy.png',
        parentFolder: 'f-001',
        noToggleButton: true,
        children: [],
      }],
    }]);

  });

  it('should handle active folder', () => {

    component[`handleActiveFolder`]();

    /**
     * component.folderControl.value is [] (empty array)
     * peMessageService.isLiveChat is TRUE
     */
    peMessageService.isLiveChat = true;

    component.folderControl.patchValue([]);

    expect(peMessageChatRoomListService.getConversationList).not.toHaveBeenCalled();
    expect(peMessageNavService.activeFolder).toEqual([]);

    /**
     * peMessageService.isLiveChat is FALSE
     */
    peMessageService.isLiveChat = false;

    component.folderControl.patchValue([]);

    expect(peMessageChatRoomListService.getConversationList).toHaveBeenCalledWith(undefined);
    expect(peMessageNavService.activeFolder).toEqual([]);

    /**
     * component.folderControl.value is set
     */
    component.folderControl.patchValue([{ _id: 'f-001' }]);

    expect(peMessageChatRoomListService.getConversationList).toHaveBeenCalledWith('f-001');
    expect(peMessageNavService.activeFolder).toEqual([{ _id: 'f-001' }]);

  });

  it('should open folder from overlay', () => {

    const updateSpy = spyOn<any>(component, 'updateFolder');
    const createSpy = spyOn<any>(component, 'createFolder');
    const folder = {
      _id: 'f-001',
      name: 'Folder 1',
    };

    translateService.translate.calls.reset();

    /**
     * event is PeMessageContextMenu.Create
     * folder is null
     */
    component[`openFolderFormOverlay`](PeMessageContextMenu.Create, null as any);

    expect(peOverlayWidgetService.open).toHaveBeenCalled();
    let config = peOverlayWidgetService.open.calls.argsFor(0)[0];
    expect(config?.data).toEqual({
      folder: { parentFolder: undefined },
      theme: 'dark',
    });
    expect(config?.hasBackdrop).toBe(true);
    expect(config?.headerConfig?.title).toEqual('message-app.sidebar.new_folder.translated');
    expect(config?.headerConfig?.backBtnTitle).toEqual('message-app.sidebar.close.translated');
    expect(config?.headerConfig?.doneBtnTitle).toEqual('message-app.sidebar.save.translated');
    expect(config?.headerConfig?.theme).toEqual('dark');
    expect(translateService.translate).toHaveBeenCalledTimes(3);
    expect(translateService.translate.calls.all().map(c => c.args[0])).toEqual([
      'message-app.sidebar.new_folder',
      'message-app.sidebar.close',
      'message-app.sidebar.save',
    ]);

    /**
     * folder is set
     */
    peOverlayWidgetService.open.calls.reset();
    translateService.translate.calls.reset();

    component[`openFolderFormOverlay`](PeMessageContextMenu.Create, { _id: 'f-001' });

    expect(peOverlayWidgetService.open).toHaveBeenCalled();
    config = peOverlayWidgetService.open.calls.argsFor(0)[0];
    expect(config?.data).toEqual({
      folder: { parentFolder: 'f-001' },
      theme: 'dark',
    });
    expect(config?.headerConfig?.title).toEqual('message-app.sidebar.new_folder.translated');
    expect(translateService.translate).toHaveBeenCalledTimes(3);
    expect(translateService.translate.calls.argsFor(0)[0]).toEqual('message-app.sidebar.new_folder');

    /**
     * event is PeMessageContextMenu.Edit
     */
    peOverlayWidgetService.open.calls.reset();

    component[`openFolderFormOverlay`](PeMessageContextMenu.Edit, folder);

    expect(peOverlayWidgetService.open).toHaveBeenCalled();
    config = peOverlayWidgetService.open.calls.argsFor(0)[0];
    expect(config?.data).toEqual({
      folder: folder,
      theme: 'dark',
    });
    expect(config?.headerConfig?.title).toEqual(folder.name);

    /**
     * test config backBtnCallback
     */
    config?.headerConfig?.backBtnCallback?.();

    expect(peOverlayWidgetService.close).toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();

    /**
     * test config doneBtnCallback
     * peOverlayConfig.data.newFolder is null
     */
    peOverlayWidgetService.close.calls.reset();
    config!.data.newFolder = null;
    config?.headerConfig?.doneBtnCallback?.();

    expect(peOverlayWidgetService.close).toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
    expect(createSpy).not.toHaveBeenCalled();

    /**
     * peOverlayConfig.data.newFolder is set without _id property
     */
    peOverlayWidgetService.close.calls.reset();
    config!.data.newFolder = {
      _id: null,
      name: 'Folder 1',
    };
    config?.headerConfig?.doneBtnCallback?.();

    expect(peOverlayWidgetService.close).toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
    expect(createSpy).toHaveBeenCalledWith({ name: 'Folder 1' });

    /**
     * peOverlayConfig.data.newFolder is set with _id property
     */
    peOverlayWidgetService.close.calls.reset();
    createSpy.calls.reset();
    config!.data.newFolder = {
      _id: 'f-001',
      name: 'Folder 1',
    };
    config?.headerConfig?.doneBtnCallback?.();

    expect(peOverlayWidgetService.close).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalledWith({ _id: 'f-001', name: 'Folder 1' });
    expect(createSpy).not.toHaveBeenCalled();

  });

  it('should update folder', () => {

    const folder = {
      _id: 'f-001',
    };
    const foldersList = [
      { _id: 'f-002' },
    ]
    const updatedFolder = {
      ...folder,
      name: 'Folder 1',
    };
    const getSpy = spyOn<any>(component, 'getFolderTree');
    const detectSpy = spyOn(component[`changeDetectorRef`], 'detectChanges');

    peMessageApiService.patchFolder.and.returnValue(of(updatedFolder));

    /**
     * folder is not in foldersList
     */
    component.folderList = foldersList;
    component[`updateFolder`](folder);

    expect(peMessageApiService.patchFolder).toHaveBeenCalledWith(folder);
    expect(getSpy).toHaveBeenCalledWith(foldersList);
    expect(detectSpy).toHaveBeenCalled();

    /**
     * folder is in foldersList
     */
    component.folderList.unshift({ _id: 'f-001' });
    component[`updateFolder`](folder);

    expect(getSpy).toHaveBeenCalledWith([
      {
        _id: 'f-001',
        name: 'Folder 1',
      },
      { _id: 'f-002' },
    ]);

  });

  it('should close folder', () => {

    expect(peMessageNavService.activeFolder).toBeNull();
    component.closeFolder();
    expect(peMessageNavService.activeFolder).toEqual([]);

  });

});
