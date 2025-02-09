import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpRequest, HttpHandler } from '@angular/common/http';
import { GetRequestsCachingInterceptor } from '../../../common';
import { Subscription } from 'rxjs';

describe('GetRequestsCachingInterceptor', () => {

  let httpTestingController: HttpTestingController;
  let interceptor: GetRequestsCachingInterceptor;
  const subscriptions: Subscription = new Subscription();

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        GetRequestsCachingInterceptor
      ]
    });

    httpTestingController = TestBed.get(HttpTestingController);
    interceptor = TestBed.get(GetRequestsCachingInterceptor);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should add Cache-Control and Pragma headers if type of request is GET', inject([HttpHandler], (next: HttpHandler) => {
    const reqUrl: string = '/test-url';
    const req: HttpRequest<any> = new HttpRequest('GET', reqUrl);

    const sub: Subscription = interceptor.intercept(req, next).subscribe();
    subscriptions.add(sub);

    const sendedRequest: HttpRequest<any> = httpTestingController.expectOne(reqUrl).request;
    expect(sendedRequest.headers.get('Cache-Control')).toEqual('no-cache');
    expect(sendedRequest.headers.get('Pragma')).toEqual('no-cache');
  }));

  it('should not add Cache-Control and Pragma headers if type of request is not GET', inject([HttpHandler], (next: HttpHandler) => {
    const reqUrl: string = '/test-url';
    const req: HttpRequest<any> = new HttpRequest('DELETE', reqUrl);

    const sub: Subscription = interceptor.intercept(req, next).subscribe();
    subscriptions.add(sub);

    const sendedRequest: HttpRequest<any> = httpTestingController.expectOne(reqUrl).request;
    expect(sendedRequest.headers.get('Cache-Control')).toBeNull();
    expect(sendedRequest.headers.get('Pragma')).toBeNull();
  }));

  afterAll(() => {
    if (subscriptions) {
      subscriptions.unsubscribe();
    }
  });
});
