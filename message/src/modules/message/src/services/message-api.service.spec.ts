import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EnvService } from '@pe/common';
import { PeMessageApiService, PE_MESSAGE_API_PATH, PE_PRODUCTS_API_PATH } from './message-api.service';

describe('PeMessageApiService', () => {

  let service: PeMessageApiService;
  let http: HttpTestingController;

  const businessId = 'b-001';
  const chatId = 'chat-001';
  const peMessageApiPath = 'api/message';
  const peProductsApiPath = 'api/products';

  beforeEach(() => {

    const envServiceMock = {
      businessId,
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PeMessageApiService,
        { provide: EnvService, useValue: envServiceMock },
        { provide: PE_MESSAGE_API_PATH, useValue: peMessageApiPath },
        { provide: PE_PRODUCTS_API_PATH, useValue: peProductsApiPath },
      ],
    });

    service = TestBed.inject(PeMessageApiService);
    http = TestBed.inject(HttpTestingController);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  describe('Channels', () => {

    it('should get public channel', () => {

      const channelId = 'ch-001';
      const url = `${peMessageApiPath}/api/business/${businessId}/public-channels/${channelId}`;

      service.getPublicChannel(businessId, channelId).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('GET');

    });

    it('should post channel', () => {

      const channel: any = { _id: 'ch-001' };
      const url = `${peMessageApiPath}/api/business/${businessId}/channels`;

      service.postChannel(channel).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(channel);

    });

    it('should get channel list', () => {

      const url = `${peMessageApiPath}/api/business/${businessId}/channels`;

      service.getChannelList().subscribe();

      const req = http.expectOne(url);
      req.flush([]);

      expect(req.request.method).toEqual('GET');

    });

    it('should post channel member invite', () => {

      const channelId = 'ch-001';
      const memberId = 'u-001';
      const url = `${peMessageApiPath}/api/business/${businessId}/channels/${channelId}/members/${memberId}/invite`;

      service.postChannelMemberInvite(channelId, memberId).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({});

    });

  });

  describe('Chats', () => {

    it('should post chat', () => {

      const chat = { _id: chatId };
      const url = `${peMessageApiPath}/api/business/${businessId}/chats`;

      service.postChat(chat as any).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(chat);


    });

    it('should post chat invite', () => {

      const userId = 'u-001';
      const url = `${peMessageApiPath}/api/business/${businessId}/chats/${chatId}/invite/${userId}`;

      service.postChatInvite(chatId, userId).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toBeNull();


    });

    it('should get chat list', () => {

      const parentFolder = 'parent';
      let url = `${peMessageApiPath}/api/business/${businessId}/chats`;
      let req: TestRequest;

      /**
       * argument parentFolder is undefined as default
       */
      service.getChatList().subscribe();

      req = http.expectOne(url);
      req.flush([]);

      expect(req.request.method).toEqual('GET');

      /**
       * argument parentFolder is set
       */
      url += `?filter=${JSON.stringify({ parentFolder })}`;

      service.getChatList(parentFolder).subscribe();

      req = http.expectOne(url);
      req.flush([]);

      expect(req.request.method).toEqual('GET');

    });

    it('should get chat', () => {

      const url = `${peMessageApiPath}/api/business/${businessId}/chats/${chatId}`;

      service.getChat(chatId).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('GET');

    });

    it('should patch chat', () => {

      const chat = {
        _id: chatId,
        title: 'Chat',
      };
      const url = `${peMessageApiPath}/api/business/${businessId}/chats/${chat._id}`;

      service.patchChat(chat as any).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('PATCH');
      expect(req.request.body).toEqual({ title: chat.title });

    });

    it('should delete chat', () => {

      const url = `${peMessageApiPath}/api/business/${businessId}/chats/${chatId}`;

      service.deleteChat(chatId).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('DELETE');

    });

  });

  describe('Chat message', () => {

    it('should post chat message', () => {

      const message = { _id: 'm-001' };
      const url = `${peMessageApiPath}/api/business/${businessId}/chats/${chatId}/messages`;

      service.postChatMessage(chatId, message as any).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(message);

    });

    it('should get chat message list', () => {

      const url = `${peMessageApiPath}/api/business/${businessId}/chats/${chatId}/messages`;

      service.getChatMessageList(chatId).subscribe();

      const req = http.expectOne(url);
      req.flush([]);

      expect(req.request.method).toEqual('GET');

    });

    it('should patch chat message', () => {

      const message = {
        _id: 'm-001',
        content: 'content',
        status: 'status',
      };
      const url = `${peMessageApiPath}/api/business/${businessId}/chats/${chatId}/messages/${message._id}`;

      service.patchChatMessage(chatId, message as any).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('PATCH');
      expect(req.request.body).toEqual({
        content: message.content,
        status: message.status,
      });

    });

    it('should delete chat message', () => {

      const messageId = 'm-001';
      const url = `${peMessageApiPath}/api/business/${businessId}/chats/${chatId}/messages/${messageId}`;

      service.deleteChatMessage(chatId, messageId).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('DELETE');

    });

  })

  describe('Contacts', () => {

    it('should post contact', () => {

      const contact = { _id: 'c-001' };
      const url = `${peMessageApiPath}/api/business/${businessId}/contacts`;

      service.postContact(contact as any).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(contact);

    });

    it('should get contact list', () => {

      const url = `${peMessageApiPath}/api/business/${businessId}/contacts`;

      service.getContactList().subscribe();

      const req = http.expectOne(url);
      req.flush([]);

      expect(req.request.method).toEqual('GET');

    });

    it('should patch contact', () => {

      const contact = { _id: 'c-001' };
      const url = `${peMessageApiPath}/api/business/${businessId}/contacts/${contact._id}`;

      service.patchContact(contact as any).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('PATCH');
      expect(req.request.body).toEqual(contact);

    });

    it('should delet contact', () => {

      const contactId = 'c-001';
      const url = `${peMessageApiPath}/api/business/${businessId}/contacts/${contactId}`;

      service.deleteContact(contactId).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('DELETE');

    });

  });

  describe('Conversations', () => {

    it('should get conversation list', () => {

      const parentFolder = 'parent';
      let url = `${peMessageApiPath}/api/business/${businessId}/conversations`;
      let req: TestRequest;

      /**
       * argument parentFolder is undefined as default
       */
      service.getConversationList().subscribe();

      req = http.expectOne(url);
      req.flush([]);

      expect(req.request.method).toEqual('GET');

      /**
       * argument parentFolder is set
       */
      url += `?filter=${JSON.stringify({ parentFolder })}`;

      service.getConversationList(parentFolder).subscribe();

      req = http.expectOne(url);
      req.flush([]);

      expect(req.request.method).toEqual('GET');

    });

  });

  describe('Users', () => {

    it('should get user list', () => {

      const url = `${peMessageApiPath}/api/business/${businessId}/users`;

      service.getUserList().subscribe();

      const req = http.expectOne(url);
      req.flush([]);

      expect(req.request.method).toEqual('GET');

    });

  });

  describe('Subscriptions', () => {

    it('should get subscription list', () => {

      const url = `${peMessageApiPath}/api/business/${businessId}/subscriptions`;

      service.getSubscriptionList().subscribe();

      const req = http.expectOne(url);
      req.flush([]);

      expect(req.request.method).toEqual('GET');

    });

    it('should get subscription all', () => {

      const url = `${peMessageApiPath}/api/business/${businessId}/subscriptions/all`;

      service.getSubscriptionsAll().subscribe();

      const req = http.expectOne(url);
      req.flush([]);

      expect(req.request.method).toEqual('GET');

    });

    it('should patch subscription install', () => {

      const integrationName = 'whatsapp';
      const url = `${peMessageApiPath}/api/business/${businessId}/subscriptions/${integrationName}/install`;

      service.patchSubscriptionInstall(integrationName).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('PATCH');
      expect(req.request.body).toBeNull();

    });

    it('should patch subscription uninstall', () => {

      const integrationName = 'whatsapp';
      const url = `${peMessageApiPath}/api/business/${businessId}/subscriptions/${integrationName}/uninstall`;

      service.patchSubscriptionUninstall(integrationName).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('PATCH');
      expect(req.request.body).toBeNull();

    });

  });

  describe('Settings', () => {

    it('should get settings', () => {

      const url = `${peMessageApiPath}/api/business/${businessId}/themes`;

      service.getSettings().subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('GET');

    });

    it('should patch settings', () => {

      const themeItem: any = { id: 't-001' };
      const themeId = themeItem.id;
      const url = `${peMessageApiPath}/api/business/${businessId}/themes/${themeId}`;

      service.patchSettings(themeItem, themeId).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('PATCH');
      expect(req.request.body).toEqual(themeItem);

    });

    it('should get bubble', () => {

      const url = `${peMessageApiPath}/api/business/${businessId}/bubble`;

      service.getBubble().subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('GET');

    });

    it('should patch bubble', () => {

      const bubble = { bgColor: '#333333' };
      const url = `${peMessageApiPath}/api/business/${businessId}/bubble`;

      service.patchBubble(bubble).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('PATCH');
      expect(req.request.body).toEqual(bubble);

    });

  });

  describe('Folders', () => {

    it('should post folder', () => {

      const folder = { _id: 'f-001' };
      const url = `${peMessageApiPath}/api/business/${businessId}/folders`;

      service.postFolder(folder as any).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(folder);

    });

    it('should get folder list', () => {

      const url = `${peMessageApiPath}/api/business/${businessId}/folders`;

      service.getFolderList().subscribe();

      const req = http.expectOne(url);

      expect(req.request.method).toEqual('GET');

    });

    it('should patch folder', () => {

      const folder = { _id: 'f-001' };
      const url = `${peMessageApiPath}/api/business/${businessId}/folders/${folder._id}`;

      service.patchFolder(folder as any).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('PATCH');
      expect(req.request.body).toEqual(folder);

    });

    it('should delete folder', () => {

      const folderId = 'f-001';
      const url = `${peMessageApiPath}/api/business/${businessId}/folders/${folderId}`;

      service.deleteFolder(folderId).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('DELETE');

    });

    it('should patch folder item', () => {

      const itemId = 'i-001';
      const item = { parentFolder: 'parent' };
      const url = `${peMessageApiPath}/api/business/${businessId}/folders/item/${itemId}`;

      service.patchFolderItem(itemId, item).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('PATCH');
      expect(req.request.body).toEqual(item);

    });

  });

  describe('Bots', () => {

    const app = 'test-app';

    it('should get bot list', () => {

      const url = `${peMessageApiPath}/api/business/${businessId}/bots`;

      service.getBotList().subscribe();

      const req = http.expectOne(url);
      req.flush([]);

      expect(req.request.method).toEqual('GET');

    });

    it('should get bot', () => {

      const url = `${peMessageApiPath}/api/business/${businessId}/bots/${app}`;

      service.getBot(app).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('GET');

    });

    it('should get bot message list', () => {

      const url = `${peMessageApiPath}/api/business/${businessId}/bots/${app}/messages`;

      service.getBotMessageList(app).subscribe();

      const req = http.expectOne(url);
      req.flush([]);

      expect(req.request.method).toEqual('GET');

    });

    it('should post bot message', () => {

      const messageContent = 'message.content';
      const url = `${peMessageApiPath}/api/business/${businessId}/bots/${app}/messages`;

      service.postBotMessage(app, messageContent).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        bot: app,
        business: businessId,
        content: messageContent,
      });

    });

    it('should patch bot message', () => {

      const message = {
        _id: 'm-001',
        content: 'message.content',
      };
      const url = `${peMessageApiPath}/api/business/${businessId}/bots/${app}/messages/${message._id}`;

      service.patchBotMessage(app, message as any).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('PATCH');
      expect(req.request.body).toEqual({
        bot: app,
        business: businessId,
        content: message.content,
      });

    });

    it('should delete bot message', () => {

      const messageId = 'm-001';
      const url = `${peMessageApiPath}/api/business/${businessId}/bots/${app}/messages/${messageId}`;

      service.deleteBotMessage(app, messageId).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('DELETE');

    });

  });

  describe('Products', () => {

    it('should get product checkout link', () => {

      const body = {
        productIds: ['prod-001', 'prod-002'],
        type: 'type',
      };
      const url = `${peProductsApiPath}/product/checkout/${businessId}/link`;

      service.getProductCheckoutLink(body).subscribe();

      const req = http.expectOne(url);
      req.flush({});

      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(body);

    });

    it('should get product list', () => {

      const url = `${peProductsApiPath}/products`;
      const response = {
        data: {
          getProducts: {
            products: [{ _id: 'prod-001' }],
          },
        },
      };

      service.getProductList().subscribe(products => expect(products).toEqual(response.data.getProducts.products));

      const req = http.expectOne(url);
      req.flush(response);

      expect(req.request.method).toEqual('POST');
      expect(req.request.body.query).toBeDefined();

    });

    it('should get channel set by business', () => {

      const url = `${peProductsApiPath}/channelset`;
      const response = {
        data: {
          getChannelSetByBusiness: 'ch-001',
        },
      };

      service.getChannelSetByBusiness().subscribe(channelSet => expect(channelSet).toEqual(response.data.getChannelSetByBusiness));

      const req = http.expectOne(url);
      req.flush(response);

      expect(req.request.method).toEqual('POST');
      expect(req.request.body.operationName).toEqual('getChannelSetByBusiness');
      expect(req.request.body.query).toBeDefined();
      expect(req.request.body.variables).toEqual({ businessId });

    });

  });

  afterAll(() => {

    http.verify();

  });

});
