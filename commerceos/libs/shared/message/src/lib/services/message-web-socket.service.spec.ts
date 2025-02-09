import { TestBed, waitForAsync } from '@angular/core/testing';
import { Observable } from 'rxjs';

import { PeChatService } from '../../../../../libs/shared/chat/src/lib/services/chat.service';
import { PeMessageWebSocketEvents } from '../enums';
import { PeMessageWebsocketType } from '../enums/message-chat-type.enum';

import { PeMessageWebSocketService } from './message-web-socket.service';
import { PeMessageService } from './message.service';




describe('PeMessageWebSocketService', () => {
  let peMessageWebSocketService: PeMessageWebSocketService;
  let peChatService: PeChatService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        PeMessageWebSocketService,
        PeChatService,
        { provide: PeMessageService, useValue: {} },
      ],
    });

    peMessageWebSocketService = TestBed.inject(PeMessageWebSocketService);
    peChatService = TestBed.inject(PeChatService);
  }));

  it('should be defined', () => {
    expect(peMessageWebSocketService.handleGenericSocketEvent).toBeDefined();
    expect(peMessageWebSocketService).toBeDefined();
  });

  it('should connect to websocket', () => {
    spyOn(peChatService, 'connect').and.returnValue({ on: (ev: string, fn : Function) => {
      return {}; 
    } } as any);

    peMessageWebSocketService.init('', '', PeMessageWebsocketType.Regular);
    expect(peChatService.connect).toHaveBeenCalled();
  });

  it('should call handleGenericSocketEvent', () => {
    spyOn(peMessageWebSocketService, 'handleGenericSocketEvent' );
    peMessageWebSocketService.init('', '', PeMessageWebsocketType.Regular);
    expect(peMessageWebSocketService.handleGenericSocketEvent).toHaveBeenCalled();
  });

  it('handleSubjectObservable should return observable', () => {
    peMessageWebSocketService.init('', '', PeMessageWebsocketType.Regular);
    expect(peMessageWebSocketService
      .handleSubjectObservable(PeMessageWebSocketEvents.CHAT_MEMBER_EXCLUDED) instanceof Observable)
      .toBeTrue();
  });
});
