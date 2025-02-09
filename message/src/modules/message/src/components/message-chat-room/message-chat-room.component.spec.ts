import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PeChatAttachMenuItem, PeChatChannelMenuItem, PeChatMessageStatus, PeChatService } from '@pe/chat';
import { PeDestroyService, PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { of, Subject } from 'rxjs';
import { count } from 'rxjs/operators';
import { PeMessageIntegration } from '../../enums';
import {
  PeMessageApiService,
  PeMessageChatRoomListService,
  PeMessageChatRoomService,
  PeMessageThemeService,
} from '../../services';
import { PeMessageService } from '../../services/message.service';
import { PeMessageChatRoomComponent } from './message-chat-room.component';

describe('PeMessageChatRoomComponent', () => {

  let fixture: ComponentFixture<PeMessageChatRoomComponent>;
  let component: PeMessageChatRoomComponent;
  let peChatService: jasmine.SpyObj<PeChatService>;
  let peMessageChatRoomListService: jasmine.SpyObj<PeMessageChatRoomListService>;
  let peMessageService: jasmine.SpyObj<PeMessageService>;
  let peMessageApiService: jasmine.SpyObj<PeMessageApiService>;
  let peOverlayWidgetService: jasmine.SpyObj<PeOverlayWidgetService>;
  let peMessageChatRoomService: jasmine.SpyObj<PeMessageChatRoomService>;
  let peMessageThemeService: jasmine.SpyObj<PeMessageThemeService>;
  let translateService: jasmine.SpyObj<TranslateService>;

  beforeEach(waitForAsync(() => {

    const destroyServiceMock = new Subject();

    const peMessageServiceMock = {
      activeUser: {
        _id: 'u-001',
      },
      isLiveChat: null,
      currSettings$: new Subject(),
      userList: [],
      contactList: [],
      subscriptionList: [],
      liveChatBubbleClickedStream$: {
        next: jasmine.createSpy('next'),
      },
    };

    const peMessageChatRoomListServiceMock = {
      unreadInFolder$: new Subject(),
      activeChat: null,
      activeChat$: new Subject(),
      chatList: [],
      detectChangeStream$: {
        next: jasmine.createSpy('next'),
      },
      sortChatList: jasmine.createSpy('sortChatList'),
    };

    const peMessageChatRoomServiceSpy = jasmine.createSpyObj<PeMessageChatRoomService>('PeMessageChatRoomService', ['sendMessage']);

    const peMessageThemeServiceSpy = jasmine.createSpyObj<PeMessageThemeService>('PeMessageThemeService', [
      'setTheme',
      'adjustBrightness',
    ]);

    const peChatServiceMock = {
      socket: {
        on: jasmine.createSpy('on'),
        emit: jasmine.createSpy('emit'),
      },
    };

    const peMessageApiServiceSpy = jasmine.createSpyObj<PeMessageApiService>('PeMessageApiService', [
      'getChatMessageList',
      'getChat',
      'getProductCheckoutLink',
    ]);

    const peOverlayWidgetServiceSpy = jasmine.createSpyObj<PeOverlayWidgetService>('PeOverlayWidgetService', [
      'open',
      'close',
    ]);

    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['translate']);
    translateServiceSpy.translate.and.callFake((key: string) => `${key}.translated`);

    const envServiceMock = {
      custom: {
        cdn: 'c-cdn',
      },
    };

    TestBed.configureTestingModule({
      declarations: [PeMessageChatRoomComponent],
      providers: [
        { provide: PeDestroyService, useValue: destroyServiceMock },
        { provide: PeMessageService, useValue: peMessageServiceMock },
        { provide: PeMessageChatRoomListService, useValue: peMessageChatRoomListServiceMock },
        { provide: PeMessageChatRoomService, useValue: peMessageChatRoomServiceSpy },
        { provide: PeMessageThemeService, useValue: peMessageThemeServiceSpy },
        { provide: PeChatService, useValue: peChatServiceMock },
        { provide: PeMessageApiService, useValue: peMessageApiServiceSpy },
        { provide: PeOverlayWidgetService, useValue: peOverlayWidgetServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: PE_ENV, useValue: envServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeMessageChatRoomComponent);
      component = fixture.componentInstance;

      peChatService = TestBed.inject(PeChatService) as jasmine.SpyObj<PeChatService>;
      peMessageChatRoomListService = TestBed.inject(PeMessageChatRoomListService) as
        jasmine.SpyObj<PeMessageChatRoomListService>;
      peMessageService = TestBed.inject(PeMessageService) as jasmine.SpyObj<PeMessageService>;
      peMessageApiService = TestBed.inject(PeMessageApiService) as jasmine.SpyObj<PeMessageApiService>;
      peOverlayWidgetService = TestBed.inject(PeOverlayWidgetService) as jasmine.SpyObj<PeOverlayWidgetService>;
      peMessageChatRoomService = TestBed.inject(PeMessageChatRoomService) as jasmine.SpyObj<PeMessageChatRoomService>;
      peMessageThemeService = TestBed.inject(PeMessageThemeService) as jasmine.SpyObj<PeMessageThemeService>;
      translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set apps images on construct', () => {

    expect(component.appsImages).toEqual({
      'whatsapp': [
        'c-cdn/icons-messages/whatsapp-1.png',
        'c-cdn/icons-messages/whatsapp-2.png',
        'c-cdn/icons-messages/whatsapp-3.png',
      ],
      'facebook-messenger': [
        'c-cdn/icons-messages/fb-messenger-1.png',
        'c-cdn/icons-messages/fb-messenger-2.png',
        'c-cdn/icons-messages/fb-messenger-3.png',
      ],
      'live-chat': [
        'c-cdn/icons-messages/live-chat-1.png',
        'c-cdn/icons-messages/live-chat-2.png',
        'c-cdn/icons-messages/live-chat-3.png',
      ],
    });

  });

  it('should get unread messages', () => {

    component.unreadMessages.pipe(
      count((value, index) => {
        if (index === 0) {
          expect(value).toEqual('99+');
          return true;
        }
        expect(value).toEqual('13');
        return true;
      })
    ).subscribe();

    /**
     * value is 113
     */
    (peMessageChatRoomListService.unreadInFolder$ as Subject<number>).next(113);

    /**
     * value is 13
     */
    (peMessageChatRoomListService.unreadInFolder$ as Subject<number>).next(13);

  });

  it('should handle ng init', () => {

    const message = {
      _id: 'm-001',
      chat: 'chat-001',
      sender: 'u-001',
      status: null,
      sentAt: new Date(),
    };
    const chat = {
      _id: 'chat-001',
      lastMessages: null,
      updatedAt: null,
    };
    const detectSpy = spyOn(component[`changeDetectorRef`], 'detectChanges');
    const transformSpy = spyOn<any>(component, 'messageTransform').and.returnValue(message);
    const updateSpy = spyOn<any>(component, 'updateMessageStatus');
    const handleSpy = spyOn<any>(component, 'handleActiveChat');
    let callback!: Function;

    peChatService.socket.on.and.callFake((_: any, fn: Function) => {
      callback = fn;
    });

    /**
     * peMessageService.isLiveChat is FALSE
     */
    peMessageService.isLiveChat = false;

    component.bgChatColor = null as any;
    component.accentColor = null as any;
    component.messageAppColor = null as any;
    component.messagesBottomColor = null as any;
    component.messagesTopColor = null as any;
    component.ngOnInit();

    expect(peChatService.socket.on).toHaveBeenCalled();
    expect(peChatService.socket.on.calls.argsFor(0)[0]).toEqual('messages.ws-client.message.posted');
    expect(handleSpy).toHaveBeenCalled();
    expect(callback).toBeDefined();
    expect(component.bgChatColor).toBeNull();
    expect(component.accentColor).toBeNull();
    expect(component.messageAppColor).toBeNull();
    expect(component.messagesBottomColor).toBeNull();
    expect(component.messagesTopColor).toBeNull();
    expect(component.timeInfo).toEqual({});

    /**
     * test callback
     * peMessageChatRoomListService.activeChat is null
     * peMessageChatRoomListService.chatList is [] (empty array)
     */
    peMessageChatRoomListService.activeChat = null;
    peMessageChatRoomListService.chatList = [];

    callback(message);

    expect(transformSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();
    expect(component.messageList).toEqual([]);
    expect(peMessageChatRoomListService.sortChatList).toHaveBeenCalled();
    expect(detectSpy).toHaveBeenCalled();

    /**
     * peMessageChatRoomListService.activeChat is set
     * peMessageService.activeUser._id is equal to message.sender
     * chat exists in peMessageChatRoomListService.chatList
     * chat.lastMessages is null
     */
    peMessageChatRoomListService.chatList.push(chat as any);
    peMessageChatRoomListService.activeChat = chat as any;

    callback(message);

    expect(transformSpy).toHaveBeenCalledWith(message, true);
    expect(component.messageList).toEqual([message] as any);
    expect(updateSpy).not.toHaveBeenCalled();
    expect(message.status).toBeNull();
    expect(chat.lastMessages).toBeNull();
    expect(chat.updatedAt).toEqual(message.sentAt as any);

    /**
     * chat.lastMessages is set
     * peMessageService.activeUser._id is NOT equal to message.sender
     */
    transformSpy.calls.reset();
    message.sender = 'u-002';
    chat.lastMessages = [] as any;
    chat.updatedAt = null;
    component.messageList = [];

    callback(message);

    expect(transformSpy).toHaveBeenCalledWith({ ...message, status: null }, false);
    expect(component.messageList).toEqual([message] as any);
    expect(updateSpy).toHaveBeenCalledWith(message);
    expect(message.status).toEqual(PeChatMessageStatus.READ as any);
    expect(chat.lastMessages).toEqual([message] as any);
    expect(chat.updatedAt).toEqual(message.sentAt as any);

    /**
     * peMessageService.isLiveChat is TRUE
     * peChatService.socket is null
     * all props in peMessageService.currSettings is null
     */
    peChatService.socket = null;
    peMessageService.isLiveChat = true;
    detectSpy.calls.reset();

    component.ngOnInit();

    (peMessageService.currSettings$ as Subject<any>).next({
      settings: {
        bgChatColor: null,
        accentColor: null,
        messageAppColor: null,
        messagesBottomColor: null,
        messagesTopColor: null,
      },
    });
    expect(detectSpy).toHaveBeenCalled();
    expect(component.bgChatColor).toEqual('');
    expect(component.accentColor).toEqual('');
    expect(component.messageAppColor).toEqual('');
    expect(component.messagesBottomColor).toEqual('');
    expect(component.messagesTopColor).toEqual('');

    /**
     * all props in peMessageService.currSettings are set
     */
    (peMessageService.currSettings$ as Subject<any>).next({
      settings: {
        bgChatColor: '#cccccc',
        accentColor: '#aaaaaa',
        messageAppColor: '#666666',
        messagesBottomColor: '#333333',
        messagesTopColor: '#111111',
      },
    });
    expect(component.bgChatColor).toEqual('#cccccc');
    expect(component.accentColor).toEqual('#aaaaaa');
    expect(component.messageAppColor).toEqual('#666666');
    expect(component.messagesBottomColor).toEqual('#333333');
    expect(component.messagesTopColor).toEqual('#111111');

    /**
     * peMessageChatRoomListService.activeChat$ is null
     */
    (peMessageChatRoomListService.activeChat$ as Subject<any>).next(null);

    expect(component.timeInfo).toEqual({
      lastSeen: '',
      currentlyAnswering: '',
    });

    /**
     * peMessageChatRoomListService.activeChat$ is set
     */
    const activeChat = {
      lastSeen: '1 hour ago',
      updatedAt: new Date(),
    };
    (peMessageChatRoomListService.activeChat$ as Subject<any>).next(activeChat);

    expect(component.timeInfo).toEqual({
      lastSeen: activeChat.lastSeen,
      currentlyAnswering: activeChat.updatedAt,
    });

  });

  it('should handle ng after view init', () => {

    const nextSpy = spyOn(component.shownBs, 'next');

    component.ngAfterViewInit();

    /**
     * peMessageChatRoomListService.activeChat is null
     */
    (peMessageChatRoomListService.activeChat$ as Subject<any>).next(null);
    expect(nextSpy).not.toHaveBeenCalled();

    /**
     * peMessageChatRoomListService.activeChat is set
     */
    (peMessageChatRoomListService.activeChat$ as Subject<any>).next({ _id: 'chat-001' });
    expect(nextSpy).toHaveBeenCalledWith(true);

  });

  it('should test message accent color', () => {

    const message = {
      isCurrentUserSender: false,
    };

    peMessageThemeService.setTheme.and.returnValues('dark', 'dark', 'light');
    peMessageThemeService.adjustBrightness.and.returnValues('#999999', '#000000');

    component.accentColor = '#333333';
    component.messagesBottomColor = '#222222';

    /**
     * message.isCurrentUserSender is FALSE
     * peMessageThemeService.setTheme returns 'dark'
     */
    expect(component.messageAccentColor(message)).toEqual('#333333');
    expect(peMessageThemeService.setTheme).toHaveBeenCalledWith('#222222');
    expect(peMessageThemeService.adjustBrightness).not.toHaveBeenCalled();

    /**
     * message.isCurrentUserSender is TRUE
     */
    message.isCurrentUserSender = true;
    expect(component.messageAccentColor(message)).toEqual('#999999');
    expect(peMessageThemeService.adjustBrightness).toHaveBeenCalledWith('#222222', 80);

    /**
     * peMessageThemeService.setTheme returns 'light'
     */
    expect(component.messageAccentColor(message)).toEqual('#000000');
    expect(peMessageThemeService.adjustBrightness).toHaveBeenCalledWith('#222222', -60);

  });

  it('should send message on appsMenuItem function', () => {

    const item = {
      app: 'facebook-messenger',
      image: 'image.jpg',
    };
    const eventMock = {
      type: 'template',
      components: [{
        type: 'header',
        parameters: [{
          type: 'image',
          image: {
            link: 'image.jpg',
          },
          action: undefined,
        }],
      }],
    };

    function runAssertion() {
      expect(peMessageChatRoomService.sendMessage).toHaveBeenCalledWith(eventMock);
    }

    /**
     * peMessageService.subscriptionList is [] (empty array)
     * item.app is 'facebook-messenger'
     */
    peMessageService.subscriptionList = [];

    component.appsMenuItem(item);

    runAssertion();

    /**
     * item.app is 'whatsapp'
     */
    item.app = 'whatsapp';

    component.appsMenuItem(item);

    runAssertion();

    /**
     * peMessageService.subscriptionList is set
     * but subscription.info is null
     * item.app is 'facebook-messenger'
     */
    peMessageService.subscriptionList = [
      {
        info: null,
        integration: {
          name: 'facebook-messenger'
        },
      },
      {
        info: null,
        integration: {
          name: 'whatsapp'
        },
      },
    ] as any;
    item.app = 'facebook-messenger';

    component.appsMenuItem(item);

    runAssertion();

    /**
     * item.app is 'whatsapp'
     */
    item.app = 'whatsapp';

    component.appsMenuItem(item);

    runAssertion();

    /**
     * subscription.info is set
     * item.app is 'facebook-messenger'
     */
    peMessageService.subscriptionList[0].info = { pageId: 'p-001' };
    peMessageService.subscriptionList[1].info = { phoneNumber: '123456789' };
    item.app = 'facebook-messenger';
    eventMock.components[0].parameters[0].action = 'https://facebook.com/p-001' as any;

    component.appsMenuItem(item);

    runAssertion();

    /**
     * item.app is 'whatsapp'
     */
    item.app = 'whatsapp';
    eventMock.components[0].parameters[0].action = 'https://wa.me/123456789' as any;

    component.appsMenuItem(item);

    runAssertion();

  });

  it('should attach menu item', () => {

    const openSpy = spyOn<any>(component, 'openProductListOverlay');

    /**
     * item is 'file'
     */
    component.attachMenuItem(PeChatAttachMenuItem.File);

    expect(openSpy).not.toHaveBeenCalled();

    /**
     * item is 'product'
     */
    component.attachMenuItem(PeChatAttachMenuItem.Product);

    expect(openSpy).toHaveBeenCalled();

  });

  it('should channel menu item', () => {

    const item = PeChatChannelMenuItem.WhatsApp;
    const chat = {
      _id: 'chat-001',
      contact: 'c-001',
      title: 'Contact 1',
      integrationName: item as string,
    };

    /**
     * peMessageChatRoomListService.chatList is [] (empty array)
     */
    peMessageChatRoomListService.activeChat = null;

    component.channelMenuItem(item);

    expect(peMessageChatRoomListService.activeChat).toEqual({
      contact: undefined,
      title: undefined,
      integrationName: item,
    } as any);

    /**
     * peMessageChatRoomListService.chatList is set
     * peMessageChatRoomListService.activeChat is null
     */
    peMessageChatRoomListService.chatList = [chat] as any;
    peMessageChatRoomListService.activeChat = null;

    component.channelMenuItem(item);

    expect(peMessageChatRoomListService.activeChat).toEqual({
      contact: undefined,
      title: undefined,
      integrationName: item,
    } as any);

    /**
     * peMessageChatRoomListService.activeChat is set
     * but chat is not in peMessageChatRoomListService.chatList
     */
    peMessageChatRoomListService.activeChat = {
      contact: 'c-002',
      title: 'Contact 2',
    } as any;

    component.channelMenuItem(item);

    expect(peMessageChatRoomListService.activeChat).toEqual({
      contact: 'c-002',
      title: 'Contact 2',
      integrationName: item,
    } as any);

    /**
     * peMessageChatRoomListService.activeChat is in peMessageChatRoomListService.chatList
     */
    peMessageChatRoomListService.activeChat = {
      contact: 'c-001',
      title: 'Test Contact',
    } as any;

    component.channelMenuItem(item);

    expect(peMessageChatRoomListService.activeChat).toEqual(chat as any);

  });

  it('should handle avatar in header', () => {

    /**
     * peMessageChatRoomListService.activeChat is null
     */
    peMessageChatRoomListService.activeChat = null;

    component.onAvatarInHeader();

    expect(peOverlayWidgetService.open).toHaveBeenCalled();
    let config = peOverlayWidgetService.open.calls.argsFor(0)[0];
    expect(config?.data).toEqual({ theme: 'dark' });
    expect(config?.headerConfig?.title).toBeUndefined();
    expect(config?.headerConfig?.theme).toEqual('dark');
    expect(config?.headerConfig?.backBtnTitle).toEqual('message-app.sidebar.cancel.translated');
    expect(config?.headerConfig?.doneBtnTitle).toEqual('message-app.sidebar.done.translated');
    expect(translateService.translate).toHaveBeenCalledTimes(2);
    expect(translateService.translate.calls.all().map(c => c.args[0])).toEqual([
      'message-app.sidebar.cancel',
      'message-app.sidebar.done',
    ]);
    expect(peOverlayWidgetService.close).not.toHaveBeenCalled();

    /**
     * test config.headerConfig.backBtnCallback
     */
    config?.headerConfig?.backBtnCallback?.();

    expect(peOverlayWidgetService.close).toHaveBeenCalled();

    /**
     * test config.headerConfig.doneBtnCallback
     */
    peOverlayWidgetService.close.calls.reset();
    config?.headerConfig?.doneBtnCallback?.();

    expect(peOverlayWidgetService.close).toHaveBeenCalled();

    /**
     * peMessageChatRoomListService.activeChat is set
     */
    peMessageChatRoomListService.activeChat = { title: 'Chat 1' } as any;

    component.onAvatarInHeader();

    expect(peOverlayWidgetService.open).toHaveBeenCalledTimes(2);
    config = peOverlayWidgetService.open.calls.argsFor(1)[0];
    expect(config?.headerConfig?.title).toEqual('Chat 1');

  });

  it('should get chat message list', () => {

    const messages = [
      {
        _id: 'm-001',
        sender: 'u-001',
        status: 'read',
      },
      {
        _id: 'm-002',
        sender: 'u-002',
        status: 'unread',
      },
    ];
    const detectSpy = spyOn(component[`changeDetectorRef`], 'detectChanges');
    const transformSpy = spyOn<any>(component, 'messageTransform').and.callFake((message: any) => message);
    const updateSpy = spyOn<any>(component, 'updateMessageStatus');

    peMessageApiService.getChatMessageList.and.returnValue(of(messages));

    component[`getChatMessageList`]('chat-001');

    expect(peMessageApiService.getChatMessageList).toHaveBeenCalledWith('chat-001');
    expect(component.messageList).toEqual(messages as any);
    messages.forEach((m, i) => expect(transformSpy).toHaveBeenCalledWith(m, i === 0 ? true : false));
    expect(updateSpy).toHaveBeenCalledWith(messages[1]);
    expect(detectSpy).toHaveBeenCalled();

  });

  it('should handle active chat', () => {

    const refreshSpy = spyOn<any>(component, 'refreshMessages');
    const activeChatSubject = new Subject<any>();
    const chat = {
      _id: 'chat-001',
      integrationName: null,
    };
    const freshChat = {
      ...chat,
      messages: [{
        _id: 'm-001',
        sender: 'u-001',
        status: 'read',
      }],
    };

    peMessageChatRoomListService.activeChat$ = activeChatSubject;
    peMessageChatRoomService.channelMenuItems = [{ test: 'channel.menu.item' }] as any;
    peMessageApiService.getChat.and.returnValue(of(freshChat));

    component[`handleActiveChat`]();

    /**
     * chat is null
     */
    component.activeChannel = null as any;
    component.messageList = null as any;
    component.appsMenuItems = null as any;
    activeChatSubject.next(null);

    expect(component.activeChannel).toBeNull();
    expect(component.messageList).toEqual([]);
    expect(component.appsMenuItems).toBeNull();
    expect(peMessageApiService.getChat).not.toHaveBeenCalled();
    expect(refreshSpy).not.toHaveBeenCalled();

    /**
     * chat is set
     * chat.integrationName is null
     * peMessageService.isLiveChat is TRUE
     */
    peMessageService.isLiveChat = true;
    activeChatSubject.next(chat);

    expect(component.activeChannel).toBeNull();
    expect(component.appsMenuItems).toEqual([{ test: 'channel.menu.item' }] as any);
    expect(peMessageApiService.getChat).not.toHaveBeenCalled();
    expect(refreshSpy).toHaveBeenCalledWith(chat);

    /**
     * chat.integrationName is set
     * peMessageService.isLiveChat is FALSE
     */
    chat.integrationName = PeMessageIntegration.WhatsApp as any;
    peMessageService.isLiveChat = false;
    activeChatSubject.next(chat);

    expect(component.activeChannel).toEqual(PeChatChannelMenuItem.WhatsApp);
    expect(peMessageApiService.getChat).toHaveBeenCalledWith(chat._id);
    expect(refreshSpy).toHaveBeenCalledWith(freshChat);

  });

  it('should refresh messages', () => {

    const detectSpy = spyOn(component[`changeDetectorRef`], 'detectChanges');
    const transformSpy = spyOn<any>(component, 'messageTransform').and.callFake((message: any) => message);
    const updateSpy = spyOn<any>(component, 'updateMessageStatus');
    const chat = {
      _id: 'chat-001',
      lastMessages: null,
      messages: null,
    };
    const messages = [
      {
        _id: 'm-001',
        sender: 'u-001',
        status: 'read',
      },
      {
        _id: 'm-002',
        sender: 'u-002',
        status: 'unread',
      },
    ];

    /**
     * chat is null
     */
    component.messageList = null as any;
    component[`refreshMessages`](null as any);

    expect(component.messageList).toBeNull();
    expect(updateSpy).not.toHaveBeenCalled();
    expect(transformSpy).not.toHaveBeenCalled();
    expect(detectSpy).not.toHaveBeenCalled();

    /**
     * chat is set
     * chat.messages is set
     * peMessageService.activeUser is null
     */
    chat.messages = messages as any;
    peMessageService.activeUser = null as any;

    component[`refreshMessages`](chat as any);

    expect(component.messageList).toEqual(messages as any);
    messages.forEach((m, i) => expect(transformSpy).toHaveBeenCalledWith(m, false));
    expect(updateSpy).not.toHaveBeenCalled();
    expect(detectSpy).toHaveBeenCalled();

    /**
     * peMessageService.activeUser is set
     */
    peMessageService.activeUser = { _id: 'u-001' } as any;
    transformSpy.calls.reset();

    component[`refreshMessages`](chat as any);

    messages.forEach((m, i) => expect(transformSpy).toHaveBeenCalledWith(m, i === 0 ? true : false));
    expect(updateSpy).toHaveBeenCalledWith(messages[1]);

  });

  it('should trasform message', () => {

    const message = {
      _id: 'm-001',
      name: null,
      sender: 'u-001',
      chat: 'chat-001',
      content: 'content',
      avatar: null,
      reply: null,
      isCurrentUserSender: null,
    };
    const user = {
      _id: 'u-001',
      userAccount: {
        firstName: 'Bruce',
        lastName: 'Wayne',
      },
    };
    const contact = {
      _id: 'u-001',
      avatar: 'avatar',
      name: 'James Bond',
    };
    const chat = {
      _id: 'chat-001',
      title: 'Chat 1',
    };

    /**
     * peMessageService.userList, contactList & activeUser are null
     * peMessageService.isLiveChat is FALSE
     */
    peMessageService.userList = null as any;
    peMessageService.contactList = null as any;
    peMessageService.activeUser = null as any;
    peMessageService.isLiveChat = false;

    expect(component[`messageTransform`](Object.assign({}, message) as any, true)).toEqual({
      _id: 'm-001',
      name: undefined,
      sender: 'u-001',
      chat: 'chat-001',
      content: 'content',
      avatar: undefined,
      reply: true,
      isCurrentUserSender: true,
    } as any);

    /**
     * peMessageService.userList is [] (empty array)
     * peMessageService.contactList is set
     */
    peMessageService.userList = [];
    peMessageService.contactList = [contact] as any;

    expect(component[`messageTransform`](Object.assign({}, message) as any, true)).toEqual({
      _id: 'm-001',
      name: 'James Bond',
      sender: 'u-001',
      chat: 'chat-001',
      content: 'content',
      avatar: 'avatar',
      reply: true,
      isCurrentUserSender: true,
    } as any);

    /**
     * peMessageService.userList is set
     */
    peMessageService.userList = [user] as any;

    expect(component[`messageTransform`](Object.assign({}, message) as any, true).name).toEqual('Bruce Wayne');

    /**
     * peMessageService.isLiveChat is TRUE
     * chat is not in peMessageChatRoomListService.chatList
     */
    peMessageService.isLiveChat = true;
    peMessageChatRoomListService.chatList = [{
      _id: 'chat-002',
      title: null,
    }] as any;

    expect(component[`messageTransform`](Object.assign({}, message) as any, true).title).toBeUndefined();

    /**
     * chat is in peMessageChatRoomListService.chatList
     */
    peMessageChatRoomListService.chatList = [chat] as any;

    expect(component[`messageTransform`](Object.assign({}, message) as any, true).name).toEqual('Chat 1');

    /**
     * peMessageService.activeUser is set
     */
    peMessageService.activeUser = user as any;

    expect(component[`messageTransform`](Object.assign({}, message) as any, false)).toEqual({
      _id: 'm-001',
      name: 'Visitor',
      sender: 'u-001',
      chat: 'chat-001',
      content: 'content',
      avatar: 'avatar',
      reply: false,
      isCurrentUserSender: false,
    } as any);

  });

  it('should open product list overlay', () => {

    let config!: PeOverlayConfig;

    peOverlayWidgetService.open.and.callFake((overlayConfig: any) => config = overlayConfig);

    component.theme = 'light';
    component[`openProductListOverlay`]();

    expect(peOverlayWidgetService.open).toHaveBeenCalled();
    expect(config.data).toEqual({ theme: 'light' });
    expect(config.hasBackdrop).toBe(true);
    expect(config.headerConfig?.title).toEqual('message-app.chat-room.products.translated');
    expect(config.headerConfig?.theme).toEqual('light');
    expect(config.headerConfig?.removeContentPadding).toBe(true);
    expect(config.headerConfig?.hideHeader).toBe(true);
    expect(config.panelClass).toEqual('pe-message-products-overlay');
    expect(translateService.translate).toHaveBeenCalledTimes(1);
    expect(translateService.translate).toHaveBeenCalledWith('message-app.chat-room.products');

    /**
     * test onSaveSubject$ emit
     * productIds is []
     */
    config.headerConfig?.onSaveSubject$?.next([]);

    expect(peMessageApiService.getProductCheckoutLink).not.toHaveBeenCalled();
    expect(peMessageChatRoomService.sendMessage).not.toHaveBeenCalled();
    expect(peOverlayWidgetService.close).toHaveBeenCalled();

    /**
     * productIds is set
     */
    config = null as any;
    peOverlayWidgetService.close.calls.reset();
    peMessageApiService.getProductCheckoutLink.and.returnValue(of({ link: 'checkout.link' }));

    component.activeChannel = PeChatChannelMenuItem.WhatsApp;
    component[`openProductListOverlay`]();

    config.headerConfig?.onSaveSubject$?.next(['prod-001']);

    expect(peMessageApiService.getProductCheckoutLink).toHaveBeenCalledWith({
      productIds: ['prod-001'],
      type: PeChatChannelMenuItem.WhatsApp,
    });
    expect(peMessageChatRoomService.sendMessage).toHaveBeenCalledWith({ message: 'checkout.link' });
    expect(peOverlayWidgetService.close).toHaveBeenCalled();

  });

  it('should update message status', () => {

    const message = {
      _id: 'm-001',
      chat: 'chat-001',
      status: 'unread',
    };
    const chat = {
      _id: 'chat-001',
      lastMessages: null,
    };

    /**
     * peMessageChatRoomListService.chatList is [] (empty array)
     */
    peMessageChatRoomListService.chatList = [];

    component[`updateMessageStatus`](message as any);

    expect(message.status).toEqual('unread');
    expect(peChatService.socket.emit).toHaveBeenCalledWith('messages.ws-client.message.mark-read', message._id);
    expect(peMessageChatRoomListService.detectChangeStream$.next).toHaveBeenCalled();

    /**
     * peMessageChatRoomListService.chatList is set
     * chat.lastMessages is null
     */
    peChatService.socket.emit.calls.reset();
    (peMessageChatRoomListService.detectChangeStream$.next as jasmine.Spy).calls.reset();
    peMessageChatRoomListService.chatList = [chat] as any;

    component[`updateMessageStatus`](message as any);

    expect(message.status).toEqual('unread');
    expect(peChatService.socket.emit).toHaveBeenCalledWith('messages.ws-client.message.mark-read', message._id);
    expect(peMessageChatRoomListService.detectChangeStream$.next).toHaveBeenCalled();

    /**
     * chat.lastMessages is set
     */
    chat.lastMessages = [message] as any;
    peChatService.socket.emit.calls.reset();
    (peMessageChatRoomListService.detectChangeStream$.next as jasmine.Spy).calls.reset();
    peMessageChatRoomListService.chatList = [chat] as any;

    component[`updateMessageStatus`](message as any);

    expect(message.status).toEqual('read');
    expect(peChatService.socket.emit).toHaveBeenCalledWith('messages.ws-client.message.mark-read', message._id);
    expect(peMessageChatRoomListService.detectChangeStream$.next).toHaveBeenCalled();

  });

  it('should handle hide chat click', () => {

    component.clickOnHideChat();

    expect(peMessageService.liveChatBubbleClickedStream$.next).toHaveBeenCalled();

  });

});
