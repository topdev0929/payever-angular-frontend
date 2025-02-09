import { TestBed } from '@angular/core/testing';
import { AuthService } from '../services';
import { RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';
import { MicroRegistryService } from '../../../micro/src/services/micro-registry.service';
import { HttpClient } from '@angular/common/http';
import { EnvironmentConfigService } from '../../../environment-config/src/services';
import { TranslateService } from '../../../i18n/src/services';
import { PlatformService } from '../../../common/src/services';
import { of, Observable, Subscription } from 'rxjs';
import { TemporarySecondFactorJustPassedOnlyGuard } from './temporary-second-factor-just-passed-only.guard';

describe('TemporarySecondFactorJustPassedOnlyGuard', () => {

  let authService: AuthService;
  let temporarySecondFactorJustPassedOnlyGuard: TemporarySecondFactorJustPassedOnlyGuard;
  let snapshot: RouterStateSnapshot;
  let routeSnapshot: ActivatedRouteSnapshot;
  let sub: Subscription = new Subscription();

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
        TemporarySecondFactorJustPassedOnlyGuard,
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

    temporarySecondFactorJustPassedOnlyGuard = TestBed.get(TemporarySecondFactorJustPassedOnlyGuard);
    authService = TestBed.get(AuthService);
    snapshot = TestBed.get(RouterStateSnapshot);
    routeSnapshot = TestBed.get(ActivatedRouteSnapshot);
  });

  it('should return true if isSecondFactorAuthPassedAsPermanent is true', () => {
    const isSecondFactorAuthPassedAsPermanentSpy: jasmine.Spy = spyOn(authService, 'isSecondFactorAuthPassedAsPermanent').and.returnValue(true);

    expect(temporarySecondFactorJustPassedOnlyGuard.canActivate(routeSnapshot, snapshot)).toBeTruthy();
    expect(isSecondFactorAuthPassedAsPermanentSpy).toHaveBeenCalled();
  });

  it('should return true if isSecondFactorAuthPassedAsPermanent is false and isSecondFactorJustPassed is true', () => {
    const isSecondFactorAuthPassedAsPermanentSpy: jasmine.Spy = spyOn(authService, 'isSecondFactorAuthPassedAsPermanent').and.returnValue(false);
    const isSecondFactorJustPassedSpy: jasmine.Spy = spyOn(authService, 'isSecondFactorJustPassed').and.returnValue(true);

    expect(temporarySecondFactorJustPassedOnlyGuard.canActivate(routeSnapshot, snapshot)).toBeTruthy();
    expect(isSecondFactorAuthPassedAsPermanentSpy).toHaveBeenCalled();
    expect(isSecondFactorJustPassedSpy).toHaveBeenCalled();
  });

  it('should return observable of false', done => {
    const isSecondFactorAuthPassedAsPermanentSpy: jasmine.Spy = spyOn(authService, 'isSecondFactorAuthPassedAsPermanent').and.returnValue(false);
    const isSecondFactorJustPassedSpy: jasmine.Spy = spyOn(authService, 'isSecondFactorJustPassed').and.returnValue(false);
    const resetTemporarySecondFactorSpy: jasmine.Spy = spyOn(authService, 'resetTemporarySecondFactor').and.returnValue(of(true));
    const repeatSendCodeSpy: jasmine.Spy = spyOn(authService, 'repeatSendCode').and.returnValue(of(undefined));
    const redirectToEntryPageWithUrlSpy: jasmine.Spy = spyOn(authService, 'redirectToEntryPageWithUrl').and.stub();

    const result: any = temporarySecondFactorJustPassedOnlyGuard.canActivate(routeSnapshot, snapshot);

    if (result instanceof Observable) {
      sub = result.subscribe((val: boolean) => {
        expect(val).toBeFalsy();
        expect(isSecondFactorAuthPassedAsPermanentSpy).toHaveBeenCalled();
        expect(isSecondFactorJustPassedSpy).toHaveBeenCalled();
        expect(resetTemporarySecondFactorSpy).toHaveBeenCalled();
        expect(repeatSendCodeSpy).toHaveBeenCalled();
        expect(redirectToEntryPageWithUrlSpy.calls.mostRecent().args[0]).toEqual('entry/second-factor-code');
        done();
      });
    }

  });

  afterAll(() => {
    if (sub) {
      sub.unsubscribe();
    }
  });
});
