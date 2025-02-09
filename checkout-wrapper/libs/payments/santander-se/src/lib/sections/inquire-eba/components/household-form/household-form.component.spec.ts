import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';
import { MatSelectHarness } from '@angular/material/select/testing';
import { Store } from '@ngxs/store';
import { from } from 'rxjs';
import { delayWhen, switchMap, take, tap } from 'rxjs/operators';

import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { CheckoutFormsInputModule } from '@pe/checkout/forms/input';
import { PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum, SelectOptionInterface } from '@pe/checkout/types';

import { UtilStepService } from '../../../../services';
import { PaymentOptions, flowWithPaymentOptionsFixture } from '../../../../test/fixtures';


import { HouseholdFormComponent } from './household-form.component';

describe('household-form', () => {
  let component: HouseholdFormComponent;
  let fixture: ComponentFixture<HouseholdFormComponent>;
  let store: Store;
  let formGroup: InstanceType<typeof HouseholdFormComponent>['formGroup'];
  let loader: HarnessLoader;
  let accommodationTypeOptions: SelectOptionInterface[];

  beforeEach(() => {
    const fb = new FormBuilder();
    const financeDetailsForm = fb.control(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        CheckoutFormsInputModule,
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
        HouseholdFormComponent,
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

    fixture = TestBed.createComponent(HouseholdFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    formGroup = component.formGroup;
    loader = TestbedHarnessEnvironment.loader(fixture);
    component.accommodationTypeOptions$.pipe(
      take(1),
      tap((options) => { accommodationTypeOptions = options }),
    ).subscribe();
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

  describe('component', () => {
    it('should enforce min and max validator to the housingCostPerMonth', () => {
      const housingCostPerMonth = formGroup.get('housingCostPerMonth');
      housingCostPerMonth.setValue(1);
      expect(housingCostPerMonth.valid).toBeTruthy();
      housingCostPerMonth.setValue(null);
      expect(housingCostPerMonth.hasError('required')).toBeTruthy();
      housingCostPerMonth.setValue(-1);
      expect(housingCostPerMonth.valid).toBeFalsy();
      housingCostPerMonth.setValue(1_000_000);
      expect(housingCostPerMonth.valid).toBeFalsy();
    });

    it('should require accommodationType', () => {
      const accommodationType = formGroup.get('accommodationType');
      accommodationType.setValue(null);
      expect(accommodationType.hasError('required')).toBeTruthy();
    });

    it('Should require numberOfChildren', () => {
      const numberOfChildren = formGroup.get('numberOfChildren');
      numberOfChildren.setValue(null);
      expect(numberOfChildren.hasError('required')).toBeTruthy();
    });


    it('Should have correct options on citizenship', () => from(loader.getHarness(MatSelectHarness)).pipe(
      delayWhen(loader => from(loader.open())),
      switchMap(select => from(select.getOptions())),
      tap((options) => { expect(options).toHaveLength(accommodationTypeOptions.length) }),
      tap(async (options) => {
        const optionsText = options.map(async option => await option.getText());
        expect(await Promise.all(optionsText)).toEqual(
          accommodationTypeOptions.map(option => option.label)
        );
      })
    ).toPromise());
  });
});
