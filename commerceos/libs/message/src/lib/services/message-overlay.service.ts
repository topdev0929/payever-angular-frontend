import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { BusinessInterface } from '@pe/business';
import { DockerItemInterface, DockerState } from '@pe/docker';
import {
  MessageService,
  PeMessageService,
  PeMessageChatRoomListService,
  SetMessageOverlayStatus,
} from '@pe/message/shared';
import { BusinessState } from '@pe/user';

import { PeMessageOverlayComponent } from '../components/overlay/message-overlay.component';

@Injectable({ providedIn: 'root' })
export class PeMessageOverlayService {
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;
  @SelectSnapshot(DockerState.dockerItems) dockerItems:DockerItemInterface[];
  @Select(DockerState.dockerItems) dockerItems$: Observable<DockerItemInterface[]>;

  private overlayRef: OverlayRef;
  private messageStatus: string;
  public loadingOverlay$ = new BehaviorSubject<boolean>(false);

  dockerItemsObservable$: Observable<DockerItemInterface[]>;

  constructor(
    private overlay: Overlay,
    private store: Store,
    private peMessageService: PeMessageService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private messageService:MessageService
  ) {
    this.dockerItems$.pipe(
      tap((dockerItems)=>{
        if (dockerItems){
          this.messageService.isEnableAppMessage$.next(
            !!dockerItems?.find((item: DockerItemInterface) => item.code === 'message' && item.installed));
          this.messageService.unreadMessages$ = this.unreadMessages();
        }
      })
    ).subscribe();

    this.messageService.loading$ = this.loadingOverlay$.asObservable();
    this.messageService.closeMessages$.pipe(
      tap(()=>{
        this.closeMessages();
      })
    ).subscribe();

    this.messageService.toggleMessages$.pipe(
      tap(()=>{
        this.toggleMessages();
      })
    ).subscribe();

    this.messageService.setAppName$.pipe(
      tap((name: string)=>{
        this.setAppName(name);
      })
    ).subscribe();
  }


  isEnableAppMessage(): boolean {
    return !!this.dockerItems?.find((item: DockerItemInterface) => item.code === 'message' && item.installed);
  }

  toggleMessages(firstStart = false) {
    if (!this.isEnableAppMessage()) {
      return;
    }

    if (this.messageStatus === null) {
      this.loadingOverlay$.next(true);
      this.overlayRef = this.overlay.create({
        positionStrategy: this.overlay
          .position()
          .global()
          .right('16px')
          .top('68px'),
        hasBackdrop: false,
        backdropClass: 'pe-message-settings-menu-backdrop',
        panelClass: 'pe-message-panel-class',
      });

      this.overlayRef.attach(new ComponentPortal(PeMessageOverlayComponent));
      this.store.dispatch(new SetMessageOverlayStatus('open'));
      this.messageStatus = 'open';
    } else if (this.messageStatus !== null && !firstStart) {
      this.closeMessages();
    }
  }

  closeMessages(): void {
    this.overlayRef?.detach();
    this.messageStatus = null;
    this.loadingOverlay$.next(false);
    this.store.dispatch(new SetMessageOverlayStatus(null));
  }

  hideChatStream(): BehaviorSubject<boolean> {
    return this.peMessageService.liveChatBubbleClickedStream$;
  }

  unreadMessages(): Observable<number> {
    return this.peMessageChatRoomListService.externalUnreadMessages();
  }

  setAppName(app: string): void {
    this.peMessageService.app = app;
  }
}
