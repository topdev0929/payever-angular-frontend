import { NO_ERRORS_SCHEMA, Pipe } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@pe/i18n';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { of } from 'rxjs';
import { PeMessageChannelType } from '../../../enums';
import { PeMessageApiService, PeMessageChatRoomListService, PeMessageService } from '../../../services';
import { PeMessageChannelFormComponent } from './message-channel-form.component';

@Pipe({
  name: 'translate',
})
class TranslatePipeMock {

  transform() { }

}

describe('PeMessageChannelFormComponent', () => {

  let fixture: ComponentFixture<PeMessageChannelFormComponent>;
  let component: PeMessageChannelFormComponent;
  let translateService: jasmine.SpyObj<TranslateService>;
  let peMessageService: jasmine.SpyObj<PeMessageService>;
  let peMessageApiService: jasmine.SpyObj<PeMessageApiService>;
  let peMessageChatRoomListService: jasmine.SpyObj<PeMessageChatRoomListService>;
  let peOverlayData: any;

  beforeEach(waitForAsync(() => {

    const peMessageApiServiceSpy = jasmine.createSpyObj<PeMessageApiService>('PeMessageApiService', [
      'postChannel',
      'postChannelMemberInvite',
    ]);

    const peMessageServiceMock = {
      userList: [],
    };

    const peMessageChatRoomListServiceMock = {
      chatList: [],
    };

    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', {
      translate: 'translated',
    });

    const peOverlayDataMock = {
      theme: 'dark',
      onCloseSubject$: {
        next: jasmine.createSpy('next'),
      },
    };

    TestBed.configureTestingModule({
      declarations: [
        PeMessageChannelFormComponent,
        TranslatePipeMock,
      ],
      providers: [
        FormBuilder,
        { provide: PeMessageApiService, useValue: peMessageApiServiceSpy },
        { provide: PeMessageService, useValue: peMessageServiceMock },
        { provide: PeMessageChatRoomListService, useValue: peMessageChatRoomListServiceMock },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: PE_OVERLAY_DATA, useValue: peOverlayDataMock },
        { provide: PE_OVERLAY_CONFIG, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeMessageChannelFormComponent);
      component = fixture.componentInstance;

      translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
      peMessageService = TestBed.inject(PeMessageService) as jasmine.SpyObj<PeMessageService>;
      peMessageApiService = TestBed.inject(PeMessageApiService) as jasmine.SpyObj<PeMessageApiService>;
      peMessageChatRoomListService = TestBed.inject(PeMessageChatRoomListService) as jasmine.SpyObj<PeMessageChatRoomListService>;
      peOverlayData = TestBed.inject(PE_OVERLAY_DATA);

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set props on construct', () => {

    expect(component.hostClass).toEqual('dark');
    expect(component.nextButton).toEqual('translated');
    expect(translateService.translate).toHaveBeenCalledTimes(1);
    expect(translateService.translate).toHaveBeenCalledWith('message-app.channel.overlay.next');

    expect(component.channelFirstFormGroup).toBeDefined();
    expect(component.channelFirstFormGroup.value).toEqual({
      title: null,
      description: null,
      photo: null,
    });

    expect(component.channelSecondFormGroup).toBeDefined();
    expect(component.channelSecondFormGroup.value).toEqual({
      type: PeMessageChannelType.Public,
    });

    expect(component.channelThirdFormGroup).toBeDefined();
    expect(component.channelThirdFormGroup.value).toEqual({
      members: null,
    });

  });

  it('should handle ng init', () => {

    const users = [
      {
        _id: 'u-001',
        userAccount: {
          firstName: 'Bruce',
          lastName: 'Wayne',
        },
      },
      {
        _id: 'u-002',
        userAccount: {
          firstName: 'James',
          lastName: 'Bond',
        },
      },
    ];

    peMessageService.userList = users as any;

    component.ngOnInit();
    expect(component.userList).toEqual(users.map(user => ({
      _id: user._id,
      label: `${user.userAccount.firstName} ${user.userAccount.lastName}`,
    })));

  });

  it('should do nothing on add member', () => {

    component.addMember();

    expect().nothing();

  });

  it('should cancel', () => {

    component.cancel();

    expect(peOverlayData.onCloseSubject$.next).toHaveBeenCalledWith(true);

  });

  it('should do nothing on copy invite', () => {

    component.copyInvite();

    expect().nothing();

  });

  it('should handle next step', () => {

    const detectSpy = spyOn(component[`changeDetectorRef`], 'detectChanges');
    const channel = {
      _id: 'chat-001',
      members: null,
    };

    translateService.translate.calls.reset();

    /**
     * component.step is 1
     * component.channelFirstFormGroup.status is VALID
     */
    component.step = 1;
    component.channelFirstFormGroup.patchValue({
      title: 'title',
    });
    component.nextStep();

    expect(component.step).toBe(2);
    expect(peMessageApiService.postChannel).not.toHaveBeenCalled();
    expect(peMessageApiService.postChannelMemberInvite).not.toHaveBeenCalled();
    expect(translateService.translate).not.toHaveBeenCalled();
    expect(detectSpy).not.toHaveBeenCalled();
    expect(peOverlayData.onCloseSubject$.next).not.toHaveBeenCalled();

    /**
     * component.step is 2
     * component.channelSecondFormGroup.status is VALID
     */
    peMessageApiService.postChannel.and.returnValue(of({ _id: 'ch-001' }));

    component.nextButton = '';
    component.step = 2;
    component.nextStep();

    expect(component.step).toBe(3);
    expect(peMessageApiService.postChannel).toHaveBeenCalledWith({
      title: 'title',
      type: PeMessageChannelType.Public,
    } as any);
    expect(peMessageApiService.postChannelMemberInvite).not.toHaveBeenCalled();
    expect(component.channel).toEqual({ _id: 'ch-001' } as any);
    expect(component.nextButton).toEqual('translated');
    expect(translateService.translate).toHaveBeenCalledTimes(1);
    expect(translateService.translate).toHaveBeenCalledWith('message-app.sidebar.create');
    expect(detectSpy).toHaveBeenCalled();
    expect(peOverlayData.onCloseSubject$.next).not.toHaveBeenCalled();

    /**
     * component.step is 3
     * peMessageChatRoomListService.chatList is [] (empty array)
     */
    peMessageChatRoomListService.chatList = [];
    peMessageApiService.postChannel.calls.reset();
    peMessageApiService.postChannelMemberInvite.and.returnValue(of(null));
    translateService.translate.calls.reset();
    detectSpy.calls.reset();

    component.step = 3;
    component.channelThirdFormGroup.patchValue({
      members: [{ _id: 'm-001' }],
    });
    component.channel = { _id: 'chat-001' } as any;
    component.nextStep();

    expect(peMessageApiService.postChannelMemberInvite).toHaveBeenCalledWith('chat-001', 'm-001');
    expect(peMessageApiService.postChannel).not.toHaveBeenCalled();
    expect(translateService.translate).not.toHaveBeenCalled();
    expect(detectSpy).not.toHaveBeenCalled();
    expect(peOverlayData.onCloseSubject$.next).toHaveBeenCalledWith(true);

    /**
     * peMessageChatRoomListService.chatList is set
     * channel.members is null
     */
    peMessageChatRoomListService.chatList = [channel] as any;

    component.nextStep();

    expect(channel.members).toBeNull();

    /**
     * channel.members is set
     */
    channel.members = ['m-002'] as any;

    component.nextStep();

    expect(channel.members).toEqual(['m-002', 'm-001'] as any);

    /**
     * component.step is null
     */
    peMessageApiService.postChannelMemberInvite.calls.reset();
    peOverlayData.onCloseSubject$.next.calls.reset();

    component.step = null as any;
    component.nextStep();

    expect(component.step).toBeNull();
    expect(peMessageApiService.postChannel).not.toHaveBeenCalled();
    expect(peMessageApiService.postChannelMemberInvite).not.toHaveBeenCalled();
    expect(translateService.translate).not.toHaveBeenCalled();
    expect(peOverlayData.onCloseSubject$.next).not.toHaveBeenCalled();

  });

  it('should skip', () => {

    expect(peOverlayData.onCloseSubject$.next).not.toHaveBeenCalled();

    component.skip();

    expect(peOverlayData.onCloseSubject$.next).toHaveBeenCalledWith(true);

  });

});
