import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { PeAuthService } from '@pe/auth';
import { PeChatService } from '@pe/chat';
import { EnvService, PeDestroyService, PE_ENV } from '@pe/common';
import { TranslateService, TranslationLoaderService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayWidgetService, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { of, Subject, throwError } from 'rxjs';
import { PeMessageComponent } from './message.component';
import {
  PeMessageApiService,
  PeMessageAppearanceService,
  PeMessageChatRoomListService,
  PeMessageChatRoomService,
  PeMessageEmbedService,
  PeMessageNavService,
  PeMessageService,
  PeMessageSubscriptionListService,
  PeMessageThemeService,
} from './services';

describe('PeMessageComponent', () => {

  let fixture: ComponentFixture<PeMessageComponent>;
  let component: PeMessageComponent;
  let peMessageApiService: jasmine.SpyObj<PeMessageApiService>;
  let peMessageService: jasmine.SpyObj<PeMessageService>;
  let peMessageSubscriptionListService: jasmine.SpyObj<PeMessageSubscriptionListService>;
  let translationLoaderService: jasmine.SpyObj<TranslationLoaderService>;
  let peChatService: jasmine.SpyObj<PeChatService>;
  let peMessageChatRoomListService: jasmine.SpyObj<PeMessageChatRoomListService>;
  let peMessageChatRoomService: jasmine.SpyObj<PeMessageChatRoomService>;
  let peOverlayWidgetService: jasmine.SpyObj<PeOverlayWidgetService>;
  let peMessageNavService: jasmine.SpyObj<PeMessageNavService>;
  let peMessageThemeService: jasmine.SpyObj<PeMessageThemeService>;
  let peMessageAppearanceService: jasmine.SpyObj<PeMessageAppearanceService>;
  let peMessageEmbedService: jasmine.SpyObj<PeMessageEmbedService>;
  let translateService: jasmine.SpyObj<TranslateService>;
  let activeFolderSubject: Subject<any>;
  let envMock: any;
  let styleElem: HTMLStyleElement;

  beforeEach(waitForAsync(() => {

    const destroyServiceMock = new Subject();

    const envServiceMock = { businessId: 'b-001' };

    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['translate']);
    translateServiceSpy.translate.and.callFake((key: string) => `${key}.translated`);

    const peAuthServiceMock = {
      token: 'token',
    };

    const peChatServiceSpy = jasmine.createSpyObj<PeChatService>('PeChatService', ['connect'], {
      socket: {
        on: jasmine.createSpy('on'),
        emit: jasmine.createSpy('emit'),
      },
    });

    const peMessageApiServiceSpy = jasmine.createSpyObj<PeMessageApiService>('PeMessageApiService', [
      'getPublicChannel',
      'getChannelList',
      'getSettings',
      'getBubble',
      'getContactList',
      'getUserList',
      'getSubscriptionList',
      'getSubscriptionsAll',
      'patchSettings',
      'patchBubble',
      'patchSubscriptionInstall',
      'patchSubscriptionUninstall',
    ]);

    const peMessageAppearanceServiceMock = {
      openOverlayAppearance$: new Subject<void>(),
    };

    activeFolderSubject = new Subject();
    const peMessageNavServiceMock = {
      activeFolder$: activeFolderSubject,
    };

    const peMessageServiceMock = {
      isLiveChat: null,
      liveChatBubbleClickedStream$: new Subject(),
      settings: null,
      currSettings: null,
      currSettings$: new Subject(),
      bubble: null,
      contactList: null,
      userList: null,
      activeUser: null,
      subscriptionList: null,
    };

    const peMessageChatRoomServiceMock = {
      channelMenuItems: null,
    };

    const peMessageChatRoomListServiceMock = {
      mobileView: null,
      chatList: null,
      activeChat: null,
      activeChat$: new Subject(),
      getContactInitials: jasmine.createSpy('getContactInitials'),
      getConversationList: jasmine.createSpy('getConversationList'),
    };

    const peMessageEmbedServiceMock = {
      openOverlayEmbed$: new Subject<void>(),
    };

    const peMessageSubscriptionListServiceMock = {
      openOverlaySubscriptionList$: new Subject(),
    };

    const peOverlayWidgetServiceSpy = jasmine.createSpyObj<PeOverlayWidgetService>('PeOverlayWidgetService', [
      'open',
      'close',
    ]);

    const translationLoaderServiceSpy = jasmine.createSpyObj<TranslationLoaderService>('TranslationLoaderService', {
      loadTranslations: of(true),
    });

    const peMessageThemeServiceSpy = jasmine.createSpyObj<PeMessageThemeService>('PeMessageThemeService', [
      'setTheme',
      'adjustBrightness',
    ]);

    envMock = {
      backend: {
        message: 'be-message',
      },
    };

    TestBed.configureTestingModule({
      declarations: [PeMessageComponent],
      providers: [
        { provide: PeDestroyService, useValue: destroyServiceMock },
        { provide: EnvService, useValue: envServiceMock },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: PeAuthService, useValue: peAuthServiceMock },
        { provide: PeChatService, useValue: peChatServiceSpy },
        { provide: PeMessageApiService, useValue: peMessageApiServiceSpy },
        { provide: PeMessageAppearanceService, useValue: peMessageAppearanceServiceMock },
        { provide: PeMessageNavService, useValue: peMessageNavServiceMock },
        { provide: PeMessageService, useValue: peMessageServiceMock },
        { provide: PeMessageChatRoomService, useValue: peMessageChatRoomServiceMock },
        { provide: PeMessageChatRoomListService, useValue: peMessageChatRoomListServiceMock },
        { provide: PeMessageEmbedService, useValue: peMessageEmbedServiceMock },
        { provide: PeMessageSubscriptionListService, useValue: peMessageSubscriptionListServiceMock },
        { provide: PeOverlayWidgetService, useValue: peOverlayWidgetServiceSpy },
        { provide: TranslationLoaderService, useValue: translationLoaderServiceSpy },
        { provide: PeMessageThemeService, useValue: peMessageThemeServiceSpy },
        { provide: PE_OVERLAY_DATA, useValue: {} },
        { provide: PE_ENV, useValue: envMock },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeMessageComponent);
      component = fixture.componentInstance;
      component.business = 'b-001';
      component.channel = 'ch-001';

      peMessageApiService = TestBed.inject(PeMessageApiService) as jasmine.SpyObj<PeMessageApiService>;
      peMessageService = TestBed.inject(PeMessageService) as jasmine.SpyObj<PeMessageService>;
      peMessageSubscriptionListService = TestBed.inject(PeMessageSubscriptionListService) as
        jasmine.SpyObj<PeMessageSubscriptionListService>;
      translationLoaderService = TestBed.inject(TranslationLoaderService) as jasmine.SpyObj<TranslationLoaderService>;
      peChatService = TestBed.inject(PeChatService) as jasmine.SpyObj<PeChatService>;
      peMessageChatRoomListService = TestBed.inject(PeMessageChatRoomListService) as
        jasmine.SpyObj<PeMessageChatRoomListService>;
      peMessageChatRoomService = TestBed.inject(PeMessageChatRoomService) as jasmine.SpyObj<PeMessageChatRoomService>;
      peOverlayWidgetService = TestBed.inject(PeOverlayWidgetService) as jasmine.SpyObj<PeOverlayWidgetService>;
      peMessageNavService = TestBed.inject(PeMessageNavService) as jasmine.SpyObj<PeMessageNavService>;
      peMessageThemeService = TestBed.inject(PeMessageThemeService) as jasmine.SpyObj<PeMessageThemeService>;
      peMessageAppearanceService = TestBed.inject(PeMessageAppearanceService) as jasmine.SpyObj<PeMessageAppearanceService>;
      peMessageEmbedService = TestBed.inject(PeMessageEmbedService) as jasmine.SpyObj<PeMessageEmbedService>;
      translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;

      /**
       * added style elem to DOM to avoid error on descruction
       */
      styleElem = document.createElement('style');
      styleElem.className = 'style-accent-elements';

      document.head.appendChild(styleElem);

    });

  }));

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should set pe message api path on construct', () => {

    /**
     * environmentConfigInterface.backend.message is set
     */
    expect(component.peMessageApiPath).toEqual('be-message');

    /**
     * environmentConfigInterface.backend is null
     */
    envMock.backend = null;

    fixture = TestBed.createComponent(PeMessageComponent);
    component = fixture.componentInstance;

    expect(component.peMessageApiPath).toBeUndefined();

  });

  it('should handle window resize', () => {

    spyOnProperty(window, 'innerWidth').and.returnValue(500);

    peMessageChatRoomListService.mobileView = false;
    component.mobileView = false;

    window.dispatchEvent(new Event('resize'));

    expect(component.mobileView).toBe(true);
    expect(peMessageChatRoomListService.mobileView).toBe(true);


  });

  it('should handle ng init', () => {

    const liveSpy = spyOn(component, 'liveChat');
    const mobileViewSpy = spyOn(component, 'mobileViewHandler');
    const initTranslationsSpy = spyOn<any>(component, 'initTranslations');
    const initChatSpy = spyOn<any>(component, 'initChat');
    const initSettingsSpy = spyOn(component, 'initSettings');
    const getContactListSpy = spyOn<any>(component, 'getContactList');
    const getSubscriptionListSpy = spyOn<any>(component, 'getSubscriptionList');
    const getSubscriptionsAllSpy = spyOn<any>(component, 'getSubscriptionsAll');
    const getUserListSpy = spyOn<any>(component, 'getUserList');
    const handleSpies = [
      spyOn<any>(component, 'handleOpenOverlayAppearance'),
      spyOn<any>(component, 'handleOpenOverlayEmbed'),
      spyOn<any>(component, 'handleOpenOverlaySubscriptionList'),
    ];
    const chat: any = {
      _id: 'chat-001',
      initials: null,
    };

    peMessageService.isLiveChat = false;
    peMessageApiService.getPublicChannel.and.returnValue(of(chat));
    peMessageChatRoomListService.getContactInitials.and.returnValue('JB');

    /**
     * component.isLiveChat is TRUE
     */
    component.isLiveChat = true;
    component.ngOnInit();

    expect(peMessageService.isLiveChat).toBe(true);
    expect(liveSpy).toHaveBeenCalled();
    expect(mobileViewSpy).toHaveBeenCalled();
    expect(initTranslationsSpy).toHaveBeenCalled();
    expect(initChatSpy).not.toHaveBeenCalled();
    expect(peMessageApiService.getPublicChannel).not.toHaveBeenCalled();
    expect(peMessageChatRoomListService.getContactInitials).not.toHaveBeenCalled();
    expect(peMessageChatRoomListService.chatList).toBeNull();
    expect(peMessageChatRoomListService.activeChat).toBeNull();
    expect(initSettingsSpy).toHaveBeenCalled();
    expect(getContactListSpy).not.toHaveBeenCalled();
    expect(getSubscriptionListSpy).not.toHaveBeenCalled();
    expect(getSubscriptionsAllSpy).not.toHaveBeenCalled();
    expect(getUserListSpy).not.toHaveBeenCalled();
    handleSpies.forEach(spy => expect(spy).not.toHaveBeenCalled());
    expect(component.class).toEqual('message-list');

    /**
     * emit translationsReady
     */
    component.translationsReady$.next(true);

    expect(initChatSpy).not.toHaveBeenCalled();
    expect(peMessageApiService.getPublicChannel).toHaveBeenCalledWith('b-001', 'ch-001');
    expect(peMessageChatRoomListService.getContactInitials).toHaveBeenCalledWith(chat);
    expect(peMessageChatRoomListService.chatList).toEqual([chat]);
    expect(peMessageChatRoomListService.activeChat).toEqual(chat);
    expect(chat.initials).toEqual('JB' as any);
    component.translationsReady$.next(false);

    /**
     * component.isLiveChat is FALSE
     */
    peMessageApiService.getPublicChannel.calls.reset();
    peMessageChatRoomListService.getContactInitials.calls.reset();
    peMessageChatRoomListService.chatList = null as any;
    peMessageChatRoomListService.activeChat = null as any;

    component.isLiveChat = false;
    component.ngOnInit();

    expect(peMessageService.isLiveChat).toBe(false);
    expect(initChatSpy).not.toHaveBeenCalled();
    expect(peMessageApiService.getPublicChannel).not.toHaveBeenCalled();
    expect(peMessageChatRoomListService.getContactInitials).not.toHaveBeenCalled();
    expect(peMessageChatRoomListService.chatList).toBeNull();
    expect(peMessageChatRoomListService.activeChat).toBeNull();
    expect(getContactListSpy).toHaveBeenCalled();
    expect(getSubscriptionListSpy).toHaveBeenCalled();
    expect(getSubscriptionsAllSpy).toHaveBeenCalled();
    expect(getUserListSpy).toHaveBeenCalled();
    handleSpies.forEach(spy => expect(spy).toHaveBeenCalled());
    expect(component.class).toEqual('message-list');

    /**
     * emit translationsReady
     */
    component.translationsReady$.next(true);

    expect(initChatSpy).toHaveBeenCalled();
    expect(peMessageApiService.getPublicChannel).not.toHaveBeenCalled();
    expect(peMessageChatRoomListService.getContactInitials).not.toHaveBeenCalled();
    expect(peMessageChatRoomListService.chatList).toBeNull();
    expect(peMessageChatRoomListService.activeChat).toBeNull();

    /**
     * emit peMessageChatRoomListService.activeChat$
     */
    (peMessageChatRoomListService.activeChat$ as Subject<any>).next();
    expect(component.class).toEqual('message-chat');

    /**
     * emit peMessageNavService.activeFolder$
     */
    (peMessageNavService.activeFolder$ as Subject<any>).next();
    expect(component.class).toEqual('message-list');

  });

  it('should test live chat function', fakeAsync(() => {

    const nextSpy = spyOn(component.showAnimationOnStream$, 'next');

    /**
     * component.isLiveChat is FALSE
     */
    component.isLiveChat = false;
    component.liveChat();

    expect(nextSpy).not.toHaveBeenCalled();
    component.shown$.subscribe(s => expect(s).toBe(true)).unsubscribe();

    /**
     * component.isLiveChat is TRUE
     */
    component.isLiveChat = true;
    component.liveChat();

    peMessageService.liveChatBubbleClickedStream$.next(false);

    tick();

    expect(nextSpy).toHaveBeenCalledWith(false);
    component.shown$.subscribe(s => expect(s).toBe(false)).unsubscribe();

  }));

  it('should handle mobile view', () => {

    spyOnProperty(window, 'innerWidth').and.returnValues(500, 1000);

    /**
     * component.mobileView is FALSE
     * so it will not change onResize func and it still will change
     * component.mobileView to TRUE as window.innerWidth is 500
     */
    peMessageChatRoomListService.mobileView = true;

    component.mobileView = false;
    component.mobileViewHandler();

    expect(peMessageChatRoomListService.mobileView).toBe(false);
    component.onResize(null);
    expect(component.mobileView).toBe(true);

    /**
     * component.mobileView is TRUE
     * it will change onResize func and it will not change
     * component.mobileView to FALSE as window.innerWidth is 1000
     */
    component.mobileView = true;
    component.mobileViewHandler();

    expect(peMessageChatRoomListService.mobileView).toBe(true);
    component.onResize(null);
    expect(component.mobileView).toBe(true);

  });

  it('should init settings', () => {

    const setSpy = spyOn(component, 'setDynamicGlobalStyle');
    const detectSpy = spyOn(component[`changeDetectorRef`], 'detectChanges');
    const nextSpy = spyOn(peMessageService.liveChatBubbleClickedStream$, 'next');
    const settings = {
      themes: null,
    };
    const bubble = {
      showBubble: true,
    };
    const themeItems = [
      {
        isDefault: false,
        settings: null,
      },
      {
        isDefault: true,
        settings: null,
      },
      {
        isDefault: true,
        settings: {
          messageAppColor: '#333333',
          accentColor: '#222222',
          messagesBottomColor: null,
        },
      },
      {
        isDefault: true,
        settings: {
          messageAppColor: '#444444',
          accentColor: '#555555',
          messagesBottomColor: '#ffffff',
        },
      },
    ];

    peMessageApiService.getSettings.and.returnValue(of(settings));
    peMessageApiService.getBubble.and.returnValue(of(bubble));
    peMessageThemeService.setTheme.and.callFake((color: string) => {
      return ['#333333', '#000000'].includes(color) ? 'dark' : 'light';
    });
    peMessageThemeService.adjustBrightness.and.callFake((color: string, _) => {
      return color === '#000000' ? '#cccccc' : '#111111';
    });

    /**
     * component.isLiveChat is FALSE
     * settings.themes is null
     */
    component.isLiveChat = false;
    component.loaded = false;
    component.initSettings();

    expect(peMessageApiService.getSettings).toHaveBeenCalledWith('b-001');
    expect(peMessageService.settings).toEqual(settings as any);
    expect(peMessageService.currSettings).toBeNull();
    expect(peMessageThemeService.setTheme).not.toHaveBeenCalled();
    expect(peMessageThemeService.adjustBrightness).not.toHaveBeenCalled();
    expect(setSpy).not.toHaveBeenCalled();
    expect(peMessageApiService.getBubble).toHaveBeenCalledWith('b-001');
    expect(peMessageService.bubble).toEqual(bubble);
    expect(component.loaded).toBe(false);
    expect(nextSpy).not.toHaveBeenCalled();
    expect(detectSpy).not.toHaveBeenCalled();

    /**
     * component.isLiveChat is TRUE
     * settings.themes is set
     * bubble.showBubble is true
     */
    settings.themes = themeItems as any;

    component.isLiveChat = true;
    component.initSettings();

    expect(peMessageService.currSettings).toEqual(themeItems[themeItems.length - 1] as any);
    expect(component.theme).toEqual('light');
    expect(peMessageThemeService.setTheme).toHaveBeenCalledTimes(4);
    expect(peMessageThemeService.setTheme.calls.all().map(c => c.args[0])).toEqual([
      '#333333',
      '#000000',
      '#444444',
      '#ffffff',
    ]);
    expect(peMessageThemeService.adjustBrightness).toHaveBeenCalledTimes(2);
    expect(peMessageThemeService.adjustBrightness.calls.allArgs()).toEqual([
      ['#000000', 80],
      ['#ffffff', -60],
    ]);
    expect(setSpy).toHaveBeenCalledTimes(2);
    expect(setSpy.calls.allArgs()).toEqual([
      ['#222222', '#cccccc'],
      ['#555555', '#111111'],
    ]);
    expect(component.loaded).toBe(true);
    expect(nextSpy).not.toHaveBeenCalled();
    expect(detectSpy).toHaveBeenCalled();

    /**
     * bubble.showBubble is FALSE
     */
    bubble.showBubble = false;
    settings.themes = null;

    component.initSettings();

    expect(nextSpy).toHaveBeenCalledWith(true);

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
    const createSpy = spyOn(document, 'createElement').and.returnValue(styleEl);
    const color = '#333333';
    const linkColor = '#eeeeee';

    component.setDynamicGlobalStyle(color, linkColor);

    expect(createSpy).toHaveBeenCalledWith('style');
    expect(document.head.querySelector('.style-accent-elements')).toEqual(styleEl);
    expect(styleEl.className).toEqual('style-accent-elements');
    expect(styleEl.innerHTML).toContain(`fill: ${color}!important`);
    expect(styleEl.innerHTML).toContain(`color: ${color}!important`);
    expect(styleEl.innerHTML).toContain(`color: ${linkColor}!important`);
    expect(styleEl.innerHTML).toContain(`background-color: ${color}!important`);

  });

  it('should get contacts list', () => {

    const contacts = [
      { _id: 'c-001' },
      { _id: 'c-002' },
    ];

    peMessageApiService.getContactList.and.returnValue(of(contacts));

    component[`getContactList`]();

    expect(peMessageService.contactList).toEqual(contacts as any);

  });

  it('should get user list', () => {

    const users = [
      { _id: 'u-001' },
      { _id: 'u-002' },
    ];

    peMessageApiService.getUserList.and.returnValue(of(users));

    component[`getUserList`]();

    expect(peMessageService.userList).toEqual(users as any);

  });

  it('should handle open overlay appearance', () => {

    const openSpy = spyOn<any>(component, 'openAppearanceOverlay');

    component[`handleOpenOverlayAppearance`]();
    peMessageAppearanceService.openOverlayAppearance$.next();

    expect(openSpy).toHaveBeenCalled();

  });

  it('should handle open overlay embed', () => {

    const openSpy = spyOn<any>(component, 'openEmbedOverlay');

    component[`handleOpenOverlayEmbed`]();
    peMessageEmbedService.openOverlayEmbed$.next();

    expect(openSpy).toHaveBeenCalled();

  });

  it('should handle open overlay subscription list', () => {

    const openSpy = spyOn<any>(component, 'openSubscriptionListOverlay');

    component[`handleOpenOverlaySubscriptionList`]();
    peMessageSubscriptionListService.openOverlaySubscriptionList$.next();

    expect(openSpy).toHaveBeenCalled();

  });

  it('should init translations', () => {

    const warnSpy = spyOn(console, 'warn');
    const nextSpy = spyOn(component.translationsReady$, 'next');

    translationLoaderService.loadTranslations.and.returnValue(throwError('test error'));

    component[`initTranslations`]();

    expect(translationLoaderService.loadTranslations).toHaveBeenCalledWith(['message-app']);
    expect(warnSpy).toHaveBeenCalledWith('Cant load translations for domains', ['message-app'], 'test error');
    expect(nextSpy).toHaveBeenCalledWith(true);

  });

  it('should init chat', () => {

    const callbacksList: { [key: string]: Function } = {};
    const localStorageSpies = {
      getItem: spyOn(window.localStorage, 'getItem'),
      setItem: spyOn(window.localStorage, 'setItem'),
    };
    const storageKey = 'pe_live-chat_token';

    peChatService.socket.on.and.callFake((eventName: string, callback: Function) => {
      callbacksList[eventName] = callback;
    });

    /**
     * component.isLiveChat is FALSE
     */
    component.isLiveChat = false;
    component[`initChat`]();

    expect(localStorageSpies.getItem).not.toHaveBeenCalled();
    expect(peChatService.connect).toHaveBeenCalledWith('be-message/chat', {
      path: '/ws',
      transports: ['websocket'],
      query: { token: 'token' },
    });

    /**
     * test unauthorized callback
     */
    const msg = {
      data: {
        type: 'type',
      },
    };

    expect(() => {
      callbacksList['unauthorized'](msg);
    }).toThrowError();

    /**
     * test authenticated callback
     */
    const user = { _id: 'u-001' };

    callbacksList[`authenticated`](user);

    expect(peMessageService.activeUser).toEqual(user as any);
    expect(peChatService.socket.emit).toHaveBeenCalledWith('messages.ws-client.business-room.join', 'b-001');
    expect(peMessageChatRoomListService.getConversationList).toHaveBeenCalled();
    Object.values(localStorageSpies).forEach(spy => expect(spy).not.toHaveBeenCalled());

    /**
     * test authenticated callback
     * component.isLiveChat is TRUE
     * localStorage.getItem returns mocked date
     */
    const resultMock = {
      contact: { _id: 'u-002' },
      chat: { _id: 'chat-001' },
      accessToken: 'access.token',
    };
    localStorageSpies.getItem.and.returnValue('local.storage.token');
    peMessageChatRoomListService.getConversationList.calls.reset();
    peChatService.socket.emit.calls.reset();

    component.isLiveChat = true;

    callbacksList[`authenticated`](resultMock);

    expect(peMessageService.activeUser).toEqual(resultMock.contact as any);
    expect(peMessageChatRoomListService.chatList).toEqual([resultMock.chat] as any);
    expect(peMessageChatRoomListService.activeChat).toEqual(resultMock.chat as any);
    expect(localStorageSpies.getItem).toHaveBeenCalledWith(storageKey);
    expect(localStorageSpies.setItem).not.toHaveBeenCalled();
    expect(peChatService.socket.emit).toHaveBeenCalledWith('messages.ws-client.chat-room.join', resultMock.chat._id);

    /**
     * localStorage.getItem returns null
     */
    localStorageSpies.getItem.and.returnValue(null);

    callbacksList[`authenticated`](resultMock);

    expect(localStorageSpies.setItem).toHaveBeenCalledWith(storageKey, resultMock.accessToken);

    /**
     * rerun initChat function with component.isLiveChat = TRUE
     */
    peChatService.connect.calls.reset();

    component.isLiveChat = true;
    component[`initChat`]();

    expect(peChatService.connect).toHaveBeenCalledWith('be-message/live-chat', {
      path: '/ws',
      transports: ['websocket'],
      query: { businessId: 'b-001' },
    });

  });

  it('should get subscription list', () => {

    const subscriptions = [
      {
        installed: false,
        enabled: false,
        integration: {
          name: 'whatsapp',
        },
      },
      {
        installed: true,
        enabled: false,
        integration: {
          name: 'whatsapp',
        },
      },
      {
        installed: true,
        enabled: true,
        integration: {
          name: 'facebook-messenger',
        },
      },
    ];

    peMessageApiService.getSubscriptionList.and.returnValue(of(subscriptions));

    component[`getSubscriptionList`]();

    expect(peMessageService.subscriptionList).toEqual(subscriptions.filter(s => s.installed) as any);
    expect(peMessageChatRoomService.channelMenuItems).toEqual([subscriptions[2].integration.name] as any);

  });

  it('should get all subscriptions', () => {

    const subscriptions = [
      {
        info: { test: 'info 1' },
        integration: {
          name: 'Integration 1',
        },
      },
      {
        info: { test: 'info 2' },
        integration: {
          name: 'Integration 2',
        },
      },
    ];

    peMessageApiService.getSubscriptionsAll.and.returnValue(of(subscriptions));
    peMessageService.subscriptionList = [{
      info: null,
      integration: {
        name: 'Integration 2',
      },
    }] as any;

    component[`getSubscriptionsAll`]();

    expect(peMessageService.subscriptionList[0].info).toEqual(subscriptions[1].info);

  });

  it('should open appearance overlay', () => {

    const theme = {
      name: 'Theme 1',
      settings: null,
      isDefault: true,
    };
    const bubble = {
      showBubble: false,
      showNotifications: true,
      style: 'bubble.style',
      logo: 'bubble.logo',
      text: 'bubble.text',
      bgColor: 'bubble.bgColor',
      textColor: 'bubble.textColor',
    };
    let currSettings: any = {};

    function generateCurrSettings() {
      currSettings = {
        name: null,
        settings: {
          test: 'prev.settings',
          defaultPresetColor: null,
          customPresetColors: [
            {
              accentColor: '#333333',
              newItem: false,
            },
            {
              accentColor: '#222222',
              newItem: true,
            },
          ],
        },
      };
    }

    generateCurrSettings();
    peMessageService.currSettings = currSettings as any;

    component[`openAppearanceOverlay`]();

    expect(peOverlayWidgetService.open).toHaveBeenCalled();
    const config = peOverlayWidgetService.open.calls.argsFor(0)[0];
    expect(config).toBeDefined();

    /**
     * test config.headerConfig.backBtnCallback
     * peMessageService.settings.themes is null
     */
    const backBtnCallback = config?.headerConfig?.backBtnCallback;
    expect(backBtnCallback).toBeDefined();

    peMessageService.settings = {
      themes: null,
    } as any;

    backBtnCallback?.();

    expect(peOverlayWidgetService.close).toHaveBeenCalled();
    expect(peMessageService.currSettings).toEqual(currSettings as any);
    expect(peMessageService.currSettings.settings.defaultPresetColor).toBe(0);
    expect(peMessageService.currSettings.settings.customPresetColors).toEqual([{
      accentColor: '#333333',
      newItem: false,
    }]);

    /**
     * peMessageService.settings.themes is set
     * theme.name is not equal to prevSettingsName
     */
    peMessageService.settings.themes = [theme] as any;
    backBtnCallback?.();

    expect(theme.isDefault).toBe(false);
    expect(theme.settings).toBeNull();
    expect(peMessageService.currSettings).not.toEqual(theme as any);

    /**
     * theme.name is equal to prevSettingsName
     */
    generateCurrSettings();
    theme.name = 'default';

    backBtnCallback?.();

    expect(theme.isDefault).toBe(true);
    expect(theme.settings).toEqual(peMessageService.currSettings.settings as any);
    expect(peMessageService.currSettings).toEqual(theme as any);

    /**
     * test config.headerConfig.cancelBtnCallback
     */
    const cancelBtnCallback = config?.headerConfig?.cancelBtnCallback;

    expect(cancelBtnCallback).toBeDefined();
    cancelBtnCallback?.();

    /**
     * test config.headerConfig.doneBtnCallback
     */
    const doneBtnCallback = config?.headerConfig?.doneBtnCallback;
    expect(doneBtnCallback).toBeDefined();

    peOverlayWidgetService.close.calls.reset();
    peMessageService.bubble = bubble;
    peMessageService.currSettings = {
      _id: null,
      name: 'default',
      isDefault: true,
      settings: {
        test: 'prev.settings',
        defaultPresetColor: null,
        customPresetColors: [
          {
            accentColor: '#333333',
            newItem: false,
          },
          {
            accentColor: '#222222',
            newItem: true,
          },
          {
            accentColor: '#111111',
            newItem: true,
          },
        ],
      },
    } as any;
    peMessageApiService.patchSettings.and.returnValue(of(null));
    peMessageApiService.patchBubble.and.returnValue(of(null));

    /**
     * peMessageService.currSettings.settings.defaultPresetColor is null
     */
    doneBtnCallback?.();

    expect(peOverlayWidgetService.close).toHaveBeenCalled();
    expect(peMessageApiService.patchSettings).toHaveBeenCalledWith({
      isDefault: true,
      settings: peMessageService.currSettings.settings,
    }, 'default');
    expect(peMessageApiService.patchBubble).toHaveBeenCalledWith(bubble);
    expect(peMessageService.currSettings.settings.customPresetColors).toEqual([
      {
        accentColor: '#333333',
        newItem: false,
      },
      { accentColor: '#222222' },
      { accentColor: '#111111' },
    ]);

    /**
     * peMessageService.currSettings.settings.defaultPresetColor is set
     */
    peMessageService.currSettings.settings.defaultPresetColor = 1;

    doneBtnCallback?.();

    expect(peMessageService.currSettings.settings.customPresetColors).toEqual([
      { accentColor: '#222222' },
      {
        accentColor: '#333333',
        newItem: false,
      },
      { accentColor: '#111111' },
    ]);

  });

  it('should open subscription list overlay', () => {

    const toggleSpy = spyOn<any>(component, 'toggleSubscription');
    const subscriptions = [
      {
        enabled: true,
        integration: {
          name: 'whatsapp',
        },
      },
    ];

    peMessageService.subscriptionList = subscriptions as any;

    component[`openSubscriptionListOverlay`]();

    expect(peOverlayWidgetService.open).toHaveBeenCalled();
    const config = peOverlayWidgetService.open.calls.argsFor(0)[0] as PeOverlayConfig;

    expect(config.data.subscriptionList).toEqual(peMessageService.subscriptionList);
    expect(config.hasBackdrop).toBe(true);
    expect(config.headerConfig?.title).toEqual('message-app.sidebar.connect.translated');
    expect(config.headerConfig?.theme).toEqual(component.theme);
    expect(config.headerConfig?.backBtnTitle).toEqual('message-app.sidebar.cancel.translated');
    expect(config.headerConfig?.doneBtnTitle).toEqual('message-app.sidebar.done.translated');
    expect(config.panelClass).toEqual('pe-message-overlay-subscription-list');
    expect(translateService.translate).toHaveBeenCalledTimes(3);
    expect(translateService.translate.calls.all().map(c => c.args[0])).toEqual([
      'message-app.sidebar.connect',
      'message-app.sidebar.cancel',
      'message-app.sidebar.done',
    ]);

    /**
     * test backBtnCallback
     */
    config.headerConfig?.backBtnCallback?.();

    expect(peOverlayWidgetService.close).toHaveBeenCalled();

    /**
     * test doneBtnCallback
     * config.data.changes is undefined
     */
    peOverlayWidgetService.close.calls.reset();
    config.headerConfig?.doneBtnCallback?.();

    expect(toggleSpy).not.toHaveBeenCalled();
    expect(peOverlayWidgetService.close).toHaveBeenCalled();

    /**
     * config.data.changes is set
     */
    peOverlayWidgetService.close.calls.reset();
    config.data.changes = {
      whatsapp: false,
    };
    config.headerConfig?.doneBtnCallback?.();

    expect(toggleSpy).toHaveBeenCalledWith('whatsapp', false);
    expect(peOverlayWidgetService.close).toHaveBeenCalled();

  });

  it('should toggle subscription', () => {

    const subscriptions = [
      {
        enabled: true,
        integration: {
          name: 'whatsapp',
        },
      },
    ];

    peMessageService.subscriptionList = subscriptions as any;

    peMessageApiService.patchSubscriptionInstall.and.returnValue(of(null));
    peMessageApiService.patchSubscriptionUninstall.and.returnValue(of(null));

    /**
     * argument integrationName is 'facebook-messenger'
     * argument enabled is FALSE
     * foundSubscription is null
     */
    component[`toggleSubscription`]('facebook-messenger', false);

    expect(peMessageApiService.patchSubscriptionUninstall).toHaveBeenCalledWith('facebook-messenger');
    expect(peMessageApiService.patchSubscriptionInstall).not.toHaveBeenCalled();
    expect(subscriptions[0].enabled).toBe(true);

    /**
     * argument integrationName is 'whatsapp'
     * argument enabled is TRUE
     * foundSubscription is set
     */
    peMessageApiService.patchSubscriptionUninstall.calls.reset();
    subscriptions[0].enabled = false;

    component[`toggleSubscription`]('whatsapp', true);

    expect(peMessageApiService.patchSubscriptionInstall).toHaveBeenCalledWith('whatsapp');
    expect(peMessageApiService.patchSubscriptionUninstall).not.toHaveBeenCalled();
    expect(subscriptions[0].enabled).toBe(true);

  });

  it('should switch sidebar', () => {

    component.class = 'message-chat';
    component[`switchSidebar`]();
    expect(component.class).toEqual('message-list');

    component[`switchSidebar`]();
    expect(component.class).toEqual('message-folder');

    component[`switchSidebar`]();
    expect(component.class).toEqual('message-folder');

  });

});
