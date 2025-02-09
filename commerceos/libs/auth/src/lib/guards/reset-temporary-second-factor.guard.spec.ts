import { of } from 'rxjs';

import { PeAuthService } from '../services/auth.service';

import { ResetTemporarySecondFactorGuard } from './reset-temporary-second-factor.guard';

describe('ResetTemporarySecondFactorGuard', () => {

  let guard: ResetTemporarySecondFactorGuard;
  let authService: jasmine.SpyObj<PeAuthService>;

  beforeEach(() => {

    authService = jasmine.createSpyObj<PeAuthService>('PeAuthService', [
      'isSecondFactorAuthPassedAsTemporary',
      'isSecondFactorJustPassed',
      'isSecondFactorAuthPassed',
      'resetTemporarySecondFactor',
    ]);

    guard = new ResetTemporarySecondFactorGuard(authService);

  });

  it('should be defined', () => {

    expect(guard).toBeDefined();

  });

  it('should check can activate', () => {

    /**
     * isSecondFactorAuthPassedAsTemporary returns FALSE
     */
    authService.isSecondFactorAuthPassedAsTemporary.and.returnValue(false);

    expect(guard.canActivate()).toBe(true);
    expect(authService.isSecondFactorAuthPassedAsTemporary).toHaveBeenCalled();
    expect(authService.isSecondFactorJustPassed).not.toHaveBeenCalled();
    expect(authService.isSecondFactorAuthPassed).not.toHaveBeenCalled();
    expect(authService.resetTemporarySecondFactor).not.toHaveBeenCalled();

    /**
     * isSecondFactorAuthPassedAsTemporary returns TRUE
     * isSecondFactorJustPassed returns TRUE
     * isSecondFactorAuthPassed returns FALSE
     */
    authService.isSecondFactorAuthPassedAsTemporary.and.returnValue(true);
    authService.isSecondFactorJustPassed.and.returnValue(true);
    authService.isSecondFactorAuthPassed.and.returnValue(false);
    authService.resetTemporarySecondFactor.and.returnValue(of(true));

    (guard.canActivate() as any).subscribe(can => expect(can).toBe(true));
    expect(authService.isSecondFactorJustPassed).toHaveBeenCalled();
    expect(authService.isSecondFactorAuthPassed).toHaveBeenCalled();
    expect(authService.resetTemporarySecondFactor).toHaveBeenCalled();

  });

  it('should check can deactivate', () => {

    const canSpy = spyOn(guard, 'canActivate').and.returnValue(true);

    expect(guard.canDeactivate()).toBe(true);
    expect(canSpy).toHaveBeenCalled();

  });

});
