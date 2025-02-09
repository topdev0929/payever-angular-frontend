import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import * as Cookie from 'js-cookie';
import { of } from 'rxjs';

import { PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n';

import { AuthHeadersEnum, AuthTokenType, IErrorEntryResponse, PeAuthService } from './auth.service';
import { AuthPlatformService } from './platform.service';

describe('PeAuthService', () => {

  let service: PeAuthService;
  let http: HttpTestingController;
  let translateService: jasmine.SpyObj<TranslateService>;
  let router: jasmine.SpyObj<Router>;
  let platformService: jasmine.SpyObj<AuthPlatformService>;
  let env: any;

  beforeEach(() => {

    env = {
      backend: {
        auth: 'be-auth',
        payments: 'be-payments',
        connect: 'be-connect',
        billingSubscription: 'be-billing-subscription',
        paymentNotifications: 'be-payment-notifications',
      },
      connect: {
        test: 'ct-test',
      },
      payments: {
        test: 'p-test',
      },
      frontend: {
        commerceos: 'https://f-commerceos',
      },
      custom: {
        proxy: 'c-proxy',
      },
      thirdParty: {
        payments: 'tp-payments',
      },
    };

    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', {
      translate: 'translated',
    });

    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    const platformServiceSpy = jasmine.createSpyObj<AuthPlatformService>('AuthPlatformService', ['dispatchEvent']);
    platformServiceSpy[`observe$` as any] = of({
      target: 'auth_event',
      data: {
        refreshing: true,
      },
    });

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        PeAuthService,
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AuthPlatformService, useValue: platformServiceSpy },
        { provide: PE_ENV, useValue: env },
      ],
    });

    service = TestBed.inject(PeAuthService);
    http = TestBed.inject(HttpTestingController);
    translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    platformService = TestBed.inject(AuthPlatformService) as jasmine.SpyObj<AuthPlatformService>;

    window[`pe_isSecondFactorJustPassedAsTemporary`] = null;

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should set refreshing access token on construct', () => {

    expect(service[`refreshingAccessToken`]).toBe(true);

  });

  it('should get env', () => {

    expect(service[`env`]).toEqual(env);

  });

  it('should get token', () => {

    const cookieName = 'pe_auth_token';

    /**
     * token has not been set in cookies
     */
    expect(service.token).toEqual('');

    /**
     * token has been set in cookies
     */
    Cookie.set('pe_auth_token', 'token');

    expect(service.token).toEqual('token');

    Cookie.remove(cookieName);

  });

  it('should get guest token', () => {

    const cookieName = 'pe_guest_token';

    /**
     * guestToken has not been set in localStorage
     */
    expect(service.guestToken).toEqual('');

    /**
     * guestToken has been set in localStorage
     */
    localStorage.setItem(cookieName, 'guest.token');

    expect(service.guestToken).toEqual('guest.token');

    // clear storage to prevent failure of other tests
    localStorage.clear();

  });

  it('should get refresh token', () => {

    const cookieName = 'pe_refresh_token';

    /**
     * refreshToken has not been set in cookies
     */
    expect(service.refreshToken).toEqual('');

    /**
     * refreshToken has been set in cookies
     */
    Cookie.set(cookieName, 'refresh.token');

    expect(service.refreshToken).toEqual('refresh.token');

    Cookie.remove(cookieName);

  });

  it('should get preferred checkout token', () => {

    const guestExpiredSpy = spyOn(service, 'isGuestTokenExpired').and.returnValue(true);
    const accessExpiredSpy = spyOn(service, 'isAccessTokenExpired').and.returnValue(true);

    /**
     * window.location.hostname != commerceos
     * guestToken has not been set
     * token has not been set
     */
    expect(service.prefferedCheckoutToken).toBeNull();
    expect(guestExpiredSpy).not.toHaveBeenCalled();
    expect(accessExpiredSpy).not.toHaveBeenCalled();

    /**
     * token has been set
     */
    spyOnProperty(service, 'token').and.returnValue('token');
    accessExpiredSpy.and.returnValue(false);

    expect(service.prefferedCheckoutToken).toEqual('token');
    expect(accessExpiredSpy).toHaveBeenCalled();
    expect(guestExpiredSpy).not.toHaveBeenCalled();

    /**
     * guestToken has been set
     */
    spyOnProperty(service, 'guestToken').and.returnValue('guest.token');
    guestExpiredSpy.and.returnValue(false);

    expect(service.prefferedCheckoutToken).toEqual('guest.token');
    expect(guestExpiredSpy).toHaveBeenCalled();

    /**
     * window.location.hostname = commerceos
     */
    guestExpiredSpy.calls.reset();
    accessExpiredSpy.calls.reset();

    env.frontend.commerceos = `https://${window.location.hostname}`;

    expect(service.prefferedCheckoutToken).toEqual('token');
    expect(guestExpiredSpy).not.toHaveBeenCalled();
    expect(accessExpiredSpy).not.toHaveBeenCalled();

  });

  it('should set refresh login data', () => {

    const setSpy = spyOn(localStorage, 'setItem');
    const data = {
      activeBusiness: null,
      email: 'data.email',
    };
    spyOn(service, 'getUserData').and.returnValue({ email: null } as any);

    /**
     * set refreshLoginData without activeBusiness
     */
    service.refreshLoginData = data;

    expect(setSpy).not.toHaveBeenCalled();

    /**
     * set refreshLoginData with activeBusiness
     */
    data.activeBusiness = { id: 'ab-001' };
    service.refreshLoginData = data;

    expect(setSpy).toHaveBeenCalledTimes(2);
    expect(setSpy).toHaveBeenCalledWith('pe_active_business', JSON.stringify(data.activeBusiness));
    expect(setSpy).toHaveBeenCalledWith('pe_user_email', 'data.email');

  });

  it('should get refresh login data', () => {

    const data = {
      activeBusiness: { id: 'ab-001' },
      email: 'data.email',
    };
    const getItemSpy = spyOn(localStorage, 'getItem').and.callThrough();

    localStorage.setItem('pe_active_business', JSON.stringify(data.activeBusiness));
    localStorage.setItem('pe_user_email', data.email);

    expect(service.refreshLoginData).toEqual(data);
    expect(getItemSpy).toHaveBeenCalledTimes(2);
    expect(getItemSpy).toHaveBeenCalledWith('pe_active_business');
    expect(getItemSpy).toHaveBeenCalledWith('pe_user_email');

    localStorage.clear();

  });

  it('should get token query param', () => {

    const enabledSpy = spyOn<any>(service, 'isLocalStorageEnabled').and.returnValue(false);
    const tokenSpy = spyOnProperty(service, 'guestToken').and.returnValue(null);

    /**
     * isLocalStorageEnabled returns FALSE
     * guestToken has not been set
     */
    expect(service.guestTokenQueryParam).toBeNull();
    expect(enabledSpy).toHaveBeenCalled();
    expect(tokenSpy).toHaveBeenCalled();

    /**
     * guestToken has been set
     */
    tokenSpy.and.returnValue('guest.token');

    expect(service.guestTokenQueryParam).toEqual({ guest_token: 'guest.token' });

  });

  it('should get user data', () => {

    const initSpy = spyOn<any>(service, '_initTokenData').and.callFake(() => {
      service[`_authUserData`] = {
        uuid: 'uid-001',
        email: 'user.email',
      } as any;
    });

    expect(service.getUserData()).toEqual({
      uuid: 'uid-001',
      email: 'user.email',
    } as any);
    expect(initSpy).toHaveBeenCalled();

  });

  it('should get refresh token data', () => {

    const jwtMock = {
      decodeToken: jasmine.createSpy('decodeToken').and.returnValue({
        payload: { decoded: true },
      }),
    };

    service[`jwtHelper` as any] = jwtMock;

    spyOnProperty(service, 'refreshToken').and.returnValues(null, 'refresh.token');

    /**
     * refreshToken has not been set
     */
    expect(service.getRefershTokenData()).toEqual({});

    /**
     * refreshToken has been set
     */
    expect(service.getRefershTokenData()).toEqual({ decoded: true } as any);

  });

  it('should check is admin', () => {

    const getUserDataSpy = spyOn(service, 'getUserData').and.returnValue({ roles: null } as any);

    /**
     * getUserData returns mock data in which roles is null
     */
    expect(service.isAdmin()).toBe(false);
    expect(getUserDataSpy).toHaveBeenCalled();

    /**
     * getUserData returns mock data with roles
     */
    getUserDataSpy.and.returnValue({ roles: [{ name: 'admin' }] } as any);

    expect(service.isAdmin()).toBe(true);

  });

  it('should check is second factor auth passed as permanent', () => {

    const getUserDataSpy = spyOn(service, 'getUserData').and.returnValue({ tokenType: AuthTokenType.permanent2fa } as any);

    expect(service.isSecondFactorAuthPassedAsPermanent()).toBe(true);
    expect(getUserDataSpy).toHaveBeenCalled();

  });

  it('should check is second factor auth passed as temporary', () => {

    const getUserDataSpy = spyOn(service, 'getUserData').and.returnValue({ tokenType: AuthTokenType.temporary2fa } as any);

    expect(service.isSecondFactorAuthPassedAsTemporary()).toBe(true);
    expect(getUserDataSpy).toHaveBeenCalled();

  });

  it('should check is second factor auth passed', () => {

    const permSpy = spyOn(service, 'isSecondFactorAuthPassedAsPermanent').and.returnValue(false);
    const tempSpy = spyOn(service, 'isSecondFactorAuthPassedAsTemporary').and.returnValue(true);

    expect(service.isSecondFactorAuthPassed()).toBe(true);
    expect(permSpy).toHaveBeenCalled();
    expect(tempSpy).toHaveBeenCalled();

  });

  it('should reset temporary second factor', () => {

    const tempSpy = spyOn(service, 'isSecondFactorAuthPassedAsTemporary').and.returnValue(false);
    const asyncRefreshSpy = spyOn(service, 'asyncRefreshAccessToken').and.returnValue(of({}) as any);

    /**
     * isSecondFactorAuthPassedAsTemporary returns FALSE
     */
    service.resetTemporarySecondFactor().subscribe(result => expect(result).toBe(false)).unsubscribe();

    expect(tempSpy).toHaveBeenCalled();
    expect(asyncRefreshSpy).not.toHaveBeenCalled();

    /**
     * isSecondFactorAuthPassedAsTemporary returns TRUE
     */
    tempSpy.and.returnValue(true);

    service.resetTemporarySecondFactor().subscribe(result => expect(result).toBe(true)).unsubscribe();

    expect(asyncRefreshSpy).toHaveBeenCalled();
    expect(window['pe_isSecondFactorJustPassedAsTemporary']).toBe(false);

  });

  it('should check is second factor just passed', () => {

    /**
     * IS_2FA_JUST_PASSED has not been set in window object
     */
    expect(service.isSecondFactorJustPassed()).toBe(false);

    /**
     * IS_2FA_JUST_PASSED has been set in window object
     */
    window['pe_isSecondFactorJustPassedAsTemporary'] = true;

    expect(service.isSecondFactorJustPassed()).toBe(true);

  });

  it('should set tokens', () => {

    const tokens = {
      accessToken: 'token',
      refreshToken: 'refresh.token',
      guestToken: 'guest.token',
    };
    const spies = {
      accessToken: spyOn(service, 'setToken').and.returnValue(of(() => { }) as any),
      refreshToken: spyOn(service, 'setRefreshToken').and.returnValue(of(() => { }) as any),
      guestToken: spyOn(service, 'setGuestToken').and.returnValue(of(() => { }) as any),
    };

    /**
     * without any token given in argument for setTokens function
     */
    service.setTokens({}).subscribe().unsubscribe();

    Object.values(spies).forEach(spy => expect(spy).not.toHaveBeenCalled());

    /**
     * with all tokens in argument for setTokens function
     */
    service.setTokens(tokens).subscribe().unsubscribe();

    Object.keys(spies).forEach((key) => {
      expect(spies[key]).toHaveBeenCalledWith(tokens[key]);
    });

  });

  it('should clear session', () => {

    const setSpy = spyOn(service, 'setTokens').and.returnValue(of(null));

    service.clearSession();

    expect(setSpy).toHaveBeenCalledWith({ accessToken: '', refreshToken: '', guestToken: '' });

  });

  it('should set token', () => {

    const cookieName = 'pe_auth_token';
    const cookieSetSpy = spyOn(Cookie, 'set');
    const cookieRemoveSpy = spyOn(Cookie, 'remove');
    const tokenSpy = spyOnProperty(service, 'token').and.returnValue('token');
    const checkSpy = spyOn<any>(service, 'checkToken');
    const setGuestTokenSpy = spyOn(service, 'setGuestToken').and.returnValue(of(null));
    const isDevSpy = spyOn(service, 'isDev').and.returnValue(false);
    const createAnonymHeaderSpy = spyOn<any>(service, 'createAnonymHeader');
    const errorSpy = spyOn(console, 'error');
    let url = `${env.custom.proxy}/api/set-cookie/pe_auth_token/token`;
    let req: TestRequest;

    /**
     * argument for setToken and service.token are identical
     */
    service.setToken('token').subscribe().unsubscribe();

    http.expectNone(url);
    expect(checkSpy).toHaveBeenCalled();
    expect(setGuestTokenSpy).toHaveBeenCalled();

    /**
     * argument for setToken is '' (emtpy string)
     * so argument and service.token are not identical
     * service.isDev returns FALSE
     */
    service.setToken('').subscribe();

    url = `${env.custom.proxy}/api/set-cookie/pe_auth_token/`;
    req = http.expectOne(url);

    expect(isDevSpy).toHaveBeenCalled();
    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});
    expect(createAnonymHeaderSpy).toHaveBeenCalledWith({
      withCredentials: true,
    });
    expect(cookieRemoveSpy).toHaveBeenCalledWith(cookieName);
    expect(cookieSetSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    req.flush(null);

    /**
     * service.isDev returns TRUE
     * service.token is null
     */
    tokenSpy.and.returnValue(null);
    isDevSpy.and.returnValue(true);

    service.setToken('test.token').subscribe();

    expect(cookieSetSpy).toHaveBeenCalledWith(cookieName, 'test.token');

    url = `${env.custom.proxy}/api/set-cookie/pe_auth_token/test.token`;
    req = http.expectOne(url);
    req.flush(null);

    expect(errorSpy).toHaveBeenCalled();

  });

  it('should set guest token', () => {

    const cookieName = 'pe_guest_token';
    const setItemSpy = spyOn(localStorage, 'setItem');
    const removeItemSpy = spyOn(localStorage, 'removeItem');
    const tokenSpy = spyOnProperty(service, 'guestToken').and.returnValue('guest.token');
    const checkSpy = spyOn<any>(service, 'checkToken');
    const errorSpy = spyOn(console, 'error');

    /**
     * argument for setGuestToken and service.guestToken are identical
     */
    service.setGuestToken('guest.token').subscribe();

    expect(checkSpy).toHaveBeenCalledWith(cookieName, 'guest.token');
    expect(setItemSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(removeItemSpy).not.toHaveBeenCalled();

    /**
     * argument for setGuestToken is '' (empty string)
     * service.guestToken is null
     */
    checkSpy.calls.reset();
    tokenSpy.and.returnValue(null);

    service.setGuestToken(null).subscribe();

    expect(checkSpy).not.toHaveBeenCalled();
    expect(setItemSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(removeItemSpy).toHaveBeenCalledWith(cookieName);

    /**
     * argument for setGuestToken and service.guestToken are not identical
     * service.guestToken is 'guest.token'
     */
    setItemSpy.calls.reset();
    removeItemSpy.calls.reset();
    tokenSpy.and.returnValue('guest.token');

    service.setGuestToken('test.guest.token').subscribe();

    expect(setItemSpy).toHaveBeenCalledWith(cookieName, 'test.guest.token');
    expect(errorSpy).not.toHaveBeenCalled();
    expect(removeItemSpy).not.toHaveBeenCalled();

    /**
     * service.guestToken is null
     */
    tokenSpy.and.returnValue(null);

    service.setGuestToken('test.guest.token').subscribe();

    expect(errorSpy).toHaveBeenCalled();

  });

  it('should set refresh token', () => {

    const cookieName = 'pe_refresh_token';
    const cookieSetSpy = spyOn(Cookie, 'set');
    const cookieRemoveSpy = spyOn(Cookie, 'remove');
    const tokenSpy = spyOnProperty(service, 'refreshToken').and.returnValue('refresh.token');
    const checkSpy = spyOn<any>(service, 'checkToken');
    const isDevSpy = spyOn(service, 'isDev').and.returnValue(false);
    const createAnonymHeaderSpy = spyOn<any>(service, 'createAnonymHeader');
    const errorSpy = spyOn(console, 'error');
    let url = `${env.custom.proxy}/api/set-cookie/pe_refresh_token/refresh.token`;
    let req: TestRequest;

    /**
     * argument for setRefreshToken and service.refreshToken are identical
     */
    service.setRefreshToken('refresh.token').subscribe();

    expect(checkSpy).toHaveBeenCalledWith(cookieName, 'refresh.token');
    expect(isDevSpy).not.toHaveBeenCalled();
    expect(cookieSetSpy).not.toHaveBeenCalled();
    expect(cookieRemoveSpy).not.toHaveBeenCalled();
    expect(createAnonymHeaderSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    http.expectNone(url);

    /**
     * argument for setRefreshToken is '' (empty string)
     * service.isDev returns FALSE
     */
    checkSpy.calls.reset();

    service.setRefreshToken('').subscribe();

    expect(checkSpy).not.toHaveBeenCalled();
    expect(cookieSetSpy).not.toHaveBeenCalled();
    expect(cookieRemoveSpy).toHaveBeenCalledWith(cookieName);

    url = `${env.custom.proxy}/api/set-cookie/pe_refresh_token/`;
    req = http.expectOne(url);
    req.flush(null);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});
    expect(createAnonymHeaderSpy).toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    /**
     * guest.refreshToken is null
     * service.isDev returns TRUE
     */
    cookieRemoveSpy.calls.reset();
    tokenSpy.and.returnValue(null);
    isDevSpy.and.returnValue(true);

    service.setRefreshToken('test.refresh.token').subscribe();

    url = `${env.custom.proxy}/api/set-cookie/pe_refresh_token/test.refresh.token`;
    req = http.expectOne(url);
    req.flush(null);

    expect(cookieSetSpy).toHaveBeenCalledWith(cookieName, 'test.refresh.token');
    expect(cookieRemoveSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();

  });

  it('should login', () => {

    const data = {
      email: 'email',
      plainPassword: 'pass',
    };
    const nextSpy = spyOn(service[`onChangeSubject`], 'next');
    const createAnonymHeaderSpy = spyOn<any>(service, 'createAnonymHeader');
    const createErrorBagSpy = spyOn<any>(service, 'createErrorBag');
    const setTokenSpy = spyOn(service, 'setToken').and.returnValue(of(null));
    const setRefreshTokenSpy = spyOn(service, 'setRefreshToken').and.returnValue(of(null));
    const response = {
      accessToken: null,
      refreshToken: 'refresh.token',
    };
    const url = `${env.backend.auth}/api/login`;
    let req: TestRequest;

    /**
     * http request throws error 404
     */
    createErrorBagSpy.and.returnValue({ error: 'created.errorbag' });

    service.login(data).subscribe(
      () => { fail(); },
      error => expect(error.error).toEqual('created.errorbag'),
    );

    req = http.expectOne(url);
    req.flush('Not found', {
      status: 404,
      statusText: 'Not found',
    });

    expect(createErrorBagSpy).toHaveBeenCalled();
    expect(nextSpy).not.toHaveBeenCalled();
    expect(createAnonymHeaderSpy).toHaveBeenCalled();
    expect(setTokenSpy).not.toHaveBeenCalled();
    expect(setRefreshTokenSpy).not.toHaveBeenCalled();

    /**
     * http request returns data with tokens
     * accessToken in request response is null
     */
    createErrorBagSpy.calls.reset();
    setRefreshTokenSpy.and.callFake(() => {
      response.accessToken = 'token';

      return of(null);
    });

    service.login(data).subscribe(token => expect(token).toEqual('token'));

    req = http.expectOne(url);
    req.flush(response);

    expect(setTokenSpy).not.toHaveBeenCalled();
    expect(setRefreshTokenSpy).toHaveBeenCalledWith(response.refreshToken);
    expect(nextSpy).toHaveBeenCalled();
    expect(createErrorBagSpy).not.toHaveBeenCalled();

    /**
     * accessToken in request response is 'token'
     */
    service.login(data).subscribe(token => expect(token).toEqual('token'));

    req = http.expectOne(url);
    req.flush(response);

    expect(setTokenSpy).toHaveBeenCalledWith(response.accessToken);

  });

  it('should logout', () => {

    const setTokenSpy = spyOn(service, 'setToken').and.returnValue(of(null));
    const isDevSpy = spyOn(service, 'isDev').and.returnValue(false);
    const clearDevAuthTokenSpy = spyOn(service, 'clearDevAuthToken');
    const clearDevRefreshTokenSpy = spyOn(service, 'clearDevRefreshToken');
    const setRefreshTokenSpy = spyOn(service, 'setRefreshToken').and.returnValue(of(null));
    const redirectSpy = spyOn(service, 'redirectToEntryPage');
    const nextSpy = spyOn(service[`onChangeSubject`], 'next');

    router[`url` as any] = 'router.url';

    /**
     * service.isDev returns FALSE
     */
    service.logout().subscribe().unsubscribe();

    expect(setTokenSpy).toHaveBeenCalledWith('');
    expect(isDevSpy).toHaveBeenCalledTimes(2);
    expect(clearDevAuthTokenSpy).not.toHaveBeenCalled();
    expect(clearDevRefreshTokenSpy).not.toHaveBeenCalled();
    expect(setRefreshTokenSpy).toHaveBeenCalledWith('');
    expect(service[`_authUserData`]).toBeNull();
    expect(redirectSpy).toHaveBeenCalledWith('entry/refresh-login', router.url);
    expect(nextSpy).toHaveBeenCalled();

    /**
     * service.isDev returns TRUE
     */
    isDevSpy.and.returnValue(true);

    service.logout().subscribe().unsubscribe();

    expect(clearDevAuthTokenSpy).toHaveBeenCalled();
    expect(clearDevRefreshTokenSpy).toHaveBeenCalled();

  });

  it('should clear dev auth token', () => {

    const cookieName = 'pe_auth_token';
    const setSpy = spyOnProperty(document, 'cookie', 'set');

    service.clearDevAuthToken();

    expect(setSpy).toHaveBeenCalledWith(`${cookieName}=;path=/`);

  });

  it('should clear dev refresh token', () => {

    const cookieName = 'pe_refresh_token';
    const setSpy = spyOnProperty(document, 'cookie', 'set');

    service.clearDevRefreshToken();

    expect(setSpy).toHaveBeenCalledWith(`${cookieName}=;path=/`);

  });

  it('should register', () => {

    const createErrorBagSpy = spyOn<any>(service, 'createErrorBag').and.returnValue({ error: 'created.errorbag' });
    const setTokenSpy = spyOn(service, 'setToken').and.returnValue(of(null));
    const setRefreshTokenSpy = spyOn(service, 'setRefreshToken').and.returnValue(of(null));
    const data = { email: 'email' } as any;
    const response = {
      accessToken: 'token',
      refreshToken: 'refresh.token',
    };
    const registerUrl = `${env.backend.auth}/api/register`;
    const userUrl = `${env.backend.users}/api/user`;
    let req: TestRequest;

    /**
     * request throws error 404
     * argument config for register function is null
     */
    service.register(data).subscribe(
      () => { fail(); },
      error => expect(error.error).toEqual('created.errorbag'),
    );

    req = http.expectOne(registerUrl);
    req.flush('Error', {
      status: 404,
      statusText: 'Not found',
    });

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual(data);
    expect(createErrorBagSpy).toHaveBeenCalled();
    expect(setTokenSpy).not.toHaveBeenCalled();
    expect(setRefreshTokenSpy).not.toHaveBeenCalled();
    http.expectNone(userUrl);

    /**
     * request returns mock data
     */
    createErrorBagSpy.calls.reset();

    service.register(data).subscribe(token => expect(token).toEqual('token'));

    req = http.expectOne(registerUrl);
    req.flush(response);

    expect(createErrorBagSpy).not.toHaveBeenCalled();
    expect(setTokenSpy).toHaveBeenCalledWith(response.accessToken);
    expect(setRefreshTokenSpy).toHaveBeenCalledWith(response.refreshToken);
    http.expectNone(userUrl);

    /**
     * argument config for register function is mocked
     */
    service.register(data, { test: true } as any).subscribe(token => expect(token).toEqual('token'));

    req = http.expectOne(registerUrl);
    req.flush(response);

    req = http.expectOne(userUrl);
    req.flush(null);

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ test: true } as any);

  });

  it('should set second factor code', () => {

    const createRefreshHeaderSpy = spyOn<any>(service, 'createRefreshHeader');
    const setTokenSpy = spyOn(service, 'setToken').and.returnValue(of(null));
    const setRefreshTokenSpy = spyOn(service, 'setRefreshToken').and.returnValue(of(null));
    const createErrorBagSpy = spyOn<any>(service, 'createErrorBag').and.returnValue({ error: 'created.errorbag' });
    const url = `${env.backend.auth}/api/2fa/auth`;
    const respone = {
      accessToken: 'token',
      refreshToken: 'refresh.token',
    };
    let req: TestRequest;

    /**
     * request throws error 404
     */
    service.secondFactorCode('2fc').subscribe(
      () => { fail(); },
      error => expect(error.error).toEqual('created.errorbag'),
    );

    req = http.expectOne(url);
    req.flush('Error', {
      status: 404,
      statusText: 'Not found',
    });

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({ secondFactorCode: '2fc' });
    expect(createRefreshHeaderSpy).toHaveBeenCalled();
    expect(createErrorBagSpy).toHaveBeenCalled();
    expect(setTokenSpy).not.toHaveBeenCalled();
    expect(setRefreshTokenSpy).not.toHaveBeenCalled();
    expect(window[`pe_isSecondFactorJustPassedAsTemporary`]).toBeNull();

    /**
     * request returns mocked data
     */
    createErrorBagSpy.calls.reset();

    service.secondFactorCode('2fc').subscribe(token => expect(token).toEqual('token'));

    req = http.expectOne(url);
    req.flush(respone);

    expect(createErrorBagSpy).not.toHaveBeenCalled();
    expect(setTokenSpy).toHaveBeenCalledWith(respone.accessToken);
    expect(setRefreshTokenSpy).toHaveBeenCalledWith(respone.refreshToken);
    expect(window[`pe_isSecondFactorJustPassedAsTemporary`]).toBe(true);

  });

  it('should repeat send code', () => {

    const createErrorBagSpy = spyOn<any>(service, 'createErrorBag').and.returnValue({ error: 'created.errorbag' });
    const createRefreshHeaderSpy = spyOn<any>(service, 'createRefreshHeader');
    const url = `${env.backend.auth}/api/2fa/resend`;
    let req: TestRequest;

    /**
     * request throws error 404
     */
    service.repeatSendCode().subscribe(
      () => { fail(); },
      error => expect(error.error).toEqual('created.errorbag'),
    );

    req = http.expectOne(url);
    req.flush('Error', {
      status: 404,
      statusText: 'Not found',
    });

    expect(req.request.method).toEqual('POST');
    expect(req.request.body).toEqual({});
    expect(createRefreshHeaderSpy).toHaveBeenCalled();
    expect(createErrorBagSpy).toHaveBeenCalled();

    /**
     * request returns null
     */
    createErrorBagSpy.calls.reset();

    service.repeatSendCode().subscribe(result => expect(result).toBeUndefined());

    req = http.expectOne(url);
    req.flush(null);

    expect(createErrorBagSpy).not.toHaveBeenCalled();

  });

  it('should check is access token expired', () => {

    const jwtMock = {
      isTokenExpired: jasmine.createSpy('isTokenExpired').and.returnValue(true),
    };

    spyOnProperty(service, 'token').and.returnValue('token');
    service[`jwtHelper` as any] = jwtMock;

    expect(service.isAccessTokenExpired()).toBe(true);
    expect(jwtMock.isTokenExpired).toHaveBeenCalledWith('token');

  });

  it('should check is guest token expired', () => {

    const jwtMock = {
      isTokenExpired: jasmine.createSpy('isTokenExpired').and.returnValue(true),
    };

    spyOnProperty(service, 'guestToken').and.returnValue('guest.token');
    service[`jwtHelper` as any] = jwtMock;

    expect(service.isGuestTokenExpired()).toBe(true);
    expect(jwtMock.isTokenExpired).toHaveBeenCalledWith('guest.token');

  });

  it('should check is refresh token expired', () => {

    const jwtMock = {
      isTokenExpired: jasmine.createSpy('isTokenExpired').and.returnValue(true),
    };

    spyOnProperty(service, 'refreshToken').and.returnValue('refresh.token');
    service[`jwtHelper` as any] = jwtMock;

    expect(service.isRefreshTokenExpired()).toBe(true);
    expect(jwtMock.isTokenExpired).toHaveBeenCalledWith('refresh.token');

  });

  it('should refresh access token', () => {

    const spy = spyOn<any>(service, '_refreshAccessToken');

    service.refreshAccessToken();
    expect(spy).toHaveBeenCalled();

  });

  it('should check is guest token allowed', () => {

    const getSpy = spyOn<any>(service, 'getUrlHostname').and.callFake(url => url);
    const url = env.backend.payments;
    const urls = [
      env.backend.payments,
      env.backend.connect,
      env.backend.billingSubscription,
      env.backend.paymentNotifications,
      env.thirdParty.payments,
    ];

    /**
     * environment config is set
     */
    expect(service.isGuestTokenAllowed(url)).toBe(true);
    urls.forEach(u => expect(getSpy).toHaveBeenCalledWith(u));

    /**
     * environment config is not set
     */
    getSpy.calls.reset();
    Object.defineProperty(service, 'env', { value: null });

    expect(service.isGuestTokenAllowed(url)).toBe(false);

  });

  it('should check is payever backend', () => {

    const getSpy = spyOn<any>(service, 'getUrlHostname').and.callFake(url => url);
    const url = env.backend.auth;
    const urls = [
      ...Object.values(env.backend),
      ...Object.values(env.connect),
      ...Object.values(env.thirdParty),
      ...Object.values(env.payments),
    ];

    /**
     * evnironment config is set
     */
    expect(service.isPayeverBackend(url)).toBe(true);
    expect(service.isPayeverDomain('test')).toBe(false);
    urls.forEach(u => expect(getSpy).toHaveBeenCalledWith(u));

    /**
     * environment config does not have properties:
     * backend
     * connect
     * thirdParty
     * payments
     */
    delete env.backend;
    delete env.connect;
    delete env.thirdParty;
    delete env.payments;

    expect(service.isPayeverBackend(url)).toBe(false);

    /**
     * environment config is not set
     */
    Object.defineProperty(service, 'env', { value: null });

    expect(service.isPayeverBackend(url)).toBe(false);

  });

  it('should check is payever domain', () => {

    const getSpy = spyOn<any>(service, 'getUrlHostname').and.callFake(url => url);
    const url = env.backend.auth;

    /**
     * environment config is set
     */
    expect(service.isPayeverDomain(url)).toBe(true);
    expect(service.isPayeverDomain('test')).toBe(false);
    expect(getSpy).toHaveBeenCalled();

    /**
     * environment config is not set
     */
    Object.defineProperty(service, 'env', { value: null });

    expect(service.isPayeverDomain(url)).toBe(false);

  });

  it('should check is commerceos domain', () => {

    let url = env.backend.auth;
    spyOn<any>(service, 'getUrlHostname').and.callFake(url => url);

    /**
     * environment config is set
     * url is not commerceos domain
     */
    expect(service.isCommerceosDomain(url)).toBe(false);

    /**
     * url is commerceos domain
     */
    url = env.frontend.commerceos;
    expect(service.isCommerceosDomain(url)).toBe(true);

    /**
     * environment config is not set
     */
    Object.defineProperty(service, 'env', { value: null });
    expect(service.isCommerceosDomain(url)).toBe(false);

  });

  it('should refresh access token async', fakeAsync(() => {

    const url = `${env.backend.auth}/api/refresh`;
    const setTokenSpy = spyOn(service, 'setToken').and.returnValue(of(null));
    const setRefreshTokenSpy = spyOn(service, 'setRefreshToken').and.returnValue(of(null));
    const createRefreshHeaderSpy = spyOn<any>(service, 'createRefreshHeader');
    const refreshTokenSpy = spyOnProperty(service, 'refreshToken');
    const response = {
      accessToken: 'token',
      refreshToken: null,
    };
    let req: TestRequest;

    /**
     * environment config is not set
     */
    Object.defineProperty(service, 'env', { value: null });
    service.asyncRefreshAccessToken().subscribe(result => expect(result).toBeNull());

    /**
     * environment config is set
     * service.refreshToken is null
     */
    Object.defineProperty(service, 'env', { value: { backend: { auth: 'be-auth' } } });
    service.asyncRefreshAccessToken().subscribe(result => expect(result).toBeNull());

    // error part of the original code is not correct
    // it throws error if it returns null after 10000msec delay

    /**
     * service.refreshToken is set
     * request returns mocked data
     * refreshToken in mocked data is null
     */
    refreshTokenSpy.and.returnValue('refresh.token');

    service.asyncRefreshAccessToken().subscribe(result => expect(result).toEqual(response));

    req = http.expectOne(url);
    req.flush(response);

    expect(req.request.method).toEqual('GET');
    expect(createRefreshHeaderSpy).toHaveBeenCalled();
    expect(setTokenSpy).toHaveBeenCalledWith(response.accessToken);
    expect(setRefreshTokenSpy).not.toHaveBeenCalled();

    /**
     * refreshToken in mocked data is set
     */
    response.refreshToken = 'refresh.token';

    service.asyncRefreshAccessToken().subscribe(result => expect(result).toEqual(response));

    req = http.expectOne(url);
    req.flush(response);

    expect(setRefreshTokenSpy).toHaveBeenCalledWith(response.refreshToken);

  }));

  it('should refresh access token $', () => {

    const refreshSpy = spyOn<any>(service, '_refreshAccessToken');

    service.refreshAccessToken$().subscribe(result => expect(result).toBe(false));

    expect(refreshSpy).toHaveBeenCalled();

  });

  it('should decode token user', () => {

    const jwtMock = {
      decodeToken: jasmine.createSpy('decodeToken').and.returnValue(null),
    };

    service[`jwtHelper` as any] = jwtMock;

    expect(service.decodeTokenUser('token')).toEqual({});

  });

  it('should redirect to entry page', () => {

    const route = 'route.url';

    env.frontend.commerceos = window.location.origin;

    service.redirectToEntryPage(route, 'current.route');

    expect(router.navigate).toHaveBeenCalledWith([route], { queryParams: { returnUrl: 'current.route' } });

  });

  it('should check token', () => {

    const errorSpy = spyOn(console, 'error');
    const isDevSpy = spyOn(service, 'isDev').and.returnValue(true);
    let generatedToken = '';

    for (let i = 0; i <= 4096; i++) {
      generatedToken += 'a';
    }

    /**
     * argument token for checkToken function is null
     * service.isDev returns TRUE
     */
    service[`checkToken`]('accessToken', null);

    expect(errorSpy).not.toHaveBeenCalled();
    expect(isDevSpy).toHaveBeenCalled();

    /**
     * service.isDev returns FALSE
     * proxy in environment config is undefined
     */
    isDevSpy.and.returnValue(false);
    env.custom.proxy = undefined;

    service[`checkToken`]('accessToken', null);

    expect(errorSpy).toHaveBeenCalledWith('Variable "custom.proxy" in "env.json" is not set!', 'accessToken', 0);

    /**
     * argument token's length is more than 4096
     */
    service[`checkToken`]('accessToken', generatedToken);

    expect(errorSpy).toHaveBeenCalledWith('Token is too long', 'accessToken', generatedToken.length);

  });

  it('should init token data', () => {

    const user = {
      id: 'u-001',
      email: 'email',
      first_name: 'James',
      last_name: 'Bond',
      roles: [],
      tokenType: AuthTokenType.default,
    };
    const decodeSpy = spyOn(service, 'decodeTokenUser').and.returnValue(user);
    const tokenSpy = spyOnProperty(service, 'token').and.returnValue(null);

    /**
     * service.token is null
     */
    service[`_initTokenData`]();

    expect(decodeSpy).not.toHaveBeenCalled();
    expect(service['_authUserData']).toBeNull();

    /**
     * service.token is 'token'
     */
    tokenSpy.and.returnValue('token');

    service[`_initTokenData`]();

    expect(decodeSpy).toHaveBeenCalledWith('token');
    expect(service[`_authUserData`]).toEqual({
      uuid: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      roles: user.roles,
      tokenType: user.tokenType,
    });

  });

  it('should refresh access token - private', () => {

    const asyncSpy = spyOn(service, 'asyncRefreshAccessToken').and.returnValue(of({}) as any);

    /**
     * service.refreshingAccessToken is TRUE
     */
    service[`refreshingAccessToken`] = true;
    service[`_refreshAccessToken`]();

    expect(platformService.dispatchEvent).not.toHaveBeenCalled();
    expect(asyncSpy).not.toHaveBeenCalled();

    /**
     * service.refreshingAccessToken is FALSE
     */
    service[`refreshingAccessToken`] = false;
    service[`_refreshAccessToken`]();

    expect(service[`refreshingAccessToken`]).toBe(true);
    expect(platformService.dispatchEvent).toHaveBeenCalledWith({
      target: 'auth_event',
      action: 'refreshing_token',
      data: {
        refreshing: true,
      },
    });
    expect(asyncSpy).toHaveBeenCalled();
    expect(platformService.dispatchEvent).toHaveBeenCalledWith({
      target: 'auth_event',
      action: 'refreshing_token',
      data: {
        refreshing: false,
      },
    });

  });

  it('should create error bag', () => {

    const errors = {
      error: {
        errors: null,
        reason: 'REASON_NO_CAPTCHA',
        message: 'error.error.message',
        statusCode: 401,
      },
      message: 'error.message',
    } as IErrorEntryResponse;

    /**
     * running test with mocked errors data
     *
     * errors.error.statusCode is 401
     * errors.error.reason is REASON_NO_CAPTCHA
     * errors.error.message is set
     */
    expect(service[`createErrorBag`](errors)).toEqual({
      errorBag: {
        email: errors.error.message,
      },
      raw: errors.error,
      message: errors.error.message,
    });

    /**
     * errors.error.reason is null
     * errors.error.message is null
     */
    errors.error.reason = null;
    errors.error.message = null;

    expect(service[`createErrorBag`](errors)).toEqual({
      errorBag: {
        email: 'translated',
        plainPassword: 'translated',
      },
      raw: errors.error,
    });
    expect(translateService.translate).toHaveBeenCalledWith('forms.error.unauthorized.invalid_credentials');
    expect(translateService.translate).toHaveBeenCalledWith('forms.error.unauthorized.invalid_credentials');

    /**
     * errors.error.statusCode is 400
     * errors.error.errors is null
     */
    errors.error.statusCode = 400;

    expect(service[`createErrorBag`](errors)).toEqual({
      errorBag: {},
      raw: errors.error,
    });

    /**
     * typeof errors.error.errors is object
     */
    errors.error.errors = {
      email: { message: 'email.error' },
      plainPassword: { message: null },
    } as any;

    expect(service[`createErrorBag`](errors)).toEqual({
      errorBag: {
        email: 'email.error',
      },
      raw: errors.error,
    });

    /**
     * typeof errors.error.errors is array
     */
    errors.error.errors = [
      {
        children: [],
        constraints: {
          required: 'email.required',
        },
        property: 'email',
        value: null,
      },
    ];

    expect(service[`createErrorBag`](errors)).toEqual({
      errorBag: {
        email: 'translated',
      },
      raw: errors.error,
    });

    /**
     * errors.error.statusCode is 500
     */
    errors.error.statusCode = 500;

    expect(service[`createErrorBag`](errors)).toEqual({
      errorBag: {},
      raw: errors.error,
    });

  });

  it('should create anonym header', () => {

    expect(service[`createAnonymHeader`]()).toEqual({
      headers: {
        [AuthHeadersEnum.anonym]: 'true',
      },
    });

  });

  it('should create refresh header', () => {

    expect(service[`createRefreshHeader`]()).toEqual({
      headers: {
        [AuthHeadersEnum.refresh]: 'true',
      },
    });

  });

  it('should get url hostname', () => {

    const url = 'https://payever.de/test';

    expect(service[`getUrlHostname`](url)).toEqual('payever.de');

  });

  it('should check if local storage enabled', () => {

    expect(service[`isLocalStorageEnabled`]()).toBe(true);

  });

  afterAll(() => {

    window[`pe_isSecondFactorJustPassedAsTemporary`] = null;
    http.verify();

  });

});
