import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

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


import { flowWithPaymentOptionsFixture } from '../../../../test';


import { DebtFormComponent } from './debt-form.component';
describe('DebtFormComponent', () => {
  const storeHelper = new StoreHelper();
  let component: DebtFormComponent;
  let fixture: ComponentFixture<DebtFormComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentTextModule,
        CheckoutUiTooltipModule,
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
        DebtFormComponent,
      ],
    }).compileComponents();

    storeHelper.setMockData();
    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new PatchPaymentResponse({
      payment: {},
      paymentDetails: {},
    }));

    fixture = TestBed.createComponent(DebtFormComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('Constructor', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });

  describe('Initialization', () => {
    it('should set formGroup value based on paymentStatus', () => {
      expect(component.formGroup.get('totalDebt')?.disabled).toBeTruthy();
    });

    it('should initialize form controls correctly', () => {
      const totalDebtControl = component.formGroup.get('totalDebt');
      expect(totalDebtControl).toBeDefined();
    });
  });

  describe('Form Controls', () => {
    it('should disable totalDebt control when paymentStatus is not NEED_MORE_INFO_DTI', () => {
      component.ngOnInit();

      const totalDebtControl = component.formGroup.get('totalDebt');
      expect(totalDebtControl?.disabled).toBeTruthy();
    });
  });

  describe('Event Handling', () => {
    it('should call registerOnChange when valueChanges event occurs', fakeAsync(() => {
      const mockFn = jest.fn();

      component['onTouch'] = jest.fn();
      component.registerOnChange(mockFn);
      component.formGroup.setValue({ totalDebt: 100 });

      tick();

      expect(mockFn).toHaveBeenCalledWith({ totalDebt: 100 });
    }));
  });
});
