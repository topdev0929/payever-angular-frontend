import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PeMessageChatAction, PeMessageChatType } from '../../enums';
import { PeMessageChatRoomListService } from '../../services';
import { PeMessageChatRoomSettingsComponent } from './message-chat-room-settings.component';

describe('PeMessageChatRoomSettingsComponent', () => {

  let fixture: ComponentFixture<PeMessageChatRoomSettingsComponent>;
  let component: PeMessageChatRoomSettingsComponent;
  let peMessageChatRoomListService: jasmine.SpyObj<PeMessageChatRoomListService>;

  beforeEach(waitForAsync(() => {

    const peMessageChatRoomListServiceMock = {
      activeChat: null,
      getMember: jasmine.createSpy('getMember'),
    };

    TestBed.configureTestingModule({
      declarations: [PeMessageChatRoomSettingsComponent],
      providers: [
        { provide: PeMessageChatRoomListService, useValue: peMessageChatRoomListServiceMock },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PeMessageChatRoomSettingsComponent);
      component = fixture.componentInstance;

      peMessageChatRoomListService = TestBed.inject(PeMessageChatRoomListService) as jasmine.SpyObj<PeMessageChatRoomListService>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle ng init', () => {

    const member = { _id: 'm-001' };

    peMessageChatRoomListService.getMember.and.returnValue(member);

    /**
     * component.activeChat is null
     */
    component.activeChat = null;
    component.ngOnInit();

    expect(component.actions).toBeUndefined();
    expect(component.members).toBeUndefined();
    expect(peMessageChatRoomListService.getMember).not.toHaveBeenCalled();

    /**
     * component.activeChat is set
     * component.activeChat.members is null
     */
    component.activeChat = {
      type: PeMessageChatType.Channel,
      members: null,
    } as any;
    component.ngOnInit();

    expect(component.actions).toEqual([
      PeMessageChatAction.Add,
      PeMessageChatAction.Mute,
      PeMessageChatAction.Edit,
      PeMessageChatAction.Search,
      PeMessageChatAction.More
    ]);
    expect(component.members).toBeUndefined();
    expect(peMessageChatRoomListService.getMember).not.toHaveBeenCalled();

    /**
     * component.activeChat.members is set
     */
    component.activeChat!.members = ['m-001'];
    component.ngOnInit();

    expect(component.members).toEqual([member]);
    expect(peMessageChatRoomListService.getMember).toHaveBeenCalledTimes(1);
    expect(peMessageChatRoomListService.getMember).toHaveBeenCalledWith('m-001');

  });

});
