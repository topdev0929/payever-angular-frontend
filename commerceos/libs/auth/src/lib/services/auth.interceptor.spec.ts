import { HttpHeaders, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AuthInterceptor } from './auth.interceptor';
import { AuthHeadersEnum, PeAuthService } from './auth.service';
import { AuthPlatformService } from './platform.service';

describe('AuthInterceptor', () => {

  let interceptor: AuthInterceptor;
  let authService: jasmine.SpyObj<PeAuthService>;
  let platformService: jasmine.SpyObj<AuthPlatformService>;

  beforeEach(() => {

    const authServiceSpy = jasmine.createSpyObj<PeAuthService>('PeAuthService', [
      'isPayeverBackend',
      'isGuestTokenAllowed',
      'isGuestTokenExpired',
      'isAccessTokenExpired',
      'refreshAccessToken$',
      'isRefreshTokenExpired',
      'asyncRefreshAccessToken',
      'redirectToEntryPage',
    ]);

    const platformServiceSpy = jasmine.createSpyObj<AuthPlatformService>('AuthPlatformService', ['dispatchEvent']);

    TestBed.configureTestingModule({
      providers: [
        AuthInterceptor,
        { provide: PeAuthService, useValue: authServiceSpy },
        { provide: AuthPlatformService, useValue: platformServiceSpy },
      ],
    });

    interceptor = TestBed.inject(AuthInterceptor);
    authService = TestBed.inject(PeAuthService) as jasmine.SpyObj<PeAuthService>;
    platformService = TestBed.inject(AuthPlatformService) as jasmine.SpyObj<AuthPlatformService>;

  });

  it('should be defined', () => {

    expect(interceptor).toBeDefined();

  });

  it('should get auth service', () => {

    expect(interceptor.authService).toEqual(authService);

  });

  it('should get platform service', () => {

    expect(interceptor.platformService).toEqual(platformService);

  });

  it('should intercept', () => {

    let reqMock = new HttpRequest('POST', 'test.url', null, {
      headers: new HttpHeaders({
        [AuthHeadersEnum.anonym]: 'true',
      }),
    });
    const handlerMock = {
      handle: jasmine.createSpy('handle').and.returnValue(of({ test: true })),
    };
    const setTokenSpy = spyOn<any>(authService, 'setTokenHeader');
    const backSpy = spyOn(interceptor, 'backToDashboard');

    /**
     * request has header pe_anonym
     */
    interceptor.intercept(reqMock, handlerMock)
      .subscribe(result => expect(result).toEqual({ test: true } as any)).unsubscribe();

    expect(handlerMock.handle).toHaveBeenCalledWith(reqMock.clone({
      headers: reqMock.headers.delete(AuthHeadersEnum.anonym),
    }));

    /**
     * request has header refresh
     */
    authService[`refreshToken` as any] = 'refresh.token';
    reqMock = new HttpRequest('POST', 'test.url', null, {
      headers: new HttpHeaders({
        [AuthHeadersEnum.refresh]: 'true',
      }),
    });
    setTokenSpy.and.returnValue(reqMock);

    interceptor.intercept(reqMock, handlerMock).subscribe().unsubscribe();

    expect(setTokenSpy).toHaveBeenCalledWith(reqMock.clone({
      headers: reqMock.headers.delete(AuthHeadersEnum.refresh),
    }), 'refresh.token');
    expect(handlerMock.handle).toHaveBeenCalledWith(reqMock);

    /**
     * authService.isPayeverBackend returns FALSE
     */
    reqMock = new HttpRequest('GET', 'test.url', null);
    authService.isPayeverBackend.and.returnValue(false);

    interceptor.intercept(reqMock, handlerMock).subscribe().unsubscribe();

    expect(handlerMock.handle).toHaveBeenCalledWith(reqMock);

    /**
     * request does not have header authorization
     * url does not contain 'api/refresh'
     * with authService.guestToken
     * isGuestTokenAllowed returns TRUE
     * isGuestTokenExpired returns FALSE
     * handler.handle throws error 404
     */
    authService[`guestToken` as any] = 'guest.token';
    authService.isPayeverBackend.and.returnValue(true);
    authService.isGuestTokenAllowed.and.returnValue(true);
    authService.isGuestTokenExpired.and.returnValue(false);

    handlerMock.handle.and.returnValue(throwError({ status: 404 }));

    interceptor.intercept(reqMock, handlerMock).subscribe(
      () => { fail(); },
      error => expect(error.status).toBe(404),
    ).unsubscribe();

    expect(authService.isGuestTokenAllowed).toHaveBeenCalledWith(reqMock.url);
    expect(authService.isGuestTokenExpired).toHaveBeenCalled();
    expect(authService.asyncRefreshAccessToken).not.toHaveBeenCalled();
    expect(authService.redirectToEntryPage).not.toHaveBeenCalled();
    expect(setTokenSpy).toHaveBeenCalledWith(reqMock, 'guest.token');

    /**
     * isGuestTokenAllowed returns FALSE
     * isAccessTokenExpired returns FALSE
     * with authService.token
     * with authService.refreshToken
     * handler.handle throws error 403
     */
    authService.isGuestTokenAllowed.and.returnValue(false);
    authService.isAccessTokenExpired.and.returnValue(false);
    authService.asyncRefreshAccessToken.and.returnValue(of(() => { }) as any);
    authService[`token` as any] = 'token';
    authService[`refreshToken` as any] = 'refresh.token';

    handlerMock.handle.and.returnValue(throwError({ status: 403, url: 'test/error/url' }));

    interceptor.intercept(reqMock, handlerMock).subscribe(
      () => { fail(); },
      error => expect(error.status).toBe(403),
    ).unsubscribe();
    expect(authService.asyncRefreshAccessToken).toHaveBeenCalled();
    expect(authService.redirectToEntryPage).not.toHaveBeenCalled();

    /**
     * asyncRefreshAccessToken throws error 403
     */
    authService.asyncRefreshAccessToken.and.returnValue(throwError({ status: 403 }));

    interceptor.intercept(reqMock, handlerMock).subscribe(
      () => { fail(); },
      error => expect(error.status).toBe(403),
    ).unsubscribe();

    expect(authService.redirectToEntryPage).toHaveBeenCalledWith('/entry/login', location.pathname);

    /**
     * asyncRefreshAccessToken throws error 404
     * handler.handle throws error 401
     */
    authService.asyncRefreshAccessToken.and.returnValue(throwError({ status: 404 }));

    handlerMock.handle.and.returnValue(throwError({ status: 401, url: 'test/error/url' }));

    interceptor.intercept(reqMock, handlerMock).subscribe(
      () => { fail(); },
      error => expect(error.status).toBe(404),
    ).unsubscribe();

    /**
     * isAccessTokenExpired returns TRUE
     */
    authService.isAccessTokenExpired.and.returnValue(true);
    authService.refreshAccessToken$.and.returnValue(of({}));

    interceptor.intercept(reqMock, handlerMock).subscribe(
      () => { fail(); },
      error => expect(error.status).toBe(401),
    ).unsubscribe();

    expect(authService.refreshAccessToken$).toHaveBeenCalledTimes(1);

    /**
     * authService.token is null
     * isRefreshTokenExpired returns TRUE
     */
    authService[`token` as any] = null;
    authService.isRefreshTokenExpired.and.returnValue(true);

    interceptor.intercept(reqMock, handlerMock).subscribe(
      () => { fail(); },
      error => expect(error.status).toBe(404),
    ).unsubscribe();

    expect(backSpy).toHaveBeenCalled();

  });

  it('should set token header', () => {

    const reqMock = {
      clone: jasmine.createSpy('clone'),
    };

    interceptor[`setTokenHeader`](reqMock as any, 'token');

    expect(reqMock.clone).toHaveBeenCalledWith({
      setHeaders: {
        Authorization: 'Bearer token',
      },
    });

  });

  it('should go back to dashboard', () => {

    interceptor.backToDashboard();

    expect(platformService.dispatchEvent).toHaveBeenCalledWith({
      target: 'dashboard-blurry-backdrop',
      action: 'HideBackdrop',
    });
    expect(platformService.dispatchEvent).toHaveBeenCalledWith({
      target: 'dashboard-micro-container',
      action: 'InfoBox',
    });
    expect(platformService.dispatchEvent).toHaveBeenCalledWith({
      target: 'dashboard-back',
      action: '',
    });

  });

});
