import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { delay, map, take, takeUntil, tap } from 'rxjs/operators';
import * as uuid from 'uuid';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import {
  MessageChatEvents,
  PeChatMessage,
  PeChatMessageStatus,
  PeChatMessageType,
  PeMessageChat } from '@pe/shared/chat';
import { FolderItem } from '@pe/shared/folders';

import { PeMessageApiService, PeMessageWebSocketService } from '../../services';
import { InitMessages, SetChannelsToShow, SetMessagesToShow } from '../state';

import { PeMessageAppApiService } from './api';
import { PeMessageChatService } from './chat.service';

@Injectable({
  providedIn: 'root',
})
export class PeMessageAppService {

  _isLiveChat: boolean;
  set isLiveChat(isLiveChat: boolean){
    this._isLiveChat = isLiveChat;
    this.peMessageWebSocketService.isLiveChat = isLiveChat;
  }

  get isLiveChat(){
    return this._isLiveChat;
  }

  userId: string;
  selectedFolder: FolderItem;
  rootFolderId: string;
  selectedChannel$ = new BehaviorSubject<{ businessId: string, channel: PeMessageChat }>(null);
  folderSearchTerm = "";
  loadChannelsPageNumber = 1;
  reachEndOfChannelList = false;
  liveChatActiveChannelId : string;
  get selectedChannel(){
    const businessId = this.peMessageApiService.businessId;
    const selectedChannel = this.selectedChannel$.getValue();
    if (selectedChannel?.businessId === businessId) {
      return selectedChannel.channel;
    }

    return null;
  }

  set selectedChannel(channel: PeMessageChat) {
    const businessId = this.peMessageApiService.businessId;
    if (!this.isLiveChat && ( channel && this.selectedChannel?._id !== channel?._id && !channel.pinnedMessageObj)) {
        this.peMessageAppApiService.getPinnedMessages(channel._id).pipe(
          take(1),
          tap((pinnedMessageObj) => {
            this.getMessages()
            .pipe(
              take(1),
              tap((messages) => {
                const chatIndex = messages.findIndex(item => item._id === channel._id);
                const updatedMessages = [...messages];
                const pinnedMessageList = pinnedMessageObj.slice().sort(
                  (a, b) => new Date(a.updatedAt ?? a.sentAt).getTime() - new Date(b.updatedAt ?? b.sentAt).getTime());
                updatedMessages[chatIndex] = {
                  ...updatedMessages[chatIndex],
                  pinnedMessageObj: pinnedMessageList,
                };
                this.selectedChannel$.next({ businessId, channel: updatedMessages[chatIndex] });
                this.setMessages(updatedMessages);
              }),
              takeUntil(this.destroy$),
            )
            .subscribe();
          }),
          takeUntil(this.destroy$),
        ).subscribe();
    }
    if (channel?._id !== this.selectedChannel?._id) {
      this.showPinnedMessageList$.next(false);
    }
    this.selectedChannel$.next({ businessId, channel });
  }

  readonly showPinnedMessageList$ = new BehaviorSubject<boolean>(false);
  get showPinnedMessageList(){
    return this.showPinnedMessageList$.getValue();
  }

  set showPinnedMessageList(isShowPinnedMessages: boolean){
    this.showPinnedMessageList$.next(isShowPinnedMessages);
    isShowPinnedMessages ?
      this.updatePinnedMessagesToShow() :
      this.setMessagesToShowBasedOnChannel(this.selectedChannel);
  }

  updatePinnedMessagesToShow(){
    this.getChannelsToShow()
    .pipe(
      take(1),
      tap((channels) => {
        let filteredMessages = channels.find(item => item._id === this.selectedChannel._id).pinnedMessageObj;
        filteredMessages = filteredMessages.filter(message => !message.deletedForUsers?.includes(this.userId));
        filteredMessages = filteredMessages.map((message) => {
          const senderObj = this.selectedChannel?.members?.find(
            member => member.user._id === message.sender)?.user?.userAccount;
          const replyMessage = filteredMessages.find(item => item._id === message.replyTo);
          const replySenderObj = this.selectedChannel?.members?.find(
            member => member.user._id === replyMessage?.sender)?.user?.userAccount;
          const replyData = replySenderObj && {
            ...replyMessage,
            senderObj: replySenderObj,
          };

          return {
            ...message,
            senderObj,
            replyData,
            isPin: true,
          };
        });
        this.setMessagesToShow(filteredMessages);
      }),
      takeUntil(this.destroy$),
    )
    .subscribe();
  }

  constructor(
    private store: Store,
    private peMessageAppApiService: PeMessageAppApiService,
    private destroy$: PeDestroyService,
    private peMessageWebSocketService: PeMessageWebSocketService,
    private peMessageChatService: PeMessageChatService,
    private peMessageApiService: PeMessageApiService,
    private translateService: TranslateService,
  ) {}

  clearSelectedChannel(): void {
    this.selectedChannel = undefined;
  }

  clear(): void {
    this.peMessageWebSocketService.destroy();
    this.isLiveChat = false;
    this.selectedFolder = undefined;
    this.store.dispatch(new InitMessages(undefined));
    this.store.dispatch(new SetChannelsToShow(undefined));
    this.store.dispatch(new SetMessagesToShow(undefined));
  }

  initMessages(isLive: boolean = false): void {
    this.peMessageAppApiService
      .getChannels(1, isLive)
      .pipe(
        tap((item) => {
          this.setMessages(item);
          this.setChannelsToShow(item);
          this.setMessagesToShow(null);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  loadMoreChannels(): void {
    if (!this.reachEndOfChannelList) {
      this.loadChannelsPageNumber = this.loadChannelsPageNumber + 1;
      this.peMessageAppApiService.getChannels(this.loadChannelsPageNumber)
      .pipe(
        tap((newChannels) => {
          if (newChannels.length === 0){
            this.reachEndOfChannelList = true;
          }
          this.getMessages().pipe(
            take(1),
            tap((messages) => {
              const updatedMessages = [...messages, ...newChannels];
              this.setMessages(updatedMessages);
            }),
            takeUntil(this.destroy$),
          )
          .subscribe();
        }),
        takeUntil(this.destroy$),
      ).subscribe();
    }
  }

  setMessages(message: PeMessageChat[]): void {
    this.store.dispatch(new InitMessages(message));
    this.selectedChannel = message.find(channel => channel._id === this.selectedChannel?._id);
    this.updateMessagesAndChannels();
  }

  setChannelsToShow(message: PeMessageChat[]): void {
    this.store.dispatch(new SetChannelsToShow(message));
  }

  setMessagesToShow(message: PeChatMessage[]): void {
    this.store.dispatch(new SetMessagesToShow(message));
  }

  getMessages(): Observable<PeMessageChat[]> {
    return this.store.select(state => state.messages.messages);
  }

  getChannelsToShow(): Observable<PeMessageChat[]> {
    return this.store.select(state => state.messages.channelsToShow);
  }

  getMessagesToShow(): Observable<PeChatMessage[]> {
    return this.store.select(state => state.messages.messagesToShow);
  }

  setChannelsToShowBasedOnFolder(folder?: FolderItem): void {
    this.selectedFolder = folder;
    this.getMessages()
      .pipe(
        take(1),
        tap((messages) => {
          let filteredChannels: PeMessageChat[] = messages;

          if (folder) {
            filteredChannels = messages.filter(message =>
              message.locations?.map(item => item.folderId).includes(folder._id),
            );
            if (filteredChannels.length === 0){
              this.loadMoreChannels();
            }
          }

          if (this.folderSearchTerm && this.folderSearchTerm !== "") {
            filteredChannels = filteredChannels.filter(channel =>channel.title.includes(this.folderSearchTerm));
          }

          filteredChannels = filteredChannels?.slice().sort(
            (a, b) => this.peMessageChatService.getLastMessageDate(b) - this.peMessageChatService.getLastMessageDate(a)
          );

          this.setChannelsToShow(filteredChannels);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }


  setMessagesToShowBasedOnChannel(channel?: PeMessageChat): void {
    if (!channel){
      return;
    };
    if (this.isLiveChat && this.liveChatActiveChannelId && !this.selectedChannel) {
      const liveChatActiveChanel = { ...channel, _id: this.liveChatActiveChannelId };
      this.selectedChannel = liveChatActiveChanel;
      this.editChannelId(channel._id, this.liveChatActiveChannelId);

      return;
    }
    this.selectedChannel = channel;
    this.getChannelsToShow()
      .pipe(
        take(1),
        tap((channels) => {
          let filteredMessages = channels.find(item => item._id === channel._id).messages;
          filteredMessages = filteredMessages.filter(message => !message.deletedForUsers?.includes(this.userId));
          filteredMessages = this.addDateSeparatorToMessages(filteredMessages);
          filteredMessages = filteredMessages.map(message =>
            Object.values(MessageChatEvents).includes(message.eventName)
              ? this.convertVirtualMessages(message)
              : this.convertMessage(filteredMessages, message)
          );

          this.setMessagesToShow(filteredMessages);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  addDateSeparatorToMessages(messages: PeChatMessage[]) {
    const updatedMessages = [];
    messages.map((message, index) => {
      if (index !== 0){
        if (new Date(messages[index].sentAt).toDateString() !== new Date(messages[index-1].sentAt).toDateString()) {
          updatedMessages.push(this.peMessageChatService.getDateSeparatorObject(messages[index]));
        }
      }
      updatedMessages.push(message);
    });

    return updatedMessages;
  }

  convertMessage(messages: PeChatMessage[], message: PeChatMessage){
    const channel = this.selectedChannel;
    const senderObj = channel?.members?.find(member => member.user._id === message.sender)?.user?.userAccount ??
      { firstName: message.sender === this.userId ? 'Me' : this.isLiveChat ? 'Merchant' :
         this.translateService.translate("message-app.chat.anonymous-user"),
        lastName: "",
      };

    const replyMessage = message.replyTo && messages.find(item => item._id === message.replyTo);
    const replySenderObj = replyMessage && (channel?.members?.find(member =>
      member.user._id === replyMessage?.sender)?.user?.userAccount ??
    { firstName: replyMessage.sender === this.userId ? 'Me' : this.isLiveChat ? 'Merchant' :
       this.translateService.translate("message-app.chat.anonymous-user"),
      lastName: "",
    });

    const replyData = replySenderObj && {
      ...replyMessage,
      senderObj: replySenderObj,
    };
    const pinId = this.selectedChannel?.pinnedMessageObj?.find(pinMessage => pinMessage._id === message._id)?.pinId;
    const type = message.attachments && message.attachments?.length !== 0
      ? PeChatMessageType.Attachment
      : message.type;

    return {
      ...message,
      senderObj,
      replyData,
      pinId,
      type,
    };
  }

  convertVirtualMessages(message: PeChatMessage){
    let convertedMessage = message;
    switch (message.eventName){
      case MessageChatEvents.ExcludeMember:
        convertedMessage = { ...message, content: this.translateService
          .translate('message-app.invitation.notification.member_excluded_by')
          .replace(
            '{excludedUser}',
            (message.data.excludedUser?.userAccount?.firstName || "") + ' ' +
              (message.data.excludedUser?.userAccount?.lastName || ""),
          )
          .replace(
            '{excludedByUser}',
            (message.data.excludedBy?.userAccount?.firstName || "") + ' ' +
              (message.data.excludedBy?.userAccount?.lastName || ""),
          ) };
        break;
      case MessageChatEvents.LeaveMember:
        if (message.data.leftUser){
          convertedMessage = { ...message, content: this.translateService
            .translate('message-app.invitation.notification.member_left_chat')
            .replace(
              '{leftUser}',
              (message.data.leftUser?.userAccount?.firstName || "") + ' ' +
                (message.data.leftUser?.userAccount?.lastName || ""),
            ) };
        }
        break;
      case MessageChatEvents.IncludeMember:
        if (message.data.withInvitationLink) {
          convertedMessage = { ...message, content: this.translateService
            .translate('message-app.invitation.notification.member_invited_by_link')
            .replace(
              '{includeUser}',
            (message.data.includedUser?.userAccount?.firstName || "") +' '+
              (message.data.includedUser?.userAccount?.lastName || ""),
            ) };
        }
        else {
          convertedMessage = { ...message, content: this.translateService
            .translate('message-app.invitation.notification.member_invited_by')
            .replace(
              '{includeUser}',
              (message.data.includedUser?.userAccount?.firstName || "") +' '+
                (message.data.includedUser?.userAccount?.lastName || ""),
            )
            .replace(
              '{includedByUser}',
              (message.data.includedBy?.userAccount?.firstName || "") + ' ' +
                (message.data.includedBy?.userAccount?.lastName || ""),
            ) };
        }
        break;
    }

    return convertedMessage;
  }

  updateMessagesAndChannels(){
    this.setChannelsToShowBasedOnFolder(this.selectedFolder);
    !this.showPinnedMessageList
      ? this.setMessagesToShowBasedOnChannel(this.selectedChannel)
      : this.updatePinnedMessagesToShow();
  }

  sendMessage(message: PeChatMessage): void {
    this.getMessages()
      .pipe(
        take(1),
        tap((messages) => {
          const chatIndex = messages.findIndex(item => item._id === message.chat);
          const updatedMessages = [...messages];
          updatedMessages[chatIndex] = {
            ...updatedMessages[chatIndex],
            messages: [...updatedMessages[chatIndex].messages, message],
          };
          if (message.sender === this.userId) {
            let wsMessage = { ...message };
            if (this.liveChatActiveChannelId && this.isLiveChat) {
              wsMessage = { ...wsMessage, chat: this.liveChatActiveChannelId };
            }
            delete wsMessage.createdAt;
            delete wsMessage.updatedAt;
            delete wsMessage.sender;

            this.peMessageWebSocketService.sendMessage(wsMessage);
          }
          else {
            updatedMessages[chatIndex] = {
              ...updatedMessages[chatIndex],
              unreadCount: (updatedMessages[chatIndex].unreadCount ?? 0) + 1,
            };
          }

          if (Object.values(MessageChatEvents).includes(message.eventName)){
            if (message.eventName === MessageChatEvents.IncludeMember) {
              const newMember = {
                addMethod: "invite",
                role: "member",
                addedBy: message.data.includedBy.user,
                createdAt: new Date(),
                updateAt: new Date(),
                user: { _id: message.data.includedUser.user, userAccount: message.data.includedUser.userAccount },
              };

              updatedMessages[chatIndex] = {
                ...updatedMessages[chatIndex],
                members: [...updatedMessages[chatIndex].members, newMember],
              };
            }
            if (message.eventName === MessageChatEvents.LeaveMember) {
              updatedMessages[chatIndex] = {
                ...updatedMessages[chatIndex],
                members: updatedMessages[chatIndex].members.filter(
                  member => member.user._id !== message.data?.leftUser?.user),
              };
            }
          }

          this.setMessages(updatedMessages);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  forwardMessage(message: PeChatMessage, withSender?: boolean): void {
    this.getMessages()
      .pipe(
        take(1),
        tap((messages) => {
          const chatIndex = messages.findIndex(item => item._id === message.chat);
          const updatedMessages = [...messages];
          updatedMessages[chatIndex] = {
            ...updatedMessages[chatIndex],
            messages: [...updatedMessages[chatIndex].messages, message],
          };
          if (message.sender === this.userId) {
            const wsMessage = {
              chat: message.chat,
              ids: [message._id],
              withSender,
             };
             this.peMessageWebSocketService.forwardMessage(wsMessage);
          }
          else {
            updatedMessages[chatIndex] = {
              ...updatedMessages[chatIndex],
              unreadCount: (updatedMessages[chatIndex].unreadCount ?? 0) + 1,
            };
          }
          this.setMessages(updatedMessages);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  readMessage(targetMessage: PeChatMessage){
    if (!targetMessage){
      return;
    }
    this.getMessages()
      .pipe(
        take(1),
        tap((messages) => {
          const chatIndex = messages.findIndex(item => item._id === targetMessage.chat);
          const updatedMessages = [...messages];

          updatedMessages[chatIndex] = {
            ...updatedMessages[chatIndex],
            unreadCount: updatedMessages[chatIndex].unreadCount - 1,
          };

          const messageIndex = updatedMessages[chatIndex].messages.findIndex(item=>item._id === targetMessage._id);

          updatedMessages[chatIndex].messages[messageIndex]=
            { ...updatedMessages[chatIndex].messages[messageIndex],
              status: PeChatMessageStatus.READ,
              readBy: this.userId && [...updatedMessages[chatIndex].messages[messageIndex].readBy ?? [], this.userId],
            };

          this.setMessages(updatedMessages);

          this.peMessageWebSocketService.markReadMessage(
            targetMessage._id,
          );
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  editMessage(newMessage: PeChatMessage, searchByTempId: boolean = false): void {
    this.getMessages()
      .pipe(
        take(1),
        tap((messages) => {
          const chatIndex = messages.findIndex(item => item._id === newMessage.chat);
          const updatedMessages = [...messages];
          let messageIndex;
          if (searchByTempId){
            messageIndex = updatedMessages[chatIndex].messages.findIndex(item=>
              item.contentPayload === newMessage.contentPayload);
          }
          else {
            messageIndex = updatedMessages[chatIndex].messages.findIndex(item=>item._id === newMessage._id);
          }

          updatedMessages[chatIndex].messages[messageIndex] = newMessage;
          if (newMessage.sender === this.userId && !searchByTempId) {
            const wsMessage = {
              content: newMessage.content,
              _id: newMessage._id,
            };
            this.peMessageWebSocketService.updateMessage(wsMessage);
          }
          this.setMessages(updatedMessages);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  deleteMessage(targetMessage: PeChatMessage, deleteForEveryone: boolean = false): void {
    this.getMessages()
      .pipe(
        take(1),
        tap((messages) => {
          const chatIndex = messages.findIndex(item => item._id === targetMessage.chat);
          const updatedMessages = [...messages];
          const messageIndex = updatedMessages[chatIndex].messages.findIndex(item=>item._id === targetMessage._id);
          if (messageIndex === -1) {
            return;
          }
          updatedMessages[chatIndex].messages.splice(messageIndex, 1);
          this.peMessageWebSocketService.deleteMessage(
            { _id: targetMessage._id, deleteForEveryone },
          );
          this.setMessages(updatedMessages);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  pinMessage(message: PeChatMessage): void {
    this.getMessages()
      .pipe(
        take(1),
        tap((messages) => {
          const chatIndex = messages.findIndex(item => item._id === message.chat);
          const updatedMessages = [...messages];
          const pinnedMessageList = [...updatedMessages[chatIndex].pinnedMessageObj ?? [], message]
            .sort((a,b)=>new Date(a.updatedAt ?? a.sentAt).getTime() - new Date(b.updatedAt ?? b.sentAt).getTime());
          updatedMessages[chatIndex] = {
            ...updatedMessages[chatIndex],
            pinnedMessageObj: pinnedMessageList,
          };
          this.setMessages(updatedMessages);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  unpinMessage(message: PeChatMessage, byMySelf: boolean): void {
    this.getMessages()
    .pipe(
      take(1),
      tap((messages) => {
        const chatIndex = messages.findIndex(item => item._id === message.chat);
        const updatedMessages = [...messages];
        const pinnedMessageList = updatedMessages[chatIndex].pinnedMessageObj.filter(
          pinMessage => pinMessage._id !== message._id);
        updatedMessages[chatIndex] = {
          ...updatedMessages[chatIndex],
          pinnedMessageObj: pinnedMessageList,
        };
        if (byMySelf) {
          this.peMessageWebSocketService.unpinMessage(
            { pinId: message.pinId, chatId: message.chat }
          );
        }
        this.setMessages(updatedMessages);
      }),
      takeUntil(this.destroy$),
    )
    .subscribe();

  }

  scrollRequest(){
    if (!this.showPinnedMessageList){
      this.getMessagesToShow().pipe(
        take(1),
        tap((messages) => {
          this.peMessageWebSocketService.getOldMessages(
            {
              _id: uuid.v4(),
              chat: this.selectedChannel._id,
              limit: 50,
              skip: messages.length,
            }
          );
        }),
        takeUntil(this.destroy$)
      ).subscribe();
    }
  }

  addChannel(channel: PeMessageChat): void {
    this.getMessages()
      .pipe(
        take(1),
        tap((messages) => {
          let filteredChannels: PeMessageChat[] = messages;

          if (this.selectedFolder) {
            this.peMessageApiService.addLocation(
              channel._id,
              channel,
              this.selectedFolder._id).pipe(
                tap((folder) =>{
                  this.peMessageAppApiService.getConversationMembers(channel.type, channel._id).pipe(
                    tap((item) => {
                      const convertedChannel: PeMessageChat = {
                        ...channel,
                        members: channel.members.map(member => ({
                          ...member,
                          user: {
                            _id: member.user,
                            userAccount: item.find(memberData => memberData.user._id === member.user)?.user.userAccount,
                          },
                        })),
                        locations: [{ _id: folder._id, folderId: folder.folderId }],
                      };
                      filteredChannels = [...filteredChannels, convertedChannel];

                      filteredChannels = filteredChannels?.slice().sort((a, b) =>
                       this.peMessageChatService.getLastMessageDate(b) - this.peMessageChatService.getLastMessageDate(a)
                      );
                      this.setMessages(filteredChannels);
                      this.selectedChannel = convertedChannel;
                    }),
                    takeUntil(this.destroy$),
                  ).subscribe();
                }),
                takeUntil(this.destroy$),
              ).subscribe();
          }
          else {
            this.peMessageAppApiService.getConversationMembers(channel.type, channel._id).pipe(
              tap((item) => {
                const convertedChannel: PeMessageChat = {
                  ...channel,
                  members: channel.members.map(member => ({
                    ...member,
                    user: {
                      _id: member.user,
                      userAccount: item.find(memberData => memberData.user._id === member.user)?.user.userAccount,
                    },
                  })),
                };
                filteredChannels = [...filteredChannels, convertedChannel];

                filteredChannels = filteredChannels?.sort((a, b) =>
                 this.peMessageChatService.getLastMessageDate(b) - this.peMessageChatService.getLastMessageDate(a)
                );
                this.setMessages(filteredChannels);
                this.selectedChannel = convertedChannel;
              }),
              takeUntil(this.destroy$),
            ).subscribe();
          }
        }),
        takeUntil(this.destroy$),
      ).subscribe();
  }

  changeChannelFolder(channel: PeMessageChat, folderId: string){
    this.getMessages()
      .pipe(
        take(1),
        tap((messages) => {
            this.peMessageApiService.addLocation(channel._id, channel, folderId).pipe(
                tap((folder) =>{
                  const chatIndex = messages.findIndex(item => item._id === channel._id);
                  const updatedMessages = [...messages];
                  updatedMessages[chatIndex].locations =
                  [...updatedMessages[chatIndex].locations ?? [], { folderId, _id: folderId }];
                  this.setMessages(updatedMessages);
                }),
                takeUntil(this.destroy$),
              ).subscribe();
        }),
        takeUntil(this.destroy$),
      ).subscribe();
  }

  removeChannelFromFolder(channel: PeMessageChat, folder: FolderItem = this.selectedFolder){
    const folderId =  channel.locations.find(location => location.folderId === folder._id)._id;
    this.getMessages()
    .pipe(
      take(1),
      tap((messages) => {
          this.peMessageApiService.removeLocation(channel._id, folderId).pipe(takeUntil(this.destroy$)).subscribe();
          const chatIndex = messages.findIndex(item => item._id === channel._id);
          const updatedMessages = [...messages];
          updatedMessages[chatIndex].locations =
            updatedMessages[chatIndex].locations.filter(location => location._id !== folderId);
          this.setMessages(updatedMessages);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  searchChannel(search: string): void {
    this.folderSearchTerm = search;
    this.setChannelsToShowBasedOnFolder(this.selectedFolder);
  }

  leaveFromChannel(channel: PeMessageChat, isDelete: boolean = false) {
    !isDelete && this.peMessageWebSocketService.leaveMember(channel._id);
    this.getMessages()
    .pipe(
      take(1),
      tap((messages) => {
          const chatIndex = messages.findIndex(item => item._id === channel._id);
          const updatedMessages = [...messages];
          updatedMessages.splice(chatIndex, 1);
          this.setMessages(updatedMessages);
          if (isDelete){
            this.peMessageApiService.deleteAppConversation(channel._id, channel.type).pipe(
              takeUntil(this.destroy$),
            ).subscribe();
          }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  editChannel(channel: PeMessageChat){
    this.getMessages()
      .pipe(
        take(1),
        tap((messages) => {
          const chatIndex = messages.findIndex(item => item._id === channel._id);
          const updatedMessages = [...messages];
          updatedMessages[chatIndex] = channel;
          this.setMessages(updatedMessages);
        }),
        takeUntil(this.destroy$),
      ).subscribe();
  }

  editChannelId(lastId: string, newId: string) {
    this.getMessages()
    .pipe(
      take(1),
      tap((messages) => {
        const chatIndex = messages.findIndex(item => item._id === lastId);
        const updatedMessages = [...messages];
        updatedMessages[chatIndex] = { ...updatedMessages[chatIndex], _id: newId };
        updatedMessages[chatIndex].messages = updatedMessages[chatIndex].messages.map(
          message => message.chat === lastId && { ...message, chat: newId } );
        this.setMessages(updatedMessages);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }


  triggerMessageHighlight(message: PeChatMessage, value: boolean = true): void {
    this.getMessages()
      .pipe(
        take(1),
        map((messages) => {
          const chatIndex = messages.findIndex(item => item._id === message.chat);
          const updatedMessages = [...messages];
          const messageIndex = updatedMessages[chatIndex].messages.findIndex(item=>item._id === message._id);

          updatedMessages[chatIndex].messages[messageIndex].highlightMessageTrigger = value;

          return updatedMessages;
        }),
        delay(!value ? 300 : 0),
        tap(updatedMessages => this.setMessages(updatedMessages)),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  toggleChannelLiveStatus(channel: PeMessageChat, isLive: boolean) {
    this.getMessages()
    .pipe(
      take(1),
      tap((messages) => {
        let updatedMessages = [...messages];
        if (isLive){
          updatedMessages = [ ...updatedMessages, channel];
        }
        const chatIndex = updatedMessages.findIndex(item => item._id === channel._id);
        this.peMessageApiService.toggleChannelLiveStatus(updatedMessages[chatIndex], isLive).pipe(
          takeUntil(this.destroy$),
        ).subscribe();
        updatedMessages[chatIndex] = {
           ...updatedMessages[chatIndex],
            permissions: { ... updatedMessages[chatIndex].permissions, live: isLive },
         };
         if (!isLive) {
          updatedMessages.splice(chatIndex, 1);
          }
        this.setMessages(updatedMessages);
      }),
      takeUntil(this.destroy$),
    )
    .subscribe();
  }
}
