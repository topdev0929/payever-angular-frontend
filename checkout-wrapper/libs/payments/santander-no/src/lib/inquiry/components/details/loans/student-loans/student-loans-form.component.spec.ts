import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { PatchPaymentResponse, SetFlow } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  FinishDeclarationsTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';
import { CheckoutUiTooltipModule } from '@pe/checkout/ui/tooltip';

import { flowWithPaymentOptionsFixture } from '../../../../../test';

import { StudentLoansFormComponent } from './student-loans-form.component';

describe('StudentLoansFormComponent', () => {
  const storeHelper = new StoreHelper();
  let component: StudentLoansFormComponent;
  let fixture: ComponentFixture<StudentLoansFormComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentTextModule,
        CheckoutUiTooltipModule,
        CheckoutFormsInputCurrencyModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        AddressStorageService,
        { provide: PaymentInquiryStorage, useValue: {} },
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
        NgControl,
      ],
      declarations: [
        ...FinishDeclarationsTestHelper(),
        StudentLoansFormComponent,
      ],
    }).compileComponents();

    storeHelper.setMockData();
    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new PatchPaymentResponse({
      payment: {},
      paymentDetails: {},
    }));

    fixture = TestBed.createComponent(StudentLoansFormComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('Constructor', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });


  describe('translate', () => {
    it('should return translated strings', () => {
      const translation = component.translate(1);
      expect(translation).toEqual({
        loanAmount: '1',
        remainingTerms: '1',
      });
    });
  });

  describe('createForm', () => {
    it('should create a form with default values and validations', () => {
      component['createForm']();

      const form = component['loansForm'].at(0);

      expect(form.get('loanAmount').value).toBeNull();
      expect(form.get('remainingTerms').value).toBeNull();

      expect(form.get('loanAmount').hasError('required')).toBeTruthy();
      expect(form.get('remainingTerms').hasError('required')).toBeTruthy();

      expect(form.get('loanAmount').hasError('min')).toBeFalsy();
      expect(form.get('remainingTerms').hasError('min')).toBeFalsy();
    });
  });
});
