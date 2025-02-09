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
  let instance: StripeApiService;
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
    instance = TestBed.inject(StripeApiService);
    env = TestBed.inject(PE_ENV);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(instance).toBeTruthy();
      expect(instance instanceof AbstractApiService).toBeTruthy();
    });
  });

  describe('service', () => {

    it('paymentPublishKey', (done) => {
      const paymentMethod = PaymentMethodEnum.STRIPE_IDEAL;
      const connectionId = 'connection-id';
      const nodeData = PaymentResponseWithStatus(null, null);
      const response: NodePaymentPreInitializeData = {
        publishKey: 'publish-key',
        totalCharge: 128,
      };
      instance.paymentPublishKey(paymentMethod, connectionId, nodeData).pipe(
        tap((result) => {
          expect(result).toEqual(response);
          done();
        })
      ).subscribe();
      const url = `${env.thirdParty.payments}/api/connection/${connectionId}/action/get-publish-key`;
      const paymentPublishKey = httpTestingController.expectOne(url);
      paymentPublishKey.flush(response);
    });

    it('should log http error', (done) => {
      const paymentMethod = PaymentMethodEnum.STRIPE_IDEAL;
      const connectionId = 'connection-id';
      const nodeData = PaymentResponseWithStatus(null, null);
      const logError = jest.spyOn(instance as any, 'logError');

      instance.paymentPublishKey(paymentMethod, connectionId, nodeData).subscribe({
        error: (err) => {
          expect(logError).toHaveBeenCalledWith(err, undefined, paymentMethod, { url, method: 'POST' });
          done();
        },
      });
      const url = `${env.thirdParty.payments}/api/connection/${connectionId}/action/get-publish-key`;
      const paymentPublishKey = httpTestingController.expectOne(url);
      paymentPublishKey.flush('nothing found', { status: 404, statusText: 'Not Found' });
    });
  });
});
