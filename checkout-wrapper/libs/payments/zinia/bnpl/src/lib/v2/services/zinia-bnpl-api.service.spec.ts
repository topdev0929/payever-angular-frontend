import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { tap } from 'rxjs/operators';

import { AbstractApiService, ApiErrorType, TrackingService } from '@pe/checkout/api';
import { NodeFlowService } from '@pe/checkout/node-api';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { ZiniaBNPLApiService } from './zinia-bnpl-api.service';

describe('ZiniaBnplApiService', () => {
  let instance: ZiniaBNPLApiService;
  let httpTestingController: HttpTestingController;
  let env: EnvironmentConfigInterface;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        ZiniaBNPLApiService,
        MockProvider(NodeFlowService),
        MockProvider(TrackingService),
      ],
      declarations: [],
    });
    instance = TestBed.inject(ZiniaBNPLApiService);
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
    const connectionId = 'connection-id';
    const data: PaymentInterface = {
      id: 'payment-id',
    };
    const nodeData: any = {
      nodeData: 'some-data',
    };
    const flowId = 'flow-id';
    const paymentId = 'payment-id';
    const paymentMethod = PaymentMethodEnum.ZINIA_BNPL;
    const result = { done: true };

    it('Should verify-otp-code on optVerify', () => {
      instance.optVerify(flowId, paymentMethod, connectionId, data).pipe(
        tap(res => expect(res).toEqual(result)),
      ).subscribe();
      const url = `${env.thirdParty.payments}/api/connection/${connectionId}/action/verify-otp-code`;

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(data);
      req.flush(result);
    });

    it('Should handle error on optVerify', (done) => {
      const logError = jest.spyOn(instance as any, 'logError');

      instance.optVerify(flowId, paymentMethod, connectionId, data).subscribe({
        error: (err) => {
          expect(logError).toHaveBeenCalledWith(
            err,
            flowId,
            paymentMethod,
            { url, method: 'POST' },
            ApiErrorType.ErrorSubmit
          );
          done();
        },
      });
      const url = `${env.thirdParty.payments}/api/connection/${connectionId}/action/verify-otp-code`;

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual(data);
      req.flush('nothing found', { status: 404, statusText: 'Not Found' });
    });

    it('should update-details on updateInfo', () => {
      instance.updateInfo(flowId, paymentMethod, connectionId, paymentId, nodeData).pipe(
        tap(res => expect(res).toEqual(result)),
      ).subscribe();
      const url = `${env.thirdParty.payments}/api/connection/${connectionId}/action/update-details`;

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({ ...nodeData, paymentId });
      req.flush(result);
    });

    it('Should handle error on updateInfo', (done) => {
      const logError = jest.spyOn(instance as any, 'logError');

      instance.updateInfo(flowId, paymentMethod, connectionId, paymentId, nodeData).subscribe({
        error: (err) => {
          expect(logError).toHaveBeenCalledWith(
            err,
            flowId,
            paymentMethod,
            { url, method: 'POST' },
            ApiErrorType.ErrorSubmit
          );
          done();
        },
      });
      const url = `${env.thirdParty.payments}/api/connection/${connectionId}/action/update-details`;

      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({ ...nodeData, paymentId });
      req.flush('nothing found', { status: 404, statusText: 'Not Found' });
    });
  });
});
