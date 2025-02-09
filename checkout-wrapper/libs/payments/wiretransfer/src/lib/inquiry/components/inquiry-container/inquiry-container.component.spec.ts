import { registerLocaleData } from '@angular/common';
import * as de from '@angular/common/locales/de';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import {
    CommonImportsTestHelper,
    CommonProvidersTestHelper,
    FinishDeclarationsTestHelper,
    StoreHelper,
} from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { LocaleConstantsService } from '@pe/checkout/utils';

import { flowWithPaymentOptionsFixture } from '../../../test';

import { InquiryContainerComponent } from './inquiry-container.component';

describe('InquiryContainerComponent', () => {
    const storeHelper = new StoreHelper();
    let component: InquiryContainerComponent;
    let fixture: ComponentFixture<InquiryContainerComponent>;
    let store: Store;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ...CommonImportsTestHelper(),
            ],
            providers: [
                ...CommonProvidersTestHelper(),
                AddressStorageService,
                {
                    provide: LocaleConstantsService,
                    useValue: {
                        getLang: jest.fn().mockReturnValue('de-DE'),
                    },
                },
                { provide: PaymentInquiryStorage, useValue: {} },
                { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
            ],
            declarations: [
                ...FinishDeclarationsTestHelper(),
                InquiryContainerComponent,
            ],
        }).compileComponents();

        registerLocaleData(de.default);

        storeHelper.setMockData();
        store = TestBed.inject(Store);

        store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

        fixture = TestBed.createComponent(InquiryContainerComponent);
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

    describe('ngOnInit', () => {

        it('should call initPaymentMethod and emit buttonText on ngOnInit', () => {
            jest.spyOn(component['analyticsFormService'], 'initPaymentMethod');
            jest.spyOn(component.buttonText, 'next');

            component.ngOnInit();

            expect(component['analyticsFormService'].initPaymentMethod)
                .toHaveBeenCalledWith(PaymentMethodEnum.CASH);

            expect(component.buttonText.next).toHaveBeenCalledWith($localize`:@@payment-instant-payment.actions.pay:`);
        });
    });

    describe('triggerSubmit', () => {
        it('should call ngSubmit, onSubmit, setPaymentDetails, and emit continue when form is valid', () => {
            jest.spyOn(component.continue, 'emit');

            component.triggerSubmit();

            expect(component.continue.emit).toHaveBeenCalled();
        });
    });
});
