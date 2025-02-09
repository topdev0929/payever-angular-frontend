import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, HostListener, Inject, Input,
  OnInit, ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, filter, map, take, takeUntil, tap } from 'rxjs/operators';

import { TranslationLoaderService } from '@pe/i18n-core';
import { PeAuthService } from '@pe/auth';
import { PeChatChannelMenuItem, PeChatService } from '@pe/chat';
import { EnvironmentConfigInterface, EnvService, PeDestroyService, PE_ENV } from '@pe/common';

import { showLiveMessage } from './animations';
import {
  PeMessageBubble,
  PeMessageContact,
  PeMessageSettings,
  PeMessageSettingsThemeItem,
  PeMessageSubscription,
  PeMessageUser,
  PeMessageCheckoutApp,
  PeMessageShopApp,
  PeMessageSiteApp,
} from './interfaces';
import {
  PeMessageApiService,
  PeMessageChatRoomListService,
  PeMessageChatRoomService,
  PeMessageService,
  PeMessageThemeService,
} from './services';
import { PeMessageColumn } from './enums';

@Component({
  selector: 'pe-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
  animations: [showLiveMessage],
})
export class PeMessageComponent implements OnInit {

  peMessageColumn = PeMessageColumn;

  @Input() channels!: string;
  @Input() shown$: Observable<boolean> = of(true);
  @Input() business!: string;
  @Input() mobileView = false;
  @Input() isLiveChat = false;
  @Input() isEmbedChat = false;
  @Input() theme = 'dark';

  loaded = false;
  peMessageApiPath!: string;
  translationsReady$ = new BehaviorSubject<boolean>(false);
  messageWidgetShadow!: string;

  @HostBinding('class') class = 'message-list';
  @HostBinding('class.pe-message') peMessage = true;
  @HostBinding('class.shadow') shadow = false;

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.mobileView = window.innerWidth < 729;
    this.peMessageChatRoomListService.mobileView = this.mobileView;
  }

  constructor(
    public peMessageService: PeMessageService,
    private destroyed$: PeDestroyService,
    private changeDetectorRef: ChangeDetectorRef,
    private envService: EnvService,
    private peAuthService: PeAuthService,
    private peChatService: PeChatService,
    private peMessageApiService: PeMessageApiService,
    private peMessageChatRoomService: PeMessageChatRoomService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private translationLoaderService: TranslationLoaderService,
    private peMessageThemeService: PeMessageThemeService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    @Inject(PE_ENV) environmentConfigInterface: EnvironmentConfigInterface,
  ) {
    this.peMessageApiPath = environmentConfigInterface.backend?.message;
  }

  ngOnInit(): void {
    this.peMessageService.activeColumn = this.mobileView ? PeMessageColumn.List : PeMessageColumn.Room;
    this.peMessageService.isLiveChat = this.isLiveChat;
    this.peMessageService.isEmbedChat = this.isEmbedChat;
    this.peMessageService.activationChatId = this.route.snapshot.params.chatId;

    this.liveChat();
    this.mobileViewHandler();

    this.initTranslations();

    this.translationsReady$.pipe(
      filter(ready => !!ready),
      take(1),
      tap(() => {
        if (!this.isLiveChat) {
          this.initChat();
        } else {
          this.envService.businessId = this.business;
          JSON.parse(this.channels).forEach((channel: string, index: number) => {
            this.peMessageApiService.getIngegrationChannel(this.business, channel).pipe(
              take(1),
              tap((chat) => {
                chat.initials = this.peMessageChatRoomListService.getContactInitials(chat);

                if (!this.isEmbedChat) {
                  this.peMessageChatRoomListService.chatList.push(chat);
                }

                if (index === 0) {
                  this.peMessageChatRoomListService.activeChat = chat;
                }
              }),
            ).subscribe();
          });
        }
      }),
    ).subscribe();

    this.initSettings();

    if (!this.isLiveChat) {
      this.initPeExternalAppsId();
      this.getAppsChannelList();
      this.getContactList();
      this.getSubscriptionList();
      this.getSubscriptionsAll();
      this.getUserList();
    }
  }

  liveChat(): void {
    if (this.isLiveChat) {
      this.shown$ = this.peMessageService.liveChatBubbleClickedStream$.asObservable();
    }
  }

  mobileViewHandler(): void {
    this.peMessageChatRoomListService.mobileView = this.mobileView;
    if (this.mobileView) {
      this.onResize = (): void => {};
    }
  }

  initSettings(): void {
    this.peMessageApiService.getSettings(this.business).pipe(
      tap((settings: PeMessageSettings) => {
        this.peMessageService.settings = settings;

        settings.themes?.forEach((themeItem: PeMessageSettingsThemeItem) => {
          if (themeItem.isDefault && this.isLiveChat) {
            this.theme = themeItem.settings?.messageAppColor
              ? this.peMessageThemeService.setTheme(themeItem.settings?.messageAppColor)
              : this.theme;
          }

          if (themeItem.isDefault) {
            this.peMessageService.currSettings = themeItem;
          }
        });
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.peMessageApiService.getBubble(this.business).pipe(
      tap((bubble: PeMessageBubble) => {
        if (this.isLiveChat) {
          this.loaded = true;
          this.peMessageService.bubble = bubble;

          this.changeDetectorRef.detectChanges();
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    if (this.peMessageService.isLiveChat) {
      this.peMessageService.currSettings$.pipe(
        filter((themeItem: PeMessageSettingsThemeItem) => themeItem._id !== undefined),
        tap((themeItem: PeMessageSettingsThemeItem) => {
          const messageWidgetShadow = themeItem.settings?.messageWidgetShadow || '';
          if (messageWidgetShadow !== '') {
            this.messageWidgetShadow = `0 0 10px ${messageWidgetShadow}`;
          } else {
            this.messageWidgetShadow = '';
          }

          this.changeDetectorRef.detectChanges();
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    }
  }

  private initPeExternalAppsId(): void {
    this.peMessageApiService.getCheckout().pipe(
      tap((checkout: PeMessageCheckoutApp[]) => {
        if (checkout && checkout.length > 0) {
          const defaultCheckout = checkout.filter((item: PeMessageCheckoutApp) => item.default);
          this.peMessageService.checkoutId = defaultCheckout[0]._id;
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.peMessageApiService.getShop().pipe(
      tap((shop: PeMessageShopApp[]) => {
        if (shop && shop.length > 0) {
          const defaultShop = shop.filter((item: PeMessageShopApp) => item.isDefault);
          this.peMessageService.shopId = defaultShop[0]._id;
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.peMessageApiService.getSite().pipe(
      tap((site: PeMessageSiteApp[]) => {
        if (site && site.length > 0) {
          const defaultSite = site.filter((item: PeMessageSiteApp) => item.isDefault);
          this.peMessageService.siteId = defaultSite[0]._id;
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  private getAppsChannelList(): void {
    this.peMessageApiService.getAppsChannelList().pipe(
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  private getContactList(): void {
    this.peMessageApiService.getContactList().pipe(
      tap((contacts: PeMessageContact[]) => {
        this.peMessageService.contactList = contacts;
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  private getUserList(): void {
    this.peMessageApiService.getUserList().pipe(
      tap((users: PeMessageUser[]) => { this.peMessageService.userList = users; }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  private initTranslations(): void {
    this.translationLoaderService.loadTranslations(['message-app']).pipe(
      catchError(error => {
        console.warn('Cant load translations for domains', ['message-app'], error);
        return of(true);
      }),
      takeUntil(this.destroyed$),
    ).subscribe(() => {
      this.translationsReady$.next(true);
    });
  }

  private initChat(): void {
    const uri = `${this.peMessageApiPath}${this.isLiveChat ? '/live-chat' : '/chat'}`;
    const opts = {
      path: '/ws',
      transports: ['websocket'],
      query: {},
    };

    let token: string | null;

    if (this.isLiveChat) {
      opts.query = { businessId: this.business };
      token = localStorage.getItem('pe_live-chat_token');
    } else {
      token = this.peAuthService.token;
    }

    if (token) {
      opts.query = {
        ...opts.query,
        ...{ token: token },
      };
    }

    this.peChatService.connect(uri, opts);
    this.peChatService.socket.on('unauthorized', (msg: any) => {
      throw new Error(msg.data.message);
    });
    this.peChatService.socket.on('authenticated', (result: any) => {
      if (this.isLiveChat) {
        const { contact, chat, accessToken } = result;

        this.peMessageService.activeUser = contact;
        this.peMessageChatRoomListService.chatList = [chat];
        this.peMessageChatRoomListService.activeChat = chat;

        if (!localStorage.getItem('pe_live-chat_token')) {
          localStorage.setItem('pe_live-chat_token', accessToken);
        }

        this.peChatService.socket.emit('messages.ws-client.chat-room.join', chat._id);
      } else {
        this.peMessageService.activeUser = result;
        this.peChatService.socket.emit('messages.ws-client.business-room.join', `${this.envService.businessId}`);
        this.peMessageChatRoomListService.getConversationList();
      }
    });
  }

  private getSubscriptionList(): void {
    this.peMessageApiService.getSubscriptionList().pipe(
      tap((subscriptions: PeMessageSubscription[]) => {
        this.peMessageService.subscriptionList = subscriptions.filter(subscription => subscription.installed);
        this.peMessageChatRoomService.channelMenuItems = subscriptions
          .filter(subscription => subscription.enabled)
          .map(subscription => subscription.integration.name) as PeChatChannelMenuItem[];
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  private getSubscriptionsAll(): void {
    this.peMessageApiService.getSubscriptionsAll().pipe(
      tap((subscriptions: any) => {
        subscriptions.forEach((subscription: any) => {
          const foundSubscription = this.peMessageService.subscriptionList.find(s => s.integration.name === subscription.integration.name);

          if (foundSubscription) {
            foundSubscription.info = subscription.info;
          }
        });
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  switchSidebar(): void {
    switch (this.peMessageService.activeColumn) {
      case PeMessageColumn.Room:
        this.peMessageService.activeColumn = PeMessageColumn.List;
        break;
      case PeMessageColumn.List:
        this.peMessageService.activeColumn = PeMessageColumn.Nav;
        break;
    }
  }
}
