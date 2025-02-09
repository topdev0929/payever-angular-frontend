import { Inject, Injectable } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { take, tap, map } from 'rxjs/operators';

import { PeChatService } from '@pe/chat';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { PeMessageColumn, PeMessageChatType, PeMessageGuardRoles } from '../enums';
import { PeMessageChat } from '../interfaces';

import { PeMessageService } from './message.service';
import { PeMessageGuardService } from './message-guard.service';
import { PeMessageApiService } from './message-api.service';
import { ChatListFacade } from '../classes/chat-list-facade';

@Injectable()
export class PeMessageChatRoomListService {

  detectChangeStream$ = new Subject();

  private unreadMessagesStream$ = new BehaviorSubject<any>(0);
  unreadMessages$ = this.unreadMessagesStream$.asObservable();
  get unreadMessages(): number {
    return this.unreadMessagesStream$.value;
  }
  set unreadMessages(count: number) {
    this.unreadMessagesStream$.next(count);
  }

  private unreadInFolderStream$ = new BehaviorSubject<any>(0);
  unreadInFolder$ = this.unreadInFolderStream$.asObservable();
  get unreadInFolder(): number {
    return this.unreadInFolderStream$.value;
  }
  set unreadInFolder(count: number) {
    this.unreadInFolderStream$.next(count);
  }

  private activeChatStream$ = new BehaviorSubject<PeMessageChat | null>(null);
  activeChat$ = this.activeChatStream$.asObservable();
  get activeChat(): PeMessageChat | null {
    return this.activeChatStream$.value;
  }
  set activeChat(chat: PeMessageChat | null) {
    this.peMessageService.activeColumn = PeMessageColumn.Room;
    this.activeChatStream$.next(chat);
  }

  mobileView: boolean = false;

  private chatListStream$ = new BehaviorSubject<PeMessageChat[]>([]);
  chatList$ = this.chatListStream$.asObservable();
  get chatList(): PeMessageChat[] {
    return this.chatListStream$.value;
  }
  set chatList(chats: PeMessageChat[]) {
    chats.forEach(chat => {
      this.getContactAvatar(chat, (avatar: any) => {
        chat.avatar = avatar;
      });
    });
    this.chatListStream$.next(chats);
  }

  constructor(
    private domSanitizer: DomSanitizer,
    private peChatService: PeChatService,
    private peMessageService: PeMessageService,
    private peMessageApiService: PeMessageApiService,
    private peMessageGuardService: PeMessageGuardService,
    @Inject(PE_ENV) public environmentConfigInterface: EnvironmentConfigInterface,
  ) {}

  deleteChat(id?: string): void {
    const chatId = id ?? this.activeChat?._id as string;
    const chat = this.chatList.find(chat => chat._id === chatId);

    if (
      this.peMessageGuardService.isAllowByRoles([PeMessageGuardRoles.Admin])
      && chat?.template as string
    ) {
      this.peMessageApiService.deleteChatTemplate(chat?.template as string).pipe(
        tap(() => {
          this.removeItemFromChatList(chatId);
        }),
      ).subscribe();
    } else {
      this.selectEndpoint(chat as PeMessageChat, chatId).pipe(
        take(1),
        tap(() => {
          this.removeItemFromChatList(chatId);
        }),
      ).subscribe();
    }
  }

  private selectEndpoint(chat: PeMessageChat, chatId: string): Observable<any> {
    switch (chat?.type) {
      case PeMessageChatType.Channel:
      case PeMessageChatType.AppChannel:
      case PeMessageChatType.IntegrationChannel:
        return this.peMessageApiService.deleteChannel(chatId);

      case PeMessageChatType.Group:
        return this.peMessageApiService.deleteGroup(chatId);

      case PeMessageChatType.Chat:
      default:
        return this.peMessageApiService.deleteChat(chatId);
    }
  }

  private removeItemFromChatList(chatId: string): void {
    const index = this.chatList.findIndex(c => c._id === chatId);
    this.chatList.splice(index, 1);
    this.sortChatList();
    this.activeChat = this.chatList.length ? this.chatList[0] : null;

    this.detectChangeStream$.next();
  }

  getConversationList(parentFolder?: string): void {
    this.peMessageApiService.getConversationList(parentFolder).pipe(
      take(1),
      tap((chats: PeMessageChat[]) => {
        this.chatList = this.prepareChatList(chats, parentFolder);
      }),
    ).subscribe();
  }

  private prepareChatList(chats: PeMessageChat[], parentFolder?: string): PeMessageChat[] {
    const chatListInstance = new ChatListFacade(chats, this.peMessageService.app, this.peMessageService.activationChatId);

    this.unreadInFolder = chatListInstance.countUnreadMessages();
    this.unreadMessages = this.unreadInFolder;

    const chatList = chatListInstance.normalizeChatList(this);
    this.activeChat = chatListInstance.activeChat();

    chatList.forEach(chat => this.peChatService.socket.emit('messages.ws-client.chat-room.join', chat._id));

    return chatList;
  }

  getContactAvatar(chat: PeMessageChat, callBack: Function): void {
    const contact = this.peMessageService.contactList.find(c => c._id === chat.contact);
    let url = '';

    if (contact?.avatar && chat.type === PeMessageChatType.Chat) {
      url = contact.avatar;
    } else if (chat.photo && chat.type === PeMessageChatType.Channel) {
      url = `${this.environmentConfigInterface.custom.storage}/miscellaneous/${chat.photo}`;
    }

    this.peMessageService.isValidImgUrl(url).then(res => {
      callBack(res.status === 200 && this.peMessageService.isValidUrl(url) ? this.domSanitizer.bypassSecurityTrustStyle(`url(${url})`) : undefined);
    });
  }

  getContactInitials(chat: PeMessageChat): string {
    return chat.title?.split(' ').map(n => n.charAt(0)).splice(0, 2).join('').toUpperCase() ?? '';
  }

  getMember(memberId: string, member?: any): any {
    const user = this.peMessageService.userList ? this.peMessageService.userList.find((u) => u._id === memberId)?.userAccount : null;
    const contact = this.peMessageService.contactList ? this.peMessageService.contactList.find((c) => c._id === memberId) : null;

    const name = [];

    if (user?.firstName) { name.push(user.firstName); }
    if (user?.lastName) { name.push(user.lastName); }

    const title = name.length ? name.join(' ') : contact?.name;

    return {
      _id: memberId,
      title: title,
      avatar: contact?.avatar,
      initials: title?.split(' ').map(n => n.charAt(0)).splice(0, 2).join('').toUpperCase() ?? '',
      permissions: member?.permissions,
    };
  }

  sortChatList(): void {
    this.chatList.sort((a: any, b: any) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }

  externalUnreadMessages(): Observable<any> {
    return this.peMessageApiService.getConversationList().pipe(
      take(1),
      map((chats: PeMessageChat[]) => {
        const chatListInstance = new ChatListFacade(chats, this.peMessageService.app, this.peMessageService.activationChatId);

        return chatListInstance.countUnreadMessages();
      }),
    );
  }
}
