import { TestBed } from '@angular/core/testing';
import { AuthService } from '../services';
import { RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';
import { MicroRegistryService } from '../../../micro/src/services/micro-registry.service';
import { HttpClient } from '@angular/common/http';
import { EnvironmentConfigService } from '../../../environment-config/src/services';
import { TranslateService } from '../../../i18n/src/services';
import { PlatformService } from '../../../common/src/services';
import { of, Subscription } from 'rxjs';
import { RefreshTokenGuard } from './refresh-token.guard';
import { LoginResponse } from '../interfaces';

describe('RefreshTokenGuard', () => {

  let authService: AuthService;
  let refreshTokenGuard: RefreshTokenGuard;
  let snapshot: RouterStateSnapshot;
  let routeSnapshot: ActivatedRouteSnapshot;
  const subscriptions: Subscription = new Subscription();

  beforeEach(() => {

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        {
          provide: Router,
          useValue: {
          }
        },
        {
          provide: MicroRegistryService,
          useValue: {
            getMicroConfig: () => new Array()
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy().and.stub()
          }
        },
        {
          provide: HttpClient,
          useValue: {
            get: () => ''
          }
        },
        {
          provide: EnvironmentConfigService,
          useValue: {
            isDev: jasmine.createSpy().and.returnValue(true),
            getConfig: jasmine.createSpy('getConfig').and.returnValue({
              backend: { auth: '2' },
              frontend: { commerceos: window.location.origin }
            }),
          }
        },
        {
          provide: TranslateService,
          useValue: {
            translate: jasmine.createSpy().and.returnValue('')
          }
        },
        {
          provide: PlatformService,
          useValue: {
            backToDashboard: jasmine.createSpy().and.returnValue(undefined),
            platformEvents$: of({})
          }
        },
        RefreshTokenGuard,
        {
          provide: RouterStateSnapshot,
          useValue: {
            url: ''
          }
        },
        {
          provide: ActivatedRouteSnapshot,
          useValue: {
          }
        }
      ]
    });

    refreshTokenGuard = TestBed.get(RefreshTokenGuard);
    authService = TestBed.get(AuthService);
    snapshot = TestBed.get(RouterStateSnapshot);
    routeSnapshot = TestBed.get(ActivatedRouteSnapshot);
  });

  it('should call asyncRefreshAccessToken if access token expired and refresh token not expired', () => {
    const checkRefreshTokenSpy: jasmine.Spy = spyOn(authService, 'isRefreshTokenExpired').and.returnValue(false);
    const checkAccessTokenSpy: jasmine.Spy = spyOn(authService, 'isAccessTokenExpired').and.returnValue(true);
    const asyncReftSpy: jasmine.Spy = spyOn(authService, 'asyncRefreshAccessToken').and.returnValue(of({} as LoginResponse));
    const sub: Subscription = refreshTokenGuard.canActivate(routeSnapshot, snapshot).subscribe((val: boolean) => {
      expect(val).toBeTruthy();
      expect(checkRefreshTokenSpy).toHaveBeenCalled();
      expect(checkAccessTokenSpy).toHaveBeenCalled();
      expect(asyncReftSpy).toHaveBeenCalled();
    });
    subscriptions.add(sub);
  });

  it('should call setToken and setRefreshToken if refresh token expired',done => {
    const checkRefreshTokenSpy: jasmine.Spy = spyOn(authService, 'isRefreshTokenExpired').and.returnValue(true);
    const checkAccessTokenSpy: jasmine.Spy = spyOn(authService, 'isAccessTokenExpired').and.returnValue(true);
    const setTokenSpy: jasmine.Spy = spyOn(authService, 'setToken').and.returnValue(of(undefined));
    const setRefreshTokenSpy: jasmine.Spy = spyOn(authService, 'setRefreshToken').and.returnValue(of(undefined));
    const sub: Subscription = refreshTokenGuard.canActivate(routeSnapshot, snapshot).subscribe((val: boolean) => {
      expect(val).toBeTruthy();
      expect(checkRefreshTokenSpy).toHaveBeenCalled();
      expect(checkAccessTokenSpy).toHaveBeenCalled();
      expect(setTokenSpy).toHaveBeenCalled();
      expect(setRefreshTokenSpy).toHaveBeenCalled();
      done();
    });
    subscriptions.add(sub);
  });

  it('should of(true) if tokens are fresh', () => {
    const checkRefreshTokenSpy: jasmine.Spy = spyOn(authService, 'isRefreshTokenExpired').and.returnValue(false);
    const checkAccessTokenSpy: jasmine.Spy = spyOn(authService, 'isAccessTokenExpired').and.returnValue(false);
    const setTokenSpy: jasmine.Spy = spyOn(authService, 'setToken').and.returnValue(of(undefined));
    const setRefreshTokenSpy: jasmine.Spy = spyOn(authService, 'setRefreshToken').and.returnValue(of(undefined));
    const sub: Subscription = refreshTokenGuard.canActivate(routeSnapshot, snapshot).subscribe((val: boolean) => {
      expect(val).toBeTruthy();
      expect(checkRefreshTokenSpy).toHaveBeenCalled();
      expect(checkAccessTokenSpy).toHaveBeenCalled();
      expect(setTokenSpy).not.toHaveBeenCalled();
      expect(setRefreshTokenSpy).not.toHaveBeenCalled();
    });
    subscriptions.add(sub);
  });

  afterAll(() => {
    if (subscriptions) {
      subscriptions.unsubscribe();
    }
  });
});
