import { AuthService, ExtraLoginData, AuthTokenType, AuthUserData } from './auth.service';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EnvironmentConfigService } from '../../../environment-config/src/services';
import { TranslateService } from '../../../i18n';
import { Router } from '@angular/router';
import { MicroRegistryService } from '../../../micro/src/services';
import { PlatformService } from '../../../common/src/services';
import { of, Subscription, Observable } from 'rxjs';
import * as Cookie from 'js-cookie';
import { HttpClient } from '@angular/common/http';
import { LoginPayload, LoginResponse } from '../interfaces';

describe('AuthService', () => {
  const subscriptions: Subscription = new Subscription();
  let authService: AuthService;
  let environmentConfigService: EnvironmentConfigService;
  let translateService: TranslateService;
  let router: Router;
  let microRegistryService: MicroRegistryService;
  let platformService: PlatformService;
  let http: HttpClient;

  const IS_2FA_JUST_PASSED: string = 'pe_isSecondFactorJustPassedAsTemporary';
  const proxy: string = 'proxy';
  const auth: string = 'auth';
  const commerceos: string = 'commerceos';
  const fakeUserData: any = {
    id: '1',
    email: '1',
    first_name: '1',
    last_name: '1',
    roles: new Array(),
    tokenType: '1'
  };

  let cookieGetSpy: jasmine.Spy;
  let cookieSetSpy: jasmine.Spy;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        AuthService,
        {
          provide: EnvironmentConfigService,
          useValue: {
            isDev: jasmine.createSpy('isDev').and.returnValue(true),
            getConfig: jasmine.createSpy('getConfig').and.returnValue({
              frontend: {
                commerceos
              },
              backend: {
                auth
              },
              custom: {
                proxy
              }
            })
          }
        },
        {
          provide: TranslateService,
          useValue: {
            translate: jasmine.createSpy().and.returnValue('')
          }
        },
        {
          provide: Router,
          useValue: {
            url: '',
            navigate: jasmine.createSpy()
          }
        },
        {
          provide: MicroRegistryService,
          useValue: {
            getMicroConfig: jasmine.createSpy().and.returnValue(['1', '2'])
          }
        },
        {
          provide: PlatformService,
          useValue: {
            platformEvents$: of({}),
            dispatchEvent: jasmine.createSpy().and.returnValue(undefined)
          }
        },
        {
          provide: HttpClient,
          useValue: {
            post: () => of({}),
            get: () => of({})
          }
        }
      ]
    });

    authService = TestBed.get(AuthService);
    environmentConfigService = TestBed.get(EnvironmentConfigService);
    translateService = TestBed.get(TranslateService);
    router = TestBed.get(Router);
    microRegistryService = TestBed.get(MicroRegistryService);
    platformService = TestBed.get(PlatformService);
    http = TestBed.get(HttpClient);

    cookieGetSpy = spyOn(Cookie, 'get').and.callThrough();
    cookieSetSpy = spyOn(Cookie, 'set').and.stub();
    spyOn(localStorage, 'getItem').and.callThrough();
    spyOn(localStorage, 'setItem').and.callThrough();
  });

  describe('test getters', () => {

    it('should return auth token', () => {
      expect(authService.token).toBeDefined();
      expect(Cookie.get).toHaveBeenCalled();
    });

    it('should return guest token', () => {
      expect(authService.guestToken).toBeDefined();
      expect(Cookie.get).toHaveBeenCalled();
    });

    it('should return refresh token', () => {
      expect(authService.refreshToken).toBeDefined();
      expect(Cookie.get).toHaveBeenCalled();
    });

    it('refreshLoginData', () => {
      expect(authService.refreshLoginData).toBeDefined();
      expect(localStorage.getItem).toHaveBeenCalledWith('pe_active_business');
      expect(localStorage.getItem).toHaveBeenCalledWith('pe_user_email');
    });
  });

  it('refreshLoginData should set data to localStorage', () => {
    spyOn(authService, 'decodeTokenUser').and.returnValue(fakeUserData);
    spyOnProperty(authService, 'token').and.returnValue('1');
    authService.getUserData();
    const mockData: ExtraLoginData = {
      activeBusiness: true
    };

    authService.refreshLoginData = mockData;

    expect(localStorage.setItem).toHaveBeenCalledWith('pe_active_business', JSON.stringify(mockData.activeBusiness));
  });

  it('getUserData should return user data', () => {
    spyOn(authService, 'decodeTokenUser').and.returnValue(fakeUserData);
    spyOnProperty(authService, 'token').and.returnValue('1');
    expect(authService.getUserData().uuid).toBeDefined();
  });

  it('getRefershTokenData should return token data', () => {
    const token: string = 'refreshToken';
    cookieGetSpy.and.returnValue(token);

    expect(() => authService.getRefershTokenData()).toThrowError();

    cookieGetSpy.and.returnValue(null);

    expect(authService.getRefershTokenData()).toEqual({});
  });

  it('isAdmin should return true if user is admin, otherwise false', () => {
    let roles: any[] = [{ name: 'admin' }];
    const getUserDataSpy: jasmine.Spy = spyOn(authService, 'getUserData').and.returnValue({
      roles
    } as AuthUserData);

    expect(authService.isAdmin()).toBeTruthy();
    expect(authService.getUserData).toHaveBeenCalled();

    roles = [{ name: 'somebody' }];
    getUserDataSpy.and.returnValue({ roles });

    expect(authService.isAdmin()).toBeFalsy();
    expect(authService.getUserData).toHaveBeenCalled();
  });

  it('isSecondFactorAuthPassedAsPermanent should return true if passed, otherwise false', () => {
    let tokenType: number = AuthTokenType.permanent2fa;
    const getUserDataSpy: jasmine.Spy = spyOn(authService, 'getUserData').and.returnValue({
      tokenType
    } as AuthUserData);

    expect(authService.isSecondFactorAuthPassedAsPermanent()).toBeTruthy();
    expect(authService.getUserData).toHaveBeenCalled();

    tokenType = AuthTokenType.temporary2fa;
    getUserDataSpy.and.returnValue({ tokenType });

    expect(authService.isSecondFactorAuthPassedAsPermanent()).toBeFalsy();
    expect(authService.getUserData).toHaveBeenCalled();
  });

  it('isSecondFactorAuthPassedAsTemporary should return true if passed, otherwise false', () => {
    let tokenType: number = AuthTokenType.temporary2fa;
    const getUserDataSpy: jasmine.Spy = spyOn(authService, 'getUserData').and.returnValue({
      tokenType
    } as AuthUserData);

    expect(authService.isSecondFactorAuthPassedAsTemporary()).toBeTruthy();
    expect(authService.getUserData).toHaveBeenCalled();

    tokenType = AuthTokenType.permanent2fa;
    getUserDataSpy.and.returnValue({ tokenType });

    expect(authService.isSecondFactorAuthPassedAsTemporary()).toBeFalsy();
    expect(authService.getUserData).toHaveBeenCalled();
  });

  it('isSecondFactorAuthPassed should return true if passed temp/permament, otherwise false', () => {
    const permamentSpy: jasmine.Spy = spyOn(authService, 'isSecondFactorAuthPassedAsPermanent').and.returnValue(true);
    const temporarySpy: jasmine.Spy = spyOn(authService, 'isSecondFactorAuthPassedAsTemporary').and.returnValue(true);

    expect(authService.isSecondFactorAuthPassed()).toBeTruthy();
    expect(authService.isSecondFactorAuthPassedAsPermanent).toHaveBeenCalled();
    expect(authService.isSecondFactorAuthPassedAsTemporary).not.toHaveBeenCalled();

    permamentSpy.calls.reset();
    temporarySpy.calls.reset();
    permamentSpy.and.returnValue(false);
    temporarySpy.and.returnValue(true);

    expect(authService.isSecondFactorAuthPassed()).toBeTruthy();
    expect(authService.isSecondFactorAuthPassedAsPermanent).toHaveBeenCalled();
    expect(authService.isSecondFactorAuthPassedAsTemporary).toHaveBeenCalled();

    permamentSpy.calls.reset();
    temporarySpy.calls.reset();
    permamentSpy.and.returnValue(true);
    temporarySpy.and.returnValue(false);

    expect(authService.isSecondFactorAuthPassed()).toBeTruthy();
    expect(authService.isSecondFactorAuthPassedAsPermanent).toHaveBeenCalled();
    expect(authService.isSecondFactorAuthPassedAsTemporary).not.toHaveBeenCalled();

    permamentSpy.calls.reset();
    temporarySpy.calls.reset();
    permamentSpy.and.returnValue(false);
    temporarySpy.and.returnValue(false);

    expect(authService.isSecondFactorAuthPassed()).toBeFalsy();
    expect(authService.isSecondFactorAuthPassedAsPermanent).toHaveBeenCalled();
    expect(authService.isSecondFactorAuthPassedAsTemporary).toHaveBeenCalled();
  });

  it('resetTemporarySecondFactor should set window[IS_2FA_JUST_PASSED] to false and return Observable with true', () => {
    const temporarySpy: jasmine.Spy = spyOn(authService, 'isSecondFactorAuthPassedAsTemporary').and.returnValue(true);
    const asyncRefreshAccessTokenSpy: jasmine.Spy = spyOn(authService, 'asyncRefreshAccessToken').and.returnValue(of({} as LoginResponse));
    const sub: Subscription = authService.resetTemporarySecondFactor().subscribe((value: boolean) => {
      expect(value).toBeTruthy();
      expect(temporarySpy).toHaveBeenCalled();
      expect(asyncRefreshAccessTokenSpy).toHaveBeenCalled();
      expect(window[IS_2FA_JUST_PASSED]).toBeFalsy();
    });
    subscriptions.add(sub);
  });

  it('resetTemporarySecondFactor should return Observable with false', () => {
    const temporarySpy: jasmine.Spy = spyOn(authService, 'isSecondFactorAuthPassedAsTemporary').and.returnValue(false);
    const sub: Subscription = authService.resetTemporarySecondFactor().subscribe((value: boolean) => {
      expect(value).toBeFalsy();
      expect(temporarySpy).toHaveBeenCalled();
    });
    subscriptions.add(sub);
  });

  it('isSecondFactorJustPassed should return boolean value of window[IS_2FA_JUST_PASSED]', () => {
    window[IS_2FA_JUST_PASSED] = 'string';
    expect(authService.isSecondFactorJustPassed()).toBe(true);
  });

  it('setToken should call authService.checkToken if not empty token is passed', () => {
    const consoleSpy: jasmine.Spy = spyOn(console, 'error').and.returnValue(undefined);
    const token: any = new Array(5000);

    authService.setToken(token);
    expect(environmentConfigService.getConfig).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('setToken should return of(null), if tokens are same' , done => {
    const token: string = '1';
    spyOnProperty(authService, 'token').and.returnValue(token);

    const sub: Subscription = authService.setToken(token).subscribe((value: any) => {
      expect(value).toBeNull();
      done();
    });
    subscriptions.add(sub);
  });

  it('setToken sets the pe_auth_token cookie', () => {
    const token: string = '1';
    const httpSpy: jasmine.Spy = spyOn(http, 'post').and.returnValue(of({}));

    const sub: Subscription = authService.setToken(token).subscribe((value: any) => {
      expect(environmentConfigService.getConfig).toHaveBeenCalled();
      expect(environmentConfigService.isDev).toHaveBeenCalled();
      expect(cookieSetSpy).toHaveBeenCalledWith('pe_auth_token', token);
      expect(httpSpy.calls.mostRecent().args[0]).toEqual(`${proxy}/api/set-cookie/pe_auth_token/${token}`);
      expect(value).toBeNull();
    });
    subscriptions.add(sub);
  });

  it('setGuestToken sets the pe_guest_token cookie', () => {
    const token: string = '1';
    cookieGetSpy.and.returnValue('2');
    const httpSpy: jasmine.Spy = spyOn(http, 'post').and.returnValue(of({}));

    const sub: Subscription = authService.setGuestToken(token).subscribe((value: any) => {
      expect(environmentConfigService.getConfig).toHaveBeenCalled();
      expect(environmentConfigService.isDev).toHaveBeenCalled();
      expect(cookieSetSpy).toHaveBeenCalledWith('pe_guest_token', token);
      expect(httpSpy.calls.mostRecent().args[0]).toEqual(`${proxy}/api/set-cookie/pe_guest_token/${token}`);
      expect(value).toBeNull();
    });
    subscriptions.add(sub);
  });

  it('setRefreshToken sets the pe_refresh_token cookie', () => {
    const token: string = '1';
    const httpSpy: jasmine.Spy = spyOn(http, 'post').and.returnValue(of({}));

    const sub: Subscription = authService.setRefreshToken(token).subscribe((value: any) => {
      expect(environmentConfigService.getConfig).toHaveBeenCalled();
      expect(environmentConfigService.isDev).toHaveBeenCalled();
      expect(cookieSetSpy).toHaveBeenCalledWith('pe_refresh_token', token);
      expect(httpSpy.calls.mostRecent().args[0]).toEqual(`${proxy}/api/set-cookie/pe_refresh_token/${token}`);
      expect(value).toBeNull();
    });
    subscriptions.add(sub);
  });

  it('login should make login request', done => {
    const loginPayload: LoginPayload = { email: '1', plainPassword: '1'};
    const accessToken: string = '1';
    const refreshToken: string = '1';
    const httpSpy: jasmine.Spy = spyOn(http, 'post').and.returnValue(of({ accessToken, refreshToken }));
    const setTokenSpy: jasmine.Spy = spyOn(authService, 'setToken').and.returnValue(of(undefined));

    const sub: Subscription = authService.login(loginPayload).subscribe(() => {
      expect(httpSpy).toHaveBeenCalled();
      expect(httpSpy.calls.first().args[0]).toEqual(`${auth}/api/login`);
      expect(httpSpy.calls.mostRecent().args[0]).toEqual(`${proxy}/api/set-cookie/pe_refresh_token/${refreshToken}`);
      expect(setTokenSpy).toHaveBeenCalledWith(accessToken);
      done();
    });
    subscriptions.add(sub);
  });

  it('logout method should clear all tokens', done => {
    const setTokenSpy: jasmine.Spy = spyOn(authService, 'setToken').and.returnValue(of(undefined));
    const clearAuthSpy: jasmine.Spy = spyOn(authService, 'clearDevAuthToken').and.stub();
    const clearRefreshSpy: jasmine.Spy = spyOn(authService, 'clearDevRefreshToken').and.stub();
    const redirectSpy: jasmine.Spy = spyOn(authService, 'redirectToEntryPage').and.stub();
    const sub: Subscription = authService.logout().subscribe(() => {
      expect(setTokenSpy).toHaveBeenCalledWith('');
      expect(clearAuthSpy).toHaveBeenCalled();
      expect(clearRefreshSpy).toHaveBeenCalled();
      expect(redirectSpy).toHaveBeenCalled();
      done();
    });
    subscriptions.add(sub);
  });

  it('register method should make http request and set tokens', done => {
    const accessToken: string = '1';
    const refreshToken: string = '1';
    const setTokenSpy: jasmine.Spy = spyOn(authService, 'setToken').and.returnValue(of(undefined));
    const setRefreshTokenSpy: jasmine.Spy = spyOn(authService, 'setRefreshToken').and.returnValue(of(undefined));
    const httpSpy: jasmine.Spy = spyOn(http, 'post').and.returnValue(of({ accessToken, refreshToken }));
    const registerPayload: any = {email: 'email', first_name: 'name', last_name: 'name'};

    const sub: Subscription = authService.register(registerPayload).subscribe((value: string) => {
      expect(httpSpy.calls.mostRecent().args[0]).toEqual(`${auth}/api/register`);
      expect(httpSpy.calls.mostRecent().args[1]).toEqual(registerPayload);
      expect(setTokenSpy).toHaveBeenCalled();
      expect(setRefreshTokenSpy).toHaveBeenCalled();
      expect(value).toBe(accessToken);
      done();
    });
    subscriptions.add(sub);
  });

  it('secondFactorCode method should make http request and set tokens', done => {
    const accessToken: string = '1';
    const refreshToken: string = '1';
    const setTokenSpy: jasmine.Spy = spyOn(authService, 'setToken').and.returnValue(of(undefined));
    const setRefreshTokenSpy: jasmine.Spy = spyOn(authService, 'setRefreshToken').and.returnValue(of(undefined));
    const httpSpy: jasmine.Spy = spyOn(http, 'post').and.returnValue(of({ accessToken, refreshToken }));
    const secondFactorCode: string = 'code';

    const sub: Subscription = authService.secondFactorCode(secondFactorCode).subscribe((value: string) => {
      expect(httpSpy.calls.mostRecent().args[0]).toEqual(`${auth}/api/2fa/auth`);
      expect(httpSpy.calls.mostRecent().args[1]).toEqual({ secondFactorCode });
      expect(setTokenSpy).toHaveBeenCalled();
      expect(setRefreshTokenSpy).toHaveBeenCalled();
      expect(value).toBe(accessToken);
      expect(window[IS_2FA_JUST_PASSED]).toBeTruthy();
      done();
    });
    subscriptions.add(sub);
  });

  it('repeatSendCode method should make http request and set tokens', done => {
    const httpSpy: jasmine.Spy = spyOn(http, 'post').and.returnValue(of({}));

    const sub: Subscription = authService.repeatSendCode().subscribe(() => {
      expect(httpSpy.calls.mostRecent().args[0]).toEqual(`${auth}/api/2fa/resend`);
      done();
    });
    subscriptions.add(sub);
  });

  it('isAccessTokenExpired should return true if token expired', () => {
    const tokenSpy: jasmine.Spy = spyOnProperty(authService, 'token').and.returnValue('');

    expect(authService.isAccessTokenExpired()).toBeTruthy();
    expect(tokenSpy).toHaveBeenCalled();
  });

  it('isGuestTokenExpired should return true if token expired', () => {
    const tokenSpy: jasmine.Spy = spyOnProperty(authService, 'guestToken').and.returnValue('');

    expect(authService.isGuestTokenExpired()).toBeTruthy();
    expect(tokenSpy).toHaveBeenCalled();
  });

  it('isRefreshTokenExpired should return true if token expired', () => {
    const tokenSpy: jasmine.Spy = spyOnProperty(authService, 'refreshToken').and.returnValue('');

    expect(authService.isRefreshTokenExpired()).toBeTruthy();
    expect(tokenSpy).toHaveBeenCalled();
  });

  it('refreshAccessToken should update access token', () => {
    const asyncRefreshAccessTokenSpy: jasmine.Spy = spyOn(authService, 'asyncRefreshAccessToken').and.returnValue(of({} as LoginResponse));
    authService.refreshAccessToken();

    expect(asyncRefreshAccessTokenSpy).toHaveBeenCalled();
  });

  it('isPayeverBackend should check if domain is payever', () => {
    const wrongUrl: string = 'https://google.com';
    const correctUrl: string = 'a';

    expect(authService.isPayeverBackend(wrongUrl)).toBeFalsy();
    expect(authService.isPayeverBackend(correctUrl)).toBeTruthy();
  });

  it('asyncRefreshAccessToken should return of(null) if there is no refresh token', () => {
    spyOnProperty(authService, 'refreshToken').and.returnValue(null);

    const sub: Subscription = authService.asyncRefreshAccessToken().subscribe((value: any) => {
      expect(value).toBeNull();
    });
    subscriptions.add(sub);
  });

  it('asyncRefreshAccessToken make request and set tokens', done => {
    spyOnProperty(authService, 'refreshToken').and.returnValue('1');
    const accessToken: string = '1';
    const refreshToken: string = '1';
    const httpSpy: jasmine.Spy = spyOn(http, 'get').and.returnValue(of({ accessToken, refreshToken }));
    const setTokenSpy: jasmine.Spy = spyOn(authService, 'setToken').and.returnValue(of(undefined));
    const setRefreshTokenSpy: jasmine.Spy = spyOn(authService, 'setRefreshToken').and.returnValue(of(undefined));

    const sub: Subscription = authService.asyncRefreshAccessToken().subscribe((value: any) => {
      expect(httpSpy.calls.mostRecent().args[0]).toEqual(`${auth}/api/refresh`);
      expect(setTokenSpy).toHaveBeenCalledWith(accessToken);
      expect(setRefreshTokenSpy).toHaveBeenCalledWith(refreshToken);
      done();
    });
    subscriptions.add(sub);
  });

  it('refreshAccessToken$ should update access token and return observable', () => {
    const asyncRefreshAccessTokenSpy: jasmine.Spy = spyOn(authService, 'asyncRefreshAccessToken').and.returnValue(of({} as LoginResponse));
    authService.refreshAccessToken$();

    expect(asyncRefreshAccessTokenSpy).toHaveBeenCalled();
    expect(authService.refreshAccessToken$() instanceof Observable).toBeTruthy();
  });

  it('decodeTokenUser should throw if token is not jwt', () => {
    const token: string = '1';
    expect(() => authService.decodeTokenUser(token)).toThrow();
  });

  afterAll(() => {
    if (subscriptions) {
      subscriptions.unsubscribe();
    }
  });
});
