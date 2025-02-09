import { Subscription } from 'rxjs';

import { AuthPlatformService } from './platform.service';

describe('AuthPlatformService', () => {

  let service: AuthPlatformService;

  beforeEach(() => {

    service = new AuthPlatformService();

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should get observe', () => {

    const event = new Event('backgroundEvent') as any;
    let subscription: Subscription;
    event.detail = 'pe:os:target:action';

    /** 
     * Running test:
     * 
     * cachedObserve$ is null
     * ---
     * dispatch event without data in detail string
     */
    subscription = service.observe$.subscribe(result => expect(result).toEqual({
      target: 'target',
      action: 'action',
      data: undefined,
    }));
    window.dispatchEvent(event);

    /**
     * Running test:
     * 
     * cachedObserve$ has been set during prev run of this test
     * ---
     * dispatch event with data in detail string
     */
    subscription.unsubscribe();
    event.detail += ':test';

    service.observe$.subscribe(result => expect(result).toEqual({
      target: 'target',
      action: 'action',
      data: 'test',
    }));
    window.dispatchEvent(event);

  });

  it('should dispatch event', () => {

    const event = {
      data: null,
      target: 'target',
      action: 'action',
    };
    const dispatchSpy = spyOn(window, 'dispatchEvent');

    /**
     * Running test:
     * 
     * without event.data
     */
    service.dispatchEvent(event);

    expect(dispatchSpy).toHaveBeenCalledWith(new CustomEvent('backgroundEvent', {
      detail: `pe:os:${event.target}:${event.action}`,
    }));

    /**
     * Running test:
     * 
     * with event.data
     * typeof event.data = string
     */
    event.data = 'test';

    service.dispatchEvent(event);

    expect(dispatchSpy).toHaveBeenCalledWith(new CustomEvent('backgroundEvent', {
      detail: `pe:os:${event.target}:${event.action}:${event.data}`,
    }));

    /**
     * Running test:
     * 
     * typeof event.data != string
     */
    event.data = { test: true };

    service.dispatchEvent(event);

    expect(dispatchSpy).toHaveBeenCalledWith(new CustomEvent('backgroundEvent', {
      detail: `pe:os:${event.target}:${event.action}:${JSON.stringify(event.data)}`,
    }));

  });

});
