import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { PeChatService } from '@pe/chat';
import { EMPTY, of } from 'rxjs';
import { PeMessageApiService } from './message-api.service';
import { PeMessageChatRoomListService } from './message-chat-room-list.service';
import { PeMessageService } from './message.service';

describe('PeMessageChatRoomListService', () => {

  let service: PeMessageChatRoomListService;
  let peMessageApiService: jasmine.SpyObj<PeMessageApiService>;
  let peChatService: jasmine.SpyObj<PeChatService>;
  let peMessageService: jasmine.SpyObj<PeMessageService>;
  let domSanitizer: jasmine.SpyObj<DomSanitizer>;

  beforeEach(() => {

    const sanitizerSpy = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', {
      bypassSecurityTrustStyle: 'bypassed.style',
    });

    const peChatServiceMock = {
      socket: {
        emit: jasmine.createSpy('emit'),
      },
    };

    const peMessageServiceMock = {
      contactList: [],
    };

    const peMessageApiServiceSpy = jasmine.createSpyObj<PeMessageApiService>('PeMessageApiService', [
      'deleteChat',
      'getConversationList',
    ]);

    TestBed.configureTestingModule({
      providers: [
        PeMessageChatRoomListService,
        { provide: DomSanitizer, useValue: sanitizerSpy },
        { provide: PeChatService, useValue: peChatServiceMock },
        { provide: PeMessageService, useValue: peMessageServiceMock },
        { provide: PeMessageApiService, useValue: peMessageApiServiceSpy },
      ],
    });

    service = TestBed.inject(PeMessageChatRoomListService);
    peMessageApiService = TestBed.inject(PeMessageApiService) as jasmine.SpyObj<PeMessageApiService>;
    peChatService = TestBed.inject(PeChatService) as jasmine.SpyObj<PeChatService>;
    peMessageService = TestBed.inject(PeMessageService) as jasmine.SpyObj<PeMessageService>;
    domSanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should set/get unread messages', () => {

    const nextSpy = spyOn(service[`unreadMessagesStream$`], 'next').and.callThrough();

    service.unreadMessages = 13;

    expect(nextSpy).toHaveBeenCalledWith(13);
    expect(service.unreadMessages).toBe(13);
    service.unreadMessages$.subscribe(unread => expect(unread).toBe(13));

  });

  it('should set/get unread in folder', () => {

    const nextSpy = spyOn(service[`unreadInFolderStream$`], 'next').and.callThrough();

    service.unreadInFolder = 13;

    expect(nextSpy).toHaveBeenCalledWith(13);
    expect(service.unreadInFolder).toBe(13);
    service.unreadInFolder$.subscribe(unread => expect(unread).toBe(13));

  });

  it('should set/get active chat', () => {

    const nextSpy = spyOn(service[`activeChatStream$`], 'next').and.callThrough();
    const chat: any = { _id: 'chat-001' };

    service.activeChat = chat;

    expect(nextSpy).toHaveBeenCalledWith(chat);
    expect(service.activeChat).toEqual(chat);
    service.activeChat$.subscribe(ac => expect(ac).toEqual(chat));

  });

  it('should set/get chat list', () => {

    const nextSpy = spyOn(service[`chatListStream$`], 'next').and.callThrough();
    const chatList: any = [{ _id: 'chat-001' }];

    service.chatList = chatList;

    expect(nextSpy).toHaveBeenCalledWith(chatList);
    expect(service.chatList).toEqual(chatList);
    service.chatList$.subscribe(list => expect(list).toEqual(chatList));

  });

  it('should delete chat', () => {

    const sortSpy = spyOn(service, 'sortChatList');
    const nextSpy = spyOn(service.detectChangeStream$, 'next');

    /**
     * argument id is undefined as default
     * service.activeChat is null
     */
    peMessageApiService.deleteChat.and.returnValue(EMPTY);

    service.activeChat = null;
    service.deleteChat();

    expect(peMessageApiService.deleteChat).toHaveBeenCalledWith(undefined as any);
    expect(sortSpy).not.toHaveBeenCalled();
    expect(nextSpy).not.toHaveBeenCalled();

    /**
     * service.activeChat is set
     * service.chatList.length is 1
     */
    peMessageApiService.deleteChat.and.returnValue(of(null));

    service.activeChat = { _id: 'chat-001' } as any;
    service.chatList = [{ _id: 'chat-001' }] as any;
    service.deleteChat();

    expect(peMessageApiService.deleteChat).toHaveBeenCalledWith('chat-001');
    expect(service.chatList).toEqual([]);
    expect(sortSpy).toHaveBeenCalled();
    expect(service.activeChat).toBeNull();
    expect(nextSpy).toHaveBeenCalled();

    /**
     * argument id is set
     * service.chatList.length is 2
     */
    sortSpy.calls.reset();
    nextSpy.calls.reset();

    service.chatList = [
      { _id: 'chat-001' },
      { _id: 'chat-002' },
    ] as any;
    service.deleteChat('chat-002');

    expect(peMessageApiService.deleteChat).toHaveBeenCalledWith('chat-002');
    expect(service.chatList).toEqual([{ _id: 'chat-001' }] as any);
    expect(sortSpy).toHaveBeenCalled();
    expect(service.activeChat).toEqual({ _id: 'chat-001' } as any);
    expect(nextSpy).toHaveBeenCalled();

  });

  it('should get conversation list', () => {

    const sortSpy = spyOn(service, 'sortChatList');
    const avatarSpy = spyOn(service, 'getContactAvatar').and.callFake((_, callback) => {
      callback('avatar');
    });
    const setSpies = {
      activeChat: spyOnProperty(service, 'activeChat', 'set').and.callThrough(),
      unreadInFolder: spyOnProperty(service, 'unreadInFolder', 'set').and.callThrough(),
      unreadMessages: spyOnProperty(service, 'unreadMessages', 'set').and.callThrough(),
    };
    const initialsSpy = spyOn(service, 'getContactInitials').and.returnValue('initials');
    const chatList = [
      {
        _id: 'chat-001',
        lastMessages: null,
      },
      {
        _id: 'chat-002',
        lastMessages: [
          {
            type: null,
            attachments: null,
            status: 'unread',
          },
          {
            type: null,
            attachments: [{ test: 'attachment' }],
            status: 'read',
          },
          {
            type: 'default',
            attachments: null,
            status: 'read',
          },
        ],
      },
      {
        _id: 'chat-003',
        lastMessages: [
          {
            type: null,
            attachments: null,
            status: 'unread',
          },
        ],
      },
    ];

    spyOnProperty(window, 'innerWidth').and.returnValue(1024);

    /**
     * argument parentFolder is undefined as default
     * peMessageApiService.getConversationList returns [] (empty array)
     * service.mobileView is TRUE
     */
    peMessageApiService.getConversationList.and.returnValue(of([]));

    service.mobileView = true;
    service.getConversationList();

    expect(peMessageApiService.getConversationList).toHaveBeenCalledWith(undefined);
    expect(avatarSpy).not.toHaveBeenCalled();
    expect(initialsSpy).not.toHaveBeenCalled();
    expect(service.chatList).toEqual([]);
    expect(sortSpy).toHaveBeenCalled();
    expect(setSpies.activeChat).not.toHaveBeenCalled();
    expect(setSpies.unreadInFolder).toHaveBeenCalledWith(0);
    expect(setSpies.unreadMessages).toHaveBeenCalledWith(0);
    expect(service.activeChat).toBeNull();
    expect(peChatService.socket.emit).not.toHaveBeenCalled();

    /**
     * service.mobileView is FALSE
     */
    Object.values(setSpies).forEach(spy => spy.calls.reset());

    service.mobileView = false;
    service.getConversationList();

    expect(setSpies.activeChat).toHaveBeenCalledWith(null);
    expect(service.activeChat).toBeNull();

    /**
     * argument parentFolder is set
     * peMessageApiService.getConversationList returns mocked data
     */
    Object.values(setSpies).forEach(spy => spy.calls.reset());
    peMessageApiService.getConversationList.and.returnValue(of(chatList));

    service.getConversationList('parent');

    expect(peMessageApiService.getConversationList).toHaveBeenCalledWith('parent');
    expect(sortSpy).toHaveBeenCalled();
    expect(setSpies.activeChat).toHaveBeenCalledWith({
      ...chatList[0],
      avatar: 'avatar',
      initials: 'initials',
    } as any);
    expect(setSpies.unreadInFolder).toHaveBeenCalledWith(2);
    expect(setSpies.unreadMessages).not.toHaveBeenCalled();
    expect(service.activeChat).toEqual({
      ...chatList[0],
      avatar: 'avatar',
      initials: 'initials',
    } as any);
    expect(service.chatList).toEqual(chatList.map(chat => ({
      ...chat,
      avatar: 'avatar',
      initials: 'initials',
    })) as any);
    chatList.forEach((chat, index) => {
      expect(avatarSpy.calls.argsFor(index)[0]).toEqual(chat as any);
      expect(initialsSpy).toHaveBeenCalledWith(chat as any);
      expect(peChatService.socket.emit).toHaveBeenCalledWith('messages.ws-client.chat-room.join', chat._id);
    });

  });

  it('should get contact avatar', fakeAsync(() => {

    const chat = {
      _id: 'chat-001',
      contact: 'c-001',
      avatar: null,
    };
    const contact = {
      _id: 'c-001',
      avatar: 'avatar',
    };
    const isValidImgUrlSpy = spyOn(service, 'isValidImgUrl');
    const isValidUrlSpy = spyOn(service, 'isValidUrl').and.returnValue(true);
    const callback = jasmine.createSpy('callback').and.callFake((avatar: any) => {
      chat.avatar = avatar;
    });

    domSanitizer.bypassSecurityTrustStyle.and.callFake((value: string) => `${value}.bypassed`);

    /**
     * peMessageService.contactList is [] (empty array)
     */
    service.getContactAvatar(chat as any, callback);

    expect(chat.avatar).toBeNull();
    expect(isValidImgUrlSpy).not.toHaveBeenCalled();
    expect(isValidUrlSpy).not.toHaveBeenCalled();
    expect(domSanitizer.bypassSecurityTrustStyle).not.toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();

    /**
     * peMessageService.contactList is set
     * url does not match /data:.*base64/ regex
     * service.isValidImgUrl resolves to { status: 404 }
     */
    isValidImgUrlSpy.and.resolveTo({ status: 404 });
    domSanitizer.bypassSecurityTrustStyle.calls.reset();
    peMessageService.contactList = [contact] as any;

    service.getContactAvatar(chat as any, callback);

    flushMicrotasks();

    expect(chat.avatar).toBeUndefined();
    expect(isValidUrlSpy).toHaveBeenCalledWith(contact.avatar);
    expect(isValidImgUrlSpy).toHaveBeenCalledWith(contact.avatar);
    expect(domSanitizer.bypassSecurityTrustStyle).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalledWith(undefined);

    /**
     * service.isValidImgUrl resolves to { status: 200 }
     */
    isValidImgUrlSpy.and.resolveTo({ status: 200 });
    chat.avatar = null;
    callback.calls.reset();

    service.getContactAvatar(chat as any, callback);

    flushMicrotasks();

    expect(chat.avatar).toEqual(`url(avatar).bypassed` as any);
    expect(callback).toHaveBeenCalledWith('url(avatar).bypassed');
    expect(domSanitizer.bypassSecurityTrustStyle).toHaveBeenCalledWith('url(avatar)');

    /**
     * url matchs /data:.*base64/ regex
     */
    contact.avatar = 'data:123456789:base64';
    chat.avatar = null;
    isValidImgUrlSpy.calls.reset();
    callback.calls.reset();

    service.getContactAvatar(chat as any, callback);

    expect(chat.avatar).toEqual(`url(data:123456789:base64).bypassed` as any);
    expect(callback).toHaveBeenCalledWith('url(data:123456789:base64).bypassed');
    expect(domSanitizer.bypassSecurityTrustStyle).toHaveBeenCalledWith('url(data:123456789:base64)');
    expect(isValidImgUrlSpy).not.toHaveBeenCalled();

  }));

  it('should get contact initials', () => {

    const chat = {
      _id: 'chat-001',
      title: null,
    };

    /**
     * chat.title is null
     */
    expect(service.getContactInitials(chat as any)).toEqual('');

    /**
     * chat.title is set
     */
    chat.title = 'James Bond' as any;

    expect(service.getContactInitials(chat as any)).toEqual('JB');

  });

  it('should get member', () => {

    const user = {
      _id: 'u-001',
      userAccount: {
        firstName: 'Bruce',
        lastName: 'Wayne',
      },
    };
    const contact = {
      _id: 'u-001',
      name: 'James Bond',
      avatar: 'avatar',
    };

    /**
     * peMessageService.userList and contactList are both null
     */
    peMessageService.userList = null as any;
    peMessageService.contactList = null as any;

    expect(service.getMember('u-001')).toEqual({
      _id: 'u-001',
      title: undefined,
      avatar: undefined,
      initials: '',
    });

    /**
     * peMessageService.userList is [] (empty array)
     * peMessageService.contactList is set
     */
    peMessageService.userList = [];
    peMessageService.contactList = [contact] as any;

    expect(service.getMember('u-001')).toEqual({
      _id: 'u-001',
      title: 'James Bond',
      avatar: 'avatar',
      initials: 'JB',
    });

    /**
     * peMessageService.userList is set
     */
    peMessageService.userList = [user] as any;

    expect(service.getMember('u-001')).toEqual({
      _id: 'u-001',
      title: 'Bruce Wayne',
      avatar: 'avatar',
      initials: 'BW',
    });

  });

  it('should sort chat list', () => {

    const chatList = [
      {
        _id: 'chat-001',
        updatedAt: new Date('2021-05-12 10:00'),
      },
      {
        _id: 'chat-002',
        updatedAt: new Date('2021-05-13 13:00'),
      },
      {
        _id: 'chat-003',
        updatedAt: new Date('2021-05-10 09:00'),
      },
    ];

    service.chatList = chatList as any;
    service.sortChatList();

    expect(service.chatList).toEqual([
      {
        _id: 'chat-002',
        updatedAt: new Date('2021-05-13 13:00'),
      },
      {
        _id: 'chat-001',
        updatedAt: new Date('2021-05-12 10:00'),
      },
      {
        _id: 'chat-003',
        updatedAt: new Date('2021-05-10 09:00'),
      },
    ] as any);

  });

  it('should validate url', () => {

    expect(service.isValidUrl('test')).toBe(false);
    expect(service.isValidUrl('https://localhost')).toBe(true);

  });

  it('should validate img url', fakeAsync(() => {

    const fetchSpy = spyOn(window, 'fetch').and.resolveTo({ status: 200 } as any);
    const url = 'https://localhost';


    service.isValidImgUrl(url).then((response) => {
      expect(response.status).toBe(200);
    });

    flushMicrotasks();

    expect(fetchSpy).toHaveBeenCalledWith(new Request(url));

  }));

});
