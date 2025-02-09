import { HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { catchError } from 'rxjs/operators';

import { TrackingService } from '@pe/checkout/api';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { flowWithPaymentOptionsFixture } from '../../test';
import { SendDocument, WebIDIdentMode } from '../types';

import { SantanderDeApiService } from './api.service';

describe('SantanderDeApiService', () => {
  let service: SantanderDeApiService;
  let httpTestingController: HttpTestingController;
  let store: Store;
  let env: EnvironmentConfigInterface;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        SantanderDeApiService,
      ],
    });

    service = TestBed.inject(SantanderDeApiService);
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    env = TestBed.inject(PE_ENV);
    httpTestingController = TestBed.inject(HttpTestingController);

  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Constructor', () => {
    it('Should create service instance', () => {
      expect(service).toBeDefined();
    });
  });

  describe('service', () => {
    describe('sendDocuments', () => {
      it('should sendDocuments', (done) => {
        const flow = flowWithPaymentOptionsFixture();
        const paymentId = 'payment-id';
        const flowId = flow.id;
        const paymentMethod = flow.paymentOptions[0].paymentMethod;
        const connectionId = flow.connectionId;
        const docs: SendDocument[] = [];

        const mockResponse = {
          status: 'ok',
        };

        service.sendDocuments(
          docs,
          paymentId,
          flowId,
          paymentMethod,
          connectionId
        ).subscribe((response) => {
          expect(response).toEqual(mockResponse);
          done();
        });
        const expectedUrl = `${env.thirdParty.payments}/api/connection/${connectionId}/action/send-documents`;
        const req = httpTestingController.expectOne(expectedUrl);
        expect(req.request.method).toEqual('POST');
        req.flush(mockResponse);
      });

      it('should handel errors', (done) => {
        const logError = jest.spyOn(TrackingService.prototype, 'doEmitApiError');
        const flow = flowWithPaymentOptionsFixture();
        const paymentId = 'payment-id';
        const flowId = flow.id;
        const paymentMethod = flow.paymentOptions[0].paymentMethod;
        const connectionId = flow.connectionId;
        const docs: SendDocument[] = [];

        service.sendDocuments(
          docs,
          paymentId,
          flowId,
          paymentMethod,
          connectionId
        ).pipe(
          catchError(() => {
            done();

            return null;
          })
        ).subscribe();
        const expectedUrl = `${env.thirdParty.payments}/api/connection/${connectionId}/action/send-documents`;
        const req = httpTestingController.expectOne(expectedUrl);
        expect(req.request.method).toEqual('POST');
        req.flush('nothing found', { status: 404, statusText: 'Not Found' });
        expect(logError).toBeCalled();
      });
    });
  });

  describe('getWebIDIdentificationURL', () => {

    it('should getWebIDIdentificationURL', (done) => {
      const flow = flowWithPaymentOptionsFixture();
      const paymentId = 'payment-id';
      const flowId = flow.id;
      const paymentMethod = flow.paymentOptions[0].paymentMethod;
      const connectionId = flow.connectionId;
      const identMode = WebIDIdentMode.PayIdent;
      const mockResponse = {
        status: 'ok',
      };

      service.getWebIDIdentificationURL(
        identMode,
        flowId,
        paymentMethod,
        connectionId,
        paymentId
      ).subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });
      const expectedUrl = `${env.thirdParty.payments}/api/connection/${connectionId}/action/start-identification`;
      const req = httpTestingController.expectOne(expectedUrl);
      expect(req.request.method).toEqual('POST');
      expect(req.request.body).toMatchObject({
        paymentId, identMode,
      });
      req.flush(mockResponse);
    });

    it('should handel errors', (done) => {
      const logError = jest.spyOn(TrackingService.prototype, 'doEmitApiError');
      const flow = flowWithPaymentOptionsFixture();
      const paymentId = 'payment-id';
      const flowId = flow.id;
      const paymentMethod = flow.paymentOptions[0].paymentMethod;
      const connectionId = flow.connectionId;
      const identMode = WebIDIdentMode.PayIdent;

      service.getWebIDIdentificationURL(
        identMode,
        flowId,
        paymentMethod,
        connectionId,
        paymentId
      ).pipe(
        catchError(() => {
          done();

          return null;
        })
      ).subscribe();
      const expectedUrl = `${env.thirdParty.payments}/api/connection/${connectionId}/action/start-identification`;
      const req = httpTestingController.expectOne(expectedUrl);
      expect(req.request.method).toEqual('POST');
      req.flush('nothing found', { status: 404, statusText: 'Not Found' });
      expect(logError).toBeCalled();
    });
  });
});
