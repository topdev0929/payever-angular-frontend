import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, formOptionsInstallmentFixture } from '../../../test';

import { RatesFormComponent } from './rates-form.component';

describe('RatesFormComponent', () => {
  const storeHelper = new StoreHelper();

  let component: RatesFormComponent;
  let fixture: ComponentFixture<RatesFormComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        CheckoutFormsInputCurrencyModule,
      ],
      declarations: [RatesFormComponent],
      providers: [
        ...CommonProvidersTestHelper(),
        NgControl,
      ],
    });

    storeHelper.setMockData();
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          formOptions: formOptionsInstallmentFixture,
        },
      },
    }));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RatesFormComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('Constructor method', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });


  describe('formGroup', () => {
    it('should have a valid formGroup', () => {
      expect(component.formGroup).toBeDefined();
      expect(component.formGroup.controls).toBeTruthy();
    });

    it('should validate credit_due_date control', () => {
      const creditDueDateControl = component.formGroup.get('credit_due_date');
      expect(creditDueDateControl.valid).toBeTruthy();
      creditDueDateControl.setValue(null);
      expect(creditDueDateControl.hasError('required')).toBe(true);
    });
  });

  describe('showDownpaymentApply$', () => {
    it('should emit values based on downPayment and depositView changes', (done) => {
      component.showDownpaymentApply$.subscribe((result) => {
        expect(result).toBe(true);
        done();
      });

      component.formGroup.get('_down_payment_view').setValue(10);
    });

    it('should not emit if isRatesLoading is true', (done) => {
      component.showDownpaymentApply$.subscribe((result) => {
        expect(result).toBe(false);
        done();
      });

      component.isRatesLoading = true;
      fixture.detectChanges();
      component.formGroup.get('_down_payment_view').setValue(100);
    });
  });

  describe('writeValue', () => {
    it('should update the down_payment control with _down_payment_view value', () => {
    component.formGroup.get('_down_payment_view').setValue(50);

    component.applyDownpayment();

    expect(component.formGroup.get('down_payment').value).toBe(50);
    });
  });
});
