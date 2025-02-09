import { TestBed, fakeAsync } from '@angular/core/testing';
import { I18nModule } from '@pe/ng-kit/src/kit/i18n';
import { AuthService } from '@pe/ng-kit/src/kit/auth';
import { PlatformHeaderService } from '@pe/ng-kit/src/kit/platform-header';
import { ApiService } from './api.service';
import { PlatformService } from '@pe/ng-kit/src/kit/common';
import { of } from 'rxjs';
import { SettingsService } from './settings.service';
import { EnvironmentConfigService } from '@pe/ng-kit/src/kit/environment-config';
import { Router } from '@angular/router';

describe('SettingsService', () => {
  let service: SettingsService;
  let authServiceSpy: jasmine.Spy;
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [I18nModule.forRoot({})],
      providers: [
        SettingsService,
        {
          provide: AuthService,
          useValue: {
            isAdmin: () => false,
          },
        },
        {
          provide: EnvironmentConfigService,
          useValue: {
            getConfig$: () => of({}),
            getConfig: () => ({ backend: { users: 'users' }, frontend: {} }),
            getBackendConfig: () => ({
              users: 'users',
            }),
            getFrontendConfig: () => ({}),
          },
        },
        {
          provide: Router,
          useValue: {},
        },
      ],
    })
  );

  beforeEach(() => {
    service = TestBed.get(SettingsService);
    const authService = TestBed.get(AuthService);
    authServiceSpy = spyOn(authService, 'isAdmin');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get apiBusinessUrls without errors', () => {
    expect(service.apiBusinessUrls).toBeTruthy();
    authServiceSpy.and.returnValue(true);
    expect(service.apiBusinessUrls).toBeTruthy();
  });

  it('should get externalUrls without errors', () => {
    expect(service.externalUrls).toBeTruthy();
    authServiceSpy.and.returnValue(true);
    expect(service.externalUrls).toBeTruthy();
  });

  it('should get apiPersonalUrls without errors', () => {
    expect(service.apiPersonalUrls).toBeTruthy();
    authServiceSpy.and.returnValue(true);
    expect(service.apiPersonalUrls).toBeTruthy();
  });

  it('should execute getters without errors', () => {
    const apiMicroBaseUrl = service.apiMicroBaseUrl;
    expect(apiMicroBaseUrl).toBeFalsy();

    const apiMicroCheckoutUrl = service.apiMicroCheckoutUrl;
    expect(apiMicroCheckoutUrl).toBeFalsy();

    const apiMicroConnectUrl = service.apiMicroConnectUrl;
    expect(apiMicroConnectUrl).toBeFalsy();

    const apiMicroUsersUrl = service.apiMicroUsersUrl;
    expect(apiMicroUsersUrl).toBe('users');

    const checkoutWrapperUrl = service.checkoutWrapperUrl;
    expect(checkoutWrapperUrl).toBeFalsy();
  });

  it('should execute getters and setters without errors', () => {
    service.isPersonal = true;
    expect(service.isPersonal).toBeTruthy();

    service.parentApp = 'test';
    expect(service.parentApp).toBe('test');

    service.parentAppId = 'testId';
    expect(service.parentAppId).toBe('testId');

    service.parentBackUrl = 'url';
    expect(service.parentBackUrl).toBe('url');

    service.embedded = true;
    expect(service.embedded).toBeTruthy();

    expect(service.settings).toBeTruthy();

    service.businessUuid = 'tyui-3443430fghj-43hgf-dsfgd';
    expect(service.businessUuid).toBe('tyui-3443430fghj-43hgf-dsfgd');

    service.isPrivate = true;
    expect(service.isPrivate).toBeTruthy();

    expect(service.getBusinessDataUrl()).toBe(
      'users/api/business/tyui-3443430fghj-43hgf-dsfgd'
    );
  });
});
