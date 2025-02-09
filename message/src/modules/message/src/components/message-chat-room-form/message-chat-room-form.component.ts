import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, Inject, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, take, tap } from 'rxjs/operators';

import { PeChatAttachMenuItem, PeChatChannelMenuItem, PeChatMessage } from '@pe/chat';
import { PeOverlayConfig, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeMessageContact } from '../../interfaces';
import { PeMessageApiService, PeMessageService } from '../../services';
import { PeMessageProductListComponent } from '../message-product-list';
import { TranslateService } from '@pe/i18n-core';
import { PeMessageIntegration } from '../../enums/message-integration.enum';



@Component({
  selector: 'pe-message-chat-room-form',
  templateUrl: './message-chat-room-form.component.html',
  styleUrls: ['./message-chat-room-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PeMessageChatRoomFormComponent {

  activeChannel!: PeChatChannelMenuItem;
  attachMenuItems = [
    PeChatAttachMenuItem.Product
  ];
  channelMenuItems!: PeChatChannelMenuItem[];
  contact?: PeMessageContact;
  productOverlayRef!: OverlayRef;
  messageList: PeChatMessage[] = [];
  sender = this.peOverlayData.sender;
  theme = this.peOverlayConfig.theme;

  items = this.peOverlayData.contactList.map((contact: PeMessageContact) => {
    return { title: contact.name, value: contact._id };
  });

  messageAppColor = this.peMessageService.currSettings.settings?.messageAppColor || '';
  accentColor = this.peMessageService.currSettings.settings?.accentColor || '';
  bgChatColor = this.peMessageService.currSettings.settings?.bgChatColor || '';

  constructor(
    private injector: Injector,
    private overlay: Overlay,
    private peMessageApiService: PeMessageApiService,
    public peMessageService: PeMessageService,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public peOverlayConfig: any,
    private translateService: TranslateService,
  ) {
  }

  onClose(): void {
    this.peOverlayData.onCloseSubject$.next(true);
  }

  onSelected(event: any): void {
    const foundContact = this.peOverlayData.contactList.find((contact: PeMessageContact) => contact._id === event.value);

    if (foundContact) {
      this.contact = foundContact;
      this.activeChannel = foundContact.communications[0]?.integrationName ?? PeMessageIntegration.WhatsApp;
      this.channelMenuItems = foundContact.communications.map((communucation: any) => {
        return communucation.integrationName;
      });
    }
  }

  sendMessage(event: any): void {
    this.peOverlayData.onCloseSubject$.next({
      contact: this.contact?._id,
      content: event.message,
      integrationName: this.activeChannel,
    });
  }

  channelMenuItem(channel: PeChatChannelMenuItem): void {
    this.activeChannel = channel;
  }

  attachMenuItem(item: PeChatAttachMenuItem): void {
    if (item === PeChatAttachMenuItem.Product) {
      this.openOverlayProductList();
    }
  }

  private createInjector(config: any): PortalInjector {
    const injectionTokens = new WeakMap();

    injectionTokens.set(PE_OVERLAY_DATA, config.data);
    injectionTokens.set(PE_OVERLAY_CONFIG, config.headerConfig);

    return new PortalInjector(this.injector, injectionTokens);
  }


  private openOverlayProductList(): void {
    this.productOverlayRef = this.overlay.create({
      panelClass: 'pe-message-chat-products-overlay',
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
      hasBackdrop: true,
    });

    const onSaveSubject$ = new BehaviorSubject<string[]>(['init']);
    const peOverlayConfig: PeOverlayConfig = {
      data: { theme: this.theme },
      headerConfig: {
        title: this.translateService.translate('message-app.chat-room.products'),
        theme: this.theme,
        onSaveSubject$,
      },
    };

    const injector = this.createInjector(peOverlayConfig);
    const productListComponent = new ComponentPortal(PeMessageProductListComponent, null, injector);

    this.productOverlayRef.backdropClick().subscribe(() => this.productOverlayRef.dispose());
    this.productOverlayRef.attach(productListComponent);

    onSaveSubject$.pipe(
      filter(data => !!data && data[0] !== 'init'),
      take(1),
      tap((productIds: string[]) => {
        if (productIds.length) {
          const body = {
            productIds: productIds,
            type: this.activeChannel,
          };
          this.peMessageApiService.getProductCheckoutLink(body).pipe(
            take(1),
            tap(data => { this.sendMessage({ message: data.link }); }),
          ).subscribe();
        }

        this.productOverlayRef.dispose();
      })
    ).subscribe();
  }
}
