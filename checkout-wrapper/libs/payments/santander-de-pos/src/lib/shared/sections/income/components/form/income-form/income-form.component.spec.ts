import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { of } from 'rxjs';

import { CompositeForm } from '@pe/checkout/forms';
import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { PERSON_TYPE } from '@pe/checkout/santander-de-pos/shared';
import { PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, paymentFormFixture } from '../../../../../../test/fixtures';
import { GuarantorRelation, PersonTypeEnum } from '../../../../../common';
import { IncomeModule } from '../../../income.module';

import { IncomeFormComponent } from './income-form.component';

describe('IncomeFormComponent', () => {

  let component: IncomeFormComponent;
  let fixture: ComponentFixture<IncomeFormComponent>;

  let formGroup: InstanceType<typeof IncomeFormComponent>['formGroup'];
  let store: Store;

  beforeEach(() => {

    const fb = new FormBuilder();
    const formControl = fb.control(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        CheckoutFormsInputCurrencyModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(IncomeModule),
        { provide: NgControl, useValue: formControl },
        { provide: PERSON_TYPE, useValue: PersonTypeEnum.Customer },
      ],
      declarations: [
        IncomeFormComponent,
      ],
      schemas: [],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: {
        ...store.selectSnapshot(PaymentState),
        form: paymentFormFixture(),
      },
    }));

    fixture = TestBed.createComponent(IncomeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    formGroup = component.formGroup;

  });

  afterEach(() => {

    fixture?.destroy();
    jest.clearAllMocks();

  });

  it('should create an instance', () => {

    expect(component).toBeTruthy();
    expect(component instanceof CompositeForm).toBe(true);

  });

  it('should defined formGroup', () => {

    expect(formGroup.get('netIncome')).toBeTruthy();
    expect(formGroup.get('netIncome').value).toBeNull();
    expect(formGroup.get('netIncome').validator).toBeTruthy();

    expect(formGroup.get('partnerIncomeNet')).toBeTruthy();
    expect(formGroup.get('partnerIncomeNet').value).toBeNull();
    expect(formGroup.get('partnerIncomeNet').validator).toBeFalsy();

    expect(formGroup.get('otherIncomeFromHousehold')).toBeTruthy();
    expect(formGroup.get('otherIncomeFromHousehold').value).toBeNull();
    expect(formGroup.get('otherIncomeFromHousehold').validator).toBeFalsy();

    expect(formGroup.get('typeOfResident')).toBeTruthy();
    expect(formGroup.get('typeOfResident').value).toBeNull();
    expect(formGroup.get('typeOfResident').validator).toBeTruthy();

    expect(formGroup.get('incomeFromRent')).toBeTruthy();
    expect(formGroup.get('incomeFromRent').value).toBeNull();
    expect(formGroup.get('incomeFromRent').validator).toBeFalsy();


    expect(formGroup.get('incomeInfo')).toBeTruthy();
    expect(formGroup.get('incomeInfo').value).toBeNull();
    expect(formGroup.get('incomeInfo').disabled).toBeTruthy();
    expect(formGroup.get('incomeInfo').validator).toBeTruthy();

    expect(formGroup.get('housingCosts')).toBeTruthy();
    expect(formGroup.get('housingCosts').value).toBeNull();
    expect(formGroup.get('housingCosts').validator).toBeTruthy();

    expect(formGroup.get('supportPayment')).toBeTruthy();
    expect(formGroup.get('supportPayment').value).toBeNull();
    expect(formGroup.get('supportPayment').validator).toBeFalsy();

  });

  it('should netIncome validator work correctly', () => {

    const netIncome = formGroup.get('netIncome');

    netIncome.setValue(100 as any);
    expect(netIncome.valid).toBeTruthy();

    netIncome.setValue(null);
    expect(netIncome.invalid).toBeTruthy();

  });

  it('should typeOfResident validator work correctly', () => {

    const typeOfResident = formGroup.get('typeOfResident');

    typeOfResident.setValue(100 as any);
    expect(typeOfResident.valid).toBeTruthy();

    typeOfResident.setValue(null);
    expect(typeOfResident.invalid).toBeTruthy();

  });

  it('should incomeInfo validators work correctly', () => {

    const incomeInfo = formGroup.get('incomeInfo');

    incomeInfo.enable();

    incomeInfo.setValue('Test' as any);
    expect(incomeInfo.valid).toBeTruthy();

    incomeInfo.setValue('1231231' as any);
    expect(incomeInfo.invalid).toBeTruthy();

    incomeInfo.setValue(100 as any);
    expect(incomeInfo.invalid).toBeTruthy();

    incomeInfo.setValue(null);
    expect(incomeInfo.invalid).toBeTruthy();

  });

  it('should housingCosts validator work correctly', () => {

    const housingCosts = formGroup.get('housingCosts');

    housingCosts.setValue(100 as any);
    expect(housingCosts.valid).toBeTruthy();

    housingCosts.setValue(null);
    expect(housingCosts.invalid).toBeTruthy();

  });

  it('should alphaMask work correctly', () => {

    expect(component.alphaMask('123Test123')).toEqual('Test');
    expect(component.alphaMask(null)).toBeNull();

  });

  it('should correctly enable fields if personal type and typeOfGuarantorRelation is match', () => {

    component.ngOnInit();

    expect(component.personType).toBe(PersonTypeEnum.Customer || PersonTypeEnum.Guarantor);

    expect(formGroup.get('partnerIncomeNet').enabled).toBeTruthy();
    expect(formGroup.get('otherIncomeFromHousehold').enabled).toBeTruthy();
    expect(formGroup.get('typeOfResident').enabled).toBeTruthy();
    expect(formGroup.get('incomeFromRent').enabled).toBeTruthy();
    expect(formGroup.get('housingCosts').enabled).toBeTruthy();
    expect(formGroup.get('supportPayment').enabled).toBeTruthy();

  });

  it('should correctly disabled fields if personal type and typeOfGuarantorRelation is not match', () => {

    jest.spyOn(store, 'select').mockReturnValue(of(
      {
        ...paymentFormFixture(),
        detailsForm: {
          ...paymentFormFixture().detailsForm,
          typeOfGuarantorRelation: GuarantorRelation.EQUIVALENT_HOUSEHOLD,
        },
      },
    ));
    component.personType = PersonTypeEnum.Guarantor;

    component.ngOnInit();

    expect(formGroup.get('partnerIncomeNet').disabled).toBeTruthy();
    expect(formGroup.get('otherIncomeFromHousehold').disabled).toBeTruthy();
    expect(formGroup.get('typeOfResident').disabled).toBeTruthy();
    expect(formGroup.get('incomeFromRent').disabled).toBeTruthy();
    expect(formGroup.get('housingCosts').disabled).toBeTruthy();
    expect(formGroup.get('supportPayment').disabled).toBeTruthy();

  });

  it('should disabled or enabled incomeInfo base on otherIncomeFromHousehold value', () => {

    const otherIncomeFromHousehold = formGroup.get('otherIncomeFromHousehold');
    const incomeInfo = formGroup.get('incomeInfo');

    component.ngOnInit();

    otherIncomeFromHousehold.setValue(300);
    expect(incomeInfo.enabled).toBeTruthy();

    otherIncomeFromHousehold.setValue(null);
    expect(incomeInfo.disabled).toBeTruthy();

  });

  it('should updateValueAndValidity for housingCosts on typeOfResident value changed', () => {

    const updateValueAndValiditySpy = jest.spyOn(formGroup, 'updateValueAndValidity');

    component.ngOnInit();

    formGroup.get('typeOfResident').setValue(1 as any);

    expect(updateValueAndValiditySpy).toHaveBeenCalled();

  });

});
