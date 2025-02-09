import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { AbstractApiService, ApiErrorType, TrackingService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { PaymentResponseWithStatus } from '../../../test/fixtures';

import { OpenbankApiService } from './openbank-api.service';

describe('OpenbankApiService', () => {
  let instance: OpenbankApiService;
  let httpTestingController: HttpTestingController;
  let env: EnvironmentConfigInterface;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        OpenbankApiService,
        MockProvider(NodeFlowService),
        TrackingService,
      ],
      declarations: [
      ],
    });
    instance = TestBed.inject(OpenbankApiService);
    env = TestBed.inject(PE_ENV);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(instance).toBeTruthy();
      expect(instance instanceof AbstractApiService).toBe(true);
    });
  });

  describe('service', () => {
    const flowId = 'flow-id';
    const paymentMethod = PaymentMethodEnum.ZINIA_INSTALLMENT;
    const connectionId = 'connection-id';
    const paymentId = 'payment-id';
    const nodeData = PaymentResponseWithStatus(null, null);
    const response = {
      ...nodeData,
      paymentDetails: {
        some_value: 'some_value',
      },
    };

    describe('Should log error', () => {
      const cases = {
        optVerify: () => instance.optVerify(flowId, paymentMethod, connectionId, nodeData),
        updateInfo: () => instance.updateInfo(flowId, paymentMethod, connectionId, paymentId, nodeData),
      };
      Object.entries(cases).forEach(([methodName, method], i) => {
        it(`${i}: ${methodName}`, (done) => {
          const doEmitApiError = jest.spyOn(TrackingService.prototype, 'doEmitApiError');
          method().pipe(
            catchError(() => {
              expect(doEmitApiError).toHaveBeenCalledWith(
                flowId,
                paymentMethod,
                ApiErrorType.ErrorSubmit,
                expect.anything()
              );
              done();

              return of(null);
            }),
          ).subscribe();
          const requests = httpTestingController.match(() => true);
          requests.forEach(req => req.flush({
            error: 'server is not in the mood',
          }, { status: 500, statusText: 'internal server error' }));
        });
      });
    });

    it('Should verify-otp-code', () => {
      const connectionId = 'connection-id';
      const data: PaymentInterface = {
        id: 'payment-id',
      };
      const result = { done: true };
      instance.optVerify('flow-id', PaymentMethodEnum.ZINIA_BNPL, connectionId, data).pipe(
        tap(res => expect(res).toEqual(result)),
      ).subscribe();
      const url = `${env.thirdParty.payments}/api/connection/${connectionId}/action/verify-otp-code`;

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(data);
      req.flush(result);
    });

    it('Should updateInfo', (done) => {
      instance.updateInfo(flowId, paymentMethod, connectionId, paymentId, nodeData).pipe(
        tap((result) => {
          expect(result).toEqual(response);
          done();
        }),
      ).subscribe();

      const url = `${env.thirdParty.payments}/api/connection/${connectionId}/action/update-details`;
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        ...nodeData,
        paymentId,
      });
      req.flush(response);
    });

  });
});
