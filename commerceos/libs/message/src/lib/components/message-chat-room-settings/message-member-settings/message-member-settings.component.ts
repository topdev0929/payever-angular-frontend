import {
  ChangeDetectionStrategy,
  Component,
  Inject,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import {
  PeMessageMemberAction,
  PeMessageApiService,
  PeMessageChatRoomListService,
} from '@pe/message/shared';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';



@Component({
  selector: 'pe-message-member-settings',
  templateUrl: './message-member-settings.component.html',
  styleUrls: ['./message-member-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageMemberSettingsComponent{

  actions: PeMessageMemberAction[] = [
    PeMessageMemberAction.Delete,
  ];

  peMessageMemberAction = PeMessageMemberAction;
  member = this.peOverlayData.member;

  constructor(
    public peMessageChatRoomListService: PeMessageChatRoomListService,
    public dialog: MatDialog,
    private peMessageApiService: PeMessageApiService,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
  ) {
  }

  pushAction(action: PeMessageMemberAction): void {
    if (action === PeMessageMemberAction.Delete) {
      this.deleteMember();
    }
  }

  private deleteMember(): void {
    this.peMessageApiService.postConversationMemberExclude(
      this.peOverlayData.channel._id,
      this.member._id,
      this.peOverlayData.channel.type
    ).pipe(
      tap(() => {
        this.peOverlayData.onCloseSubject$.next(true);
      }),
      catchError(() => {
        this.peOverlayData.onCloseSubject$.next(true);

        return EMPTY;
      }),
    ).subscribe();
  }

}
