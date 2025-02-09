import { randomInt } from 'crypto';

import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { take, tap } from 'rxjs/operators';

import { ApiErrorType } from '@pe/checkout/api';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import {
  NodePaymentInterface,
  PaymentMethodEnum,
  PaymentSpecificStatusEnum,
  PaymentStatusEnum,
} from '@pe/checkout/types';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { PaymentResponseWithStatus } from '../../../test/fixtures';

import { SantanderSeApiService } from './santander-se-api.service';


describe('SantanderSeApiService', () => {
  let instance: SantanderSeApiService;
  let httpTestingController: HttpTestingController;
  let env: EnvironmentConfigInterface;
  let logError: jest.SpyInstance;
  const connectionId = 'connection-id';
  const flowId = 'flow-id';
  const paymentMethod = PaymentMethodEnum.SANTANDER_INSTALLMENT_SE;
  const paymentId = 'payment-id';
  const businessId = 'business-id';
  const ssn = 'social-security-number';
  const amount = 1000;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        SantanderSeApiService,
      ],
      declarations: [],
    });
    instance = TestBed.inject(SantanderSeApiService);
    env = TestBed.inject(PE_ENV);
    httpTestingController = TestBed.inject(HttpTestingController);

    logError = jest.spyOn(instance as any, 'logError');
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(instance).toBeTruthy();
    });
  });

  const getRadomResponse = () => ({
    id: randomInt(0, 1000),
  });

  describe('service', () => {
    it('startMobileSigning', (done) => {
      const paymentResponse = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_NEW,
        PaymentSpecificStatusEnum.NEED_MORE_INFO,
      );
      const url = `${env.thirdParty.payments}/api/connection/${connectionId}/action/start-mobile-signing`;
      instance.startMobileSigning(flowId, paymentMethod, connectionId, paymentId).pipe(
        take(1),
        tap((res) => {
          expect(res).toEqual(paymentResponse);
          done();
        }),
      ).subscribe();
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        paymentId,
      });
      req.flush(paymentResponse);
    });

    it('should startMobileSigning handle error', (done) => {
      const url = `${env.thirdParty.payments}/api/connection/${connectionId}/action/start-mobile-signing`;
      instance.startMobileSigning(flowId, paymentMethod, connectionId, paymentId).subscribe({
        error: (err) => {
          expect(logError).toHaveBeenCalledWith(
            err,
            flowId,
            paymentMethod,
            { url, method: 'POST' },
            ApiErrorType.ErrorSubmit,
          );
          done();
        },
      });
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        paymentId,
      });
      req.flush('submit error', { status: 400, statusText: 'Bad request' });
    });

    it('initiateAuthentication', (done) => {
      const response = getRadomResponse();
      const url = `${env.thirdParty.payments}/api/connection/${connectionId}/action/initiate-authentication`;
      instance.initiateAuthentication(ssn, connectionId).pipe(
        take(1),
        tap((res) => {
          expect(res).toEqual(response);
          done();
        }),
      ).subscribe();
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        socialSecurityNumber: ssn,
      });
      req.flush(response);
    });

    it('getAuthenticationStatus', (done) => {
      const response = getRadomResponse();
      const transactionId = 'transaction-id';
      const url = `${env.thirdParty.payments}/api/connection/${connectionId}/action/get-authentication-status`;
      instance.getAuthenticationStatus(transactionId, connectionId).pipe(
        take(1),
        tap((res) => {
          expect(res).toEqual(response);
          done();
        }),
      ).subscribe();
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        transactionId,
      });
      req.flush(response);
    });

    it('getSwedenSSNDetails', (done) => {
      const nodeData = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_NEW,
        PaymentSpecificStatusEnum.NEED_MORE_INFO,
      );
      const response = getRadomResponse();
      const url = `${env.thirdParty.payments}/api/business/${businessId}/connection/${connectionId}/action/get-address-by-ssn`;
      instance.getSwedenSSNDetails(paymentMethod, businessId, connectionId, nodeData, ssn, amount).pipe(
        take(1),
        tap((res) => {
          expect(res).toEqual(response);
          done();
        }),
      ).subscribe();
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        socialSecurityNumber: ssn,
        amount,
      });
      req.flush(response);
    });

    it('should getSwedenSSNDetails handle error', (done) => {
      const nodeData: NodePaymentInterface<any> = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_NEW,
        PaymentSpecificStatusEnum.NEED_MORE_INFO,
      );
      const url = `${env.thirdParty.payments}/api/business/${businessId}/connection/${connectionId}/action/get-address-by-ssn`;
      instance.getSwedenSSNDetails(paymentMethod, businessId, connectionId, nodeData, ssn, amount).subscribe({
        error: (err) => {
          expect(logError).toHaveBeenCalledWith(err, nodeData.payment.flowId, paymentMethod, { url, method: 'POST' });
          done();
        },
      });
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        socialSecurityNumber: ssn,
        amount,
      });
      req.flush('Bad request', { status: 400, statusText: 'Bad request' });
    });

    it('getApplication', (done) => {
      const inquiryId = 'inquiry-id';
      const nodeData = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_NEW,
        PaymentSpecificStatusEnum.NEED_MORE_INFO,
      );
      const response = getRadomResponse();
      const url = `${env.thirdParty.payments}/api/business/${businessId}/connection/${connectionId}/action/get-application`;
      instance.getApplication(paymentMethod, businessId, connectionId, nodeData, inquiryId).pipe(
        take(1),
        tap((res) => {
          expect(res).toEqual(response);
          done();
        }),
      ).subscribe();
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        inquiryId,
      });
      req.flush(response);
    });

    it('should getApplication handle error', (done) => {
      const inquiryId = 'inquiry-id';
      const nodeData: NodePaymentInterface<any> = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_NEW,
        PaymentSpecificStatusEnum.NEED_MORE_INFO,
      );
      const url = `${env.thirdParty.payments}/api/business/${businessId}/connection/${connectionId}/action/get-application`;
      instance.getApplication(paymentMethod, businessId, connectionId, nodeData, inquiryId).subscribe({
        error: (err) => {
          expect(logError).toHaveBeenCalledWith(err, nodeData.payment.flowId, paymentMethod, { url, method: 'POST' });
          done();
        },
      });
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        inquiryId,
      });
      req.flush('Bad request', { status: 400, statusText: 'Bad request' });
    });

    it('postMoreInfo', (done) => {
      const nodeData = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_NEW,
        PaymentSpecificStatusEnum.NEED_MORE_INFO,
      );
      const response = getRadomResponse();
      const url = `${env.thirdParty.payments}/api/connection/${connectionId}/action/update-payment-additional-info`;
      instance.postMoreInfo(paymentMethod, connectionId, paymentId, nodeData).pipe(
        take(1),
        tap((res) => {
          expect(res).toEqual(response);
          done();
        }),
      ).subscribe();
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        ...nodeData.paymentDetails,
        paymentId,
      });
      req.flush(response);
    });

    it('should postMoreInfo handle error', (done) => {
      const nodeData: NodePaymentInterface<any> = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_NEW,
        PaymentSpecificStatusEnum.NEED_MORE_INFO,
      );
      const url = `${env.thirdParty.payments}/api/connection/${connectionId}/action/update-payment-additional-info`;
      instance.postMoreInfo(paymentMethod, connectionId, paymentId, nodeData).subscribe({
        error: (err) => {
          expect(logError).toHaveBeenCalledWith(
            err,
            nodeData.payment.flowId,
            paymentMethod,
            { url, method: 'POST' },
            ApiErrorType.ErrorSubmit
          );
          done();
        },
      });
      const req = httpTestingController.expectOne(url);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toEqual({
        ...nodeData.paymentDetails,
        paymentId,
      });
      req.flush('Bad request', { status: 400, statusText: 'Bad request' });
    });

  });
});
