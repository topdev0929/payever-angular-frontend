import { RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';

import { PeAuthService } from '../services/auth.service';

import { TemporarySecondFactorJustPassedOnlyGuard } from './temporary-second-factor-just-passed-only.guard';

describe('TemporarySecondFactorJustPassedOnlyGuard', () => {

  let guard: TemporarySecondFactorJustPassedOnlyGuard;
  let authService: jasmine.SpyObj<PeAuthService>;

  beforeEach(() => {

    authService = jasmine.createSpyObj<PeAuthService>('PeAuthService', [
      'isSecondFactorAuthPassedAsPermanent',
      'isSecondFactorJustPassed',
      'resetTemporarySecondFactor',
      'repeatSendCode',
      'redirectToEntryPageWithUrl',
    ]);

    guard = new TemporarySecondFactorJustPassedOnlyGuard(authService, null);

  });

  it('should be defined', () => {

    expect(guard).toBeDefined();

  });

  it('should check can activate', () => {

    const stateMock = {
      url: 'state.url',
    } as RouterStateSnapshot;

    /**
     * isSecondFactorAuthPassedAsPermanent returns TRUE
     */
    authService.isSecondFactorAuthPassedAsPermanent.and.returnValue(true);

    expect(guard.canActivate(null, stateMock)).toBe(true);
    expect(authService.isSecondFactorAuthPassedAsPermanent).toHaveBeenCalled();
    expect(authService.isSecondFactorJustPassed).not.toHaveBeenCalled();
    expect(authService.resetTemporarySecondFactor).not.toHaveBeenCalled();
    expect(authService.repeatSendCode).not.toHaveBeenCalled();
    expect(authService.redirectToEntryPageWithUrl).not.toHaveBeenCalled();

    /**
     * isSecondFactorAuthPassedAsPermanent returns FALSE
     * isSecondFactorJustPassed returns TRUE
     */
    authService.isSecondFactorAuthPassedAsPermanent.and.returnValue(false);
    authService.isSecondFactorJustPassed.and.returnValue(true);

    expect(guard.canActivate(null, stateMock)).toBe(true);
    expect(authService.isSecondFactorJustPassed).toHaveBeenCalled();
    expect(authService.resetTemporarySecondFactor).not.toHaveBeenCalled();
    expect(authService.repeatSendCode).not.toHaveBeenCalled();
    expect(authService.redirectToEntryPageWithUrl).not.toHaveBeenCalled();

    /**
     * isSecondFactorJustPassed returns FALSE
     */
    authService.isSecondFactorJustPassed.and.returnValue(false);
    authService.resetTemporarySecondFactor.and.returnValue(of(true));
    authService.repeatSendCode.and.returnValue(of(() => { }) as any);

    (guard.canActivate(null, stateMock) as any).subscribe(can => expect(can).toBe(false));
    expect(authService.resetTemporarySecondFactor).toHaveBeenCalled();
    expect(authService.repeatSendCode).toHaveBeenCalled();
    expect(authService.redirectToEntryPageWithUrl).toHaveBeenCalledWith('second-factor-code', stateMock.url);

  });

});
