import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import {
  PeChatService,
  PeMessageChat,
  PeMessageChatMember,
} from '@pe/shared/chat';

import { PeMessageWebSocketEvents, PeMessageWebsocketType } from '../enums';
import {
  PeMessageWebSocketEvent,
  PeMessageWebSocketIncludedDTO,
  PeMessageWebSocketMember,
  PeMessageWebSocketUserDTO,
  PeMessageWebSocketUserExcludedDTO,
} from '../interfaces';

import { PeMessageService } from './pe-message.service';

import Socket = SocketIOClient.Socket;


const SOCKET_EVENT_CUSTOM_MAPPERS: { [key: string]: Function } = {
  [PeMessageWebSocketEvents.CHAT_MEMBER_INCLUDED]:
    (
      userData: PeMessageWebSocketUserDTO,
      member: PeMessageWebSocketMember,
      chat: PeMessageChat,
    ) =>
      plainToClass(PeMessageWebSocketIncludedDTO, { userData, member, chat }),
  [PeMessageWebSocketEvents.CHAT_MEMBER_EXCLUDED]:
    (
      userData: PeMessageWebSocketUserDTO,
    ) =>
      plainToClass(PeMessageWebSocketUserExcludedDTO, { userData }),
  [PeMessageWebSocketEvents.CHAT_MEMBER_CHANGED]:
    (
      userData: PeMessageWebSocketUserDTO,
      member: PeMessageChatMember,
      chat: PeMessageChat,
    ) =>
      ({ chatId: chat._id, chatType: chat.type, memberId: member.user, member: member }),
};


@Injectable()
export class PeMessageWebSocketService {
  private socketStack = new Map<PeMessageWebsocketType, Socket>();
  private events$ = new Subject<PeMessageWebSocketEvent>();
  private webSocketType: PeMessageWebsocketType;
  public isLiveChat: boolean;

  constructor(
    public peMessageService: PeMessageService,
    private peChatService: PeChatService,
  ) {
    this.socketStack = new Map();
  }

  public init(uri: string, query: any, webSocketType = PeMessageWebsocketType.Regular): Observable<any> {
    if (this.socketStack.get(webSocketType)) {
      return;
    }
    this.webSocketType = this.isLiveChat
      ? PeMessageWebsocketType.LiveChat
      : PeMessageWebsocketType.Regular;
    const opts = {
      path: '/ws',
      timeout: 10000,
      transports: ['websocket'],
      query,
    };
    const socket = this.peChatService.connect(uri, opts);
    this.socketStack.set(webSocketType, socket);

    const initialEvents = [
      PeMessageWebSocketEvents.EXCEPTION,
      PeMessageWebSocketEvents.UNAUTHORIZED,
      PeMessageWebSocketEvents.AUTHENTICATED,
      PeMessageWebSocketEvents.INITIAL_APP_CHANNELS_CREATED,
    ];
    const messageEvents = [
      PeMessageWebSocketEvents.MESSAGE_POSTED,
      PeMessageWebSocketEvents.MESSAGE_PINNED,
      PeMessageWebSocketEvents.MESSAGE_UNPINNED,
      PeMessageWebSocketEvents.MESSAGE_TYPING,
      PeMessageWebSocketEvents.MESSAGE_ONLINE,
      PeMessageWebSocketEvents.MESSAGE_UPDATED,
      PeMessageWebSocketEvents.MESSAGE_DELETED,
      PeMessageWebSocketEvents.MESSAGE_SCROLL_RESPONSE,
    ];
    const chatEvents = [
      PeMessageWebSocketEvents.CHAT_CREATED,
      PeMessageWebSocketEvents.CHAT_UPDATED,
      PeMessageWebSocketEvents.CHAT_DELETED,
      PeMessageWebSocketEvents.CHAT_MEMBER_INCLUDED,
      PeMessageWebSocketEvents.CHAT_MEMBER_EXCLUDED,
      PeMessageWebSocketEvents.CHAT_MEMBER_CHANGED,
      PeMessageWebSocketEvents.ROOM_JOINED,
      PeMessageWebSocketEvents.CONTACT_CREATED,
      PeMessageWebSocketEvents.CHAT_UNREAD_MESSAGE,
    ];

    [
      ...initialEvents,
      ...messageEvents,
      ...chatEvents,
    ].forEach(event => this.handleGenericSocketEvent(socket, event));

    return this.events$.pipe(
      filter(data => data.socketId === socket.id && initialEvents.includes(data.eventName)),
      map((data) => {
        const isException = [
          PeMessageWebSocketEvents.EXCEPTION,
          PeMessageWebSocketEvents.UNAUTHORIZED,
        ].includes(data.eventName);
        if (isException) {
          throw data;
        }

        return {
          ...data.payload,
          eventName: data.eventName,
          liveChat: webSocketType === PeMessageWebsocketType.LiveChat,
          socket,
        };
      }),
    );
  }

  public handleSubjectObservable(eventName: string): Observable<any> {
    return this.events$.pipe(
      filter(data => data.eventName === eventName),
      map(data => data.payload),
    );
  }

  getOldMessages(data:{ _id, chat, limit, skip? }) {
    const socket = this.socketStack.get(this.webSocketType);

    socket?.emit(PeMessageWebSocketEvents.EMIT_MESSAGE_SCROLL_REQUEST, data);
  }

  public handleGenericSocketEvent(
    socket: Socket,
    eventName: PeMessageWebSocketEvents,
  ): void {
    const mapper = SOCKET_EVENT_CUSTOM_MAPPERS[eventName] || ((...args) => args[0]);
    socket.on(eventName, (...args) => this.events$.next({ eventName, payload: mapper(...args), socketId: socket.id }));
  }

  public emitMessageUnreadCount(data) {
    const socket = this.socketStack.get(this.webSocketType);
    socket?.emit(PeMessageWebSocketEvents.EMIT_UNREAD_MESSAGE, data);
  }

  public deleteMessage(data) {
    const socket = this.socketStack.get(this.webSocketType);
    socket?.emit(PeMessageWebSocketEvents.EMIT_MESSAGE_DELETE, data);
  }

  public updateMessage(data) {
    const socket = this.socketStack.get(this.webSocketType);
    socket?.emit(PeMessageWebSocketEvents.EMIT_MESSAGE_UPDATE, data);
  }

  public sendMessage(data, webSocketType: PeMessageWebsocketType = PeMessageWebsocketType.Regular) {
    const socket = this.socketStack.get(this.webSocketType);
    socket?.emit(PeMessageWebSocketEvents.EMIT_MESSAGE_SEND, data);
  }

  public pinMessage(messageId: string) {
    const socket = this.socketStack.get(this.webSocketType);
    socket?.emit(PeMessageWebSocketEvents.EMIT_MESSAGE_PIN, { messageId });
  }

  public unpinMessage(data:{pinId,chatId}) {
    const socket = this.socketStack.get(this.webSocketType);
    socket?.emit(PeMessageWebSocketEvents.EMIT_MESSAGE_UNPIN, data);
  }

  typingMessage(chatId: string) {
    const socket = this.socketStack.get(this.webSocketType);
    socket?.emit(PeMessageWebSocketEvents.EMIT_MESSAGE_TYPING, chatId);
  }

  typingStoppedMessage(chatId: string) {
    const socket = this.socketStack.get(this.webSocketType);
    socket?.emit(PeMessageWebSocketEvents.EMIT_MESSAGE_TYPING_STOPPED, chatId);
  }

  leaveChat(chatId: string) {
    const socket = this.socketStack.get(this.webSocketType);
    socket?.emit(PeMessageWebSocketEvents.MESSAGE_LEAVE, chatId);
  }

  leaveMember(chatId: string){
    const socket = this.socketStack.get(this.webSocketType);
    socket?.emit(PeMessageWebSocketEvents.CHAT_MEMBER_LEAVE, chatId);
  }

  forwardMessage(data) {
    const socket = this.socketStack.get(this.webSocketType);
    socket?.emit(PeMessageWebSocketEvents.EMIT_MESSAGE_FORWARD, data);
  }

  public markReadMessage(messageId: string) {
    const socket = this.socketStack.get(this.webSocketType);
    socket?.emit(PeMessageWebSocketEvents.EMIT_MESSAGE_MARK_READ, messageId);
  }

  public chatRoomJoin(chatId: string) {
    const socket = this.socketStack.get(this.webSocketType);
    socket?.emit(PeMessageWebSocketEvents.EMIT_CHAT_ROOM_JOIN, chatId);
  }

  public businessRoomJoin(businessId: string) {
    const socket = this.socketStack.get(this.webSocketType);
    socket?.emit(PeMessageWebSocketEvents.EMIT_BUSINESS_ROOM_JOIN, businessId);
  }

  public destroy(): void {
    this.socketStack.forEach(socket => socket.disconnect());
    this.socketStack.clear();
  }
}
