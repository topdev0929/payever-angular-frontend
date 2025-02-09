import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { tap } from 'rxjs/operators';

import { ApiErrorType, ErrorDetails, TrackingService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { ContractApiService } from './contract-api.service';

describe('ContractApiService', () => {
  let instance: ContractApiService;
  let httpTestingController: HttpTestingController;
  let env: EnvironmentConfigInterface;
  let trackingService: TrackingService;

  const flowId = 'flow-id';
  const paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT_SE;
  const payment: PaymentInterface = {
    id: 'payment-id',
  };
  const error = new Error('test error');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        ContractApiService,
        MockProvider(NodeFlowService),
        MockProvider(TrackingService),
      ],
      declarations: [],
    });
    instance = TestBed.inject(ContractApiService);
    trackingService = TestBed.inject(TrackingService);
    env = TestBed.inject(PE_ENV);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(instance).toBeTruthy();
    });
  });

  describe('service', () => {
    it('Should preform the correct req on  doSignContract', () => {
      const result = { done: true };
      instance.doSignContract(flowId, paymentMethod, payment).pipe(
        tap(res => expect(res).toEqual(result)),
      ).subscribe();
      const url = `${env.backend.payments}/api/rest/v1/checkout/sign-contract/${payment.id}`;
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      req.flush(result);
    });

    it('Should doSignContract handle error', (done) => {
      const logError = jest.spyOn(instance as any, 'logError');
      instance.doSignContract(flowId, paymentMethod, payment).subscribe({
        error: (err) => {
          expect(logError).toHaveBeenCalledWith(err, flowId, paymentMethod, { url, method: 'GET' });
          done();
        },
      },
      );
      const url = `${env.backend.payments}/api/rest/v1/checkout/sign-contract/${payment.id}`;
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('GET');
      req.flush('nothing found', { status: 404, statusText: 'Not Found' });
    });

    it('should log error emit error to tracking service', () => {
      const url = `${env.backend.payments}/api/rest/v1/checkout/sign-contract/${payment.id}`;
      const details: ErrorDetails = { url, method: 'GET' };
      const doEmitApiError = jest.spyOn(trackingService, 'doEmitApiError');

      instance['logError'](error, flowId, paymentMethod, details);
      expect(doEmitApiError).toHaveBeenCalledWith(flowId, paymentMethod, ApiErrorType.ErrorEvent, details);
    });
  });
});
