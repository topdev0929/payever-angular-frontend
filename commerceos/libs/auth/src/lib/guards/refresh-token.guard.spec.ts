import { of } from 'rxjs';

import { PeAuthService } from '../services/auth.service';

import { RefreshTokenGuard } from './refresh-token.guard';

describe('RefreshTokenGuard', () => {

  let guard: RefreshTokenGuard;
  let authService: jasmine.SpyObj<PeAuthService>;

  beforeEach(() => {

    authService = jasmine.createSpyObj<PeAuthService>('PeAuthService', [
      'isAccessTokenExpired',
      'isRefreshTokenExpired',
      'asyncRefreshAccessToken',
      'setToken',
      'setRefreshToken',
    ]);

    guard = new RefreshTokenGuard(authService);

  });

  it('should be defined', () => {

    expect(guard).toBeDefined();

  });

  it('should check can activate', () => {

    /**
     * isAccessTokenExpired returns TRUE
     * isRefreshTokenExpired returns FALSE
     */
    authService.isAccessTokenExpired.and.returnValue(true);
    authService.isRefreshTokenExpired.and.returnValue(false);
    authService.asyncRefreshAccessToken.and.returnValue(of({
      accessToken: 'access.token',
      refreshToken: 'refresh.token',
    }));

    (guard.canActivate(null, null) as any).subscribe(can => expect(can).toBe(true));
    expect(authService.isAccessTokenExpired).toHaveBeenCalled();
    expect(authService.isRefreshTokenExpired).toHaveBeenCalled();
    expect(authService.asyncRefreshAccessToken).toHaveBeenCalled();
    expect(authService.setToken).not.toHaveBeenCalled();

    /**
     * isAccessTokenExpired returns TRUE
     * isRefreshTokenExpired returns TRUE
     */
    authService.asyncRefreshAccessToken.calls.reset();
    authService.isRefreshTokenExpired.and.returnValue(true);
    authService.setToken.and.returnValue(of(() => { }) as any);
    authService.setRefreshToken.and.returnValue(of(() => { }) as any);

    (guard.canActivate(null, null) as any).subscribe(can => expect(can).toBe(true));
    expect(authService.setToken).toHaveBeenCalled();
    expect(authService.setRefreshToken).toHaveBeenCalled();
    expect(authService.asyncRefreshAccessToken).not.toHaveBeenCalled();

    /**
     * isAccessTokenExpired returns FALSE
     * isRefreshTokenExpired returns FALSE
     */
    authService.setToken.calls.reset();
    authService.setRefreshToken.calls.reset();
    authService.isAccessTokenExpired.and.returnValue(false);
    authService.isRefreshTokenExpired.and.returnValue(false);

    (guard.canActivate(null, null) as any).subscribe(can => expect(can).toBe(true));
    expect(authService.setToken).not.toHaveBeenCalled();
    expect(authService.setRefreshToken).not.toHaveBeenCalled();
    expect(authService.asyncRefreshAccessToken).not.toHaveBeenCalled();

  });

});
