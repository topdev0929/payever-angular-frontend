import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Actions, Store } from '@ngxs/store';
import { of, Subject, throwError } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow, SetPaymentError, UpdatePayment } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  FinishDeclarationsTestHelper,
  FinishProvidersTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';
import {
  NodePaymentResponseInterface,
  PaymentSpecificStatusEnum,
  PaymentStatusEnum,
  ResponseErrorsInterface,
} from '@pe/checkout/types';

import { FinishComponent } from '../../../shared/components';
import { PaymentService } from '../../../shared/services';
import { flowWithPaymentOptionsFixture, PaymentResponseWithStatus } from '../../../test';

import { FinishContainerComponent } from './finish-container.component';

describe('FinishContainerComponent', () => {
  const storeHelper = new StoreHelper();

  let component: FinishContainerComponent;
  let fixture: ComponentFixture<FinishContainerComponent>;
  let store: Store;
  let nodeFlowService: NodeFlowService;

  const actions$ = new Subject();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        ...FinishProvidersTestHelper(),
        { provide: Actions, useValue: actions$ },
        { provide: PaymentInquiryStorage, useValue: {} },
        {
          provide: ABSTRACT_PAYMENT_SERVICE,
          useClass: PaymentService,
        },
      ],
      declarations: [
        ...FinishDeclarationsTestHelper(),
        FinishComponent,
        FinishContainerComponent,
      ],
    }).compileComponents();
    nodeFlowService = TestBed.inject(NodeFlowService);

    storeHelper.setMockData();
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    fixture = TestBed.createComponent(FinishContainerComponent);
    component = fixture.componentInstance;
    jest.useFakeTimers();


    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  describe('Constructor', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });

  describe('isPaymentComplete', () => {
    it('should return false if nodeFlowService.getFinalResponse is falsy', () => {
      jest.spyOn(nodeFlowService, 'getFinalResponse').mockReturnValue(null);
      expect(component.isPaymentComplete).toBeFalsy();
    });

    it('should return false if needMoreInfoScenario is truthy', () => {
      jest.spyOn(nodeFlowService, 'getFinalResponse')
        .mockReturnValue({} as NodePaymentResponseInterface<unknown>);
      jest.spyOn(component, 'needMoreInfoScenario', 'get').mockReturnValue(true);
      expect(component.isPaymentComplete).toBeFalsy();
    });
    it('should return false if isNeedApproval is truthy', () => {
      jest.spyOn(nodeFlowService, 'getFinalResponse')
        .mockReturnValue({} as NodePaymentResponseInterface<unknown>);
      jest.spyOn(component, 'needMoreInfoScenario', 'get')
        .mockReturnValue(false);
      jest.spyOn(component['santanderNoFlowService'], 'isNeedApproval')
        .mockReturnValue(true);
      expect(component.isPaymentComplete).toBeFalsy();
    });
    it('should return true', () => {
      jest.spyOn(nodeFlowService, 'getFinalResponse')
        .mockReturnValue({} as NodePaymentResponseInterface<unknown>);
      jest.spyOn(component, 'needMoreInfoScenario', 'get')
        .mockReturnValue(false);
      jest.spyOn(component['santanderNoFlowService'], 'isNeedApproval')
        .mockReturnValue(false);
      expect(component.isPaymentComplete).toBeTruthy();
    });
  });

  describe('loading$', () => {
    it('should be true if OpenNextStep triggered', (done) => {
      component.loading$.subscribe((loading) => {
        expect(loading).toBeTruthy();
        done();
      });

      actions$.next({ action: UpdatePayment, status: 'DISPATCHED' });
    });

    it('should be false if OpenNextStep completed', (done) => {
      component.loading$.subscribe((loading) => {
        expect(loading).toBeFalsy();
        done();
      });

      actions$.next({ action: UpdatePayment, status: 'SUCCESSFUL' });
    });
  });

  describe('Getter', () => {
    it('should get needMoreInfoScenario return correct condition', () => {
      component.paymentResponse = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_IN_PROCESS,
        PaymentSpecificStatusEnum.NEED_MORE_INFO_IIR,
      ) as any;
      expect(component.needMoreInfoScenario).toEqual(true);
      component.paymentResponse = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_IN_PROCESS,
        PaymentSpecificStatusEnum.NEED_MORE_INFO_DTI,
      ) as any;
      expect(component.needMoreInfoScenario).toEqual(true);
      component.paymentResponse = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_IN_PROCESS,
        PaymentSpecificStatusEnum.NEED_MORE_INFO_SIFO,
      ) as any;
      expect(component.needMoreInfoScenario).toEqual(true);
      component.paymentResponse = PaymentResponseWithStatus(
        PaymentStatusEnum.STATUS_IN_PROCESS,
        PaymentSpecificStatusEnum.STATUS_PENDING,
      ) as any;
      expect(component.needMoreInfoScenario).toEqual(false);
    });
  });

  describe('showFinishModalFromExistingPayment', () => {
    const finalResponse = PaymentResponseWithStatus(null, null);
    let updatePayment: jest.SpyInstance;

    beforeEach(() => {
      updatePayment = jest.spyOn(nodeFlowService, 'updatePayment').mockReturnValue(of(null));
      jest.spyOn(nodeFlowService, 'getFinalResponse').mockReturnValue(finalResponse);

    });
    it('should set error message if paymentResponse is null', () => {
      component.paymentResponse = null;
      store.dispatch(new SetPaymentError({
        message: 'error',
        code: 409,
      } as ResponseErrorsInterface));

      fixture.detectChanges();

      component.showFinishModalFromExistingPayment();
      expect(component.errorMessage).toEqual('error');
    });

    it('should update paymentResponse if errorMessage null', () => {
      component.paymentResponse = { payment: 'payment' } as any;
      component.errorMessage = null;

      fixture.detectChanges();
      component.showFinishModalFromExistingPayment();
      expect(component.paymentResponse).toEqual(finalResponse);
    });

    it('should updatePayment handle error', () => {
      component.paymentResponse = { payment: 'payment' } as any;
      const error = new Error('test error');
      updatePayment.mockReturnValue(throwError(error));

      fixture.detectChanges();
      component.showFinishModalFromExistingPayment();
      expect(component.errorMessage).toEqual(error.message);
    });

    it('should updatePayment handle unknown error', () => {
      component.paymentResponse = { payment: 'payment' } as any;
      const error = new Error();
      updatePayment.mockReturnValue(throwError(error));

      fixture.detectChanges();
      component.showFinishModalFromExistingPayment();
      expect(component.errorMessage).toEqual('Unknown error');
    });
  });
});
