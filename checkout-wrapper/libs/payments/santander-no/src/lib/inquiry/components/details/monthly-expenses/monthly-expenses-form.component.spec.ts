import { registerLocaleData } from '@angular/common';
import * as de from '@angular/common/locales/de';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { SetFlow } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  FinishDeclarationsTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';
import { CheckoutUiTooltipModule } from '@pe/checkout/ui/tooltip';

import { flowWithPaymentOptionsFixture } from '../../../../test';

import { MonthlyExpensesFormComponent } from './monthly-expenses-form.component';

describe('MonthlyExpensesFormComponent', () => {
  const storeHelper = new StoreHelper();
  let component: MonthlyExpensesFormComponent;
  let fixture: ComponentFixture<MonthlyExpensesFormComponent>;
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
        MonthlyExpensesFormComponent,
      ],
    }).compileComponents();

    registerLocaleData(de.default);

    storeHelper.setMockData();
    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));

    fixture = TestBed.createComponent(MonthlyExpensesFormComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('Constructor', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });

  describe('Form Controls', () => {
    it('should have a form with otherMonthlyExpenses control', () => {
      const form = component.formGroup;
      expect(form.contains('otherMonthlyExpenses')).toBeTruthy();
    });

    it('should require otherMonthlyExpenses', () => {
      const form = component.formGroup;
      const control = form.get('otherMonthlyExpenses');
      control.setValue(null);
      expect(control.hasError('required')).toBeTruthy();
    });
  });

  describe('Value Changes', () => {
    it('should emit changes when otherMonthlyExpenses value changes', fakeAsync(() => {
      component['onTouch'] = jest.fn();
      const mockChangeFn = jest.fn();
      component.registerOnChange(mockChangeFn);

      const form = component.formGroup;
      const control = form.get('otherMonthlyExpenses');

      control.setValue(500);

      tick();

      expect(mockChangeFn).toHaveBeenCalledWith({ otherMonthlyExpenses: 500 });
    }));
  });
});
