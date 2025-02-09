import { RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';

import { PeAuthService } from '../services/auth.service';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {

  let guard: AuthGuard;
  let authService: jasmine.SpyObj<PeAuthService>;

  beforeEach(() => {

    authService = jasmine.createSpyObj<PeAuthService>('PeAuthService', [
      'redirectToEntryPage',
      'isRefreshTokenExpired',
      'isAccessTokenExpired',
      'refreshAccessToken$',
    ]);

    guard = new AuthGuard(authService, null);

  });

  it('should be defined', () => {

    expect(guard).toBeDefined();

  });

  it('should check can activate', () => {

    const stateMock = {
      url: 'state.url',
    } as RouterStateSnapshot;

    /**
     * without authService.token
     */
    expect(guard.canActivate(null, stateMock)).toBe(false);
    expect(authService.redirectToEntryPage).toHaveBeenCalledWith('/entry', stateMock.url);

    /** 
     * with authService.token
     * with authService.refreshToken
     * isRefreshTokenExpired returns TRUE
     * isAccessTokenExpired returns FALSE
     */
    authService[`token` as any] = 'token';
    authService[`refreshToken` as any] = 'refresh.token';
    authService.isRefreshTokenExpired.and.returnValue(true);
    authService.isAccessTokenExpired.and.returnValue(false);

    expect(guard.canActivate(null, stateMock)).toBe(true);
    expect(authService.redirectToEntryPage).toHaveBeenCalledWith('/entry/login', stateMock.url);

    /** 
     * isRefreshTokenExpired returns FALSE
     * isAccessTokenExpired returns TRUE
     */
    authService.isRefreshTokenExpired.and.returnValue(false);
    authService.isAccessTokenExpired.and.returnValue(true);
    authService.refreshAccessToken$.and.returnValue(of({ refreshed: true }));

    (guard.canActivate(null, stateMock) as any).subscribe(can => expect(can).toBe(true));
    expect(authService.refreshAccessToken$).toHaveBeenCalled();

  });

});
