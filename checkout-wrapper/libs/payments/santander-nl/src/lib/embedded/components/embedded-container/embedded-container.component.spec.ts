import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { EmbeddedContainerComponent } from './embedded-container.component';

describe('EmbeddedContainerComponent', () => {

  let component: EmbeddedContainerComponent;
  let fixture: ComponentFixture<EmbeddedContainerComponent>;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [EmbeddedContainerComponent],
      imports: [],
      providers: [
        { provide: PaymentInquiryStorage, useValue: {} },
      ],
      schemas: [],
    }).compileComponents();

    fixture = TestBed.createComponent(EmbeddedContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should have default paymentMethod as SANTANDER_INSTALLMENT_NL', () => {

    expect(component.paymentMethod).toEqual(PaymentMethodEnum.SANTANDER_INSTALLMENT_NL);

  });

  it('should set isPaymentFinished to false by default', () => {

    expect(component.isPaymentFinished).toBe(false);

  });

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

  it('should set isPaymentFinished to true when onPaymentCreated is called', () => {

    component.onPaymentCreated();

    expect(component.isPaymentFinished).toBe(true);

  });

});
