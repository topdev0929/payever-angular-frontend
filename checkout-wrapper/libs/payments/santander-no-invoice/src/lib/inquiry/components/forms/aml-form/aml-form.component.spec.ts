import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';
import { CheckoutUiTooltipModule } from '@pe/checkout/ui/tooltip';

import { flowWithPaymentOptionsFixture, formOptionsInstallmentFixture } from '../../../../test';

import { AmlFormComponent } from './aml-form.component';

describe('AmlFormComponent', () => {
  const storeHelper = new StoreHelper();

  let component: AmlFormComponent;
  let fixture: ComponentFixture<AmlFormComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        CheckoutUiTooltipModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        NgControl,
      ],
      declarations: [
        AmlFormComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    storeHelper.setMockData();
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INVOICE_NO]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          formOptions: formOptionsInstallmentFixture,
        },
      },
    }));

    fixture = TestBed.createComponent(AmlFormComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  describe('Constructor', () => {
    it('Should create component instance', () => {
      expect(component).toBeDefined();
    });
  });

  describe('Form Initialization', () => {
    it('should create the form with the expected controls', () => {
      expect(component.formGroup.get('politicalExposedPerson')).toBeDefined();
      expect(component.formGroup.get('appliedOnBehalfOfOthers')).toBeDefined();
      expect(component.formGroup.get('payWithMainIncome')).toBeDefined();
      expect(component.formGroup.get('paySource')).toBeDefined();
      expect(component.formGroup.get('professionalStatus')).toBeDefined();
      expect(component.formGroup.get('otherPaySource')).toBeDefined();
      expect(component.formGroup.get('amlEnabled')).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should disable paySource and enable professionalStatus', () => {
      const paySourceControl = component.formGroup.get('paySource');
      const professionalStatusControl = component.formGroup.get('professionalStatus');
      const payWithMainIncomeControl = component.formGroup.get('payWithMainIncome');

      payWithMainIncomeControl.patchValue(true);

      expect(paySourceControl.disabled).toBeTruthy();
      expect(professionalStatusControl.enabled).toBeTruthy();
    });

    it('should enable paySource and disable professionalStatus', () => {
      const paySourceControl = component.formGroup.get('paySource');
      const professionalStatusControl = component.formGroup.get('professionalStatus');
      const payWithMainIncomeControl = component.formGroup.get('payWithMainIncome');

      payWithMainIncomeControl.patchValue(false);

      expect(professionalStatusControl.disabled).toBeTruthy();
      expect(paySourceControl.enabled).toBeTruthy();
    });

    it('should enable otherPaySource when paySource value is "OTHER"', () => {
      const otherPaySourceControl = component.formGroup.get('otherPaySource');
      const paySourceControl = component.formGroup.get('paySource');

      paySourceControl.setValue('OTHER');
      paySourceControl.enable();

      expect(otherPaySourceControl.enabled).toBeTruthy();
    });

    it('should disable otherPaySource when paySource value is not "OTHER"', () => {
      const otherPaySourceControl = component.formGroup.get('otherPaySource');
      const paySourceControl = component.formGroup.get('paySource');

      paySourceControl.setValue('SOME_VALUE');

      expect(otherPaySourceControl.disabled).toBeTruthy();
    });
  });
});
