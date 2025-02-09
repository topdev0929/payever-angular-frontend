import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';

import { BaseContainerComponent } from '../shared';
import { flowWithPaymentOptionsFixture } from '../test/fixtures';

import { PaymentDetailsContainerComponent } from './payment-details-container.component';
import { StripeWalletDetailsModule } from './stripe-wallet-details.module';


describe('payment-details-container', () => {
  let store: Store;
  let component: PaymentDetailsContainerComponent;
  let fixture: ComponentFixture<PaymentDetailsContainerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),

        importProvidersFrom(StripeWalletDetailsModule),
        PaymentInquiryStorage,
      ],
      declarations: [
        PaymentDetailsContainerComponent,
      ],
    });

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    fixture = TestBed.createComponent(PaymentDetailsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
      expect(component instanceof BaseContainerComponent).toBe(true);
    });
  });

  describe('component', () => {
    it('Should emit continue on init', () => {
      const emitContinue = jest.spyOn(component.continue, 'emit');
      component.ngOnInit();
      expect(emitContinue).toHaveBeenCalled();
    });
  });
});

