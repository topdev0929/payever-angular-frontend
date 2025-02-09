import { TestBed } from '@angular/core/testing';
import { AuthService } from '../services';
import { RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';
import { MicroRegistryService } from '../../../micro/src/services/micro-registry.service';
import { HttpClient } from '@angular/common/http';
import { EnvironmentConfigService } from '../../../environment-config/src/services';
import { TranslateService } from '../../../i18n/src/services';
import { PlatformService } from '../../../common/src/services';
import { of, Observable } from 'rxjs';
import { SecondFactorGuard } from './second-factor.guard';

describe('SecondFactorGuard', () => {

  let authService: AuthService;
  let secondFactorGuard: SecondFactorGuard;
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
        SecondFactorGuard,
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

    secondFactorGuard = TestBed.get(SecondFactorGuard);
    authService = TestBed.get(AuthService);
    snapshot = TestBed.get(RouterStateSnapshot);
    routeSnapshot = TestBed.get(ActivatedRouteSnapshot);
  });

  it('should call redirectToEntryPageWithUrlSpy return false', done => {
    const isSecondFactorAuthPassedSpy: jasmine.Spy = spyOn(authService, 'isSecondFactorAuthPassed').and.returnValue(false);
    const redirectToEntryPageWithUrlSpy: jasmine.Spy = spyOn(authService, 'redirectToEntryPageWithUrl').and.stub();
    const repeatSendCodeSpy: jasmine.Spy = spyOn(authService, 'repeatSendCode').and.returnValue(
      new Observable(observer => {
        observer.next();
        observer.complete();

        expect(redirectToEntryPageWithUrlSpy.calls.mostRecent().args[0]).toEqual('entry/second-factor-code');
        done();
      })
    );

    expect(secondFactorGuard.canActivate(routeSnapshot, snapshot)).toBeFalsy();
    expect(isSecondFactorAuthPassedSpy).toHaveBeenCalled();
    expect(repeatSendCodeSpy).toHaveBeenCalled();
  });

  it('should not call redirectToEntryPageWithUrlSpy return true', () => {
    const isSecondFactorAuthPassedSpy: jasmine.Spy = spyOn(authService, 'isSecondFactorAuthPassed').and.returnValue(true);
    const repeatSendCodeSpy: jasmine.Spy = spyOn(authService, 'repeatSendCode').and.returnValue(of(undefined));
    const redirectToEntryPageWithUrlSpy: jasmine.Spy = spyOn(authService, 'redirectToEntryPageWithUrl').and.stub();

    expect(secondFactorGuard.canActivate(routeSnapshot, snapshot)).toBeTruthy();
    expect(isSecondFactorAuthPassedSpy).toHaveBeenCalled();
    expect(repeatSendCodeSpy).not.toHaveBeenCalled();
    expect(redirectToEntryPageWithUrlSpy).not.toHaveBeenCalled();
  });
});
