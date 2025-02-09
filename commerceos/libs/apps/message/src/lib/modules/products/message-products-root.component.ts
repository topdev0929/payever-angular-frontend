import { AfterViewInit, ChangeDetectionStrategy, Component, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { EMPTY } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import * as uuid from 'uuid';

import { PeGridItem } from '@pe/grid';
import {
  PeMessageApiService,
  PeMessageChatRoomListService,
  PeMessageAppService,
} from '@pe/message/shared';
import { PeChatMessage, PeChatMessageType, PeMessageIntegration } from '@pe/shared/chat';
import { PopupMode, ProductsAppState } from '@pe/shared/products';


@Component({
  selector: 'pe-message-products-component',
  templateUrl: './message-products-root.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageProductsRootComponent implements AfterViewInit {
  @SelectSnapshot(ProductsAppState.products) products: PeGridItem[];

  private dialogRef: MatDialogRef<any>;
  theme = 'dark';

  @ViewChild(TemplateRef) templateRef: TemplateRef<any>;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private matDialog: MatDialog,
    private peMessageApiService: PeMessageApiService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private store: Store,
    private peMessageAppService: PeMessageAppService,
  ) {}

  ngAfterViewInit(): void {
    this.store.dispatch(new PopupMode(true));
    this.openContactsOverlay();
  }

  private openContactsOverlay(): void {
    this.dialogRef = this.matDialog.open(this.templateRef, {
      backdropClass: 'message-products-backdrop',
      hasBackdrop: true,
      maxWidth: '100%',
      width: window.innerWidth > 720 ? '80vw' : '100%',
      height: window.innerWidth > 720 ? '90vh' : '100%',
      panelClass: 'message-products',
      data: {
        theme: this.theme,
      },
    });

    this.dialogRef.afterClosed().pipe(
      filter(added => !!added),
      switchMap(() => {
        if (this.products.length > 0) {
          const activeChatType = this.peMessageChatRoomListService.activeChat?.integrationName === PeMessageIntegration.LiveChat
            ? 'live_chat'
            : this.peMessageChatRoomListService.activeChat?.integrationName;
          const type = this.peMessageChatRoomListService.activeChat?.integrationName
            ? activeChatType
            : PeMessageIntegration.Internal;

          const body = {
            productIds: this.products.map(product => product.id),
            type,
          };

          return this.peMessageApiService.getProductCheckoutLink(body).pipe(
              tap((data) => {
                const message: PeChatMessage = {
                  chat: this.peMessageAppService.selectedChannel._id,
                  content: data.link,
                  type: PeChatMessageType.Text,
                  sender: this.peMessageAppService.userId,
                  sentAt: new Date(),
                  contentPayload: uuid.v4(),
                };
                this.peMessageAppService.sendMessage(message);
              }),
            );
        }

        return EMPTY;
      }),
    ).subscribe();
  }

  addContactDialog(): void {
    this.router.navigate(['../'], { relativeTo: this.route.parent });
    this.dialogRef.close(true);
  }

  closeContactDialog(): void {
    this.router.navigate(['../'], { relativeTo: this.route.parent });
    this.dialogRef.close(false);
  }
}
