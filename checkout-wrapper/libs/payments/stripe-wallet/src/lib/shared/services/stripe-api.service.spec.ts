import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { tap } from 'rxjs/operators';

import { AbstractApiService } from '@pe/checkout/api';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { NodePaymentPreInitializeData, PaymentMethodEnum } from '@pe/checkout/types';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { PaymentResponseWithStatus } from '../../test/fixtures';

import { StripeApiService } from './stripe-api.service';

describe('StripeApiService', () => {
  let service: StripeApiService;
  let httpTestingController: HttpTestingController;
  let env: EnvironmentConfigInterface;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        StripeApiService,
      ],
    });
    service = TestBed.inject(StripeApiService);
    env = TestBed.inject(PE_ENV);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(service).toBeTruthy();
      expect(service instanceof AbstractApiService).toBeTruthy();
    });
  });

  describe('service', () => {

    it('paymentPreInitialize', (done) => {
      const paymentMethod = PaymentMethodEnum.GOOGLE_PAY;
      const connectionId = 'connection-id';
      const nodeData = PaymentResponseWithStatus(null, null);
      const response: NodePaymentPreInitializeData = {
        publishKey: 'publish-key',
        totalCharge: 128,
      };
      service.paymentPreInitialize(paymentMethod, connectionId, nodeData).pipe(
        tap((result) => {
          expect(result).toEqual(response);
          done();
        }),
      ).subscribe();
      const url = `${env.thirdParty.payments}/api/connection/${connectionId}/action/payment-pre-initialize`;
      const paymentPreInitialize = httpTestingController.expectOne(url);
      paymentPreInitialize.flush(response);
    });

    it('should paymentPreInitialize handle error', (done) => {
      const paymentMethod = PaymentMethodEnum.GOOGLE_PAY;
      const connectionId = 'connection-id';
      const nodeData = PaymentResponseWithStatus(null, null);
      const logError = jest.spyOn(service as any, 'logError');

      service.paymentPreInitialize(paymentMethod, connectionId, nodeData).subscribe(
        {
          error: (err) => {
            expect(logError).toHaveBeenCalledWith(
              err,
              undefined,
              paymentMethod,
              { url, method: 'POST' }
            );
            done();
          },
        },
      );
      const url = `${env.thirdParty.payments}/api/connection/${connectionId}/action/payment-pre-initialize`;
      const paymentPreInitialize = httpTestingController.expectOne(url);
      paymentPreInitialize.flush('nothing found', { status: 404, statusText: 'Not Found' });
    });
  });
});
