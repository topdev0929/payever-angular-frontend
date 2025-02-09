import { HttpErrorResponse } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';
import { MockComponent, MockModule } from 'ng-mocks';
import { of, throwError } from 'rxjs';

import { LoaderService } from '@pe/checkout/core/loader';
import { FinishModule } from '@pe/checkout/finish';
import { NodeFlowService } from '@pe/checkout/node-api';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import {
  ChangeFailedPayment,
  FlowState,
  ParamsState,
  SetFlow,
  SetPaymentError,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, QueryChildByDirective } from '@pe/checkout/testing';
import { ChangePaymentDataInterface, ResponseErrorsInterface } from '@pe/checkout/types';

import { FinishComponent } from '../shared';
import { PaymentResponseWithStatus, flowWithPaymentOptionsFixture } from '../test/fixtures';

import { FinishContainerComponent } from './finish-container.component';
import { StripeDirectdebitFinishModule } from './stripe-directdebit-finish.module';


describe('stripe-direct-debit-finish-container', () => {
  let store: Store;

  let component: FinishContainerComponent;
  let fixture: ComponentFixture<FinishContainerComponent>;
  let nodeFlowService: NodeFlowService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        MockModule(FinishModule),
        RouterModule.forRoot([]),
      ],
      providers: [
        importProvidersFrom(StripeDirectdebitFinishModule),
        ...CommonProvidersTestHelper(),
        PaymentInquiryStorage,
      ],
      declarations: [
        MockComponent(FinishComponent),
        FinishContainerComponent,
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    nodeFlowService = TestBed.inject(NodeFlowService);
    fixture = TestBed.createComponent(FinishContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });


  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  const checkChildInputs = () => {
    const { child: finishComponent } = QueryChildByDirective(fixture, FinishComponent);
    expect(finishComponent).toBeTruthy();

    const flow = store.selectSnapshot(FlowState.flow);
    const embeddedMode = store.selectSnapshot(ParamsState.embeddedMode);

    expect(finishComponent.embeddedMode).toEqual(embeddedMode);
    expect(finishComponent.nodeResult).toEqual(component.paymentResponse);
    expect(finishComponent.showCloseButton).toEqual(!!flow.apiCall.cancelUrl);
    expect(finishComponent.isLoading).toEqual(!component.paymentResponse && !component.errorMessage);
    expect(finishComponent.errorMessage).toEqual(component.errorMessage);
  };

  describe('component', () => {
    it('should provide inputs to the finishComponent, correctly', () => {
      checkChildInputs();
    });

    it('Should update status on updateStatus', () => {
      const { childEl } = QueryChildByDirective(fixture, FinishComponent);
      const nodeResponse = PaymentResponseWithStatus(null, null);
      const updatePayment = jest.spyOn(nodeFlowService, 'updatePayment')
        .mockReturnValue(of(nodeResponse));
      childEl.triggerEventHandler('updateStatus');
      expect(updatePayment).toHaveBeenCalled();
      expect(component.paymentResponse).toEqual(nodeResponse);
    });

    it('Should set error when updateStatus fails', () => {
      const updatePayment = jest.spyOn(nodeFlowService, 'updatePayment')
        .mockReturnValue(throwError(new Error('error')));
      component.updateStatus();
      expect(updatePayment).toHaveBeenCalled();
      expect(component.errorMessage).toEqual('error');
    });

    it('Should call tryAgain on tryAgain', () => {
      const tryAgain = jest.spyOn(component, 'tryAgain');
      const { child: finishComponent } = QueryChildByDirective(fixture, FinishComponent);
      expect(finishComponent).toBeTruthy();
      finishComponent.tryAgain.emit();
      expect(tryAgain).toHaveBeenCalled();
    });

    it('Should call colse on close', () => {
      const close = jest.spyOn(component, 'close').mockReturnValue(null);
      const { child: finishComponent } = QueryChildByDirective(fixture, FinishComponent);
      expect(finishComponent).toBeTruthy();
      finishComponent.close.emit();
      expect(close).toHaveBeenCalled();
    });

    it('Should call changePayment on changePaymentMethod', () => {
      const loaderGlobal = jest.spyOn(LoaderService.prototype, 'loaderGlobal', 'set');
      const changePayment = jest.spyOn(component, 'changePayment');
      const dispatch = jest.spyOn(store, 'dispatch').mockReturnValue(of(null));
      const destroyModal = jest.spyOn(component.destroyModal, 'emit');
      const { child: finishComponent } = QueryChildByDirective(fixture, FinishComponent);
      expect(finishComponent).toBeTruthy();
      const e: ChangePaymentDataInterface = { redirectUrl: 'redirect-url' };
      finishComponent.changePaymentMethod.emit(e);
      expect(changePayment).toHaveBeenCalledWith(e);
      expect(dispatch).toHaveBeenCalledWith(new ChangeFailedPayment(e));
      expect(destroyModal).toHaveBeenCalled();
      expect(loaderGlobal).toHaveBeenCalled();
    });

    it('should set error message', () => {
      const error: ResponseErrorsInterface = {
        code: 400,
        errors: {
          error: 'error',
        },
        message: 'errorMessage',
        raw: new HttpErrorResponse({ status: 400 }),
      };

      store.dispatch(new SetPaymentError(error));
      fixture.detectChanges();

      expect(component.errorMessage).toEqual('errorMessage');
      checkChildInputs();
    });
  });
});
