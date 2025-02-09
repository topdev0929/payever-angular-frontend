import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { AnalyzeDocument, NodePaymentResponseInterface, PaymentMethodEnum, SendDocument } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture } from '../../../test';
import { NodePaymentResponseDetailsInterface } from '../components/finish';

import { SantanderDePosApiService } from './santander-de-pos-api.service';

type PaymentResponse = NodePaymentResponseInterface<NodePaymentResponseDetailsInterface>;

describe('SantanderDePosApiService', () => {
  let service: SantanderDePosApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        SantanderDePosApiService,
      ],
    });

    const store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    service = TestBed.inject(SantanderDePosApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('postPaymentActionSimple', () => {
    it('should post payment action and return response details', (done) => {
      const mockFlowId = 'mockFlowId';
      const mockPaymentMethod = PaymentMethodEnum.SANTANDER_POS_INSTALLMENT;
      const mockConnectionId = 'mockConnectionId';
      const mockActionName = 'mockActionName';
      const mockPaymentId = 'mockPaymentId';
      const mockResponse = {
        payment: {},
      } as PaymentResponse;

      jest.spyOn(service['http'], 'post').mockReturnValue(of(mockResponse));

      service.postPaymentActionSimple(
        mockFlowId, mockPaymentMethod, mockConnectionId, mockActionName, mockPaymentId
      ).subscribe((result) => {
        expect(result).toEqual(mockResponse);
        done();
      });
    });

    it('should handle errors and log error', (done) => {
      const mockFlowId = 'mockFlowId';
      const mockPaymentMethod = PaymentMethodEnum.SANTANDER_POS_INSTALLMENT;
      const mockConnectionId = 'mockConnectionId';
      const mockActionName = 'mockActionName';
      const mockPaymentId = 'mockPaymentId';

      jest.spyOn(service['http'], 'post').mockReturnValue(throwError('Mocked error'));

      const logErrorSpy = jest.spyOn(service as any, 'logError');
  
      service.postPaymentActionSimple(
        mockFlowId, mockPaymentMethod, mockConnectionId, mockActionName, mockPaymentId
      ).pipe(
        catchError(() => {
          expect(logErrorSpy).toHaveBeenCalled();
          done();

          return of(null);
        })
      ).subscribe();
    });
  });

  describe('analyzeDocuments', () => {
    it('should analyze documents and return analyzed data', (done) => {
      const mockFlowId = 'mockFlowId';
      const mockPaymentMethod = PaymentMethodEnum.SANTANDER_POS_INSTALLMENT;
      const mockConnectionId = 'mockConnectionId';
      const mockDocs: AnalyzeDocument[] = [{ 
        content: 'content',
        type: 'type',
      }];
      const mockResponse = {
        payment: {},
      } as PaymentResponse;

      jest.spyOn(service['http'], 'post').mockReturnValue(of(mockResponse));
  
      service.analyzeDocuments(
        mockDocs, mockFlowId, mockPaymentMethod, mockConnectionId
      ).subscribe((result) => {
        expect(result).toEqual(mockResponse);
        done();
      });
    });

    it('should handle errors and log error', (done) => {
  
      const mockFlowId = 'mockFlowId';
      const mockPaymentMethod = PaymentMethodEnum.SANTANDER_POS_INSTALLMENT;
      const mockConnectionId = 'mockConnectionId';
      const mockDocs: AnalyzeDocument[] = [{ 
        content: 'content',
        type: 'type',
      }];

      jest.spyOn(service['http'], 'post').mockReturnValue(throwError('Mocked error'));

      const logErrorSpy = jest.spyOn(service as any, 'logError');
  
      service.analyzeDocuments(
        mockDocs, mockFlowId, mockPaymentMethod, mockConnectionId
      ).pipe(
        catchError(() => {
          expect(logErrorSpy).toHaveBeenCalled();
          done();
    
          return of(null);
        })
      ).subscribe();
    });
  });

  describe('sendDocuments', () => {
    it('should send documents and return response', (done) => {
      const mockFlowId = 'mockFlowId';
      const mockPaymentMethod = PaymentMethodEnum.SANTANDER_POS_INSTALLMENT;
      const mockConnectionId = 'mockConnectionId';
      const mockPaymentId = 'mockPaymentId';
      const mockDocs: SendDocument[] = [{ 
        documentType: 'documentType',
        file: 'file',
        filename: 'filename',
      }];

      jest.spyOn(service['http'], 'post').mockReturnValue(of('mockResponse'));

  
      service.sendDocuments(
        mockPaymentId, mockDocs, mockFlowId, mockPaymentMethod, mockConnectionId
      ).subscribe((result) => {
        expect(result).toEqual('mockResponse');
        done();
      });
    });

    it('should handle errors and log error', (done) => {
      const mockFlowId = 'mockFlowId';
      const mockPaymentMethod = PaymentMethodEnum.SANTANDER_POS_INSTALLMENT;
      const mockConnectionId = 'mockConnectionId';
      const mockPaymentId = 'mockPaymentId';
      const mockDocs: SendDocument[] = [{ 
        documentType: 'documentType',
        file: 'file',
        filename: 'filename',
      }];

      jest.spyOn(service['http'], 'post').mockReturnValue(throwError('Mocked error'));

      const logErrorSpy = jest.spyOn(service as any, 'logError');

      service.sendDocuments(
        mockPaymentId, mockDocs, mockFlowId, mockPaymentMethod, mockConnectionId
      ).pipe(
        catchError(() => {
          expect(logErrorSpy).toHaveBeenCalled();
          done();
      
          return of(null);
        })
      ).subscribe();
    });
  });
});
