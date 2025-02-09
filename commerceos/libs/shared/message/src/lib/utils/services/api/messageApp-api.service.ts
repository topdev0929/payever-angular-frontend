import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

import { EnvService } from "@pe/common";
import { PeChatMessage, PeMessageChat } from "@pe/shared/chat";

import { PeMessageChatType } from "../../../enums";
import { PE_MESSAGE_API_PATH } from "../../../services";

@Injectable()
export class PeMessageAppApiService {

  constructor(
    private envService: EnvService,
    private httpClient: HttpClient,
    @Inject(PE_MESSAGE_API_PATH) private peMessageApiPath: string,
  ) { }

  private get businessId(): string {
    return this.envService.businessId;
  }

  private get businessPath(): string {
    return `${this.peMessageApiPath}/api/business/${this.businessId}`;
  }

  private get messagingPath(): string {
    return `${this.businessPath}/messaging`;
  }

  public getChannels(page = 1, isLive: boolean = false): Observable<PeMessageChat[]> {
    return this.httpClient.get<PeMessageChat[]>(`${this.messagingPath}?page=${page}${isLive ? '&filter={"permissions.live":true}' : ''}`);
  }

  public getConversationMembers(conversationType: PeMessageChatType, conversationId: string): Observable<any> {
    return this.httpClient.get(`${this.messagingPath}/${conversationType}/${conversationId}/members`);
  }

  public getPinnedMessages(chatId: string): Observable<PeChatMessage[]> {
    return this.httpClient.get<PeChatMessage[]>(`${this.businessPath}/chats/${chatId}/pinned-messages`);
  }

  public postPinMessage(message: PeChatMessage, forAllUsers: boolean = true): Observable<any> {
    return this.httpClient.post(
      `${this.businessPath}/chats/${message.chat}/messages/${message._id}/pin`,
      { messageId: message._id, forAllUsers },
    );
  }

}
