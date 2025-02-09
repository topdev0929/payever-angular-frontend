import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { take, tap } from 'rxjs/operators';

import { CompositeForm } from '@pe/checkout/forms';
import {
  PERSON_TYPE,
  PersonTypeEnum,
} from '@pe/checkout/santander-de-pos/shared';
import { PatchFormState, PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, paymentFormFixture } from '../../../../../../test/fixtures';
import { IncomeModule } from '../../../income.module';

import { EmploymentFormComponent } from './employment-form.component';
import { UNEMPLOYED_PROFESSIONS } from './employment.constants';

describe('EmploymentFormComponent', () => {

  let component: EmploymentFormComponent;
  let fixture: ComponentFixture<EmploymentFormComponent>;

  let formGroup: InstanceType<typeof EmploymentFormComponent>['formGroup'];
  let store: Store;

  beforeEach(() => {

    const fb = new FormBuilder();
    const formControl = fb.control(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(IncomeModule),
        { provide: NgControl, useValue: formControl },
        { provide: PERSON_TYPE, useValue: PersonTypeEnum.Customer },
      ],
      declarations: [
        EmploymentFormComponent,
      ],
      schemas: [],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          form: paymentFormFixture(),
        },
      },
    }));

    fixture = TestBed.createComponent(EmploymentFormComponent);
    component = fixture.componentInstance;

    formGroup = component.formGroup;

  });

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2020, 3, 1));
  });

  afterEach(() => {

    fixture?.destroy();
    jest.clearAllMocks();

  });

  afterAll(() => {

    jest.useRealTimers();

  });

  it('should create an instance', () => {

    expect(component).toBeTruthy();
    expect(component instanceof CompositeForm).toBe(true);

  });

  it('should defined formGroup', () => {

    expect(formGroup.get('employer')).toBeTruthy();
    expect(formGroup.get('employer').value).toBeNull();
    expect(formGroup.get('employer').validator).toBeTruthy();

    expect(formGroup.get('employedSince')).toBeTruthy();
    expect(formGroup.get('employedSince').value).toBeNull();
    expect(formGroup.get('employedSince').validator).toBeTruthy();

    expect(formGroup.get('_isTemporaryUntil')).toBeTruthy();
    expect(formGroup.get('_isTemporaryUntil').value).toBeNull();
    expect(formGroup.get('_isTemporaryUntil').validator).toBeFalsy();

    expect(formGroup.get('temporaryEmployedUntil')).toBeTruthy();
    expect(formGroup.get('temporaryEmployedUntil').value).toBeNull();
    expect(formGroup.get('temporaryEmployedUntil').disabled).toBeTruthy();
    expect(formGroup.get('temporaryEmployedUntil').validator).toBeTruthy();

  });

  it('should enforce max validator to the employer', () => {

    const employer = formGroup.get('employer');

    employer.setValue('employer');
    expect(employer.valid).toBeTruthy();

    employer.setValue(null);
    expect(employer.invalid).toBeTruthy();

    employer.setValue([...Array(51)].map((_, i) => String(i)).join(''));
    expect(employer.invalid).toBeTruthy();

  });

  it('should disabled form on init if isUnemployed true', () => {
    expect(formGroup.enabled).toBeTruthy();
    const formState = store.selectSnapshot(PaymentState.form);
    formState.detailsForm.customer = {
      ...formState.detailsForm.customer,
      profession: UNEMPLOYED_PROFESSIONS[0],
    };
    store.dispatch(new PatchFormState(formState));

    return component.translations$.pipe(
      take(1),
      tap(() => {
        expect(formGroup.disabled).toBeTruthy();
      }),
    ).toPromise();

  });

  it('should set _isTemporaryUntil base on temporaryEmployedUntil', () => {
    expect(formGroup.get('temporaryEmployedUntil').value).toBeNull();
    expect(formGroup.get('_isTemporaryUntil').value).toBeFalsy();
    const formState = store.selectSnapshot(PaymentState.form);
    formState.detailsForm.customer = {
      ...formState.detailsForm.customer,
      profession: 'professional',
    };
    store.dispatch(new PatchFormState(formState));
    formGroup.get('temporaryEmployedUntil').setValue('temporaryEmployedUntil');

    return component.translations$.pipe(
      take(1),
      tap(() => {
        expect(formGroup.get('_isTemporaryUntil').value).toBeTruthy();
      }),
    ).toPromise();
  });

  it('should disable or enabled temporaryEmployedUntil base on _isTemporaryUntil value', () => {

    fixture.detectChanges();

    formGroup.get('_isTemporaryUntil').patchValue(true);
    expect(formGroup.get('temporaryEmployedUntil').enabled).toBeTruthy();

    formGroup.get('_isTemporaryUntil').patchValue(false);
    expect(formGroup.get('temporaryEmployedUntil').disabled).toBeTruthy();

  });

  it('should close datepicker and update form value on onShortDateSelected', () => {

    const mockDatePicker: any = {
      close: jest.fn(),
    };

    component.onShortDateSelected(new Date(), mockDatePicker, 'employedSince');

    expect(mockDatePicker.close).toHaveBeenCalled();
    expect(formGroup.get('employedSince').value).toEqual(new Date());

  });

});
