import { TestBed } from '@angular/core/testing';
import { PeChatService } from '@pe/chat';
import { PeMessageChatRoomListService } from './message-chat-room-list.service';
import { PeMessageChatRoomService } from './message-chat-room.service';

describe('PeMessageChatRoomService', () => {

  let service: PeMessageChatRoomService;
  let peChatService: jasmine.SpyObj<PeChatService>;
  let peMessageChatRoomListService: jasmine.SpyObj<PeMessageChatRoomListService>;

  beforeEach(() => {

    const peChatServiceMock = {
      socket: {
        emit: jasmine.createSpy('emit'),
      },
    };

    const peMessageChatRoomListServiceMock = {
      activeChat: null,
    };

    TestBed.configureTestingModule({
      providers: [
        PeMessageChatRoomService,
        { provide: PeChatService, useValue: peChatServiceMock },
        { provide: PeMessageChatRoomListService, useValue: peMessageChatRoomListServiceMock },
      ],
    });

    service = TestBed.inject(PeMessageChatRoomService);

    peChatService = TestBed.inject(PeChatService) as jasmine.SpyObj<PeChatService>;
    peMessageChatRoomListService = TestBed.inject(PeMessageChatRoomListService) as jasmine.SpyObj<PeMessageChatRoomListService>;

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should send message', () => {

    const event = { message: 'message' };

    /**
     * peMessageChatRoomListService.activeChat is null
     */
    service.sendMessage(event);

    expect(peChatService.socket.emit).toHaveBeenCalled();
    let args = peChatService.socket.emit.calls.argsFor(0);
    expect(args[0]).toEqual('messages.ws-client.message.send');
    expect(args[1].content).toEqual(event.message);
    expect(args[1].sentAt).toBeInstanceOf(Date);
    expect(args[1].chat).toBeUndefined();

    /**
     * peMessageChatRoomListService.activeChat is set
     */
    peChatService.socket.emit.calls.reset();
    peMessageChatRoomListService.activeChat = { _id: 'chat-001' } as any;

    service.sendMessage(event);

    expect(peChatService.socket.emit).toHaveBeenCalled();
    args = peChatService.socket.emit.calls.argsFor(0);
    expect(args[1].chat).toEqual('chat-001');

  });

});