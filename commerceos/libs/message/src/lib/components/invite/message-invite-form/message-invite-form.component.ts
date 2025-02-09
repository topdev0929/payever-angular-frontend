import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { of } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import {
  InviteFacadeClass,
  PeMessageChatType,
  PeMessageCreatingChatData,
  PeMessageChatRoomListService,
  PeMessageApiService,
  PeMessageGuardService,
  PeMessageService,
  PeMessageAppService,
} from '@pe/message/shared';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeMessageChannelType, PeMessageChatSteep } from '@pe/shared/chat';


@Component({
  selector: 'pe-message-invite-form',
  templateUrl: './message-invite-form.component.html',
  styleUrls: ['./message-invite-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    PeDestroyService,
    {
      provide: InviteFacadeClass,
      useFactory: (
        peMessageService: PeMessageService,
        peMessageApiService: PeMessageApiService,
        peMessageGuardService: PeMessageGuardService,
      ) => {
        return new InviteFacadeClass(
          peMessageService.app,
          peMessageApiService,
          peMessageGuardService
        );
      },
      deps: [PeMessageService, PeMessageApiService, PeMessageGuardService],
    },
  ],
})
export class PeMessageInviteFormComponent implements OnInit, AfterViewInit {
  @HostBinding('class.pe-message-invite-form') peMessageInviteForm = true;
  @HostBinding('class') hostClass = this.peOverlayData.theme;

  @ViewChild('formContent', { static: true }) formContentRef: ElementRef;

  messageChatType = PeMessageChatType.DirectChat;
  type = PeMessageChannelType.Private;
  title: string;
  nextButton: string;
  code: '';
  invitationId: '';
  optionsItemWidth;
  currentStep = PeMessageChatSteep.Main;

  constructor(
    public inviteClass: InviteFacadeClass,
    private changeDetectorRef: ChangeDetectorRef,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private destroyed$: PeDestroyService,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: PeMessageCreatingChatData,
    @Inject(PE_OVERLAY_CONFIG) public peOverlayConfig: any,
    private peMessageApiService: PeMessageApiService,
    private peMessageAppService: PeMessageAppService,
  ) { }

  ngOnInit(): void {
    this.peMessageApiService.getChatInvites(this.peMessageAppService.selectedChannel._id).pipe(
      tap(invite => this.invitationId = invite[0]._id),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.inviteClass.create();
    this.inviteClass.chatClass.postIntegrationChannel$ = of(null);

    this.peMessageChatRoomListService.activeChat$.pipe(
      filter(chat => !!chat),
      tap((chat)=> {
        this.inviteClass.chat = chat;
      }),
      switchMap(()=> {
        return this.inviteClass.chatClass.next(this.peOverlayData);
      }),
      takeUntil(this.destroyed$),
      ).subscribe();
  }

  ngAfterViewInit() {
    this.optionsItemWidth = this.formContentRef.nativeElement.scrollWidth - 2;
    this.changeDetectorRef.detectChanges();
  }

  cancel(): void {
    this.peOverlayData.onCloseSubject$.next(true);
  }

  changeStep(step: PeMessageChatSteep): void {
    this.currentStep = step;
    this.changeDetectorRef.detectChanges();
  }

  done(): void {
    this.currentStep = PeMessageChatSteep.Contacts;
    this.changeDetectorRef.detectChanges();
  }
}
