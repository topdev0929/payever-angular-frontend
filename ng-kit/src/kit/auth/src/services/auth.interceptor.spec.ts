import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { AuthInterceptor } from './auth.interceptor';
import { HttpRequest, HttpHeaders, HttpHandler } from '@angular/common/http';
import { AuthHeadersEnum, AuthService } from './auth.service';
import { PlatformService } from '../../../common';
import { EnvironmentConfigService, MicroRegistryService } from '../../..';
import { TranslateService } from '../../../i18n';
import { Router } from '@angular/router';
import { of, Subscription } from 'rxjs';
import { LoginResponse } from '../interfaces';

describe('AuthInterceptor', () => {

  let httpTestingController: HttpTestingController;
  let interceptor: AuthInterceptor;
  let authService: AuthService;
  let platformService: PlatformService;
  const subscriptions: Subscription = new Subscription();

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthInterceptor,
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
        }
      ]
    });

    httpTestingController = TestBed.get(HttpTestingController);
    interceptor = TestBed.get(AuthInterceptor);
    authService = TestBed.get(AuthService);
    platformService = TestBed.get(PlatformService);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should send request with deleted anonym header', inject([HttpHandler], (next: HttpHandler) => {
    const reqUrl: string = '/test-url';
    const headers: HttpHeaders = new HttpHeaders().append(AuthHeadersEnum.anonym, 'header');
    const req: HttpRequest<any> = new HttpRequest('GET', reqUrl, { headers });

    expect(req.headers.has(AuthHeadersEnum.anonym)).toBeTruthy();

    const sub: Subscription = interceptor.intercept(req, next).subscribe();
    subscriptions.add(sub);

    const sendedRequest: HttpRequest<any> = httpTestingController.expectOne(reqUrl).request;
    expect(sendedRequest.headers.has(AuthHeadersEnum.anonym)).toBeFalsy();
  }));

  it('should return new request with deleted refresh header and new auth token', inject([HttpHandler], (next: HttpHandler) => {
    const reqUrl: string = '/test-url';
    const headers: HttpHeaders = new HttpHeaders().append(AuthHeadersEnum.refresh, 'header');
    const req: HttpRequest<any> = new HttpRequest('GET', reqUrl, { headers });
    const token: string = '1';
    spyOnProperty(authService, 'refreshToken', 'get').and.returnValue(token);

    expect(req.headers.has(AuthHeadersEnum.refresh)).toBeTruthy();

    const sub: Subscription = interceptor.intercept(req, next).subscribe();
    subscriptions.add(sub);

    const sendedRequest: HttpRequest<any> = httpTestingController.expectOne(reqUrl).request;
    expect(sendedRequest.headers.has(AuthHeadersEnum.refresh)).toBeFalsy();
    expect(sendedRequest.headers.get('Authorization')).toEqual(`Bearer ${token}`);
  }));

  it('should return new request with no additional headers if url is not payever', inject([HttpHandler], (next: HttpHandler) => {
    const reqUrl: string = '/test-url';
    const req: HttpRequest<any> = new HttpRequest('GET', reqUrl);
    const checkSpy: jasmine.Spy = spyOn(authService, 'isPayeverBackend').and.returnValue(false);

    const sub: Subscription = interceptor.intercept(req, next).subscribe();
    subscriptions.add(sub);

    const sendedRequest: HttpRequest<any> = httpTestingController.expectOne(reqUrl).request;
    expect(checkSpy).toHaveBeenCalled();
    expect(sendedRequest.headers.keys().length).toBe(0);
  }));

  it('should add auth header with token to request', inject([HttpHandler], (next: HttpHandler) => {
    const reqUrl: string = '/test-url';
    const req: HttpRequest<any> = new HttpRequest('GET', reqUrl);
    const checkSpy: jasmine.Spy = spyOn(authService, 'isPayeverBackend').and.returnValue(true);
    const tokenExpiredSpy: jasmine.Spy = spyOn(authService, 'isAccessTokenExpired').and.returnValue(false);
    const token: string = '1';
    spyOnProperty(authService, 'token', 'get').and.returnValue(token);

    const sub: Subscription = interceptor.intercept(req, next).subscribe();
    subscriptions.add(sub);

    const sendedRequest: HttpRequest<any> = httpTestingController.expectOne(reqUrl).request;
    expect(checkSpy).toHaveBeenCalled();
    expect(tokenExpiredSpy).toHaveBeenCalled();
    expect(sendedRequest.headers.get('Authorization')).toEqual(`Bearer ${token}`);
  }));

  it('should add auth header with guest token to request', inject([HttpHandler], (next: HttpHandler) => {
    const reqUrl: string = '/test-url';
    const req: HttpRequest<any> = new HttpRequest('GET', reqUrl);
    const checkSpy: jasmine.Spy = spyOn(authService, 'isPayeverBackend').and.returnValue(true);
    const tokenExpiredSpy: jasmine.Spy = spyOn(authService, 'isGuestTokenExpired').and.returnValue(false);
    const guestToken: string = '1';
    spyOnProperty(authService, 'token', 'get').and.returnValue(null);
    spyOnProperty(authService, 'guestToken', 'get').and.returnValue(guestToken);

    const sub: Subscription = interceptor.intercept(req, next).subscribe();
    subscriptions.add(sub);

    const sendedRequest: HttpRequest<any> = httpTestingController.expectOne(reqUrl).request;
    expect(checkSpy).toHaveBeenCalled();
    expect(tokenExpiredSpy).toHaveBeenCalled();
    expect(sendedRequest.headers.get('Authorization')).toEqual(`Bearer ${guestToken}`);
  }));

  it('should add auth header with token to request if token expired', inject([HttpHandler], (next: HttpHandler) => {
    const reqUrl: string = '/test-url';
    const req: HttpRequest<any> = new HttpRequest('GET', reqUrl);
    const checkSpy: jasmine.Spy = spyOn(authService, 'isPayeverBackend').and.returnValue(true);
    const tokenExpiredSpy: jasmine.Spy = spyOn(authService, 'isAccessTokenExpired').and.returnValue(true);
    const refreshSpy: jasmine.Spy = spyOn(authService, 'refreshAccessToken$').and.returnValue(of({}));
    const token: string = '1';
    spyOnProperty(authService, 'token', 'get').and.returnValue(token);
    spyOnProperty(authService, 'guestToken', 'get').and.returnValue(null);

    const sub: Subscription = interceptor.intercept(req, next).subscribe();
    subscriptions.add(sub);

    const sendedRequest: HttpRequest<any> = httpTestingController.expectOne(reqUrl).request;
    expect(checkSpy).toHaveBeenCalled();
    expect(tokenExpiredSpy).toHaveBeenCalled();
    expect(refreshSpy).toHaveBeenCalled();
    expect(sendedRequest.headers.get('Authorization')).toEqual(`Bearer ${token}`);
  }));

  it('should add auth header with guest token to request', inject([HttpHandler], (next: HttpHandler) => {
    const reqUrl: string = '/test-url';
    const req: HttpRequest<any> = new HttpRequest('GET', reqUrl);
    const checkSpy: jasmine.Spy = spyOn(authService, 'isPayeverBackend').and.returnValue(true);
    const tokenExpiredSpy: jasmine.Spy = spyOn(authService, 'isRefreshTokenExpired').and.returnValue(true);
    const refreshToken: string = '1';
    spyOnProperty(authService, 'token', 'get').and.returnValue(null);
    spyOnProperty(authService, 'guestToken', 'get').and.returnValue(null);
    spyOnProperty(authService, 'refreshToken', 'get').and.returnValue(refreshToken);

    const sub: Subscription = interceptor.intercept(req, next).subscribe();
    subscriptions.add(sub);

    httpTestingController.expectOne(reqUrl);
    expect(platformService.backToDashboard).toHaveBeenCalled();
    expect(tokenExpiredSpy).toHaveBeenCalled();
    expect(checkSpy).toHaveBeenCalled();
  }));

  it('should correct handle 401 or 403 error', inject([HttpHandler], (next: HttpHandler) => {
    const reqUrl: string = '/test-url';
    const req: HttpRequest<any> = new HttpRequest('GET', reqUrl);
    const checkSpy: jasmine.Spy = spyOn(authService, 'isPayeverBackend').and.returnValue(true);
    const tokenExpiredSpy: jasmine.Spy = spyOn(authService, 'isRefreshTokenExpired').and.returnValue(true);
    const refreshSpy: jasmine.Spy = spyOn(authService, 'asyncRefreshAccessToken').and.returnValue(of({} as LoginResponse));
    const refreshToken: string = '1';
    const onResponseSpy: jasmine.Spy = jasmine.createSpy('onResponse');
    const status: number = 401;
    const statusText: string = 'error';
    const token: string = '';
    spyOnProperty(authService, 'token', 'get').and.returnValue(token);
    spyOnProperty(authService, 'guestToken', 'get').and.returnValue(null);
    spyOnProperty(authService, 'refreshToken', 'get').and.returnValue(refreshToken);

    const sub: Subscription = interceptor.intercept(req, next).subscribe(onResponseSpy);
    subscriptions.add(sub);

    const request: TestRequest = httpTestingController.expectOne(reqUrl);
    request.flush({}, { status, statusText });
    const sendedReq: HttpRequest<any> = httpTestingController.expectOne(reqUrl).request;
    expect(tokenExpiredSpy).toHaveBeenCalled();
    expect(checkSpy.calls.count()).toBe(2);
    expect(refreshSpy).toHaveBeenCalled();
    expect(sendedReq.headers.get('Authorization')).toEqual(`Bearer ${token}`);
  }));

  afterAll(() => {
    if (subscriptions) {
      subscriptions.unsubscribe();
    }
  });
});
