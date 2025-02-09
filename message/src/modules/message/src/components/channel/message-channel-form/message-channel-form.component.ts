import {
  Component, ChangeDetectionStrategy, HostBinding, Inject, OnInit, ChangeDetectorRef,
  SecurityContext,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { take, tap, takeUntil } from 'rxjs/operators';

import { EnvironmentConfigInterface, EnvService, PE_ENV, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeMessageChannelType } from '../../../enums';
import { PeMessageChannel, PeMessageUser } from '../../../interfaces';
import { PeMessageApiService, PeMessageChatRoomListService, PeMessageService } from '../../../services';
import { PeMessageGuardRoles } from '../../../enums/message-guards.enum';
import { PeMessageGuardService } from '../../../services/message-guard.service';
import { PeMessageImgTypes } from '../../../enums/message-img-types.enum';


@Component({
  selector: 'pe-message-channel-form',
  templateUrl: './message-channel-form.component.html',
  styleUrls: ['./message-channel-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeMessageChannelFormComponent implements OnInit {
  @HostBinding('class') hostClass = this.peOverlayData.theme;

  imgDropTypes = [
    PeMessageImgTypes.png,
    PeMessageImgTypes.jpeg,
    PeMessageImgTypes.gif,
  ];

  channel!: PeMessageChannel;
  avatar: SafeUrl | null = null;

  channelFirstFormGroup = this.formBuilder.group({
    title: [null, Validators.required],
    description: [],
    photo: [],
  });

  channelSecondFormGroup = this.formBuilder.group({
    type: [PeMessageChannelType.Public, Validators.required],
  });

  channelThirdFormGroup = this.formBuilder.group({
    members: [],
  });

  inviteCode!: string;
  nextButton = this.translateService.translate('message-app.channel.overlay.next');
  step = 1;

  types = [
    { title: 'message-app.channel.form.type.public', value: PeMessageChannelType.Public },
    { title: 'message-app.channel.form.type.private', value: PeMessageChannelType.Private },
    { title: 'message-app.channel.form.type.integration', value: PeMessageChannelType.Integration }
  ];

  userList!: any;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private envService: EnvService,
    private formBuilder: FormBuilder,
    private peMessageApiService: PeMessageApiService,
    private peMessageService: PeMessageService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private peMessageGuardService: PeMessageGuardService,
    private translateService: TranslateService,
    private domSanitizer: DomSanitizer,
    private destroyed$: PeDestroyService,
    @Inject(PE_OVERLAY_DATA) private peOverlayData: any,
    @Inject(PE_ENV) private environmentConfigInterface: EnvironmentConfigInterface,
  ) {
  }

  ngOnInit(): void {
    this.userList = this.peMessageService.userList.map((user: PeMessageUser) => {
      return {
        _id: user._id,
        label: `${user.userAccount.firstName} ${user.userAccount.lastName}`,
      };
    });
  }

  addMember(): void {

  }

  cancel(): void {
    this.peOverlayData.onCloseSubject$.next(true);
  }

  copyInvite(): string {
    const domain = this.environmentConfigInterface.backend?.message;

    return `${domain}/api/business/${this.envService.businessId}/channels/join/${this.inviteCode}`;
  }

  nextStep(): void {
    if (this.step === 1 && this.channelFirstFormGroup.status === 'VALID') {
      this.step = 2;

      return;
    }

    if (this.step === 2 && this.channelSecondFormGroup.status === 'VALID') {
      let channel = this.channelFirstFormGroup.value;

      Object.keys(channel).forEach((key: string) => {
        if (channel[key] === null) {
          delete channel[key];
        }
      });

      if (this.peMessageGuardService.isAllowByRoles([PeMessageGuardRoles.Merchant])) {
        this.peMessageApiService.postChannel({ ...channel, ...this.channelSecondFormGroup.value }).pipe(
          take(1),
          tap((newChannel) => {
            this.channel = newChannel;
            this.step = 3;
            this.nextButton = this.translateService.translate('message-app.sidebar.create');
            this.inviteCode = newChannel.inviteCode;

            this.userList = this.userList.filter((user: PeMessageUser) => {
              for (let member of newChannel.members) {
                if (member.user === user._id) {
                  return false;
                }
              }

              return true;
            });

            this.changeDetectorRef.detectChanges();
          }),
        ).subscribe();
      }

      if (this.peMessageGuardService.isAllowByRoles([PeMessageGuardRoles.Admin])) {
        this.peMessageApiService.postChatTemplate({ ...channel, ...{ app: this.peMessageService.app } }).pipe(
          take(1),
          tap(() => {
            this.peOverlayData.onCloseSubject$.next(true);
          }),
        ).subscribe();
      }

      return;
    }

    if (this.step === 3 && this.channelThirdFormGroup.status === 'VALID') {
      const members = this.channelThirdFormGroup.value.members ?? [];

      members.forEach((member: any) => {
        this.peMessageApiService.postChannelMemberInvite(this.channel._id as string, member._id).pipe(
          take(1),
          tap(() => {
            const channel = this.peMessageChatRoomListService.chatList.find(c => c._id === this.channel._id);

            if (channel) {
              channel.members?.push(member._id);
            }
          }),
        ).subscribe();
      });
      this.peOverlayData.onCloseSubject$.next(true);
    }
  }

  skip(): void {
    this.peOverlayData.onCloseSubject$.next(true);
  }

  changeAvatar(files: FileList): void {
    const file = files[0];

    if (file && this.imgDropTypes.includes(file.type as PeMessageImgTypes)) {
      this.peMessageApiService.postImage(file).pipe(
        tap(event => {
          if (event.type === HttpEventType.Response) {
            this.avatar = this.domSanitizer.sanitize(
              SecurityContext.URL,
              `${this.environmentConfigInterface.custom.storage}/miscellaneous/${event.body.blobName}`
            );
            this.channelFirstFormGroup.patchValue({
              photo: event.body.blobName,
            });

            this.changeDetectorRef.detectChanges();
          }
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    }
  }

}
