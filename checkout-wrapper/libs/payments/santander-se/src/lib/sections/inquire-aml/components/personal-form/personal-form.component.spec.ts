

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

import { PersonalFormComponent } from './personal-form.component';



describe('personal-form', () => {
  let component: PersonalFormComponent;
  let fixture: ComponentFixture<PersonalFormComponent>;
  let store: Store;
  let formGroup: InstanceType<typeof PersonalFormComponent>['formGroup'];
  let loader: HarnessLoader;
  let citizenshipOptions: SelectOptionInterface[];

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
        PersonalFormComponent,
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

    fixture = TestBed.createComponent(PersonalFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    formGroup = component.formGroup;
    loader = TestbedHarnessEnvironment.loader(fixture);
    component.citizenshipOptions$.pipe(
      take(1),
      tap((options) => { citizenshipOptions = options }),
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
    it('shoudl enfoce min and max validator to the monthlyGrossIncome', () => {
      const monthlyGrossIncome = formGroup.get('monthlyGrossIncome');
      monthlyGrossIncome.setValue(1);
      expect(monthlyGrossIncome.valid).toBeTruthy();
      monthlyGrossIncome.setValue(null);
      expect(monthlyGrossIncome.valid).toBeFalsy();
      monthlyGrossIncome.setValue(-1);
      expect(monthlyGrossIncome.valid).toBeFalsy();
      monthlyGrossIncome.setValue(1_000_000);
      expect(monthlyGrossIncome.valid).toBeFalsy();
    });

    it('Should require citizenship', () => {
      const citizenship = formGroup.get('citizenship');
      citizenship.setValue(null);
      expect(citizenship.valid).toBeFalsy();
    });


    it('Should have correct options on citizenship', () => from(loader.getHarness(MatSelectHarness)).pipe(
        delayWhen(loader => from(loader.open())),
        switchMap(select => from(select.getOptions())),
        tap((options) => { expect(options).toHaveLength(citizenshipOptions.length) }),
        tap(async (options) => {
          const optionsText = options.map(async option => await option.getText());
          expect(await Promise.all(optionsText)).toEqual(
            citizenshipOptions.map(option => option.label)
          );
        })
      ).toPromise());
  });
});

