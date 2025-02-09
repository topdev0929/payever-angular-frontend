import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { PeChatService } from '@pe/chat';
import { PeDestroyService, PeDragDropService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PeContextMenuService } from '@pe/ui';
import { EMPTY, of, Subject } from 'rxjs';
import { PeMessageContextMenu } from '../../enums';
import {
  PeMessageApiService,
  PeMessageChatRoomListService,
  PeMessageChatRoomService,
  PeMessageNavService,
} from '../../services';
import { PeMessageService } from '../../services/message.service';
import { PeMessageChatRoomListComponent } from './message-chat-room-list.component';

describe('PeMessageChatRoomListComponent', () => {

  let fixture: ComponentFixture<PeMessageChatRoomListComponent>;
  let component: PeMessageChatRoomListComponent;
  let peChatService: jasmine.SpyObj<PeChatService>;
  let peMessageChatRoomListService: jasmine.SpyObj<PeMessageChatRoomListService>;
  let peMessageApiService: jasmine.SpyObj<PeMessageApiService>;
  let peMessageService: jasmine.SpyObj<PeMessageService>;
  let peDragDropService: jasmine.SpyObj<PeDragDropService>;
  let peContextMenuService: jasmine.SpyObj<PeContextMenuService>;
  let peMessageChatRoomService: jasmine.SpyObj<PeMessageChatRoomService>;
  let peOverlayWidgetService: jasmine.SpyObj<PeOverlayWidgetService>;
  let peMessageNavService: jasmine.SpyObj<PeMessageNavService>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let styleElem: HTMLStyleElement;

  beforeEach(waitForAsync(() => {

    const destroyServiceMock = new Subject();

    const peMessageChatRoomListServiceSpy = jasmine.createSpyObj<PeMessageChatRoomListService>(
      'PeMessageChatRoomListService',
      [
        'getContactAvatar',
        'getContactInitials',
        'sortChatList',
        'deleteChat',
      ],
    );
    peMessageChatRoomListServiceSpy.detectChangeStream$ = EMPTY as any;
    peMessageChatRoomListServiceSpy.chatList = [];
    peMessageChatRoomListServiceSpy.activeChat = null;

    const peChatServiceMock = {
      socket: {
        on: jasmine.createSpy('on'),
        emit: jasmine.createSpy('emit'),
      },
    };

    const peContextMenuServiceSpy = jasmine.createSpyObj<PeContextMenuService>('PeContextMenuService', ['open']);

    const peDragDropServiceSpy = jasmine.createSpyObj<PeDragDropService>('PeDragDropService', ['setDragItem']);

    const peMessageServiceMock = {
      isLiveChat: null,
      currSettings$: new Subject(),
      activeUser: null,
      contactList: null,
    };

    const peMessageApiServiceSpy = jasmine.createSpyObj<PeMessageApiService>('PeMessageApiService', [
      'getChat',
      'postChat',
      'patchFolderItem',
    ]);

    const peMessageNavServiceMock = {
      folderTree: [{ _id: 'f-001' }],
    };

    const peOverlayWidgetServiceSpy = jasmine.createSpyObj<PeOverlayWidgetService>('PeOverlayWidgetService', [
      'open',
      'close',
    ]);

    const peMessageChatRoomServiceSpy = jasmine.createSpyObj<PeMessageChatRoomService>('PeMessageChatRoomService', [
      'sendMessage',
    ]);

    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['translate']);
    translateServiceSpy.translate.and.callFake((key: string) => `${key}.translated`);

    TestBed.configureTestingModule({
      declarations: [PeMessageChatRoomListComponent],
      providers: [
        { provide: PeDestroyService, useValue: destroyServiceMock },
        { provide: PeMessageChatRoomListService, useValue: peMessageChatRoomListServiceSpy },
        { provide: PeChatService, useValue: peChatServiceMock },
        { provide: PeContextMenuService, useValue: peContextMenuServiceSpy },
        { provide: PeDragDropService, useValue: peDragDropServiceSpy },
        { provide: PeMessageService, useValue: peMessageServiceMock },
        { provide: PeMessageApiService, useValue: peMessageApiServiceSpy },
        { provide: PeMessageNavService, useValue: peMessageNavServiceMock },
        { provide: PeOverlayWidgetService, useValue: peOverlayWidgetServiceSpy },
        { provide: PeMessageChatRoomService, useValue: peMessageChatRoomServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeMessageChatRoomListComponent);
      component = fixture.componentInstance;

      peChatService = TestBed.inject(PeChatService) as jasmine.SpyObj<PeChatService>;
      peMessageChatRoomListService = TestBed.inject(PeMessageChatRoomListService) as jasmine.SpyObj<PeMessageChatRoomListService>;
      peMessageApiService = TestBed.inject(PeMessageApiService) as jasmine.SpyObj<PeMessageApiService>;
      peMessageService = TestBed.inject(PeMessageService) as jasmine.SpyObj<PeMessageService>;
      peDragDropService = TestBed.inject(PeDragDropService) as jasmine.SpyObj<PeDragDropService>;
      peContextMenuService = TestBed.inject(PeContextMenuService) as jasmine.SpyObj<PeContextMenuService>;
      peMessageChatRoomService = TestBed.inject(PeMessageChatRoomService) as jasmine.SpyObj<PeMessageChatRoomService>;
      peOverlayWidgetService = TestBed.inject(PeOverlayWidgetService) as jasmine.SpyObj<PeOverlayWidgetService>;
      peMessageNavService = TestBed.inject(PeMessageNavService) as jasmine.SpyObj<PeMessageNavService>;
      translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

      /**
       * added style elem to DOM to avoid error on descruction
       */
      styleElem = document.createElement('style');
      styleElem.className = 'style-chat-room-list-menu';

      document.head.appendChild(styleElem);

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set menu data on construct', () => {

    const openChatSpy = spyOn<any>(component, 'openChatRoomFormOverlay');
    const openChannelSpy = spyOn<any>(component, 'openChannelFormOverlay');

    expect(JSON.stringify(component.menuData)).toEqual(JSON.stringify({
      headItem: { title: 'message-app.sidebar.add_new.translated' },
      menuItems: [
        {
          title: 'message-app.sidebar.contact.translated',
          onClick: () => {
            component[`openChatRoomFormOverlay`]();
          },
        },
        {
          title: 'message-app.sidebar.channel.translated',
          onClick: () => {
            component[`openChannelFormOverlay`]();
          },
        },
      ],
    }));
    expect(translateService.translate).toHaveBeenCalledTimes(3);
    expect(translateService.translate.calls.all().map(c => c.args[0])).toEqual([
      'message-app.sidebar.add_new',
      'message-app.sidebar.contact',
      'message-app.sidebar.channel',
    ]);

    /**
     * test contact menu item click callback
     */
    component.menuData.menuItems?.[0].onClick?.();

    expect(openChatSpy).toHaveBeenCalled();

    /**
     * test channel menut item click callback
     */
    component.menuData.menuItems?.[1].onClick?.();

    expect(openChannelSpy).toHaveBeenCalled();

  });

  it('should handle window resize', () => {

    const setSpy = spyOn(component, 'setDynamicGlobalStyle');

    window.dispatchEvent(new Event('resize'));

    expect(setSpy).toHaveBeenCalled();

  });

  it('should handle ng init', () => {

    const handleSpy = spyOn<any>(component, 'handleActiveChat');
    const cdrSpies = {
      mark: spyOn(component[`changeDetectorRef`], 'markForCheck'),
      detect: spyOn(component[`changeDetectorRef`], 'detectChanges'),
    };
    const callbacksList: { [key: string]: Function } = {};
    let getChatSubject = new Subject();

    peChatService.socket.on.and.callFake((eventName: string, callback: Function) => {
      callbacksList[eventName] = callback;
    });

    peMessageChatRoomListService.getContactAvatar.and.callFake((_, callback) => {
      callback('avatar');
    });
    peMessageChatRoomListService.getContactInitials.and.returnValue('initials');
    peMessageChatRoomListService.chatList = [];
    peMessageChatRoomListService.detectChangeStream$ = {
      next: jasmine.createSpy('next'),
    } as any;

    /**
     * peMessageService.isLiveChat is FALSE
     * peChatService.socket is set
     */
    peMessageService.isLiveChat = false;

    component.messageAppColor = null as any;
    component.accentColor = null as any;
    component.ngOnInit();

    expect(component.messageAppColor).toBeNull();
    expect(component.accentColor).toBeNull();
    expect(peChatService.socket.on).toHaveBeenCalledTimes(3);
    expect(handleSpy).toHaveBeenCalled();
    Object.values(cdrSpies).forEach(spy => expect(spy).not.toHaveBeenCalled());

    /**
   * test messages.ws-client.chat.created callback
   * chat does not exist in peMessageChatRoomListService.chatList during peMessageApiService.getChat
   */
    const chat = { _id: 'chat-001' };

    peMessageApiService.getChat.and.returnValue(getChatSubject);
    callbacksList['messages.ws-client.chat.created'](chat);

    expect(peMessageChatRoomListService.getContactAvatar).toHaveBeenCalled();
    expect(peMessageChatRoomListService.getContactAvatar.calls.argsFor(0)[0]).toEqual(chat as any);
    expect(peMessageChatRoomListService.getContactInitials).toHaveBeenCalledWith(chat as any);
    expect(peMessageChatRoomListService.chatList).toEqual([{
      ...chat,
      avatar: 'avatar',
      initials: 'initials',
    }] as any);
    expect(peMessageChatRoomListService.sortChatList).toHaveBeenCalled();
    expect(peChatService.socket.emit).toHaveBeenCalledWith('messages.ws-client.chat-room.join', chat._id);
    expect(peMessageApiService.getChat).toHaveBeenCalledWith(chat._id);
    Object.values(cdrSpies).forEach(spy => expect(spy).not.toHaveBeenCalled());

    peMessageChatRoomListService.chatList = [];
    getChatSubject.next(chat);

    expect(peMessageChatRoomListService.detectChangeStream$.next).toHaveBeenCalled();

    /**
     * chat exists in peMessageChatRoomListService.chatList during peMessageApiService.getChat
     */
    getChatSubject = new Subject();
    peMessageApiService.getChat.and.returnValue(getChatSubject);
    callbacksList['messages.ws-client.chat.created'](chat);
    getChatSubject.next({
      ...chat,
      lastMessages: [{ _id: 'm-001' }],
    });

    expect(peMessageChatRoomListService.chatList[0].lastMessages).toEqual([{ _id: 'm-001' }] as any);

    /**
     * test messages.ws-client.contact.created callback
     */
    const contact = { _id: 'c-001' };

    peMessageService.contactList = [];
    callbacksList['messages.ws-client.contact.created'](contact);

    expect(peMessageService.contactList).toEqual([contact] as any);
    expect(cdrSpies.mark).toHaveBeenCalled();

    /**
     * test messages.ws-client.message.posted callback
     */
    const message = { _id: 'm-001' };

    cdrSpies.mark.calls.reset();
    callbacksList['messages.ws-client.message.posted'](message);

    expect(cdrSpies.mark).toHaveBeenCalled();

    /**
     * peChatService.socket is null
     * peMessageService.isLiveChat is TRUE
     * settings.messageAppColor & accentColor are both null
     */
    peMessageService.isLiveChat = true;
    peChatService.socket = null;

    component.ngOnInit();

    expect(cdrSpies.detect).not.toHaveBeenCalled();
    (peMessageService.currSettings$ as Subject<any>).next({
      settings: {
        messageAppColor: null,
        accentColor: null,
      },
    });
    expect(cdrSpies.detect).toHaveBeenCalled();
    expect(component.messageAppColor).toEqual('');
    expect(component.accentColor).toEqual('');

    /**
     * settings.messageAppColor & accentColor are both set
     */
    (peMessageService.currSettings$ as Subject<any>).next({
      settings: {
        messageAppColor: '#333333',
        accentColor: '#222222',
      },
    });
    expect(component.messageAppColor).toEqual('#333333');
    expect(component.accentColor).toEqual('#222222');

  });

  it('should handle ng after view init', () => {

    const setSpy = spyOn(component, 'setDynamicGlobalStyle');

    component.ngAfterViewInit();

    expect(setSpy).toHaveBeenCalled();

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
    expect(document.head.querySelector('.style-chat-room-list-menu')).toEqual(styleEl);
    expect(styleEl.className).toEqual('style-chat-room-list-menu');
    expect(styleEl.innerHTML).toContain('width: 500px!important');

  });

  it('should handle drag start', () => {

    const chat = { _id: 'chat-001' };

    component.dragStart(chat as any);

    expect(peDragDropService.setDragItem).toHaveBeenCalledWith(chat);

  });

  it('should get last message icon', () => {

    const chat = {
      _id: 'chat-001',
      lastMessages: null,
    };

    /**
     * chat.lastMessages is null
     */
    expect(component.getLastMessageIcon(chat as any)).toBe(false);

    /**
     * chat.lastMessages is set
     * last message attachments is [] (empty array)
     */
    chat.lastMessages = [{
      _id: 'm-001',
      attachments: [],
    }] as any;

    expect(component.getLastMessageIcon(chat as any)).toBe(false);

    /**
     * last message attachments is set
     */
    (chat.lastMessages as any)[0].attachments = [{ _id: 'att-001' }];

    expect(component.getLastMessageIcon(chat as any)).toBe(true);

  });

  it('should get last message content', () => {

    const chat = {
      _id: 'chat-001',
      lastMessages: null,
    };

    /**
     * chat.lastMessages is null
     */
    expect(component.getLastMessageContent(chat as any)).toBeNull();

    /**
     * chat.lastMessages is set
     * lastMessage.type is null
     * lastMessage.content.length is less than 22
     */
    chat.lastMessages = [{
      _id: 'm-001',
      content: 'message.content',
      type: null,
    }] as any;

    expect(component.getLastMessageContent(chat as any)).toEqual('message.content');

    /**
     * lastMessage.content.length is more than 22
     */
    chat.lastMessages = [{
      _id: 'm-001',
      content: 'message.content-message.content', // total length 31
      type: null,
    }] as any;

    expect(component.getLastMessageContent(chat as any)).toEqual('message.content-messag…');

    /**
     * lastMessage.type is template
     */
    chat.lastMessages = [{
      _id: 'm-001',
      content: 'message.content',
      type: 'template',
    }] as any;

    expect(component.getLastMessageContent(chat as any)).toBeNull();

  });

  it('should get number unread messages', () => {

    const chat = {
      _id: 'chat-001',
      lastMessages: null,
    };
    const activeUser = { _id: 'u-001' };

    /**
     * chat.lastMessages is null
     */
    expect(component.getNumberUnreadMessages(chat as any)).toBeNull();

    /**
     * chat.lastMessages is set
     */
    peMessageService.activeUser = activeUser as any;
    chat.lastMessages = [
      {
        _id: 'm-001',
        sender: activeUser._id,
        status: 'unread',
      },
      {
        _id: 'm-002',
        sender: 'u-002',
        status: 'read',
      },
      {
        _id: 'm-003',
        sender: 'u-002',
        status: 'unread',
      },
    ] as any;

    expect(component.getNumberUnreadMessages(chat as any)).toBe(1);

  });

  it('should open context menu', () => {

    const event = {
      preventDefault: jasmine.createSpy('preventDefault'),
      stopPropagation: jasmine.createSpy('stopPropagation'),
    };
    const chat = { _id: 'chat-001' };
    const contextRef = {
      afterClosed: new Subject(),
    };
    const openSpy = spyOn<any>(component, 'openFolderTreeOverlay');

    translateService.translate.calls.reset();
    peContextMenuService.open.and.returnValue(contextRef as any);

    /**
     * argument event is null
     */
    component.openContextMenu(null as any, chat as any);

    expect(peContextMenuService.open).toHaveBeenCalledWith(null as any, {
      theme: 'dark',
      data: {
        title: 'message-app.sidebar.options.translated',
        list: [
          { label: 'message-app.sidebar.move_to.translated...', value: PeMessageContextMenu.Move },
          { label: 'message-app.sidebar.delete.translated', value: PeMessageContextMenu.Delete, red: true },
        ],
      },
    });
    expect(translateService.translate).toHaveBeenCalledTimes(3);
    expect(translateService.translate.calls.all().map(c => c.args[0])).toEqual([
      'message-app.sidebar.options',
      'message-app.sidebar.move_to',
      'message-app.sidebar.delete',
    ]);

    /**
     * argument event is set
     */
    component.openContextMenu(event as any, chat as any);

    expect(peContextMenuService.open).toHaveBeenCalledWith(event as any, {
      theme: 'dark',
      data: {
        title: 'message-app.sidebar.options.translated',
        list: [
          { label: 'message-app.sidebar.move_to.translated...', value: PeMessageContextMenu.Move },
          { label: 'message-app.sidebar.delete.translated', value: PeMessageContextMenu.Delete, red: true },
        ],
      },
    });

    /**
     * test afterClosed
     * event is PeMessageContextMenu.Move
     */
    contextRef.afterClosed.next(PeMessageContextMenu.Move);

    expect(openSpy).toHaveBeenCalledWith(PeMessageContextMenu.Move, chat);
    expect(peMessageChatRoomListService.deleteChat).not.toHaveBeenCalled();

    /**
     * event is PeMessageContextMenu.Delete
     */
    openSpy.calls.reset();
    contextRef.afterClosed.next(PeMessageContextMenu.Delete);

    expect(peMessageChatRoomListService.deleteChat).toHaveBeenCalledWith(chat._id);
    expect(openSpy).not.toHaveBeenCalled();

  });

  it('should create chat', () => {

    const chat = {
      _id: 'chat-001',
      contact: 'u-001',
      integrationName: 'whatsapp',
    };
    const message = { _id: 'm-001' };

    peMessageApiService.postChat.and.returnValue(of(chat));

    peMessageChatRoomListService.chatList = [];

    /**
     * chat does not exist in peMessageRoomListService.chatList
     */
    component[`createChat`](chat as any, message as any);

    expect(peMessageApiService.postChat).toHaveBeenCalledWith(chat as any);
    expect(peMessageChatRoomListService.sortChatList).toHaveBeenCalled();
    expect(peMessageChatRoomListService.activeChat).toEqual(chat as any);
    expect(peChatService.socket.emit).toHaveBeenCalledWith('messages.ws-client.chat-room.join', chat._id);
    expect(peMessageChatRoomService.sendMessage).toHaveBeenCalledWith({ message });

    /**
     * chat exists in peMessageRoomListService.chatList
     */
    peMessageChatRoomListService.activeChat = null;
    peMessageChatRoomListService.chatList.push(chat as any);
    peMessageChatRoomListService.sortChatList.calls.reset();
    peMessageApiService.postChat.calls.reset();
    peMessageChatRoomService.sendMessage.calls.reset();
    peChatService.socket.emit.calls.reset();

    component[`createChat`](chat as any, message as any);

    expect(peMessageChatRoomListService.activeChat).toEqual(chat as any);
    expect(peChatService.socket.emit).toHaveBeenCalledWith('messages.ws-client.chat-room.join', chat._id);
    expect(peMessageChatRoomService.sendMessage).toHaveBeenCalledWith({ message });
    expect(peMessageChatRoomListService.sortChatList).not.toHaveBeenCalled();
    expect(peMessageApiService.postChat).not.toHaveBeenCalled();

  });

  it('should handle active chat', fakeAsync(() => {

    const detectSpy = spyOn(component[`changeDetectorRef`], 'detectChanges');

    peMessageChatRoomListService.detectChangeStream$ = new Subject();

    component[`handleActiveChat`]();
    peMessageChatRoomListService.detectChangeStream$.next();

    expect(detectSpy).not.toHaveBeenCalled();

    tick();

    expect(detectSpy).toHaveBeenCalled();

  }));

  it('should open chat room from overlay', () => {

    const activeUser = {
      _id: 'u-001',
      userAccount: {
        firstName: 'James',
        lastName: 'Bond',
      },
    };
    const contactList = [
      { _id: 'c-001', name: 'Contact 1' },
      { _id: 'c-002', name: 'Contact 2' },
    ];
    const createSpy = spyOn<any>(component, 'createChat');

    translateService.translate.calls.reset();
    peMessageService.activeUser = activeUser as any;
    peMessageService.contactList = contactList as any;

    component[`openChatRoomFormOverlay`]();

    expect(peOverlayWidgetService.open).toHaveBeenCalled();
    let config = peOverlayWidgetService.open.calls.argsFor(0)[0];
    expect(config?.data?.sender).toEqual('James Bond');
    expect(config?.data?.contactList).toEqual(contactList);
    expect(config?.headerConfig).toEqual({
      hideHeader: true,
      removeContentPadding: true,
      title: 'message-app.sidebar.new_chat_message.translated',
      theme: 'dark',
    });
    expect(config?.panelClass).toEqual('pe-message-chat-overlay');
    expect(translateService.translate).toHaveBeenCalledTimes(1);
    expect(translateService.translate).toHaveBeenCalledWith('message-app.sidebar.new_chat_message');

    /**
     * trigger onCloseSubject$
     * data.content is null
     */
    config?.data?.onCloseSubject$.next({ content: null });

    expect(createSpy).not.toHaveBeenCalled();
    expect(peOverlayWidgetService.close).toHaveBeenCalled();

    /**
     * data.content is set
     * contact does not exist in peMessageService.contactList
     */
    component[`openChatRoomFormOverlay`]();

    config = peOverlayWidgetService.open.calls.argsFor(1)[0];
    config?.data?.onCloseSubject$.next({
      content: 'content',
      contact: 'c-005',
      integrationName: 'integration',
    });

    expect(createSpy).toHaveBeenCalledWith({
      title: '',
      integrationName: 'integration',
      contact: 'c-005',
    }, 'content');

    /**
     * contact exists in peMessageService.contactList
     */
    component[`openChatRoomFormOverlay`]();

    config = peOverlayWidgetService.open.calls.argsFor(2)[0];
    config?.data?.onCloseSubject$.next({
      content: 'content',
      contact: 'c-001',
      integrationName: 'integration',
    });

    expect(createSpy).toHaveBeenCalledWith({
      title: 'Contact 1',
      integrationName: 'integration',
      contact: 'c-001',
    }, 'content');

  });

  it('should open channel from overlay', () => {

    translateService.translate.calls.reset();

    component[`openChannelFormOverlay`]();

    expect(peOverlayWidgetService.open).toHaveBeenCalled();
    const config = peOverlayWidgetService.open.calls.argsFor(0)[0];
    expect(config?.data.theme).toEqual('dark');
    expect(config?.hasBackdrop).toBe(true);
    expect(config?.headerConfig).toEqual({
      hideHeader: true,
      removeContentPadding: true,
      title: 'message-app.channel.overlay.title.translated',
      theme: 'dark',
    });
    expect(config?.panelClass).toEqual('pe-message-channel-form-overlay');
    expect(peOverlayWidgetService.close).not.toHaveBeenCalled();
    expect(translateService.translate).toHaveBeenCalledTimes(1);
    expect(translateService.translate).toHaveBeenCalledWith('message-app.channel.overlay.title');

    config?.data.onCloseSubject$.next(true);
    expect(peOverlayWidgetService.close).toHaveBeenCalled();

  });

  it('should open folder tree overlay', () => {

    const chat = { _id: 'chat-001' };
    const folderTree = [{
      _id: 'f-001',
      parentFolder: null,
      children: [{
        _id: 'f-002',
        parentFolder: 'f-001',
        children: [],
      }],
    }];
    const moveSpy = spyOn<any>(component, 'moveChatToFolder');

    translateService.translate.calls.reset();
    peMessageNavService.folderTree = folderTree as any;

    component[`openFolderTreeOverlay`](null as any, chat as any);

    expect(peOverlayWidgetService.open).toHaveBeenCalled();
    const config = peOverlayWidgetService.open.calls.argsFor(0)[0];
    expect(config?.data).toEqual({
      folderTree,
      theme: 'dark',
    });
    expect(config?.headerConfig?.title).toEqual('message-app.sidebar.move_to.translated');
    expect(config?.headerConfig?.backBtnTitle).toEqual('message-app.sidebar.close.translated');
    expect(config?.headerConfig?.doneBtnTitle).toEqual('message-app.sidebar.save.translated');
    expect(config?.headerConfig?.theme).toEqual('dark');
    expect(translateService.translate).toHaveBeenCalledTimes(3);
    expect(translateService.translate.calls.all().map(c => c.args[0])).toEqual([
      'message-app.sidebar.move_to',
      'message-app.sidebar.close',
      'message-app.sidebar.save',
    ]);

    /**
     * test backBtnCallback
     */
    config?.headerConfig?.backBtnCallback?.();

    expect(peOverlayWidgetService.close).toHaveBeenCalled();

    /**
     * test doneBtnCallback
     */
    peOverlayWidgetService.close.calls.reset();
    config?.headerConfig?.onSaveSubject$?.next('f-003');
    config?.headerConfig?.doneBtnCallback?.();

    expect(moveSpy).toHaveBeenCalledWith(chat._id, 'f-003');
    expect(peOverlayWidgetService.close).toHaveBeenCalled();

  });

  it('should move chat to folder', () => {

    const chatId = 'chat-001';
    const folderId = 'f-003';
    const detectSpy = spyOn(component[`changeDetectorRef`], 'detectChanges');

    peMessageChatRoomListService.activeChat = null;
    peMessageApiService.patchFolderItem.and.returnValue(of(null));

    /**
     * peMessageChatRoomListService.chatList.length is 1
     */
    peMessageChatRoomListService.chatList = [{ _id: chatId }] as any;

    component[`moveChatToFolder`](chatId, folderId);

    expect(peMessageApiService.patchFolderItem).toHaveBeenCalledWith(chatId, { parentFolder: folderId });
    expect(peMessageChatRoomListService.chatList).toEqual([]);
    expect(peMessageChatRoomListService.sortChatList).toHaveBeenCalled();
    expect(peMessageChatRoomListService.activeChat).toBeNull();
    expect(detectSpy).toHaveBeenCalled();

    /**
     * peMessageChatRoomListService.chatList.length is 3
     */
    peMessageChatRoomListService.chatList = [
      { _id: 'chat-001' },
      { _id: 'chat-002' },
      { _id: 'chat-003' },
    ] as any;

    component[`moveChatToFolder`](chatId, folderId);

    expect(peMessageChatRoomListService.chatList).toEqual([
      { _id: 'chat-002' },
      { _id: 'chat-003' },
    ] as any);
    expect(peMessageChatRoomListService.activeChat).toEqual({ _id: 'chat-002' } as any);

  });

});
