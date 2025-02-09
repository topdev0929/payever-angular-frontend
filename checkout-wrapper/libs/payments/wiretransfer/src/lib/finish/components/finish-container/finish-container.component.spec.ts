import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { DefaultReceiptComponent } from '@pe/checkout/finish/components';
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

import { FinishComponent, PaymentService } from '../../../shared';
import { flowWithPaymentOptionsFixture } from '../../../test';

import { FinishContainerComponent } from './finish-container.component';

describe('FinishContainerComponent', () => {
    const storeHelper = new StoreHelper();
    const responseMock = {
        payment: {},
    } as NodePaymentResponseInterface<any>;

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
                DefaultReceiptComponent,
                FinishContainerComponent,
            ],
        }).compileComponents();

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
});
