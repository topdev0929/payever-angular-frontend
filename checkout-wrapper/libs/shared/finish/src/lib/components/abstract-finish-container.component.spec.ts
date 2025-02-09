import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { TopLocationService } from '@pe/checkout/location';
import { NodeFlowService } from '@pe/checkout/node-api';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import {
  ChangeFailedPayment,
  ClearFormState,
  ForceOpenFinishStep,
  PaymentState,
  SetFlow,
  SetPaymentError,
  SetPayments,
  SetPrevAction,
  SubmitPayment,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { ChangePaymentDataInterface, FlowStateEnum, PaymentMethodEnum } from '@pe/checkout/types';
import { PaymentHelperService } from '@pe/checkout/utils';

import { flowWithPaymentOptionsFixture, PaymentResponseWithStatus } from '../test';

import { AbstractFinishContainerComponent } from './abstract-finish-container.component';

@Component({
  selector: 'extends-abstract-finish-container-component',
  template: `
    <button (click)='submitPayment()'>Submit</button>
  `,
})
class TestAbstractFinishContainerComponent extends AbstractFinishContainerComponent {}

describe('AbstractFinishContainerComponent', () => {
  let component: TestAbstractFinishContainerComponent;
  let fixture: ComponentFixture<TestAbstractFinishContainerComponent>;

  let store: Store;
  let nodeFlowService: NodeFlowService;
  let topLocationService: TopLocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [...CommonImportsTestHelper()],
      providers: [
        ...CommonProvidersTestHelper(),
        PaymentInquiryStorage,
        NodeFlowService,
        TopLocationService,
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
      ],
      declarations: [TestAbstractFinishContainerComponent],
    }).compileComponents();

    store = TestBed.inject(Store);
    nodeFlowService = TestBed.inject(NodeFlowService);
    topLocationService = TestBed.inject(TopLocationService);
  });

  const createComponent = () => {
    fixture = TestBed.createComponent(TestAbstractFinishContainerComponent);
    component = fixture.componentInstance;
  };

  const setFlowState = (state: FlowStateEnum = null) => {
    store.dispatch(
      new SetFlow({
        ...flowWithPaymentOptionsFixture(),
        state,
      })
    );
  };

  const setPayments = (payload: any) => {
    store.dispatch(
      new SetPayments({
        [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: {
          [flowWithPaymentOptionsFixture().connectionId]: {
            ...store.selectSnapshot(PaymentState),
            ...payload,
          },
        },
      })
    );
  };

  afterEach(() => {
    jest.clearAllMocks();
    fixture?.destroy();

    setFlowState(null);
  });

  describe('ngOnInit', () => {
    const response = PaymentResponseWithStatus(null, null);

    beforeEach(() => {
      setFlowState(FlowStateEnum.FINISH);
      createComponent();
      jest.spyOn(nodeFlowService, 'getFinalResponse').mockReturnValue(response);
    });

    it('should update error message if final response null', () => {
      jest.spyOn(nodeFlowService, 'getFinalResponse').mockReturnValue(null);
      const error = new Error('payment error');
      setPayments({ error });
      component.isNeedUpdating = true;

      component.ngOnInit();
      expect(component.errorMessage).toEqual(error.message);
    });

    it('should update payment response', () => {
      component.isNeedUpdating = false;
      setPayments({ response });

      component.ngOnInit();
      expect(component.paymentResponse).toEqual(response);
    });

    it('should update error', () => {
      const error = new Error('payment error');
      setPayments({ error });

      component.ngOnInit();
      expect(component.errorMessage).toEqual(error.message);
    });
  });

  describe('component', () => {
    beforeEach(() => {
      setFlowState(null);
      createComponent();
      jest.spyOn(store, 'dispatch').mockReturnValue(of(null));
      component.ngOnInit();
    });

    it('should dispatch change payment', () => {
      const changePaymentData: ChangePaymentDataInterface = {
        redirectUrl: 'new-redirect-url',
      };
      component.ngOnInit();
      component.changePayment(changePaymentData);
      expect(store.dispatch).toHaveBeenCalledWith(new ChangeFailedPayment(changePaymentData));
    });

    it('should dispatch submit payment', () => {
      component.ngOnInit();
      fixture.debugElement.query(By.css('button')).nativeElement.click();
      expect(store.dispatch).toHaveBeenCalledWith([new SetPaymentError(null), new SubmitPayment()]);
    });

    it('should tryAgain open prevAction', () => {
      jest.resetAllMocks();
      const prevAction = new ForceOpenFinishStep();
      store.dispatch(new SetPrevAction(prevAction));

      jest.spyOn(store, 'dispatch').mockReturnValue(null);
      component.tryAgain();
      expect(store.dispatch).toHaveBeenCalledWith(prevAction);
    });

    it('should tryAgain trigger submit payment', () => {
      component.ngOnInit();
      component.tryAgain();
      expect(store.dispatch).toHaveBeenCalledWith([new SetPaymentError(null), new SubmitPayment()]);
    });

    it('should handle close', () => {
      const destroyEmit = jest.spyOn(component.destroyModal, 'emit');
      const setHref = jest.spyOn(topLocationService, 'href', 'set').mockReturnValue(null);

      component.close();
      expect(store.dispatch).toHaveBeenCalledWith(new ClearFormState());
      expect(destroyEmit).toHaveBeenCalled();
      expect(setHref).toHaveBeenCalledWith(flowWithPaymentOptionsFixture().apiCall.cancelUrl);
    });

    it('should get isPOS', () => {
      jest.spyOn(PaymentHelperService.prototype, 'isPos').mockReturnValue(false);
      expect(component.isPOS).toBeFalsy();
    });
  });
});
