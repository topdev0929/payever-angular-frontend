import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { SetFlow, PaymentState, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';
import { AnalyzeDocument, AnalyzedDocumentsData, NodePaymentResponseInterface, PaymentMethodEnum,
  PaymentStatusEnum, SendDocument } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, PaymentResponseWithStatus } from '../../../test';

import { SantanderDePosApiService } from './santander-de-pos-api.service';
import { SantanderDePosFlowService } from './santander-de-pos-flow.service';

describe('SantanderDePosFlowService', () => {
  const storeHelper = new StoreHelper();

  let service: SantanderDePosFlowService;
  let santanderDePosApiService: SantanderDePosApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        SantanderDePosApiService,
        SantanderDePosFlowService,
      ],
    });
    storeHelper.setMockData();
    const store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          response: PaymentResponseWithStatus(PaymentStatusEnum.STATUS_IN_PROCESS, null),
        },
      },
    }));

    service = TestBed.inject(SantanderDePosFlowService);
    santanderDePosApiService = TestBed.inject(SantanderDePosApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });


  describe('postPaymentActionSimple', () => {
    it('should post payment action and return response details', (done) => {
      const mockActionName = 'mockActionName';

      const mockResponse = {
        payment: {},
      } as NodePaymentResponseInterface<unknown>;

      jest.spyOn(santanderDePosApiService, 'postPaymentActionSimple')
        .mockReturnValue(of(mockResponse));

      service.postPaymentActionSimple(mockActionName).subscribe((result) => {
        expect(result).toEqual(mockResponse);
        done();
      });
    });
  });

  describe('analyzeDocuments', () => {
    it('should analyze documents and return analyzed data', (done) => {
      const mockDocs: AnalyzeDocument[] = [{
        content: 'content',
        type: 'type',
      }];
      const mockResponse = {
        idDocument: {},
        idDocumentValidity: {},
        person: {},
      } as AnalyzedDocumentsData;

      jest.spyOn(santanderDePosApiService, 'analyzeDocuments').mockReturnValue(of(mockResponse));

      service.analyzeDocuments(mockDocs).subscribe((result) => {
        expect(result).toEqual(mockResponse);
        done();
      });
    });
  });

  describe('sendDocument', () => {
    it('should send documents and return response', (done) => {
      const mockPaymentId = 'mockPaymentId';
      const mockDocs: SendDocument[] = [{
        documentType: 'documentType',
        file: 'file',
        filename: 'filename',
      }];

      jest.spyOn(santanderDePosApiService, 'sendDocuments').mockReturnValue(of('response'));

      service.sendDocument(mockPaymentId, mockDocs).subscribe((result) => {
        expect(result).toEqual('response');
        done();
      });
    });
  });
});
