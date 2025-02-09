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
import { LocaleConstantsService } from '@pe/checkout/utils';

import { FormInterface } from '../../../shared/types';
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

        store.dispatch(new SetFlow({
            ...flowWithPaymentOptionsFixture(),
            billingAddress: { firstName: 'John', lastName: 'Doe' },
        }));

        fixture = TestBed.createComponent(InquiryContainerComponent);
        component = fixture.componentInstance;

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

    describe('triggerSubmit', () => {
        it('should emit continue event and call onSend', () => {
            const onSendSpy = jest.spyOn(component, 'onSend');

            const continueSpy = jest.spyOn(component.continue, 'emit');

            component.triggerSubmit();

            expect(onSendSpy).toHaveBeenCalledWith({});
            expect(continueSpy).toHaveBeenCalled();
        });
    });

    describe('onSend', () => {
        it('should call sendPaymentData', () => {
            const sendPaymentDataSpy = jest.spyOn(component as any, 'sendPaymentData');

            component.onSend({} as FormInterface);

            expect(sendPaymentDataSpy).toHaveBeenCalledWith({});
        });
    });

    describe('sendPaymentData', () => {
        it('should set payment details and emit continue event', () => {
            const setPaymentDetailsSpy = jest.spyOn(component['nodeFlowService'], 'setPaymentDetails');

            const continueSpy = jest.spyOn(component.continue, 'emit');

            component['sendPaymentData']({} as FormInterface);

            expect(setPaymentDetailsSpy).toHaveBeenCalledWith({});
            expect(continueSpy).toHaveBeenCalled();
        });
    });
});
