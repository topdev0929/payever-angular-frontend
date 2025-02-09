import { CUSTOM_ELEMENTS_SCHEMA, importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum, PaymentSpecificStatusEnum, PaymentStatusEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, paymentResponseWithStatusFixture } from '../../../../test';
import { IvyFinishModule } from '../../ivy-finish.module';

import { FinishContainerComponent } from './finish-container.component';

describe('FinishContainerComponent', () => {

  let component: FinishContainerComponent;
  let fixture: ComponentFixture<FinishContainerComponent>;

  let store: Store;
  let nodeFlowService: NodeFlowService;

  const paymentResponse = paymentResponseWithStatusFixture(
    PaymentStatusEnum.STATUS_IN_PROCESS,
    PaymentSpecificStatusEnum.NEED_CUSTOMER_APPROVAL
  );

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [FinishContainerComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(IvyFinishModule),
        NodeFlowService,
        PaymentInquiryStorage,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.IVY]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          response: paymentResponse,
        },
      },
    }));
    nodeFlowService = TestBed.inject(NodeFlowService);

    fixture = TestBed.createComponent(FinishContainerComponent);
    component = fixture.componentInstance;

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should handle input properties', () => {

    component.showCloseButton = true;
    component.asSinglePayment = false;

    expect(component.showCloseButton).toBeTruthy();
    expect(component.asSinglePayment).toBeFalsy();

  });

  it('should handle successful update payment', () => {

    const updatePaymentSpy = jest.spyOn(nodeFlowService, 'updatePayment')
      .mockReturnValue(of(paymentResponse));
    const getFinalResponseSpy = jest.spyOn(nodeFlowService, 'getFinalResponse')
      .mockReturnValue(paymentResponse);
    const dispatchSpy = jest.spyOn(store, 'dispatch').mockReturnValue(of({}));

    component.showFinishModalFromExistingPayment();

    expect(updatePaymentSpy).toHaveBeenCalled();
    expect(dispatchSpy).toHaveBeenCalled();

    expect(getFinalResponseSpy).toHaveBeenCalled();
    expect(component.paymentResponse).toEqual(paymentResponse);
    expect(component.errorMessage).toBeNull();

  });

  it('should handle an error when update a payment', () => {

    const error = new Error('Error');

    const updatePaymentSpy = jest.spyOn(nodeFlowService, 'updatePayment')
      .mockReturnValue(throwError(error));
    const getFinalResponseSpy = jest.spyOn(nodeFlowService, 'getFinalResponse')
      .mockReturnValue(null);
    const dispatchSpy = jest.spyOn(store, 'dispatch').mockReturnValue(of({}));

    expect(component.errorMessage).toBeUndefined();

    component.showFinishModalFromExistingPayment();

    expect(updatePaymentSpy).toHaveBeenCalled();
    expect(dispatchSpy).not.toHaveBeenCalled();
    expect(getFinalResponseSpy).not.toHaveBeenCalled();
    expect(component.errorMessage).toEqual(error.message);

  });

  it('should handle an unknown error when update a payment', () => {

    const error = new Error();

    const updatePaymentSpy = jest.spyOn(nodeFlowService, 'updatePayment')
      .mockReturnValue(throwError(error));
    const getFinalResponseSpy = jest.spyOn(nodeFlowService, 'getFinalResponse')
      .mockReturnValue(null);
    const dispatchSpy = jest.spyOn(store, 'dispatch').mockReturnValue(of({}));

    expect(component.errorMessage).toBeUndefined();

    component.showFinishModalFromExistingPayment();

    expect(updatePaymentSpy).toHaveBeenCalled();
    expect(dispatchSpy).not.toHaveBeenCalled();
    expect(getFinalResponseSpy).not.toHaveBeenCalled();
    expect(component.errorMessage).toEqual('Unknown error');

  });

});
