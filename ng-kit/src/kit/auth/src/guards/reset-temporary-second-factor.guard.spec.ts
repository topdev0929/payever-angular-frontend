import { TestBed } from '@angular/core/testing';
import { AuthService } from '../services';
import { Router } from '@angular/router';
import { MicroRegistryService } from '../../../micro/src/services/micro-registry.service';
import { HttpClient } from '@angular/common/http';
import { EnvironmentConfigService } from '../../../environment-config/src/services';
import { TranslateService } from '../../../i18n/src/services';
import { PlatformService } from '../../../common/src/services';
import { of, Observable, Subscription } from 'rxjs';
import { ResetTemporarySecondFactorGuard } from './reset-temporary-second-factor.guard';

describe('ResetTemporarySecondFactorGuard', () => {

  let authService: AuthService;
  let resetTemporarySecondFactorGuard: ResetTemporarySecondFactorGuard;
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
        ResetTemporarySecondFactorGuard
      ]
    });

    resetTemporarySecondFactorGuard = TestBed.get(ResetTemporarySecondFactorGuard);
    authService = TestBed.get(AuthService);
  });

  describe('can activate', () => {
    it('should call resetTemporarySecondFactor and return observable with true', () => {
      const isSecondFactorAuthPassedAsTemporarySpy: jasmine.Spy = spyOn(authService, 'isSecondFactorAuthPassedAsTemporary').and.returnValue(true);
      const isSecondFactorJustPassedSpy: jasmine.Spy = spyOn(authService, 'isSecondFactorJustPassed').and.returnValue(true);
      const isSecondFactorAuthPassedSpy: jasmine.Spy = spyOn(authService, 'isSecondFactorAuthPassed').and.returnValue(false);
      const resetTemporarySecondFactorSpy: jasmine.Spy = spyOn(authService, 'resetTemporarySecondFactor').and.returnValue(of(true));
      const result: any = resetTemporarySecondFactorGuard.canActivate();
      if (result instanceof Observable) {
        const sub: Subscription = result.subscribe((val: boolean) => {
          expect(val).toBeTruthy();
          expect(isSecondFactorAuthPassedAsTemporarySpy).toHaveBeenCalled();
          expect(isSecondFactorJustPassedSpy).toHaveBeenCalled();
          expect(isSecondFactorAuthPassedSpy).toHaveBeenCalled();
          expect(resetTemporarySecondFactorSpy).toHaveBeenCalled();
        });
        subscriptions.add(sub);
      }
    });

    it('should not call resetTemporarySecondFactor and return true', () => {
      const isSecondFactorAuthPassedAsTemporarySpy: jasmine.Spy = spyOn(authService, 'isSecondFactorAuthPassedAsTemporary').and.returnValue(false);
      const isSecondFactorJustPassedSpy: jasmine.Spy = spyOn(authService, 'isSecondFactorJustPassed').and.returnValue(false);
      const isSecondFactorAuthPassedSpy: jasmine.Spy = spyOn(authService, 'isSecondFactorAuthPassed').and.returnValue(false);
      const resetTemporarySecondFactorSpy: jasmine.Spy = spyOn(authService, 'resetTemporarySecondFactor').and.returnValue(of(true));

      const result: any = resetTemporarySecondFactorGuard.canActivate();
      expect(result).toBeTruthy();
      expect(isSecondFactorAuthPassedAsTemporarySpy).toHaveBeenCalled();
      expect(isSecondFactorJustPassedSpy).not.toHaveBeenCalled();
      expect(isSecondFactorAuthPassedSpy).not.toHaveBeenCalled();
      expect(resetTemporarySecondFactorSpy).not.toHaveBeenCalled();
    });
  });

  it('can deactivate should call canActivate', () => {
    const canActivateSpy: jasmine.Spy = spyOn(resetTemporarySecondFactorGuard, 'canActivate').and.stub();
    resetTemporarySecondFactorGuard.canDeactivate();

    expect(canActivateSpy).toHaveBeenCalled();
  });

  afterAll(() => {
    if (subscriptions) {
      subscriptions.unsubscribe();
    }
  });
});
