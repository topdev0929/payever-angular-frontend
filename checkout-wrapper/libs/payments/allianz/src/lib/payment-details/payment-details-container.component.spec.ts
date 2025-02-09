import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { PaymentDetailsContainerComponent } from './payment-details-container.component';

describe('PaymentDetailsContainerComponent', () => {
    let component: PaymentDetailsContainerComponent;
    let fixture: ComponentFixture<PaymentDetailsContainerComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ...CommonImportsTestHelper(),
            ],
            providers: [
                ...CommonProvidersTestHelper(),
                AddressStorageService,
                { provide: PaymentInquiryStorage, useValue: {} },
                { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
            ],
            declarations: [
                PaymentDetailsContainerComponent,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PaymentDetailsContainerComponent);

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

    it('should emit continue event on ngOnInit', () => {
        const emitSpy = jest.spyOn(component.continue, 'emit');
    
        component.ngOnInit();
    
        expect(emitSpy).toHaveBeenCalled();
    });
});
