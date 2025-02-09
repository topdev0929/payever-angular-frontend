import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { UtilStepService } from '../../../../services';
import { EMPLOYMENT_TYPE } from '../../../../shared';
import { PaymentOptions, flowWithPaymentOptionsFixture } from '../../../../test/fixtures';

import { FinanceDetailsFormComponent, UNEMPLOYED_TYPES } from './finance-details-form.component';


describe('finance-details-form', () => {
  let component: FinanceDetailsFormComponent;
  let fixture: ComponentFixture<FinanceDetailsFormComponent>;
  let store: Store;
  let formGroup: InstanceType<typeof FinanceDetailsFormComponent>['formGroup'];

  beforeEach(() => {
    const fb = new FormBuilder();
    const financeDetailsForm = fb.control(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        CheckoutFormsInputCurrencyModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        {
          provide: NgControl,
          useValue: financeDetailsForm,
        },
        UtilStepService,
      ],
      declarations: [
        FinanceDetailsFormComponent,
      ],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_SE]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          formOptions: PaymentOptions,
        },
      },
    }));
    fixture = TestBed.createComponent(FinanceDetailsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    formGroup = component.formGroup;
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });


  describe('Constructor', () => {
    it('Should create an instance', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('formGroup validators', () => {
    it('should require thirdPartyDeclaration to checked', () => {
      const control = formGroup.get('thirdPartyDeclaration');
      control.setValue(false);
      expect(control.hasError('required')).toBeTruthy();
      control.setValue(null);
      expect(control.hasError('required')).toBeTruthy();
      control.setValue(true);
      expect(control.hasError('required')).toBe(false);
    });

    it('should require all expect primaryIncomeRepayment', () => {
      Object.entries(formGroup.controls).filter(([key]) => ![
        'primaryIncomeRepayment',
      ].includes(key))
        .forEach(([key, control]) => {
          control.enable();
          control.setValue(null);
          expect(`${key} ${control.hasError('required')}`).toEqual(`${key} true`);
        });
    });
  });
  describe('should toggle controls based on employmentType', () => {
    const expectations = () => {
      const employmentType = formGroup.get('employmentType');
      const isEmployed = employmentType.value && !UNEMPLOYED_TYPES.includes(employmentType.value);
      const employer = formGroup.get('employer');
      const primaryIncomeRepayment = formGroup.get('primaryIncomeRepayment');
      const repaymentSource = formGroup.get('repaymentSource');

      if (isEmployed) {
        expect(employer.disabled).toBe(false);
        expect(primaryIncomeRepayment.disabled).toBe(false);
      } else {
        expect(employer.disabled).toBe(true);
        expect(primaryIncomeRepayment.disabled).toBe(true);
        expect(repaymentSource.disabled).toBe(false);
      }
    };
    Object.keys(EMPLOYMENT_TYPE).forEach((type) => {
      it(`when employmentType is ${type}`, () => {
        formGroup.get('employmentType').setValue(type as keyof typeof EMPLOYMENT_TYPE);
        expectations();
      });
    });
  });

  describe('component', () => {
    it('should prefill employmentType', () => {
      const employmentType = formGroup.get('employmentType');
      expect(employmentType.value).toEqual(Object.keys(EMPLOYMENT_TYPE)[0]);
    });
  });
});

