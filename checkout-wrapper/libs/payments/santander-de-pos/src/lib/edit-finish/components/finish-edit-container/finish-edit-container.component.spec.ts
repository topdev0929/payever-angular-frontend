import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';

import { EditTransactionStorageService } from '@pe/checkout/api/edit-transaction';
import { FinishStatusIconConfig } from '@pe/checkout/finish';
import { NodeFlowService } from '@pe/checkout/node-api';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow, SetPaymentComplete } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  FinishDeclarationsTestHelper,
  FinishProvidersTestHelper,
} from '@pe/checkout/testing';
import { FlowStateEnum, NodePaymentResponseInterface } from '@pe/checkout/types';

import { NodePaymentDetailsResponseInterface, PaymentService, FinishComponent } from '../../../shared';
import { flowWithPaymentOptionsFixture } from '../../../test';

import { FinishEditContainerComponent } from './finish-edit-container.component';

describe('FinishEditContainerComponent', () => {
  let component: FinishEditContainerComponent;
  let fixture: ComponentFixture<FinishEditContainerComponent>;
  let store: Store;
  let editTransactionStorageService: EditTransactionStorageService;
  let nodeFlowService: NodeFlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      declarations: [
        ...FinishDeclarationsTestHelper(),
        FinishComponent,
        FinishEditContainerComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        ...FinishProvidersTestHelper(),
        PaymentInquiryStorage,
        {
          provide: ABSTRACT_PAYMENT_SERVICE,
          useClass: PaymentService,
        },
        {
          provide: FinishStatusIconConfig,
          useValue: {
            icons: {
              success: 'success-36',
              pending: 'pending-36',
              fail: 'error-36',
            },
            iconsClass: 'icon-36',
          },
        },
      ],
    });
  });

  beforeEach(() => {
    editTransactionStorageService = TestBed.inject(EditTransactionStorageService);
    nodeFlowService = TestBed.inject(NodeFlowService);
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    fixture = TestBed.createComponent(FinishEditContainerComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('constructor', () => {
    it('Should check if component defined', () => {
      expect(component).toBeDefined();
    });
  });

  describe('transactionDetails', () => {
    it('should return paymentDetails if transaction data exists', () => {
      const mockFlowId = 'mockFlowId';
      const mockPaymentDetails = {};

      jest.spyOn(editTransactionStorageService, 'getTransactionData').mockReturnValue({
        paymentDetails: mockPaymentDetails,
      } as NodePaymentResponseInterface<any>);

      component.flow.id = mockFlowId;
      const result = component.transactionDetails;

      expect(result).toEqual(mockPaymentDetails);
    });

    it('should return undefined if transaction data does not exist', () => {
      jest.spyOn(editTransactionStorageService, 'getTransactionData').mockReturnValue(null);

      const result = component.transactionDetails;

      expect(result).toBeUndefined();
    });
  });

  describe('transactionId', () => {
    it('should return transactionId when transaction data exists', () => {
      const mockFlowId = 'mockFlowId';
      const mockTransactionId = 'mockTransactionId';

      jest.spyOn(editTransactionStorageService, 'getTransactionId').mockReturnValue(mockTransactionId);

      component.flow.id = mockFlowId;
      const result = component.transactionId;

      expect(result).toEqual(mockTransactionId);
    });

    it('should return an empty string when transaction data does not exist', () => {
      jest.spyOn(editTransactionStorageService, 'getTransactionId').mockReturnValue('');

      const result = component.transactionId;

      expect(result).toEqual('');
    });
  });

  describe('showFinishModalFromExistingPayment', () => {
    it('should handle payment update, set payment response, and handle signed status', fakeAsync(() => {
      jest.spyOn(nodeFlowService, 'updatePayment').mockReturnValue(of({
        payment: {},
      } as NodePaymentResponseInterface<unknown>));
      jest.spyOn(component, 'handleSignedStatus').mockReturnValue(of(null));
      jest.spyOn(component.cdr, 'detectChanges');

      component.showFinishModalFromExistingPayment();
      tick();

      expect(component.errorMessage).toBeFalsy();
      expect(component.paymentResponse).toBeTruthy();
      expect(component.cdr.detectChanges).toHaveBeenCalled();
    }));

    it('should handle errors and update errorMessage', fakeAsync(() => {
      jest.spyOn(nodeFlowService, 'updatePayment').mockReturnValue(throwError({
        message: 'error message',
      }));
      jest.spyOn(component, 'handleSignedStatus').mockReturnValue(of(null));
      jest.spyOn(component.cdr, 'detectChanges');

      component.showFinishModalFromExistingPayment();
      tick();

      expect(component.errorMessage).toBeTruthy();
      expect(component.cdr.detectChanges).toHaveBeenCalled();
    }));
  });


  describe('onChangeContainerHeight', () => {
    it('should update minHeightValue and mark for check when onStable emits', fakeAsync(() => {
      const mockHeight = 300;

      jest.spyOn(component['cdr'], 'markForCheck');

      component.onChangeContainerHeight(mockHeight);
      component['ngZone'].onStable.next();
      tick();

      expect(component.minHeightValue).toBe(300);
      expect(component['cdr'].markForCheck).toHaveBeenCalled();
    }));
  });

  describe('handleSignedStatus', () => {
    it('should handle signed status and manage document', (done) => {
      const mockPaymentResponse = {
        payment: {},
      } as NodePaymentResponseInterface<unknown>;
      const mockCancelSigningRequest = {};

      jest.spyOn(nodeFlowService, 'getFinalResponse').mockReturnValue(mockPaymentResponse);
      jest.spyOn(component['editFinishStorageService'], 'getEditCancelSigningRequest')
        .mockReturnValue(mockCancelSigningRequest);
      jest.spyOn(component['commonService'], 'removeSignedStatus').mockReturnValue(of(null));
      jest.spyOn(component['editFinishStorageService'], 'removeEditCancelSigningRequest').mockReturnValue(null);
      jest.spyOn(component['commonService'], 'manageDocument').mockReturnValue(of(null));

      component.handleSignedStatus().subscribe(() => {
        expect(nodeFlowService.getFinalResponse).toHaveBeenCalled();
        expect(component['editFinishStorageService'].getEditCancelSigningRequest).toHaveBeenCalled();
        expect(component['commonService'].removeSignedStatus)
          .toHaveBeenCalledWith(mockPaymentResponse, mockCancelSigningRequest);
        expect(component['editFinishStorageService'].removeEditCancelSigningRequest).toHaveBeenCalled();
        expect(component['commonService'].manageDocument).toHaveBeenCalledWith(component.flow, mockPaymentResponse);
        done();
      });
    });
  });
  describe('paymentCallback', () => {
    it('should handle payment completion and update payment with a timeout', (done) => {
      const mockPaymentResponse = {
        payment: {},
      } as NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>;
      const mockRunUpdatePaymentWithTimeoutResult = {
        payment: {},
      } as NodePaymentResponseInterface<unknown>;

      jest.spyOn(component, 'handleSignedStatus').mockReturnValue(of(mockPaymentResponse));
      jest.spyOn(component as any, 'runUpdatePaymentWithTimeout')
        .mockReturnValue(of(mockRunUpdatePaymentWithTimeoutResult));

      const result$ = component.paymentCallback();

      result$.subscribe(() => {
        expect(component['runUpdatePaymentWithTimeout']).toHaveBeenCalled();
        done();
      });

      store.dispatch(new SetPaymentComplete);
    });
  });
  describe('isPaymentComplete', () => {
    it('should return true if isPaymentUpdateRequired is false', () => {
      component.flow.state = FlowStateEnum.FINISH;
      jest.spyOn(component, 'isPaymentUpdateRequired').mockReturnValue(false);
      expect(component.flow.state).toEqual(FlowStateEnum.FINISH);
      expect(component['isPaymentComplete']).toBeTruthy();
    });
    it('should return false if isPaymentUpdateRequired is true', () => {
      component.flow.state = FlowStateEnum.FINISH;
      jest.spyOn(component, 'isPaymentUpdateRequired').mockReturnValue(true);
      expect(component.flow.state).toEqual(FlowStateEnum.FINISH);
      expect(component['isPaymentComplete']).toBeFalsy();
    });
    it('should return false if the flow.state does not match', () => {
      component.flow.state = FlowStateEnum.PROGRESS;
      jest.spyOn(component, 'isPaymentUpdateRequired').mockReturnValue(false);
      expect(component.flow.state).toEqual(FlowStateEnum.PROGRESS);
      expect(component['isPaymentComplete']).toBeFalsy();
    });
  });
});
