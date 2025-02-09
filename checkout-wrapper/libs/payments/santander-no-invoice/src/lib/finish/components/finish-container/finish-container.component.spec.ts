import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

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

import { FinishComponent, PaymentService } from '../../../shared';
import { flowWithPaymentOptionsFixture, nodeResultFixture } from '../../../test';

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
        it('should set paymentResponse and call markForCheck', () => {
            const response = nodeResultFixture();

            jest.spyOn(component['nodeFlowService'], 'getFinalResponse').mockReturnValue(response);

            jest.spyOn(component.cdr, 'markForCheck');

            component['showFinishModalFromExistingPayment']();

            expect(component.cdr.markForCheck).toHaveBeenCalled();
            expect(component.paymentResponse).toEqual(response);
        });
    });
    
});
