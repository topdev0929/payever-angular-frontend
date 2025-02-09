import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  PeMessageContact,
  PeMessageSettings,
  PeMessageSubscription,
  PeMessageUser,
  PeMessageSettingsThemeItem,
  PeMessageBubble,
} from '../interfaces';
import { PeMessageColumn, PeMessageIntegration } from '../enums';

@Injectable()
export class PeMessageService {

  activeUser!: PeMessageUser;
  activeColumn!: PeMessageColumn;
  app!: string;
  appId!: string;
  checkoutId!: string;
  shopId!: string;
  siteId!: string;
  contactList!: PeMessageContact[];
  channelSetId!: PeMessageIntegration;
  isLiveChat!: boolean;
  isEmbedChat!: boolean;
  settings!: PeMessageSettings;
  subscriptionList: PeMessageSubscription[] = [];
  userList!: PeMessageUser[];
  activationChatId?: string;

  liveChatBubbleClickedStream$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private currSettingsStream$ = new BehaviorSubject<PeMessageSettingsThemeItem>({ settings: { customPresetColors: [] }});
  currSettings$ = this.currSettingsStream$.asObservable();
  get currSettings(): PeMessageSettingsThemeItem {
    return this.currSettingsStream$.value;
  }
  set currSettings(currSettings: PeMessageSettingsThemeItem) {
    this.currSettingsStream$.next(currSettings);
  }

  private bubbleStream$ = new BehaviorSubject<PeMessageBubble>({});
  bubble$ = this.bubbleStream$.asObservable();
  get bubble(): PeMessageBubble {
    return this.bubbleStream$.value;
  }
  set bubble(bubble: PeMessageBubble) {
    this.bubbleStream$.next(bubble);
  }
  bubbleLogo?: File;

  public isValidUrl(url: string): boolean {
    try {
      new URL(url);
    } catch (e) {
      return false;
    }
    return true;
  }

  public isValidImgUrl(url: string): Promise<any> {

    const myRequest = new Request(url);
    return fetch(myRequest);
  }

}
