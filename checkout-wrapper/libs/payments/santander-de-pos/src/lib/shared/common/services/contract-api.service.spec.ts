import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiErrorType, ErrorDetails } from '@pe/checkout/api';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../../test';

import { ContractApiService } from './contract-api.service';

describe('ContractApiService', () => {
  let service: ContractApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        ContractApiService, 
      ],
    });

    const store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    service = TestBed.inject(ContractApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('downloadContract', () => {
    it('should make an HTTP GET request with the correct URL', (done) => {
      const flowId = '123';
      const paymentMethod = PaymentMethodEnum.SANTANDER_POS_INSTALLMENT;
      const paymentId = '456';
      const businessId = '789';
      const expectedUrl = `/api/download-resource/business/${businessId}/integration/santander_pos_installment/action/contract?paymentId=${paymentId}`;
      const httpClientGetSpy = jest.spyOn(service['http'], 'get').mockReturnValue(of({}));

      service.downloadContract(flowId, paymentMethod, paymentId, businessId).subscribe(() => {
        expect(httpClientGetSpy).toHaveBeenCalledWith(expect.stringContaining(expectedUrl));
        done();
      });
    });

    it('should handle errors and log them using logError method', fakeAsync(() => {
      const flowId = '123';
      const paymentMethod = PaymentMethodEnum.SANTANDER_POS_INSTALLMENT;
      const paymentId = '456';
      const businessId = '789';
      const error = 'Mocked error';
      const httpClientGetSpy = jest.spyOn(service['http'], 'get').mockReturnValue(throwError(error));
      const logErrorSpy = jest.spyOn(service as any, 'logError').mockReturnValue(of(error));

      service.downloadContract(flowId, paymentMethod, paymentId, businessId).subscribe();
      tick();

      expect(httpClientGetSpy).toHaveBeenCalledWith(expect.any(String));
          expect(logErrorSpy).toHaveBeenCalledWith(
            error,
            flowId,
            paymentMethod,
            { url: expect.any(String), method: 'GET' },
          );
    }));
  });

  describe('logError', () => {
    it('should emit an API error using TrackingService and return throwError', (done) => {
      const flowId = '123';
      const paymentMethod = PaymentMethodEnum.SANTANDER_POS_INSTALLMENT;
      const details = { url: 'mocked-url', method: 'GET' } as ErrorDetails;
      const error = 'Mocked error';
      const doEmitApiErrorSpy = jest.spyOn(service['trackingService'], 'doEmitApiError');

      service['logError'](error, flowId, paymentMethod, details).pipe(
        catchError((err) => {
          expect(doEmitApiErrorSpy).toHaveBeenCalledWith(flowId, paymentMethod, ApiErrorType.ErrorEvent, details);
          expect(err).toBe(error);
          done();

          return of(null);
        })).subscribe();
    });
  });
});
