import { EventBusService } from './event-bus.service';

describe('EventBusService', () => {

  let eventBusService: any;

  beforeEach(() => {

    eventBusService = new EventBusService();
  });

  it('on should push listeners and return object with function', () => {
    const listenerSpy = jasmine.createSpy();

    const result = eventBusService.on('func1', listenerSpy);

    expect(result).toBeTruthy();
    expect(result instanceof Object).toBeTruthy();
    expect(result.hasOwnProperty('un')).toBeTruthy();
    expect(typeof result.un).toEqual('function');
  });

  it('emit should emit passed listener', () => {
    const listenerSpy = jasmine.createSpy();

    const result = eventBusService.on('func1', listenerSpy);

    expect(result).toBeTruthy();
    expect(result instanceof Object).toBeTruthy();
    expect(result.hasOwnProperty('un')).toBeTruthy();
    expect(typeof result.un).toEqual('function');

    eventBusService.emit('func1', 1);

    expect(listenerSpy).toHaveBeenCalledWith(1);
  });
});
