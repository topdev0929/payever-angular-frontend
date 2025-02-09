import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { CheckoutFormsCoreModule } from '@pe/checkout/forms';
import { SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';
import { PaymentTextComponent, PaymentTextModule } from '@pe/checkout/ui/payment-text';

import { flowWithPaymentOptionsFixture } from '../../../test';

import { TermsFormComponent } from './terms-form.component';

describe('TermsFormComponent', () => {
  const storeHelper = new StoreHelper();

  let component: TermsFormComponent;
  let fixture: ComponentFixture<TermsFormComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentTextModule,
        CheckoutFormsCoreModule,
      ],
      declarations: [
        PaymentTextComponent,
        TermsFormComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        NgControl,
      ],
    });

    storeHelper.setMockData();
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TermsFormComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('Constructor method', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });

  describe('formGroup', () => {
    it('should create the formGroup with initial values', () => {
      const formGroup = component.formGroup;

      expect(formGroup).toBeDefined();

      expect(formGroup.get('credit_protection_insurance').value).toBe(false);
      expect(formGroup.get('_agreement_for_data_processing_and_transfer').value).toBeNull();
      expect(formGroup.get('credit_accepts_requests_to_credit_agencies').value).toBeNull();
      expect(formGroup.get('allow_promo_email').value).toBeNull();
      expect(formGroup.get('allow_promo_phone').value).toBeNull();
      expect(formGroup.get('allow_promo_letter').value).toBeNull();
      expect(formGroup.get('allow_promo_others').value).toBeNull();
    });
  });

  describe('showCpiLegalText$', () => {
    it('should emit values when credit_protection_insurance changes', (done) => {
      const formGroup = component.formGroup;
      const creditProtectionInsuranceControl = formGroup.get('credit_protection_insurance');

      const emittedValues: boolean[] = [];
      const subscription = component.showCpiLegalText$.subscribe((value) => {
        emittedValues.push(value);
        if (emittedValues.length === 2) {
          expect(emittedValues).toEqual([false, true]);
          subscription.unsubscribe();
          done();
        }
      });

      creditProtectionInsuranceControl.setValue(true);
    });
  });

  describe('ngOnInit', () => {
    it('should enable _agreement_for_data_processing_and_transfer when credit_protection_insurance is true', () => {
      const formGroup = component.formGroup;
      const creditProtectionInsuranceControl = formGroup.get('credit_protection_insurance');
      const agreementControl = formGroup.get('_agreement_for_data_processing_and_transfer');

      creditProtectionInsuranceControl.setValue(true);
      component.ngOnInit();

      expect(agreementControl.enabled).toBe(true);
    });

    it('should disable when credit_protection_insurance is false', () => {
      const formGroup = component.formGroup;
      const creditProtectionInsuranceControl = formGroup.get('credit_protection_insurance');
      const agreementControl = formGroup.get('_agreement_for_data_processing_and_transfer');

      creditProtectionInsuranceControl.setValue(false);
      component.ngOnInit();

      expect(agreementControl.disabled).toBe(true);
    });

  });

  describe('onPromoTextClicked', () => {
    it('should open promo dialog when a valid link is clicked', () => {
      const el = document.createElement('a');
      el.setAttribute('href', 'http://localhost/');
      const mockMouseEvent = {
        composedPath: () => [el],
        preventDefault: jest.fn(),
      };

      const openPromoDialogSpy = jest.spyOn(component as any, 'openPromoDialog');

      component.onPromoTextClicked(mockMouseEvent as any);

      expect(openPromoDialogSpy).toHaveBeenCalled();
    });

    it('should not open promo dialog when an invalid link is clicked', () => {
      const el = document.createElement('div');
      const mockMouseEvent = new MouseEvent('click', {
        composedPath: () => [el],
      } as any);

      const openPromoDialogSpy = jest.spyOn(component as any, 'openPromoDialog');

      component.onPromoTextClicked(mockMouseEvent);

      expect(openPromoDialogSpy).not.toHaveBeenCalled();
    });
  });
});
