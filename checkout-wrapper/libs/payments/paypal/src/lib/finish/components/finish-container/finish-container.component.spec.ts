import { CUSTOM_ELEMENTS_SCHEMA, importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import '@angular/localize/init';
import { of, throwError } from 'rxjs';

import { NodeFlowService } from '@pe/checkout/node-api';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { PaymentState, SetFlow, SetPaymentError, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum, ResponseErrorsInterface } from '@pe/checkout/types';

import { PaypalModule } from '../../../paypal.module';
import { flowWithPaymentOptionsFixture } from '../../../test';

import { FinishContainerComponent } from './finish-container.component';

describe('FinishContainerComponent', () => {

  let component: FinishContainerComponent;
  let fixture: ComponentFixture<FinishContainerComponent>;

  let store: Store;
  let nodeFlowService: NodeFlowService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [FinishContainerComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(PaypalModule),
        PaymentInquiryStorage,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    nodeFlowService = TestBed.inject(NodeFlowService);
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.PAYPAL]: {},
    }));

    store.dispatch(new SetPaymentError({
      message: null,
      code: null,
    } as ResponseErrorsInterface));

    fixture = TestBed.createComponent(FinishContainerComponent);
    component = fixture.componentInstance;

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should set error message if paymentResponse is null', () => {

    store.dispatch(new SetPayments({
      [PaymentMethodEnum.PAYPAL]: {
        ...store.selectSnapshot(PaymentState),
      },
    }));
    store.dispatch(new SetPaymentError({
      message: 'error',
      code: 409,
    } as ResponseErrorsInterface));

    fixture.detectChanges();

    component.showFinishModalFromExistingPayment();
    expect(component.errorMessage).toEqual('error');

  });

  it('should update paymentResponse if errorMessage is null', () => {

    const mockPaymentResponse: any = {
      id: 'payment-id',
    };

    const updatePaymentSpy = jest.spyOn(nodeFlowService, 'updatePayment')
      .mockReturnValue(of(null));
    const getFinalResponseSpy = jest.spyOn(nodeFlowService, 'getFinalResponse')
      .mockReturnValue(mockPaymentResponse);

    fixture.detectChanges();

    component.showFinishModalFromExistingPayment();

    expect(component.errorMessage).toBeNull();
    expect(updatePaymentSpy).toHaveBeenCalled();
    expect(getFinalResponseSpy).toHaveBeenCalled();
    expect(component.paymentResponse).toEqual(mockPaymentResponse);
    expect(component.processed).toBeFalsy();
    expect(component.errorMessage).toBeNull();

  });

  it('should handle error in updatePayment', () => {

    const error = new Error('Test error');

    const updatePaymentSpy = jest.spyOn(nodeFlowService, 'updatePayment')
      .mockReturnValue(throwError(error));
    const getFinalResponseSpy = jest.spyOn(nodeFlowService, 'getFinalResponse')
      .mockReturnValue(null);
    component.errorMessage = null;

    fixture.detectChanges();

    component.showFinishModalFromExistingPayment();

    expect(updatePaymentSpy).toHaveBeenCalled();
    expect(getFinalResponseSpy).not.toHaveBeenCalled();
    expect(component.processed).toBeFalsy();
    expect(component.errorMessage).toEqual(error.message);

  });

});
