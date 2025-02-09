import { RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';

import { PeAuthService } from '../services/auth.service';

import { SecondFactorGuard } from './second-factor.guard';

describe('SecondFactorGuard', () => {

  let guard: SecondFactorGuard;
  let authService: jasmine.SpyObj<PeAuthService>;

  beforeEach(() => {

    authService = jasmine.createSpyObj<PeAuthService>('PeAuthService', [
      'isSecondFactorAuthPassed',
      'repeatSendCode',
      'redirectToEntryPageWithUrl',
    ]);

    guard = new SecondFactorGuard(authService, null);

  });

  it('should be defined', () => {

    expect(guard).toBeDefined();

  });

  it('should check can activate', () => {

    const stateMock = {
      url: 'state.url',
    } as RouterStateSnapshot;

    /**
     * isSecondFactorAuthPassed returns TRUE
     */
    authService.isSecondFactorAuthPassed.and.returnValue(true);

    expect(guard.canActivate(null, stateMock)).toBe(true);
    expect(authService.repeatSendCode).not.toHaveBeenCalled();
    expect(authService.redirectToEntryPageWithUrl).not.toHaveBeenCalled();

    /**
     * isSecondFactorAuthPassed returns FALSE
     */
    authService.isSecondFactorAuthPassed.and.returnValue(false);
    authService.repeatSendCode.and.returnValue(of(() => { }) as any);

    expect(guard.canActivate(null, stateMock)).toBe(false);
    expect(authService.repeatSendCode).toHaveBeenCalled();
    expect(authService.redirectToEntryPageWithUrl).toHaveBeenCalledWith('second-factor-code', stateMock.url);

  });

});
