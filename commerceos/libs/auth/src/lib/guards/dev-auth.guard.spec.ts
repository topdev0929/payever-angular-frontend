import { of } from 'rxjs';

import { PeAuthService } from '../services/auth.service';

import { DevAuthGuard } from './dev-auth.guard';

describe('DevAuthGuard', () => {

  let guard: DevAuthGuard;
  let authService: jasmine.SpyObj<PeAuthService>;

  beforeEach(() => {

    authService = jasmine.createSpyObj<PeAuthService>('PeAuthService', [
      'isAccessTokenExpired',
      'login',
    ]);

    guard = new DevAuthGuard(authService);

  });

  it('should be defined', () => {

    expect(guard).toBeDefined();

  });

  it('should check can activate', () => {

    const routeMock = {
      data: {
        devAuth: {
          isDev: true,
          credentials: {
            login: 'login',
            password: 'pass',
          },
        },
      },
    };

    authService.isAccessTokenExpired.and.returnValue(false);

    /**
     * isAccessTokenExpired returns FALSE
     */
    expect(guard.canActivate(routeMock as any, null)).toBe(true);
    expect(authService.isAccessTokenExpired).toHaveBeenCalled();

    /**
     * isAccessTokenExpired returns TRUE
     */
    authService.isAccessTokenExpired.and.returnValue(true);
    authService.login.and.returnValue(of('logged in'));

    (guard.canActivate(routeMock as any, null) as any).subscribe(can => expect(can).toBe(true));
    expect(authService.login).toHaveBeenCalledWith({
      email: routeMock.data.devAuth.credentials.login,
      plainPassword: routeMock.data.devAuth.credentials.password,
    });

  });

});
