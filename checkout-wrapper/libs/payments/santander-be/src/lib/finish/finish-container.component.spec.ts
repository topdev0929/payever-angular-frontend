import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';

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

import { FinishComponent, PaymentService } from '../shared';
import { flowWithPaymentOptionsFixture } from '../test';

import { FinishContainerComponent } from './finish-container.component';

describe('FinishContainerComponent', () => {
    const storeHelper = new StoreHelper();
    const responseMock = {
        payment: {},
    } as NodePaymentResponseInterface<unknown>;

    let component: FinishContainerComponent;
    let fixture: ComponentFixture<FinishContainerComponent>;
    let store: Store;
    let nodeFlowService: NodeFlowService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ...CommonImportsTestHelper(),
            ],
            providers: [
                ...CommonProvidersTestHelper(),
                ...FinishProvidersTestHelper(),
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
        component.paymentResponse = responseMock;

        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    describe('Constructor', () => {
        it('Should check if component defined.', () => {
            expect(component).toBeDefined();
        });
    });


  it('should show finish modal from existing payment', () => {
    component.asSinglePayment = true;

    const pollPaymentUntilStatusSpy = jest
      .spyOn(nodeFlowService, 'pollPaymentUntilStatus')
      .mockReturnValue(of(responseMock));

    const cdrSpy = jest.spyOn(component['cdr'], 'detectChanges').mockImplementation(jest.fn());

    jest.spyOn(component['nodeFlowService'], 'getFinalResponse')
      .mockReturnValue(of(responseMock) as any);


    component.showFinishModalFromExistingPayment();

    fixture.detectChanges();

    expect(pollPaymentUntilStatusSpy).toHaveBeenCalled();
    expect(cdrSpy).toHaveBeenCalled();
    expect(component.paymentResponse).toBeTruthy();
    expect(component.errorMessage).toBeFalsy();
  });

  it('should handle error when getting payment', () => {
    component.asSinglePayment = true;
    fixture.detectChanges();

    const pollPaymentUntilStatusSpy = jest
        .spyOn(nodeFlowService, 'pollPaymentUntilStatus')
        .mockReturnValue(throwError({ message: '' }));


    component.showFinishModalFromExistingPayment();

    fixture.detectChanges();

    expect(pollPaymentUntilStatusSpy).toHaveBeenCalledTimes(1);
  });
});
