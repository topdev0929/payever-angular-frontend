import { HttpRequest } from '@angular/common/http';
import { of } from 'rxjs';
import { PeMessageAuthInterceptor } from './message-auth.interceptor';

describe('PeMessageAuthInterceptor', () => {

  const peAuthService = { token: null };
  const envConfig = {
    custom: {
      cdn: 'c-cdn',
      translation: 'c-translation',
    },
  };
  const interceptor = new PeMessageAuthInterceptor(peAuthService as any, envConfig as any);

  it('should be defined', () => {

    expect(interceptor).toBeDefined();

  });

  it('should intercept', () => {

    let req = new HttpRequest('GET', 'url/test');
    const nextMock = {
      handle: jasmine.createSpy('handle').and.returnValue(of({ test: true })),
    };
    const getItemSpy = spyOn(localStorage, 'getItem').and.returnValue('token');

    /**
     * req.url is 'url/test'
     */
    interceptor.intercept(req, nextMock).subscribe();

    expect(getItemSpy).toHaveBeenCalledWith('TOKEN');
    expect(nextMock.handle).toHaveBeenCalledWith(req.clone({
      setHeaders: {
        Authorization: 'Bearer token',
      },
    }));

    /**
     * req.url is 'url/c-translation
     */
    req = new HttpRequest('GET', 'url/c-translation');

    interceptor.intercept(req, nextMock).subscribe();

    expect(nextMock.handle).toHaveBeenCalledWith(req);

  });

});
