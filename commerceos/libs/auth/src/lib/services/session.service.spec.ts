import { fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';

import { PeAuthService } from './auth.service';
import { SessionService } from './session.service';

describe('SessionService', () => {

  let service: SessionService;
  let authService: jasmine.SpyObj<PeAuthService>;

  beforeEach(() => {

    authService = jasmine.createSpyObj<PeAuthService>('PeAuthService', [
      'getUserData',
      'logout',
      'isDev',
    ]);

    service = new SessionService(authService);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should start user inactivity detection', fakeAsync(() => {

    const addEventSpy = spyOn(document.documentElement, 'addEventListener').and.callThrough();
    const detectedSpy = spyOn<any>(service, 'activityDetected');

    service.startUserInactivityDetection();

    expect(addEventSpy).toHaveBeenCalledTimes(2);
    expect(addEventSpy.calls.argsFor(0)[0]).toEqual('keydown');
    expect(addEventSpy.calls.argsFor(1)[0]).toEqual('click');

    document.documentElement.dispatchEvent(new Event('click'));

    tick(5000);

    expect(detectedSpy).toHaveBeenCalled();

  }));

  it('should start inactivity timer', fakeAsync(() => {

    const finishSpy = spyOn<any>(service, 'finishSession');
    const clearSpy = spyOn(window, 'clearTimeout').and.callThrough();

    /**
     * Running test:
     * 
     * activityTimeoutHandle is null
     */
    service[`startInactivityTimer`]();

    tick(15 * 60 * 1000);

    expect(clearSpy).not.toHaveBeenCalled();
    expect(finishSpy).toHaveBeenCalled();

    /**
     * Running test:
     * 
     * activityTimeoutHandle has been set during prev run of this test
     */
    service[`startInactivityTimer`]();

    tick(15 * 60 * 1000);

    expect(clearSpy).toHaveBeenCalled();

  }));

  it('should handle activity detected', () => {

    const startSpy = spyOn<any>(service, 'startInactivityTimer');

    /**
     * Running test:
     * 
     * authService.getUserData returns undefined
     */
    service[`activityDetected`]();

    expect(authService.getUserData).toHaveBeenCalled();
    expect(startSpy).not.toHaveBeenCalled();

    /**
     * Running test:
     * 
     * authService.getUserData returns mock data
     */
    authService.getUserData.and.returnValue({ uuid: 'user-uuid' } as any);

    service[`activityDetected`]();

    expect(startSpy).toHaveBeenCalled();

  });

  it('should finish session', () => {

    /**
     * Running test:
     * 
     * authService.isDev returns TRUE
     */
    authService.isDev.and.returnValue(true);

    service[`finishSession`]();

    expect(authService.isDev).toHaveBeenCalled();
    expect(authService.logout).not.toHaveBeenCalled();

    /**
     * Running test:
     * 
     * authService.isDev returns FALSE
     */
    authService.isDev.and.returnValue(false);
    authService.logout.and.returnValue(of(() => { }) as any);

    service[`finishSession`]();

    expect(authService.logout).toHaveBeenCalled();

  });

});
