import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';

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
import { NodePaymentResponseInterface, PaymentStatusEnum } from '@pe/checkout/types';

import { FinishComponent, PaymentService } from '../../../shared';
import { flowWithPaymentOptionsFixture } from '../../../test';

import { FinishContainerComponent } from './finish-container.component';

describe('FinishContainerComponent', () => {
    const storeHelper = new StoreHelper();

    let component: FinishContainerComponent;
    let fixture: ComponentFixture<FinishContainerComponent>;
    let store: Store;

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

        storeHelper.setMockData();
        store = TestBed.inject(Store);

        store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

        fixture = TestBed.createComponent(FinishContainerComponent);
        component = fixture.componentInstance;
        jest.useFakeTimers();

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

    describe('showFinishModalFromExistingPayment', () => {
        it('should set payment method and call markForCheck', () => {
            const response = {
                payment: { status: PaymentStatusEnum.STATUS_NEW },
                paymentDetails: { wizardSessionKey: 'testSessionKey' },
            } as NodePaymentResponseInterface<any>;

            jest.spyOn(component['nodeFlowService'], 'updatePayment').mockReturnValue(of(response));

            jest.spyOn(component.cdr, 'markForCheck');

            component['showFinishModalFromExistingPayment']();

            expect(component.cdr.markForCheck).toHaveBeenCalled();
            expect(component.paymentResponse).toEqual(response);
        });

        it('should set error when updatePayment returns error', () => {
            jest.spyOn(component['nodeFlowService'], 'updatePayment').mockReturnValueOnce(throwError({
                message: 'error message',
            }));

            jest.spyOn(component.cdr, 'markForCheck');

            component['showFinishModalFromExistingPayment']();

            expect(component.cdr.markForCheck).toHaveBeenCalled();
            expect(component.errorMessage).toEqual('error message');

            jest.spyOn(component['nodeFlowService'], 'updatePayment').mockReturnValueOnce(throwError({}));

            component['showFinishModalFromExistingPayment']();
            
            expect(component.errorMessage).toEqual('Unknown error');
        });
    });
    
});
