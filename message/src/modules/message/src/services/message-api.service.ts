import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PeChatMessage } from '@pe/chat';
import { EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';

import {
  PeMessageChannel,
  PeMessageChat,
  PeMessageContact,
  PeMessageFolder,
  PeMessageSettingsThemeItem,
  PeMessageBubble,
  PeMessageChannelInfo,
} from '../interfaces';

export const PE_MEDIA_API_PATH = new InjectionToken<string>('PE_MEDIA_API_PATH');
export const PE_MESSAGE_API_PATH = new InjectionToken<string>('PE_MESSAGE_API_PATH');
export const PE_PRODUCTS_API_PATH = new InjectionToken<string>('PE_PRODUCTS_API_PATH');

@Injectable()
export class PeMessageApiService {

  businessId = this.envService.businessId;

  constructor(
    private http: HttpClient,
    private envService: EnvService,
    @Inject(PE_ENV) public environmentConfigInterface: EnvironmentConfigInterface,
    @Inject(PE_MEDIA_API_PATH) private peMediaApiPath: string,
    @Inject(PE_MESSAGE_API_PATH) private peMessageApiPath: string,
    @Inject(PE_PRODUCTS_API_PATH) private peProductsApiPath: string,
  ) {
  }

  //
  // PE MESSAGE
  //

  // admin/chat-templates

  postChatTemplate(chatTemplate: any): Observable<any> {
    return this.http.post(`${this.peMessageApiPath}/api/admin/chat-templates`, chatTemplate);
  }

  getChatTemplateList(): Observable<any> {
    return this.http.get(`${this.peMessageApiPath}/api/admin/chat-templates`);
  }

  getChatTemplate(chatTemplateId: string): Observable<any> {
    return this.http.get(`${this.peMessageApiPath}/api/admin/chat-templates/${chatTemplateId}`);
  }

  patchChatTemplate(chatTemplate: any): Observable<any> {
    return this.http.patch(`${this.peMessageApiPath}/api/admin/chat-templates/${chatTemplate._id}`, chatTemplate);
  }

  deleteChatTemplate(chatTemplateId: string): Observable<any> {
    return this.http.delete(`${this.peMessageApiPath}/api/admin/chat-templates/${chatTemplateId}`);
  }

  // admin/message-templates

  postMessageTemplate(chatTemplateId: string, messageTemplate: any): Observable<any> {
    return this.http.post(`${this.peMessageApiPath}/api/admin/chat-templates/${chatTemplateId}/messages`, messageTemplate);
  }

  getMessageTemplateList(chatTemplateId: string): Observable<any> {
    return this.http.get(`${this.peMessageApiPath}/api/admin/chat-templates/${chatTemplateId}/messages`);
  }

  getMessageTemplate(chatTemplateId: string, messageTemplateId: string): Observable<any> {
    return this.http.get(`${this.peMessageApiPath}/api/admin/chat-templates/${chatTemplateId}/messages/${messageTemplateId}`);
  }

  patchMessageTemplate(chatTemplateId: string, messageTemplate: any): Observable<any> {
    return this.http.patch(
      `${this.peMessageApiPath}/api/admin/chat-templates/${chatTemplateId}/messages/${messageTemplate._id}`,
      messageTemplate
    );
  }

  deleteMessageTemplate(chatTemplateId: string, messageTemplateId: string): Observable<any> {
    return this.http.delete(`${this.peMessageApiPath}/api/admin/chat-templates/${chatTemplateId}/messages/${messageTemplateId}`);
  }

  // apps/channels

  getAppsChannelList(): Observable<any> {
    return this.http.get(`${this.peMessageApiPath}/api/business/${this.businessId}/app-channels`);
  }

  getAppsChannel(appName: string): Observable<any> {
    return this.http.get(`${this.peMessageApiPath}/api/business/${this.businessId}/app-channels/${appName}`);
  }

  // channels

  getIngegrationChannel(businessId: string, channelId: string): Observable<any> {
    return this.http.get(`${this.peMessageApiPath}/api/business/${businessId}/integration-channels/${channelId}`);
  }

  postChannel(channel: PeMessageChannel): Observable<any> {
    return this.http.post(`${this.peMessageApiPath}/api/business/${this.businessId}/channels`, channel);
  }

  patchChannel(channelInfo: PeMessageChannelInfo, channelId: string): Observable<any> {
    return this.http.patch(`${this.peMessageApiPath}/api/business/${this.businessId}/channels/${channelId}`, channelInfo);
  }

  getChannel(channelId: string): Observable<any> {
    return this.http.get(`${this.peMessageApiPath}/api/business/${this.businessId}/channels/${channelId}`);
  }

  getChannelList(): Observable<any> {
    return this.http.get(`${this.peMessageApiPath}/api/business/${this.businessId}/channels`);
  }

  postChannelMemberInvite(channelId: string, memberId: string): Observable<any> {
    return this.http.post(`${this.peMessageApiPath}/api/business/${this.businessId}/channels/${channelId}/members/${memberId}/invite`, {});
  }

  postChannelMemberExclude(channelId: string, memberId: string): Observable<any> {
    return this.http.post(`${this.peMessageApiPath}/api/business/${this.businessId}/channels/${channelId}/members/${memberId}/exclude`, {});
  }

  deleteChannel(channelId: string): Observable<any> {
    return this.http.request('delete', `${this.peMessageApiPath}/api/business/${this.businessId}/channels/${channelId}`
      , { body: { deleteForEveryone: true } });
  }

  // chat

  postChat(chat: PeMessageChat): Observable<any> {
    return this.http.post(`${this.peMessageApiPath}/api/business/${this.businessId}/chats`, chat);
  }

  postChatInvite(chatId: string, userId: string): Observable<any> {
    return this.http.post(`${this.peMessageApiPath}/api/business/${this.businessId}/chats/${chatId}/invite/${userId}`, null);
  }

  getChatList(parentFolder?: string): Observable<any> {
    const filter = parentFolder ? `?filter=${JSON.stringify({ parentFolder: parentFolder })}` : '';
    return this.http.get(`${this.peMessageApiPath}/api/business/${this.businessId}/chats${filter}`);
  }

  getChat(chatId: string): Observable<any> {
    return this.http.get(`${this.peMessageApiPath}/api/business/${this.businessId}/chats/${chatId}`);
  }

  patchChat(chat: PeMessageChat): Observable<any> {
    return this.http.patch(`${this.peMessageApiPath}/api/business/${this.businessId}/chats/${chat._id}`, { title: chat.title });
  }

  deleteChat(chatId: string): Observable<any> {
    return this.http.delete(`${this.peMessageApiPath}/api/business/${this.businessId}/chats/${chatId}`);
  }

  // group

  postGroup(chat: PeMessageChat): Observable<any> {
    return this.http.post(`${this.peMessageApiPath}/api/business/${this.businessId}/groups`, chat);
  }

  postGroupInvite(chatId: string, userId: string): Observable<any> {
    return this.http.post(`${this.peMessageApiPath}/api/business/${this.businessId}/groups/${chatId}/invite/${userId}`, null);
  }

  getGroupList(parentFolder?: string): Observable<any> {
    const filter = parentFolder ? `?filter=${JSON.stringify({ parentFolder: parentFolder })}` : '';
    return this.http.get(`${this.peMessageApiPath}/api/business/${this.businessId}/groups${filter}`);
  }

  getGroup(chatId: string): Observable<any> {
    return this.http.get(`${this.peMessageApiPath}/api/business/${this.businessId}/groups/${chatId}`);
  }

  patchGroup(chat: PeMessageChat): Observable<any> {
    return this.http.patch(`${this.peMessageApiPath}/api/business/${this.businessId}/groups/${chat._id}`, { title: chat.title });
  }

  deleteGroup(chatId: string): Observable<any> {
    return this.http.delete(`${this.peMessageApiPath}/api/business/${this.businessId}/groups/${chatId}`);
  }

  // chat-messages

  postChatMessage(chatId: string, message: PeChatMessage): Observable<any> {
    return this.http.post(`${this.peMessageApiPath}/api/business/${this.businessId}/chats/${chatId}/messages`, message);
  }

  getChatMessageList(chatId: string): Observable<any> {
    return this.http.get(`${this.peMessageApiPath}/api/business/${this.businessId}/chats/${chatId}/messages`);
  }

  patchChatMessage(chatId: string, message: PeChatMessage): Observable<any> {
    return this.http.patch(
      `${this.peMessageApiPath}/api/business/${this.businessId}/chats/${chatId}/messages/${message._id}`,
      { content: message.content, status: message.status }
    );
  }

  deleteChatMessage(chatId: string, messageId: string): Observable<any> {
    return this.http.delete(`${this.peMessageApiPath}/api/business/${this.businessId}/chats/${chatId}/messages/${messageId}`);
  }

  postChatMessageMarked(chatId: string, messageId: string, marked: boolean): Observable<any> {
    return this.http.post(
      `${this.peMessageApiPath}/api/business/${this.businessId}/chats/${chatId}/messages/${messageId}/marked`,
      { marked: marked }
    );
  }

  // contacts

  postContact(contact: PeMessageContact): Observable<any> {
    return this.http.post(`${this.peMessageApiPath}/api/business/${this.businessId}/contacts`, contact);
  }

  getContactList(): Observable<any> {
    return this.http.get(`${this.peMessageApiPath}/api/business/${this.businessId}/contacts`);
  }

  patchContact(contact: PeMessageContact): Observable<any> {
    return this.http.patch(`${this.peMessageApiPath}/api/business/${this.businessId}/contacts/${contact._id}`, contact);
  }

  deleteContact(contactId: string): Observable<any> {
    return this.http.delete(`${this.peMessageApiPath}/api/business/${this.businessId}/contacts/${contactId}`);
  }

  // conversations

  getConversationList(parentFolder?: string): Observable<any> {
    const filter = parentFolder ? `?filter=${JSON.stringify({ parentFolder: parentFolder })}` : '';
    return this.http.get(`${this.peMessageApiPath}/api/business/${this.businessId}/conversations${filter}`);
  }

  // users

  getUserList(): Observable<any> {
    return this.http.get(`${this.peMessageApiPath}/api/business/${this.businessId}/users`);
  }

  // subscriptions

  getSubscriptionList(): Observable<any> {
    return this.http.get(`${this.peMessageApiPath}/api/business/${this.businessId}/subscriptions`);
  }

  getSubscriptionsAll(): Observable<any> {
    return this.http.get(`${this.peMessageApiPath}/api/business/${this.businessId}/subscriptions/all`);
  }

  patchSubscriptionInstall(integrationName: string): Observable<any> {
    return this.http.patch(`${this.peMessageApiPath}/api/business/${this.businessId}/subscriptions/${integrationName}/install`, null);
  }

  patchSubscriptionUninstall(integrationName: string): Observable<any> {
    return this.http.patch(`${this.peMessageApiPath}/api/business/${this.businessId}/subscriptions/${integrationName}/uninstall`, null);
  }

  // settings

  getSettings(businessId: string = this.businessId): Observable<any> {
    return this.http.get(`${this.peMessageApiPath}/api/business/${businessId}/themes`);
  }

  patchSettings(themeItem: PeMessageSettingsThemeItem, themeId: string): Observable<any> {
    return this.http.patch(`${this.peMessageApiPath}/api/business/${this.businessId}/themes/${themeId}`, themeItem);
  }

  getBubble(businessId: string = this.businessId): Observable<any> {
    return this.http.get(`${this.peMessageApiPath}/api/business/${businessId}/bubble`);
  }

  patchBubble(bubble: PeMessageBubble): Observable<any> {
    return this.http.patch(`${this.peMessageApiPath}/api/business/${this.businessId}/bubble`, bubble);
  }

  // folders

  postFolder(folder: PeMessageFolder): Observable<any> {
    return this.http.post(`${this.peMessageApiPath}/api/business/${this.businessId}/folders`, folder);
  }

  getFolderList(): Observable<any> {
    return this.http.get(`${this.peMessageApiPath}/api/business/${this.businessId}/folders`);
  }

  patchFolder(folder: PeMessageFolder): Observable<any> {
    const folderId = folder._id;

    delete folder._id;

    return this.http.patch(`${this.peMessageApiPath}/api/business/${this.businessId}/folders/${folderId}`, folder);
  }

  deleteFolder(folderId: string): Observable<any> {
    return this.http.delete(`${this.peMessageApiPath}/api/business/${this.businessId}/folders/${folderId}`);
  }

  patchFolderItem(itemId: string, item: { parentFolder: string }): Observable<any> {
    return this.http.patch(`${this.peMessageApiPath}/api/business/${this.businessId}/folders/item/${itemId}`, item);
  }

  // bots

  getBotList(): Observable<any> {
    return this.http.get(`${this.peMessageApiPath}/api/business/${this.businessId}/bots`);
  }

  getBot(app: string): Observable<any> {
    return this.http.get(`${this.peMessageApiPath}/api/business/${this.businessId}/bots/${app}`);
  }

  getBotMessageList(app: string): Observable<any> {
    return this.http.get(`${this.peMessageApiPath}/api/business/${this.businessId}/bots/${app}/messages`);
  }

  postBotMessage(app: string, messageContent: string): Observable<any> {
    return this.http.post(
      `${this.peMessageApiPath}/api/business/${this.businessId}/bots/${app}/messages`,
      { bot: app, business: this.businessId, content: messageContent }
    );
  }

  patchBotMessage(app: string, message: PeChatMessage): Observable<any> {
    return this.http.patch(
      `${this.peMessageApiPath}/api/business/${this.businessId}/bots/${app}/messages/${message._id}`,
      { bot: app, business: this.businessId, content: message.content }
    );
  }

  deleteBotMessage(app: string, messageId: string): Observable<any> {
    return this.http.delete(`${this.peMessageApiPath}/api/business/${this.businessId}/bots/${app}/messages/${messageId}`);
  }

  //
  // PE PRODUCTS
  //

  getProductCheckoutLink(body: { productIds: string[], type: string }): Observable<any> {
    return this.http.post(`${this.peProductsApiPath}/product/checkout/${this.businessId}/link`, body);
  }

  getProductList(): Observable<any> {
    return this.http.post(`${this.peProductsApiPath}/products`, {
      query: `{
        getProducts(
          businessUuid: "${this.businessId}",
          pageNumber: 1,
          paginationLimit: 100,
        ) {
          products {
            images
            _id
            title
            description
            price
            salePrice
            currency
            active
            categories { id title }
          }
        }
      }`,
    }).pipe(
      map((response: any) => response.data.getProducts.products)
    );
  }

  getChannelSetByBusiness(): Observable<any> {
    return this.http.post(`${this.peProductsApiPath}/channelset`, {
      operationName: 'getChannelSetByBusiness',
      query: `
        query getChannelSetByBusiness($businessId: String!) {
          getChannelSetByBusiness(businessId: $businessId) {
            id
            name
            type
            active
            business
            enabledByDefault
            customPolicy
            policyEnabled
            originalId
          }
        }
      `,
      variables: { businessId: this.businessId }
    }).pipe(
      map((response: any) => response.data.getChannelSetByBusiness)
    );
  }

  // media

  postImage(file: File): Observable<any> {
    const formData = new FormData();

    formData.set('file', file);

    return this.http.post(
      `${this.peMediaApiPath}/api/image/business/${this.businessId}/miscellaneous`,
      formData,
      { reportProgress: true, observe: 'events' }
    );
  }

  // for boxes

  getCheckout(): Observable<any> {
    return this.http.get(`${this.environmentConfigInterface.backend.checkout}/api/business/${this.businessId}/checkout`);
  }

  getShop(): Observable<any> {
    return this.http.get(`${this.environmentConfigInterface.backend.shop}/api/business/${this.businessId}/shop`);
  }

  getSite(): Observable<any> {
    return this.http.get(`${this.environmentConfigInterface.backend.site}/api/business/${this.businessId}/site`);
  }
}
