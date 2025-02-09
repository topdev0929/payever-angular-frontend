import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { EmbeddedContainerComponent } from './embedded-container.component';

describe('EmbeddedContainerComponent', () => {
    let component: EmbeddedContainerComponent;
    let fixture: ComponentFixture<EmbeddedContainerComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ...CommonImportsTestHelper(),
            ],
            providers: [
                ...CommonProvidersTestHelper(),
                PaymentInquiryStorage,
            ],
            declarations: [
                EmbeddedContainerComponent,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(EmbeddedContainerComponent);

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


    describe('onSubmitted', () => {
      it('should emit event with correct payload when onSubmitted is called', () => {

        const submittedEmitterEmitSpy = jest.spyOn(component.submittedEmitter, 'emit');
        const doSendPaymentSpy = jest.spyOn(component, 'doSendPayment');

        component.onSubmitted();

        expect(submittedEmitterEmitSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            payload: expect.any(Function),
          }),
        );

        const emittedPayloadFunction = submittedEmitterEmitSpy.mock.calls[0][0].payload;
        emittedPayloadFunction();

        expect(doSendPaymentSpy).toHaveBeenCalled();
      });
    });

    describe('onPaymentCreated', () => {
        it('should set isPaymentFinished to true and detect changes when onPaymentCreated is called', () => {
            const detectChangesSpy = jest.spyOn(component['cdr'], 'detectChanges');

            component.onPaymentCreated();

            expect(component.isPaymentFinished).toBe(true);
            expect(detectChangesSpy).toHaveBeenCalled();
        });
    });
});
