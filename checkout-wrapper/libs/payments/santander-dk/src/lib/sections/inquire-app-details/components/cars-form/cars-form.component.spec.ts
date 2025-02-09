import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonProvidersTestHelper, CommonImportsTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { CarFinancedType, CarsFormValue } from '../../../../shared';
import { flowWithPaymentOptionsFixture, paymentOptionsFixture } from '../../../../test';

import { CarsFormComponent } from './cars-form.component';

const MAX_COUNT = 20;

describe('CarsFormComponent', () => {

  let component: CarsFormComponent;
  let fixture: ComponentFixture<CarsFormComponent>;

  let store: Store;

  let formGroup: InstanceType<typeof CarsFormComponent>['formGroup'];

  beforeEach(() => {

    const fb = new FormBuilder();
    const formControl = fb.control(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        { provide: NgControl, useValue: formControl },
      ],
      declarations: [CarsFormComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          formOptions: paymentOptionsFixture(),
        },
      },
    }));

    fixture = TestBed.createComponent(CarsFormComponent);
    component = fixture.componentInstance;

    formGroup = component.formGroup;

    fixture.detectChanges();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should create the form with initial form controls', () => {

    expect(formGroup.get('_count')).toBeTruthy();
    expect(formGroup.get('cars')).toBeTruthy();

  });

  it('should init form array with zero form groups', () => {

    expect(component.formArray.length).toBe(0);

  });

  it('should add form group to form array based on _count value decreases', () => {

    formGroup.get('_count').setValue(3);
    expect(component.formArray.length).toBe(3);

  });

  it('should update formArray if _count value decreases', () => {

    formGroup.get('_count').setValue(5);
    formGroup.get('_count').setValue(2);

    expect(component.formArray.length).toBe(2);

  });

  it('should dispatch PatchFormState action on form value change', () => {

    const mockValue: Partial<CarsFormValue> = {
      _count: 1,
      cars: [
        {
          age: 30,
          monthlyExpense: 13,
          financedType: 1,
          financedTypeView: {
            title: 'cars-1-title',
            label: 'cars-1-label',
            value: '1',
            index: 1,
          },
        },
      ],
    };

    const dispatchSpy = jest.spyOn(store, 'dispatch');

    formGroup.patchValue(mockValue);
    expect(dispatchSpy).toHaveBeenCalled();

  });

  it('should validate the _count control for maximum allowed value', () => {

    formGroup.get('_count').setValue(MAX_COUNT + 1);
    expect(formGroup.get('_count').valid).toBeFalsy();

  });

  it('should enable or disable cars form controls base on index', () => {

    component['createForm']();
    const firstCarGroup = component.controlsArray[0];

    firstCarGroup.get('financedTypeView').setValue({
        value: CarFinancedType.CarsFinancedTypePrivate,
        index: 0,
    });
    fixture.detectChanges();

    expect(firstCarGroup.get('age').enabled).toBeTruthy();
    expect(firstCarGroup.get('monthlyExpense').disabled).toBeTruthy();
    expect(firstCarGroup.get('financedType').value).toEqual(CarFinancedType.CarsFinancedTypePrivate);

    firstCarGroup.get('financedTypeView').setValue({
      value: CarFinancedType.CarsFinancedTypeLeased,
      index: 1,
    });
    fixture.detectChanges();

    expect(firstCarGroup.get('age').disabled).toBeTruthy();
    expect(firstCarGroup.get('monthlyExpense').enabled).toBeTruthy();
    expect(firstCarGroup.get('financedType').value).toEqual(CarFinancedType.CarsFinancedTypeLeased);

    firstCarGroup.get('financedTypeView').setValue({
      value: CarFinancedType.CarsFinancedTypeLeasedWithoutService,
      index: 2,
    });
    fixture.detectChanges();

    expect(firstCarGroup.get('age').enabled).toBeTruthy();
    expect(firstCarGroup.get('monthlyExpense').enabled).toBeTruthy();
    expect(firstCarGroup.get('financedType').value).toEqual(CarFinancedType.CarsFinancedTypeLeasedWithoutService);

    firstCarGroup.get('financedTypeView').setValue({
      value: CarFinancedType.CarsFinancedTypeCompany,
      index: 3,
    });
    fixture.detectChanges();

    expect(firstCarGroup.get('age').disabled).toBeTruthy();
    expect(firstCarGroup.get('monthlyExpense').disabled).toBeTruthy();
    expect(firstCarGroup.get('financedType').value).toEqual(CarFinancedType.CarsFinancedTypeCompany);

  });


  it('should trackByIdx return correct index', () => {

    expect(component.trackByIdx(1)).toEqual(1);

  });

  it('should get options from store', (done) => {

    const expectedOptions: any = {
      carsAges: paymentOptionsFixture().carsAges.map((option, index) => (
        {
          label: undefined,
          title: `santander-dk.carsAges.${option.value}`,
          value: option.value,
          index,
        }
      )),
      carsFinancedTypes: paymentOptionsFixture().carsAges.map((option, index) => (
        {
          label: undefined,
          title: `santander-dk.carsFinancedTypes.${option.value}`,
          value: option.value,
          index,
        }
      )),
    };

    component.options$.subscribe((options) => {
      expect(options).toEqual(expectedOptions);

      done();
    });

  });

});
