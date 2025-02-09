import { TestBed } from '@angular/core/testing';
import { Subscriber } from 'rxjs';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { InstantPaymentService, InstantPaymentActionEnum } from './instant-payment.service';


describe('InstantPaymentService', () => {
  let instantPaymentService: InstantPaymentService;

  const useBaseStyles = jest.fn();
  const finish = jest.fn();
  const abort = jest.fn();
  const init = jest.fn();
  const lang = jest.fn();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        InstantPaymentService,
      ],
  });
    instantPaymentService = TestBed.inject(InstantPaymentService);
    jest.spyOn(document.head, 'appendChild').mockImplementation(jest.fn());
    (window as any).xs2a = { useBaseStyles, finish, abort, init, lang };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should load instant payment and trigger Init action', (done) => {
    const mock = {
      type: 'text/javascript',
      src: 'https://api.xs2a.com/xs2a.js',
      onload: jest.fn(),
    };

    jest.spyOn(document, 'createElement').mockReturnValue(mock as any);

    instantPaymentService.load().subscribe((action) => {
      expect(action).toBe(InstantPaymentActionEnum.Init);
      done();
    });
    mock.onload();
  });

  it('should add styles if stylesheet link is not present', () => {
    const href = 'https://api.xs2a.com/xs2a.css';
    const linkSpy = jest.spyOn(document, 'createElement');
    jest.spyOn(document, 'querySelector').mockReturnValue(null);

    instantPaymentService['addStyles'](href);

    expect(linkSpy).toHaveBeenCalledWith('link');
  });

  it('should load instant payment with existing script and xs2a object', (done) => {
    jest.spyOn(document, 'querySelector').mockReturnValue(document.createElement('script'));

    instantPaymentService.load().subscribe((action) => {
      expect(action).toBe(InstantPaymentActionEnum.Init);
      expect((window as any).xs2a.useBaseStyles).toHaveBeenCalled();
      expect((window as any).xs2a.lang).toHaveBeenCalled();
      expect((window as any).xs2a.finish).toHaveBeenCalled();
      expect((window as any).xs2a.abort).toHaveBeenCalled();
      expect((window as any).xs2a.init).toHaveBeenCalled();
      done();
    });
  });

  it('should load instant payment with script onload event', (done) => {
    const mock = {
      type: 'text/javascript',
      src: 'https://api.xs2a.com/xs2a.js',
      onload: jest.fn(),
    };
    jest.spyOn(document, 'createElement').mockReturnValue(mock as any);
    jest.spyOn(document, 'querySelector').mockReturnValue(null);

    instantPaymentService.load().subscribe((action) => {
      expect(action).toBe(InstantPaymentActionEnum.Init);
      expect(document.head.appendChild).toHaveBeenCalled();
      done();
    });

    mock.onload();
  });

  it('should handle error when script fails to load', (done) => {

    jest.spyOn(document, 'createElement').mockImplementation(() => {
      throw new Error('Error');
    });

    instantPaymentService.load().subscribe({
      error: (error) => {
        expect(error).toBeTruthy();
        done();
      },
    });
  });

  it('should initEvents handle sub trigger', () => {
    const sub = new Subscriber();
    const next = jest.spyOn(sub, 'next');
    instantPaymentService['initEvents'](sub);
    expect(useBaseStyles).toHaveBeenCalled();
    expect(init).toHaveBeenCalled();
    expect(next).toHaveBeenNthCalledWith(1, InstantPaymentActionEnum.Init);
    finish.mock.calls[0][0]();
    expect(finish).toHaveBeenCalled();
    expect(next).toHaveBeenNthCalledWith(2, InstantPaymentActionEnum.Finish);
    abort.mock.calls[0][0]();
    expect(abort).toHaveBeenCalled();
    expect(next).toHaveBeenNthCalledWith(3, InstantPaymentActionEnum.Abort);
  });
});
