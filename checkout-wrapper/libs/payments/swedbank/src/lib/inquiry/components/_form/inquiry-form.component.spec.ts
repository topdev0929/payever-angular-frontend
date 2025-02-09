import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroupDirective } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';

import { PaymentSubmissionService } from '@pe/checkout/payment';
import { PatchFormState, PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { flowWithPaymentOptionsFixture, paymentFormFixture } from '../../../test';
import { DetailsFormComponent } from '../details-form';

import { InquiryFormComponent } from './inquiry-form.component';

describe('InquiryFormComponent', () => {

  let component: InquiryFormComponent;
  let fixture: ComponentFixture<InquiryFormComponent>;

  let store: Store;
  const submit$ = new Subject<void>();

  let formGroupDirective: Partial<FormGroupDirective>;

  beforeEach(() => {

    formGroupDirective = {
      onSubmit: jest.fn(),
    };

    TestBed.configureTestingModule({
      declarations: [
        InquiryFormComponent,
        DetailsFormComponent,
      ],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        FormGroupDirective,
        { provide: PaymentSubmissionService, useValue: submit$ },
        { provide: FormGroupDirective, useValue: formGroupDirective },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SWEDBANK_CREDITCARD]: {
        ...store.selectSnapshot(PaymentState),
        form: paymentFormFixture(),
      },
    }));

    fixture = TestBed.createComponent(InquiryFormComponent);
    component = fixture.componentInstance;

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should create the form with initial form state', () => {

    expect(component.formGroup.get('detailsForm')).toBeTruthy();
    expect(component.formGroup.get('detailsForm').value).toBeNull();
    expect(component.formGroup.get('detailsForm').validator).toBeNull();

  });

  it('should patch form on init', () => {

    const patchSpy = jest.spyOn(component.formGroup, 'patchValue');

    component.ngOnInit();

    component.formGroup.valueChanges.subscribe({
      next: () => {
        expect(patchSpy).toHaveBeenCalledWith(paymentFormFixture());
      },
    });



  });

  it('should dispatch PatchFormState on value changes', (done) => {

    const mockFormValues: any = {
      detailsForm: {
        phone: '+4000000',
      },
    };

    const dispatchSpy = jest.spyOn(store, 'dispatch');

    component.ngOnInit();

    component.formGroup.valueChanges.subscribe({
      next: () => {
        done();
        expect(component.formGroup.value).toEqual(mockFormValues);
        expect(dispatchSpy).toHaveBeenCalledWith(new PatchFormState(mockFormValues));
      },
    });

    component.formGroup.patchValue(mockFormValues);

  });

  it('should allowScrollToError return false', () => {

    expect(component['allowScrollToError']).toBeFalsy();

  });

  it('should handle input', () => {

    component.billingAddressPhone = '+304949302';

    expect(component.billingAddressPhone).toEqual('+304949302');

  });

  it('should handle submitted when form valid', (done) => {

    component['formGroupDirective'] = {
      onSubmit: jest.fn(),
    } as unknown as FormGroupDirective;

    component.formGroup.setValue(paymentFormFixture() as any);

    component.submitted.subscribe((value) => {
      expect(component.formGroup.valid).toBeTruthy();
      expect(value).toEqual(paymentFormFixture());

      done();
    });

    component['submit$'].next();

  });

});
