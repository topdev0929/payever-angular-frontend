import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeMessageApiService } from '../../../services/message-api.service';
import { take, tap } from 'rxjs/internal/operators';

@Component({
  selector: 'pe-message-permissions',
  templateUrl: './message-permissions.component.html',
  styleUrls: ['./message-permissions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessagePermissionsComponent implements OnInit {

  permissionMember = this.formBuilder.group({
    sendMessages: [this.peOverlayData.member.permissions.sendMessages, Validators.required],
    sendMedia: [this.peOverlayData.member.permissions.sendMedia, Validators.required],
    sendStickers: ['', Validators.required],
    sendEmbedLinks: ['', Validators.required],
    addMembers: [this.peOverlayData.member.permissions.addMembers, Validators.required],
    pinMessages: [this.peOverlayData.member.permissions.pinMessages, Validators.required],
    changeGroupInfo: [this.peOverlayData.member.permissions.changeGroupInfo, Validators.required],
  });

  channel = this.peOverlayData.channel;
  member = this.peOverlayData.member;
  owner = this.peOverlayData.owner;

  constructor(
    private formBuilder: FormBuilder,
    private peMessageApiService: PeMessageApiService,
    @Inject(PE_OVERLAY_DATA) private peOverlayData: any,
  ) { }

  ngOnInit(): void {
  }

  dismissMember(): void {
    this.peMessageApiService.postChannelMemberExclude(this.channel._id as string, this.member._id).pipe(
      take(1),
      tap(res => {

      }),
    ).subscribe();
  }

}
