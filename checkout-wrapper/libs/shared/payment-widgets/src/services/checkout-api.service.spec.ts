import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { catchError, switchMap, take, tap } from 'rxjs/operators';

import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { CheckoutSettingsInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { CheckoutApiService } from './checkout-api.service';

describe('CheckoutApiService', () => {
  let service: CheckoutApiService;
  let httpTestingController: HttpTestingController;
  let env: EnvironmentConfigInterface;
  const businessUuid = 'business-uuid';
  const currency = 'EUR';
  const defaultConnectionId = 'default-connection-id';
  const channelSetId = 'channel-set-id';


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        CheckoutApiService,
      ],
    });

    httpTestingController = TestBed.inject(HttpTestingController);
    env = TestBed.inject(PE_ENV);
    service = TestBed.inject(CheckoutApiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    httpTestingController.verify();
  });

  it('should create an instance', () => {
    expect(service).toBeTruthy();
  });

  describe('getDefaultConnections', () => {
    const payment: PaymentMethodEnum = PaymentMethodEnum.SANTANDER_INSTALLMENT;
    const result = {
      _id: defaultConnectionId,
    };
    it('should fetch default-connections only once for each channelSetId, payment combination', () => {
      const url = `${env.backend.checkout}/api/channel-set/${channelSetId}/default-connection/${payment}`;
      const getCheckoutSettings = service.getDefaultConnections(channelSetId, payment).pipe(
        take(1),
        tap((settings) => {
          expect(settings).toMatchObject(result);
        }),
        switchMap(() => service.getDefaultConnections(channelSetId, payment)),
        tap((settings) => {
          expect(settings).toMatchObject(result);
        }),
      ).toPromise();

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      req.flush(result);

      return getCheckoutSettings;
    });

    it('should refetch default-connections on error', () => {
      const url = `${env.backend.checkout}/api/channel-set/${channelSetId}/default-connection/${payment}`;
      const getCheckoutSettings = service.getDefaultConnections(channelSetId, payment).pipe(
        take(1),
        catchError((err) => {
          expect(err.message).toContain('500 internal server error');

          return of(null);
        }),
        switchMap(() => service.getDefaultConnections(channelSetId, payment)),
        tap((settings) => {
          expect(settings).toMatchObject(result);
        }),
      ).toPromise();

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      req.flush('Bad request', { status: 500, statusText: 'internal server error' });
      httpTestingController.expectOne(url).flush(result);

      return getCheckoutSettings;
    });
  });

  describe('getCheckoutSettings', () => {
    const result: CheckoutSettingsInterface = {
      currency,
      businessUuid,
    };
    it('should fetch settings only once for each channelSetId', () => {
      const url = `${env.backend.checkout}/api/checkout/channel-set/${channelSetId}/full-settings`;
      const getCheckoutSettings = service.getCheckoutSettings(channelSetId).pipe(
        take(1),
        tap((settings) => {
          expect(settings).toMatchObject(result);
        }),
        switchMap(() => service.getCheckoutSettings(channelSetId)),
        tap((settings) => {
          expect(settings).toMatchObject(result);
        }),
      ).toPromise();

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      req.flush(result);

      return getCheckoutSettings;
    });

    it('should refetch settings on error', () => {
      const url = `${env.backend.checkout}/api/checkout/channel-set/${channelSetId}/full-settings`;
      const getCheckoutSettings = service.getCheckoutSettings(channelSetId).pipe(
        take(1),
        catchError((err) => {
          expect(err.message).toContain('500 internal server error');

          return of(null);
        }),
        switchMap(() => service.getCheckoutSettings(channelSetId)),
        tap((settings) => {
          expect(settings).toMatchObject(result);
        }),
      ).toPromise();

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      req.flush('Bad request', { status: 500, statusText: 'internal server error' });
      httpTestingController.expectOne(url).flush(result);

      return getCheckoutSettings;
    });
  });
});
