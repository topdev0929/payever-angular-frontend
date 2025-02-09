import { registerLocaleData } from '@angular/common';
import * as de from '@angular/common/locales/de';
import { CUSTOM_ELEMENTS_SCHEMA, importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import dayjs from 'dayjs';

import { CompositeForm } from '@pe/checkout/forms';
import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { PaymentState, SetFlow, SetPayments, ParamsState, SetParams } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, paymentFormFixture, paymentOptionsFixture } from '../../../../../test';
import { GuarantorRelation, WeekOfDelivery } from '../../../../common';
import { RateModule } from '../../rate.module';

import { DetailsFormComponent } from './details-form.component';


describe('DetailsFormComponent', () => {

  let component: DetailsFormComponent;
  let fixture: ComponentFixture<DetailsFormComponent>;

  let formGroup: InstanceType<typeof DetailsFormComponent>['formGroup'];
  let customerForm: InstanceType<typeof DetailsFormComponent>['customerForm'];
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
        importProvidersFrom(RateModule),
        { provide: NgControl, useValue: formControl },
      ],
      declarations: [
        DetailsFormComponent,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    registerLocaleData(de.default);

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          form: paymentFormFixture(),
          formOptions: paymentOptionsFixture(),
        },
      },
    }));
    store.dispatch(new SetParams({
      ...store.selectSnapshot(ParamsState),
      merchantMode: true,
    }));

    fixture = TestBed.createComponent(DetailsFormComponent);
    component = fixture.componentInstance;

    formGroup = component['formGroup'];
    customerForm = component['customerForm'];

  });

  afterEach(() => {

    jest.clearAllMocks();
    fixture?.destroy();

  });

  it('should create an instance', () => {

    expect(component).toBeTruthy();
    expect(component instanceof CompositeForm).toBe(true);

  });

  it('should defined formGroup', () => {

    expect(formGroup.get('_enableDesiredInstalment')).toBeTruthy();
    expect(formGroup.get('_enableDesiredInstalment').validator).toBeTruthy();

    expect(formGroup.get('commodityGroup')).toBeTruthy();
    expect(formGroup.get('commodityGroup').validator).toBeTruthy();

    expect(formGroup.get('_condition_view')).toBeTruthy();
    expect(formGroup.get('_condition_view').validator).toBeTruthy();

    expect(formGroup.get('condition')).toBeTruthy();
    expect(formGroup.get('condition').validator).toBeTruthy();

    expect(formGroup.get('_program_view')).toBeTruthy();
    expect(formGroup.get('_program_view').validator).toBeTruthy();

    expect(formGroup.get('typeOfGuarantorRelation')).toBeTruthy();
    expect(formGroup.get('typeOfGuarantorRelation').validator).toBeTruthy();

    expect(formGroup.get('weekOfDelivery')).toBeTruthy();
    expect(formGroup.get('weekOfDelivery').validator).toBeTruthy();

    expect(formGroup.get('_weekOfDelivery_view')).toBeTruthy();
    expect(formGroup.get('_weekOfDelivery_view').validator).toBeTruthy();

    expect(formGroup.get('_customWeekOfDelivery_view')).toBeTruthy();
    expect(formGroup.get('_customWeekOfDelivery_view').validator).toBeTruthy();

    expect(formGroup.get('dayOfFirstInstalment')).toBeTruthy();
    expect(formGroup.get('dayOfFirstInstalment').validator).toBeTruthy();

    expect(formGroup.get('customer')).toBeTruthy();
    expect(formGroup.get('customer').validator).toBeFalsy();

    expect(formGroup.get('_downPayment_view')).toBeTruthy();
    expect(formGroup.get('_downPayment_view').validator).toBeTruthy();

    expect(formGroup.get('downPayment')).toBeTruthy();
    expect(formGroup.get('downPayment').validator).toBeFalsy();

  });

  it('should defined customerForm', () => {

    expect(customerForm.get('profession')).toBeTruthy();
    expect(customerForm.get('profession').validator).toBeTruthy();

    expect(customerForm.get('profession')).toBeTruthy();
    expect(customerForm.get('profession').validator).toBeTruthy();

  });

  it('should get detailsForm return details form from state', () => {

    expect(component.detailsForm).toEqual(paymentFormFixture().detailsForm);

  });

  it('should set default customerForm form values', () => {

    const professionValue = paymentFormFixture().detailsForm.customer.profession;
    const personalDateOfBirthValue = paymentFormFixture().detailsForm.customer.personalDateOfBirth;

    expect(professionValue).not.toBeNull();
    expect(customerForm.get('profession').value).toEqual(professionValue);

    expect(personalDateOfBirthValue).not.toBeNull();
    expect(customerForm.get('personalDateOfBirth').value).toEqual(personalDateOfBirthValue);

  });

  it('should disabled form values if merchantMode not true', () => {

    expect(component['merchantMode']).toBeTruthy();

    expect(customerForm.get('profession').disabled).toBeFalsy();
    expect(customerForm.get('personalDateOfBirth').disabled).toBeFalsy();

    expect(formGroup.get('commodityGroup').disabled).toBeFalsy();
    expect(formGroup.get('_condition_view').disabled).toBeFalsy();
    expect(formGroup.get('_program_view').disabled).toBeFalsy();
    expect(formGroup.get('typeOfGuarantorRelation').disabled).toBeFalsy();
    expect(formGroup.get('weekOfDelivery').disabled).toBeFalsy();
    expect(formGroup.get('_weekOfDelivery_view').disabled).toBeFalsy();
    expect(formGroup.get('_customWeekOfDelivery_view').disabled).toBeFalsy();

  });

  it('should show Apply return false if values are the same', (done) => {

    fixture.detectChanges();

    formGroup.get('_downPayment_view').setValue(100);
    formGroup.get('downPayment').setValue(100);

    component['showApply$'].subscribe((condition) => {
      expect(condition).toBeFalsy();

      done();
    });

  });

  it('should isComfortCardCondition return correct condition', (done) => {

    formGroup.get('condition').setValue(paymentOptionsFixture().conditions[0].programs[0].key);

    fixture.detectChanges();

    component['isComfortCardCondition$'].subscribe((condition) => {
      expect(condition).toEqual(paymentOptionsFixture().conditions[0]);

      done();
    });

  });

  it('should set _downPayment_view on init', () => {

    formGroup.get('downPayment').setValue(100);
    expect(formGroup.get('_downPayment_view').value).toBeNull();

    component.ngOnInit();

    expect(formGroup.get('_downPayment_view').value).toEqual(100);

  });

  it('should correct update condition on init', () => {

    const expectedValue = paymentOptionsFixture().conditions[0].programs[0].key;
    const expectedCondition = true;
    const isDefaultMerchantConditionSpy = jest.spyOn(component['detailsFormService'], 'isDefaultMerchantCondition')
      .mockReturnValue(expectedCondition);

    expect(formGroup.get('condition').value).toBeNull();
    expect(formGroup.get('_enableDesiredInstalment').value).toBeNull();

    component.ngOnInit();

    formGroup.get('_program_view').setValue(expectedValue);

    expect(formGroup.get('condition').value).toEqual(expectedValue);
    expect(formGroup.get('_enableDesiredInstalment').value).toEqual(expectedCondition);
    expect(isDefaultMerchantConditionSpy).toHaveBeenCalledWith(paymentOptionsFixture().conditions, expectedValue);

  });

  it('should correct toggle custom week', () => {

    component.ngOnInit();

    formGroup.get('_weekOfDelivery_view').setValue(WeekOfDelivery.OTHER_WEEK);
    expect(formGroup.get('_customWeekOfDelivery_view').enabled).toBeTruthy();

    formGroup.get('_weekOfDelivery_view').setValue(WeekOfDelivery.THIS_WEEK);
    expect(formGroup.get('_customWeekOfDelivery_view').disabled).toBeTruthy();

    formGroup.get('_weekOfDelivery_view').setValue(WeekOfDelivery.NEXT_WEEK);
    expect(formGroup.get('_customWeekOfDelivery_view').disabled).toBeTruthy();

  });

  it('should correct set week', () => {

    const date = new Date(2023, 11, 4);
    const fixedDate = '04/12/2023';
    const fixDate = jest.spyOn(component['dateUtilService'], 'fixDate')
      .mockReturnValue(fixedDate);

    component.ngOnInit();

    formGroup.get('_weekOfDelivery_view').setValue(WeekOfDelivery.THIS_WEEK);
    expect(formGroup.get('weekOfDelivery').value).toEqual(dayjs().format('W.YYYY'));

    formGroup.get('_weekOfDelivery_view').setValue(WeekOfDelivery.NEXT_WEEK);
    expect(formGroup.get('weekOfDelivery').value).toEqual(dayjs().add(1, 'week').format('W.YYYY'));

    formGroup.get('_customWeekOfDelivery_view').enable();
    formGroup.get('_customWeekOfDelivery_view').setValue(date);
    expect(fixDate).toHaveBeenCalledWith(date);
    expect(formGroup.get('weekOfDelivery').value).toEqual(dayjs(fixedDate).format('W.YYYY'));

  });

  it('should update typeOfGuarantorRelation if condition changed', () => {

    expect(formGroup.get('condition').value).toBeNull();
    expect(formGroup.get('typeOfGuarantorRelation').value).toBeNull();

    component.ngOnInit();
    formGroup.get('condition').setValue(paymentOptionsFixture().conditions[0].programs[0].key);

    expect(formGroup.get('condition').value).not.toBeNull();
    expect(formGroup.get('typeOfGuarantorRelation').value).toEqual(GuarantorRelation.NONE);

  });

  describe('applyDownPayment', () => {
    beforeEach(() => {
      formGroup.get('_downPayment_view').enable();
      formGroup.get('downPayment').enable();
    });

    it('should getMaxDownPayment return correct max down payment', () => {
      const total = flowWithPaymentOptionsFixture().total;
      const min = flowWithPaymentOptionsFixture().paymentOptions[0].min;
      expect(component['maxDownPayment']).toEqual(total - min);
    });

    it('should applyDownPayment update downPayment if no max error', () => {

      const maxDownPayment = component['maxDownPayment'];
      const _downPayment_view = formGroup.get('_downPayment_view');
      const downPayment = formGroup.get('downPayment');
      const validValue = maxDownPayment - 1;
      const invalidValue = maxDownPayment + 1;

      expect(_downPayment_view.value).toBeNull();
      expect(downPayment.value).toBeNull();

      _downPayment_view.patchValue(invalidValue);
      fixture.detectChanges();
      component['applyDownPayment']();
      expect(downPayment.value).toEqual(null);

      _downPayment_view.setValue(validValue);
      fixture.detectChanges();
      component['applyDownPayment']();
      expect(downPayment.value).toEqual(validValue);

      _downPayment_view.setValue(invalidValue);
      fixture.detectChanges();
      component['applyDownPayment']();
      expect(downPayment.value).toEqual(validValue);

      _downPayment_view.setValue(maxDownPayment);
      fixture.detectChanges();
      component['applyDownPayment']();
      expect(downPayment.value).toEqual(maxDownPayment);

    });
  });

});
