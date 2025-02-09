import { MessageBusService } from './message-bus.service';

describe('MessageBusService', () => {
  let messageBusService: MessageBusService;

  beforeEach(() => {
    messageBusService = new MessageBusService(null);
  });

  it('send should call postMessage method of window with string data', () => {
    const postMessageSpy: jasmine.Spy = spyOn(window, 'postMessage').and.stub();
    const channel: string = 'channel';
    const event: string = 'event';
    const data: string = 'data';
    messageBusService.send(window, channel, event, data, true);

    const messageArg: string = `pe:os:${channel}:${event}:${data}`;

    expect(postMessageSpy.calls.mostRecent().args[0]).toEqual(messageArg);
  });

  it('send should stringify data and call postMessage method of window', () => {
    const postMessageSpy: jasmine.Spy = spyOn(window, 'postMessage').and.stub();
    const channel: string = 'channel';
    const event: string = 'event';
    const data: any = { data: 'data' };
    messageBusService.send(window, channel, event, data, true);

    const messageArg: string = `pe:os:${channel}:${event}:${JSON.stringify(data)}`;

    expect(postMessageSpy.calls.mostRecent().args[0]).toEqual(messageArg);
  });

  it('observe should catch event and parse message', done => {
    const channel: string = 'channel';
    const event: string = 'event';
    const data: any = 'data';
    const subscription = messageBusService.observe(channel, event).subscribe((message: any) => {
      expect(message).toEqual({
        channel,
        event,
        data
      });
      subscription.unsubscribe();
      done();
    });

    const messageEvent: any = new Event('message');
    messageEvent.data = `pe:os:${channel}:${event}:${data}`;
    window.dispatchEvent(messageEvent);
  });

  it('observe should catch event and filter it if data is not string', () => {
    const subscription = messageBusService.observe().subscribe((message: any) => {
      expect(false).toBe(true);
    });

    const messageEvent: any = new Event('message');
    messageEvent.data = {};
    window.dispatchEvent(messageEvent);
    subscription.unsubscribe();
  });

  it('observe should catch event and filter it if data is in wrong format', () => {
    const subscription = messageBusService.observe().subscribe((message: any) => {
      expect(false).toBe(true);
    });

    const messageEvent: any = new Event('message');
    messageEvent.data = 'Hello there! General Kanobi...';
    window.dispatchEvent(messageEvent);
    subscription.unsubscribe();
  });
});
