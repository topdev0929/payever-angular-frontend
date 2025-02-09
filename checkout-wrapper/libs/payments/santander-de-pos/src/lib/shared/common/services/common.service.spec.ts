import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { NodePaymentResponseInterface, PaymentSpecificStatusEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../../test';
import { NodePaymentDetailsResponseInterface } from '../types';

import { CommonService } from './common.service';
import { DocsManagerService } from './docs-manager.service';
import { SantanderDePosApiService } from './santander-de-pos-api.service';
import { SantanderDePosFlowService } from './santander-de-pos-flow.service';

type PaymentResponse = NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>;

describe('CommonService', () => {
  let service: CommonService;
  let santanderDePosFlowService: SantanderDePosFlowService;
  let docsManagerService: DocsManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        NodeFlowService,
        SantanderDePosFlowService,
        SantanderDePosApiService,
        CommonService,
      ],
    });

    const store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    service = TestBed.inject(CommonService);
    santanderDePosFlowService = TestBed.inject(SantanderDePosFlowService);
    docsManagerService = TestBed.inject(DocsManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('manageDocument', () => {
    it('should send documents and return paymentResponse when documents are present', (done) => {
      const flow = { id: '123' };
      const paymentResponse = {
        id: '456',
        payment: {
          specificStatus: PaymentSpecificStatusEnum.STATUS_GENEHMIGT,
        },
      } as PaymentResponse;
      const getAllDocumentsSpy = jest.spyOn(docsManagerService, 'getAllDocuments').mockReturnValue([
        { base64: 'base64data', filename: 'document.pdf', type: 'DOCUMENT_TYPE', documentType: 'IDENTIFICATION' },
      ]);
      const sendDocumentSpy = jest.spyOn(santanderDePosFlowService, 'sendDocument').mockReturnValue(of(undefined));

      service.manageDocument(flow, paymentResponse).subscribe((result) => {
        expect(getAllDocumentsSpy).toHaveBeenCalledWith(flow.id);
        expect(sendDocumentSpy).toHaveBeenCalledWith(paymentResponse.id, expect.any(Array));
        expect(result).toBe(paymentResponse);
        done();
      });
    });

    it('should send documents handle error', (done) => {
      const flow = { id: '123' };
      const paymentResponse = {
        id: '456',
        payment: {
          specificStatus: PaymentSpecificStatusEnum.STATUS_GENEHMIGT,
        },
      } as PaymentResponse;
      const getAllDocumentsSpy = jest.spyOn(docsManagerService, 'getAllDocuments').mockReturnValue([
        { base64: 'base64data', filename: 'document.pdf', type: 'DOCUMENT_TYPE', documentType: 'IDENTIFICATION' },
      ]);
      const sendDocumentSpy = jest.spyOn(santanderDePosFlowService, 'sendDocument')
        .mockReturnValue(throwError(new Error()));

      service.manageDocument(flow, paymentResponse).subscribe((result) => {
        expect(getAllDocumentsSpy).toHaveBeenCalledWith(flow.id);
        expect(sendDocumentSpy).toHaveBeenCalledWith(paymentResponse.id, expect.any(Array));
        expect(result).toBe(paymentResponse);
        done();
      });
    });

    it('should return paymentResponse when no documents are present', (done) => {
      const flow = { id: '123' };
      const paymentResponse = { id: '456' } as PaymentResponse;
      const getAllDocumentsSpy = jest.spyOn(docsManagerService, 'getAllDocuments').mockReturnValue([]);

      service.manageDocument(flow, paymentResponse).subscribe((result) => {

        expect(getAllDocumentsSpy).toHaveBeenCalledWith(flow.id);
        expect(result).toBe(paymentResponse);
        done();
      });
    });
  });

  describe('removeSignedStatus', () => {
    it('should return paymentResponse if sendingPaymentSigningLink is true', (done) => {
      service['params'].sendingPaymentSigningLink = true;
      const paymentResponse = {
        paymentDetails: { isCustomerSigningTriggered: false },
      } as PaymentResponse;

      service.removeSignedStatus(paymentResponse).subscribe((result) => {
        expect(result).toBe(paymentResponse);
        done();
      });
    });

    it('should return paymentResponse if signing conditions are met', (done) => {
      service['params'].sendingPaymentSigningLink = false;
      const paymentResponse = {
        paymentDetails: { isCustomerSigningTriggered: false, isFullySigned: true },
      } as PaymentResponse;

      const postPaymentActionSimpleSpy = jest
        .spyOn(santanderDePosFlowService, 'postPaymentActionSimple')
        .mockReturnValue(of(undefined));

      service.removeSignedStatus(paymentResponse, true).subscribe((result) => {
        expect(postPaymentActionSimpleSpy).not.toHaveBeenCalled();
        expect(result).toBe(paymentResponse);
        done();
      });
    });


    it('should handle postPaymentActionSimple error', (done) => {
      service['params'].sendingPaymentSigningLink = false;
      const paymentResponse = {
        paymentDetails: { isCustomerSigningTriggered: false, isFullySigned: true },
      } as PaymentResponse;
      const error = new Error('Test Error');
      const postPaymentActionSimpleSpy = jest
        .spyOn(santanderDePosFlowService, 'postPaymentActionSimple')
        .mockReturnValue(throwError(error));

      service.removeSignedStatus(paymentResponse, false).subscribe({
        next: (res) => {
          expect(res).toBe(paymentResponse);
          expect(postPaymentActionSimpleSpy).toHaveBeenCalledWith('remove-signed-status');
          done();
        },
      });
    });

    it('should call postPaymentActionSimple with correct action for removing signed status', (done) => {
      service['params'].sendingPaymentSigningLink = false;
      const paymentResponse = {
        paymentDetails: { isCustomerSigningTriggered: false, isFullySigned: true },
      } as PaymentResponse;
      const postPaymentActionSimpleSpy = jest
        .spyOn(santanderDePosFlowService, 'postPaymentActionSimple')
        .mockReturnValue(of(null));

      service.removeSignedStatus(paymentResponse, false).subscribe((result) => {
        expect(postPaymentActionSimpleSpy).toHaveBeenCalledWith('remove-signed-status');
        expect(result).toBe(null);
        done();
      });
    });

    it('should call postPaymentActionSimple with correct action for canceling signing request', (done) => {
      service['params'].sendingPaymentSigningLink = false;
      const paymentResponse = {
        paymentDetails: { isCustomerSigningTriggered: false, isFullySigned: false },
      } as PaymentResponse;
      const postPaymentActionSimpleSpy = jest
        .spyOn(santanderDePosFlowService, 'postPaymentActionSimple')
        .mockReturnValue(of(undefined));

      service.removeSignedStatus(paymentResponse, false).subscribe((result) => {
        expect(postPaymentActionSimpleSpy).toHaveBeenCalledWith('remove-signed-status');
        expect(result).toBeUndefined();
        done();
      });
    });
  });
});
