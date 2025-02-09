import {
  Component, OnInit, ChangeDetectionStrategy, HostBinding, Inject, ChangeDetectorRef,
  SecurityContext,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpEventType } from '@angular/common/http';
import { take, takeUntil, tap } from 'rxjs/internal/operators';

import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { EnvironmentConfigInterface, PE_ENV, PeDestroyService } from '@pe/common';

import { PeMessageApiService, PeMessageChatRoomListService } from '../../../services';
import { PeMessageImgTypes } from '../../../enums';

@Component({
  selector: 'pe-message-edit-info',
  templateUrl: './message-edit-info.component.html',
  styleUrls: ['./message-edit-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeMessageEditInfoComponent implements OnInit {

  imgDropTypes = [
    PeMessageImgTypes.png,
    PeMessageImgTypes.jpeg,
    PeMessageImgTypes.gif,
  ];

  channel = this.peOverlayData.channel;
  avatar = this.channel.photo ?
    this.domSanitizer.sanitize(SecurityContext.URL,
      `${this.environmentConfigInterface.custom.storage}/miscellaneous/${this.channel.photo}`
    ) :
    null;

  channelInfoGroup = this.formBuilder.group({
    title: [this.channel.title, Validators.required],
    description: [this.channel.description],
    photo: [this.channel.photo],
  });

  doneBtnCallback!: () => void;

  @HostBinding('class') hostClass = this.peOverlayData.theme;

  constructor(
    private formBuilder: FormBuilder,
    private peMessageApiService: PeMessageApiService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private domSanitizer: DomSanitizer,
    private changeDetectorRef: ChangeDetectorRef,
    private destroyed$: PeDestroyService,
    @Inject(PE_OVERLAY_DATA) private peOverlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
    @Inject(PE_ENV) public environmentConfigInterface: EnvironmentConfigInterface,
  ) { }

  ngOnInit(): void {
    this.doneBtnCallback = this.overlayConfig.doneBtnCallback;
    this.overlayConfig.doneBtnCallback = this.saveInfo.bind(this);
  }

  saveInfo(): void {
    this.peMessageApiService.patchChannel({ ...this.channelInfoGroup.value }, this.channel._id).pipe(
      take(1),
      tap((data) => {
        const updateInfo = {
          title: data.title,
          initials: this.peMessageChatRoomListService.getContactInitials(data),
          description: data.description,
          photo: data.photo,
        };

        this.peMessageChatRoomListService.chatList = this.peMessageChatRoomListService.chatList.map(chat => {
          if (chat._id === data._id) {
            return { ...chat, ...updateInfo };
          }

          return chat;
        });

        this.peMessageChatRoomListService.activeChat = { ...this.channel, ...updateInfo };

        this.changeDetectorRef.detectChanges();
      }),
    ).subscribe();

    this.doneBtnCallback();
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
            this.channelInfoGroup.patchValue({
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
