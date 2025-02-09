import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { PaymentDetailsContainerComponent } from './payment-details-container.component';
import { IvyPaymentDetailsModule } from './payment-details.module';

describe('PaymentDetailsContainerComponent', () => {

  let component: PaymentDetailsContainerComponent;
  let fixture: ComponentFixture<PaymentDetailsContainerComponent>;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [PaymentDetailsContainerComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(IvyPaymentDetailsModule),
        PaymentInquiryStorage,
      ],
      schemas: [],
    }).compileComponents();

    fixture = TestBed.createComponent(PaymentDetailsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should emit continue on init', () => {

    const continueEmitSpy = jest.spyOn(component.continue, 'emit');

    expect(continueEmitSpy).not.toHaveBeenCalled();

    component.ngOnInit();

    expect(continueEmitSpy).toHaveBeenCalled();

  });

});
