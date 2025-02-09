import { Component, OnInit, ChangeDetectionStrategy, Inject, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { take, tap } from 'rxjs/operators';

import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeMessageUser } from '../../../interfaces';
import { PeMessageService, PeMessageChatRoomListService, PeMessageApiService } from '../../../services';
import { PeMessageChatMember } from '../../../interfaces/message-chat.interface';

@Component({
  selector: 'pe-add-admins',
  templateUrl: './message-add-admins.component.html',
  styleUrls: ['./message-add-admins.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeMessageAddAdminsComponent implements OnInit {

  channelGroup = this.formBuilder.group({
    members: [],
  });

  userList!: any;

  constructor(
    private peMessageApiService: PeMessageApiService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private peMessageService: PeMessageService,
    private formBuilder: FormBuilder,
    @Inject(PE_OVERLAY_DATA) private peOverlayData: any,
    @Inject(PE_OVERLAY_CONFIG) private peOverlayConfig: any,
  ) { }

  ngOnInit(): void {
    this.userList = this.peMessageService.userList.map((user: PeMessageUser) => {
      const contact = this.peMessageService.contactList ? this.peMessageService.contactList.find((c) => c._id === user._id) : null;
      return {
        _id: user._id,
        image: contact?.avatar,
        label: `${user.userAccount.firstName} ${user.userAccount.lastName}`,
      };
    });

    this.peOverlayConfig.doneBtnCallback = this.addMember.bind(this);
    this.peOverlayConfig.backBtnCallback = () => {
      this.peOverlayData.onCloseSubject$.next(true);
    };
  }

  addMember(): void {
    const members = this.channelGroup.value.members;

    members.forEach((member: any) => {
      this.peMessageApiService.postChannelMemberInvite(this.peOverlayData.channel._id as string, member._id).pipe(
        take(1),
        tap((res: any) => {
          const channel = this.peMessageChatRoomListService.chatList.find(c => c._id === this.peOverlayData.channel._id);

          if (channel) {
            channel.members?.push({
              role: 'member',
              user: member._id as string,
            } as PeMessageChatMember);
          }
        }),
      ).subscribe();
    });
    this.peOverlayData.onCloseSubject$.next(true);
  }
}
