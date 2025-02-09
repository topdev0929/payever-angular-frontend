import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FormGroupDirective } from '@angular/forms';
import { Actions, Store } from '@ngxs/store';
import { Subject } from 'rxjs';

import {
  PERSON_TYPE,
  PersonTypeEnum,
} from '@pe/checkout/santander-de-pos/shared';
import { PatchFormState, SetFlow, SetParams, OpenNextStep } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../../test';

import { InquireFormAddressGuarantorComponent } from './inquire-form-address-guarantor.component';

describe('InquireFormAddressGuarantorComponent', () => {
  const storeHelper = new StoreHelper();

  let component: InquireFormAddressGuarantorComponent;
  let fixture: ComponentFixture<InquireFormAddressGuarantorComponent>;
  let store: Store;

  const actions$ = new Subject();

  const params = {
    forceAddressOnlyFillEmptyAllowed: false,
    forceCodeForPhoneRequired: true,
    forcePhoneRequired: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      declarations: [
        InquireFormAddressGuarantorComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        { provide: Actions, useValue: actions$ },
        {
          provide: PERSON_TYPE,
          useValue: PersonTypeEnum.Guarantor,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    storeHelper.setMockData();
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new PatchFormState({
      guarantor: {},
    }));
    store.dispatch(new SetParams(params));

    fixture = TestBed.createComponent(InquireFormAddressGuarantorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('constructor', () => {
    it('Should check if component defined', () => {
      expect(component).toBeDefined();
    });
  });

  describe('Initialization', () => {
    it('should initialize formGroup with addressForm control', () => {
      const addressFormControl = component.formGroup.get('addressForm');
      expect(addressFormControl).toBeTruthy();
    });

    it('should set addressForm form control value on ngOnInit', () => {
      const formData = { guarantor: { addressForm: {} } };
      jest.spyOn(store, 'selectSnapshot').mockReturnValue(formData);

      component.ngOnInit();

      expect(component.formGroup.get('addressForm').value).toEqual(formData.guarantor.addressForm);
    });
  });

  describe('loading$', () => {
    it('should be true if OpenNextStep triggered', (done) => {
      component.loading$.subscribe((loading) => {
        expect(loading).toBeTruthy();
        done();
      });

      actions$.next({ action: OpenNextStep, status: 'DISPATCHED' });
    });

    it('should be false if OpenNextStep completed', (done) => {
      component.loading$.subscribe((loading) => {
        expect(loading).toBeFalsy();
        done();
      });

      actions$.next({ action: OpenNextStep, status: 'SUCCESSFUL' });
    });
  });

  describe('Form Submission', () => {
    it('should call formGroupDirective.onSubmit on submit', () => {
      component['formGroupDirective'] = {
        onSubmit: jest.fn(),
      } as unknown as FormGroupDirective;

      component.submit();

      expect(component['formGroupDirective'].onSubmit).toHaveBeenCalledWith(null);
    });

    it('should dispatch PatchFormState and emit submitted event on onSubmit if form is valid', () => {
      const mockValidValue = { addressForm: {} };
      const mockFormValue = { guarantor: { addressForm: {} } };
      component.formGroup.patchValue(mockValidValue);
      jest.spyOn(component.formGroup, 'valid', 'get').mockReturnValue(true);
      jest.spyOn(store, 'selectSnapshot').mockReturnValueOnce(mockFormValue);
      jest.spyOn(store, 'dispatch');
      jest.spyOn(component.submitted, 'emit');

      component.onSubmit();

      expect(store.dispatch).toHaveBeenCalledWith(
        new PatchFormState({
          guarantor: {
            ...mockFormValue.guarantor,
            addressForm: mockValidValue.addressForm,
          },
        }),
      );

      expect(component.submitted.emit).toHaveBeenCalledWith(component.formGroup.value.addressForm);
    });

    it('should not dispatch PatchFormState or emit submitted event on onSubmit if form is invalid', () => {
      jest.spyOn(component.formGroup, 'valid', 'get').mockReturnValue(false);
      jest.spyOn(store, 'dispatch');
      jest.spyOn(component.submitted, 'emit');

      component.onSubmit();

      expect(store.dispatch).not.toHaveBeenCalled();
      expect(component.submitted.emit).not.toHaveBeenCalled();
    });

    it('should get addressParams', (done) => {
      component['addressParams$'].subscribe((addressParams) => {
        expect(addressParams).toMatchObject(params);
        done();
      });
    });
  });
});
