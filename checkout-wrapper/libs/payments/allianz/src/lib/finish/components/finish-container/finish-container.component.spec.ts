import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';

import { AbstractFinishContainerComponent } from '@pe/checkout/finish';
import { NodeFlowService } from '@pe/checkout/node-api';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import {
    CommonImportsTestHelper,
    CommonProvidersTestHelper,
    FinishDeclarationsTestHelper,
    FinishProvidersTestHelper,
    StoreHelper,
} from '@pe/checkout/testing';
import { NodePaymentResponseInterface } from '@pe/checkout/types';

import { AllianzApiService, AllianzFlowService, PaymentService } from '../../../shared/service';
import { NodePaymentDetailsResponseInterface } from '../../../shared/types';
import { flowWithPaymentOptionsFixture } from '../../../test';
import { FinishComponent } from '../finish/finish.component';

import { FinishContainerComponent } from './finish-container.component';

type PaymentResponse = NodePaymentResponseInterface<NodePaymentDetailsResponseInterface>;

describe('FinishContainerComponent', () => {
    const storeHelper = new StoreHelper();

    let component: FinishContainerComponent;
    let fixture: ComponentFixture<FinishContainerComponent>;
    let store: Store;
    let allianzFlowService: AllianzFlowService;
    let nodeFlowService: NodeFlowService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ...CommonImportsTestHelper(),
            ],
            providers: [
                ...CommonProvidersTestHelper(),
                ...FinishProvidersTestHelper(),
                AllianzApiService,
                AllianzFlowService,
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
        store = TestBed.inject(Store);
        allianzFlowService = TestBed.inject(AllianzFlowService);
        nodeFlowService = TestBed.inject(NodeFlowService);

        storeHelper.setMockData();
        store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

        fixture = TestBed.createComponent(FinishContainerComponent);
        component = fixture.componentInstance;
        jest.useFakeTimers();

        fixture.detectChanges();
    });

    describe('Constructor', () => {
        it('Should check if component defined.', () => {
            expect(component).toBeDefined();
        });
    });


  it('should show finish modal from existing payment', () => {

    const superMethodSpy = jest.spyOn(
      AbstractFinishContainerComponent.prototype as any,
      'showFinishModalFromExistingPayment'
    );


    component.asSinglePayment = true;


    const getPaymentSpy = jest.spyOn(allianzFlowService, 'getPayment')
        .mockReturnValue(of({
            payment: {},
        } as PaymentResponse));


    const getFinalResponseSpy = jest
      .spyOn(nodeFlowService, 'getFinalResponse')
      .mockReturnValue({
        payment: {},
      } as PaymentResponse);


    component.showFinishModalFromExistingPayment();


    expect(superMethodSpy).toHaveBeenCalled();
    expect(getPaymentSpy).toHaveBeenCalled();
    expect(getFinalResponseSpy).toHaveBeenCalledTimes(2);
    expect(component.paymentResponse).toBeTruthy();
    expect(component.errorMessage).toBeFalsy();

  });

  it('should handle error when getting payment', () => {
    const paymentResponse = {
      payment: {},
    } as PaymentResponse;
    component.asSinglePayment = true;

    const error = new Error('Test');
    const getPayment = jest.spyOn(allianzFlowService, 'getPayment')
      .mockReturnValue(throwError(error));

    const getFinalResponseSpy = jest
      .spyOn(nodeFlowService, 'getFinalResponse')
      .mockReturnValue(paymentResponse);
    jest.spyOn(component['cdr'], 'detectChanges').mockReturnValue(null);

    component.showFinishModalFromExistingPayment();

    expect(getPayment).toHaveBeenCalledTimes(1);
    expect(getFinalResponseSpy).toHaveBeenCalledTimes(1);
    expect(component.errorMessage).toEqual(error.message);
  });

  it('should handle unknown error when getting payment', () => {
    const paymentResponse = {
      payment: {},
    } as PaymentResponse;
    component.asSinglePayment = true;

    const error = new Error();
    const getPayment = jest.spyOn(allianzFlowService, 'getPayment')
      .mockReturnValue(throwError(error));

    const getFinalResponseSpy = jest
      .spyOn(nodeFlowService, 'getFinalResponse')
      .mockReturnValue(paymentResponse);
    jest.spyOn(component['cdr'], 'detectChanges').mockReturnValue(null);

    component.showFinishModalFromExistingPayment();

    expect(getPayment).toHaveBeenCalledTimes(1);
    expect(getFinalResponseSpy).toHaveBeenCalledTimes(1);
    expect(component.errorMessage).toEqual($localize `:@@error.unknown_error:`);
  });
});
