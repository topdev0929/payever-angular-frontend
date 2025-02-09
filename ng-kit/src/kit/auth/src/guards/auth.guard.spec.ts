import { TestBed } from '@angular/core/testing';
import { AuthService } from '../services';
import { AuthGuard } from './auth.guard';
import { RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';
import { MicroRegistryService } from '../../../micro/src/services/micro-registry.service';
import { HttpClient } from '@angular/common/http';
import { EnvironmentConfigService } from '../../../environment-config/src/services';
import { TranslateService } from '../../../i18n/src/services';
import { PlatformService } from '../../../common/src/services';
import { of } from 'rxjs';

describe('AuthGuard', () => {

  let authService: AuthService;
  let authGuard: AuthGuard;
  let snapshot: RouterStateSnapshot;
  let routeSnapshot: ActivatedRouteSnapshot;

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
        AuthGuard,
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

    authGuard = TestBed.get(AuthGuard);
    authService = TestBed.get(AuthService);
    snapshot = TestBed.get(RouterStateSnapshot);
    routeSnapshot = TestBed.get(ActivatedRouteSnapshot);
  });

  it('should redirect to /entry and return false if there is no token', () => {
    spyOnProperty(authService, 'token').and.returnValue('');
    const redirSpy: jasmine.Spy = spyOn(authService, 'redirectToEntryPage').and.stub();

    expect(authGuard.canActivate(routeSnapshot, snapshot)).toBeFalsy();
    expect(redirSpy.calls.mostRecent().args[0]).toBe('/entry');
  });

  it('should redirect to /entry/login and return boolean value of token', () => {
    spyOnProperty(authService, 'token').and.returnValue('1');
    const checkRefreshTokenSpy: jasmine.Spy = spyOn(authService, 'isRefreshTokenExpired').and.returnValue(true);
    const checkAccessTokenSpy: jasmine.Spy = spyOn(authService, 'isAccessTokenExpired').and.returnValue(false);
    const redirSpy: jasmine.Spy = spyOn(authService, 'redirectToEntryPage').and.stub();

    expect(authGuard.canActivate(routeSnapshot, snapshot)).toBeTruthy();
    expect(redirSpy.calls.mostRecent().args[0]).toBe('/entry/login');
    expect(checkAccessTokenSpy).toHaveBeenCalled();
    expect(checkRefreshTokenSpy).toHaveBeenCalled();
  });

  it('should return boolean value of token and call refreshAccessToken$', done => {
    spyOnProperty(authService, 'token').and.returnValue('1');
    const checkRefreshTokenSpy: jasmine.Spy = spyOn(authService, 'isRefreshTokenExpired').and.returnValue(false);
    const checkAccessTokenSpy: jasmine.Spy = spyOn(authService, 'isAccessTokenExpired').and.returnValue(true);
    const refreshSpy: jasmine.Spy = spyOn(authService, 'refreshAccessToken$').and.returnValue(of({}));

    const result: any = authGuard.canActivate(routeSnapshot, snapshot);
    result.subscribe(() => {
      expect(checkAccessTokenSpy).toHaveBeenCalled();
      expect(checkRefreshTokenSpy).toHaveBeenCalled();
      expect(refreshSpy).toHaveBeenCalled();
      done();
    });
  });

  it('should return boolean value of token', () => {
    spyOnProperty(authService, 'token').and.returnValue('1');
    const checkRefreshTokenSpy: jasmine.Spy = spyOn(authService, 'isRefreshTokenExpired').and.returnValue(false);
    const checkAccessTokenSpy: jasmine.Spy = spyOn(authService, 'isAccessTokenExpired').and.returnValue(false);
    const refreshSpy: jasmine.Spy = spyOn(authService, 'refreshAccessToken$').and.returnValue(of({}));
    const redirSpy: jasmine.Spy = spyOn(authService, 'redirectToEntryPage').and.stub();

    authGuard.canActivate(routeSnapshot, snapshot);
    expect(refreshSpy).not.toHaveBeenCalled();
    expect(redirSpy).not.toHaveBeenCalled();
    expect(checkAccessTokenSpy).toHaveBeenCalled();
    expect(checkRefreshTokenSpy).toHaveBeenCalled();
  });
});
