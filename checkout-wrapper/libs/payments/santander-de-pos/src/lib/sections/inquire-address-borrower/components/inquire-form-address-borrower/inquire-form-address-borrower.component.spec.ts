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

import { InquireFormAddressBorrowerComponent } from './inquire-form-address-borrower.component';

describe('InquireFormAddressBorrowerComponent', () => {
  const storeHelper = new StoreHelper();

  let component: InquireFormAddressBorrowerComponent;
  let fixture: ComponentFixture<InquireFormAddressBorrowerComponent>;
  let store: Store;

  const actions$ = new Subject();

  const params = {
    forceCodeForPhoneRequired: true,
    forcePhoneRequired: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      declarations: [
        InquireFormAddressBorrowerComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        { provide: Actions, useValue: actions$ },
        {
          provide: PERSON_TYPE,
          useValue: PersonTypeEnum.Customer,
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    storeHelper.setMockData();
    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new PatchFormState({
      customer: {},
    }));
    store.dispatch(new SetParams(params));

    fixture = TestBed.createComponent(InquireFormAddressBorrowerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('constructor', () => {
    it('Should check if component defined', () => {
      expect(component).toBeDefined();
    });
  });

  describe('ngOnInit', () => {
    it('should initialize formGroup with billingAddress control', () => {
      const billingAddressControl = component.formGroup.get('billingAddress');
      expect(billingAddressControl).toBeTruthy();
    });

    it('should set billingAddress form control value on ngOnInit', () => {
      const formData = { customer: { addressForm: {} } };
      jest.spyOn(store, 'selectSnapshot').mockReturnValueOnce(formData);

      component.ngOnInit();

      expect(component.formGroup.get('billingAddress').value).toEqual(formData.customer.addressForm);
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
    it('should dispatch PatchFormState and PatchFlow actions on submit if form is valid', () => {
      const mockValidValue = { billingAddress: {} };
      const mockFormValue = { customer: { addressForm: {} } };
      jest.spyOn(component.formGroup, 'valid', 'get').mockReturnValue(true);
      component.formGroup.patchValue(mockValidValue);
      jest.spyOn(store, 'selectSnapshot').mockReturnValueOnce(mockFormValue);
      jest.spyOn(store, 'dispatch');
      component['formGroupDirective'] = {
        onSubmit: jest.fn(),
      } as unknown as FormGroupDirective;

      component.submit();

      expect(component['formGroupDirective'].onSubmit).toHaveBeenCalledWith(null);
      expect(store.dispatch).toHaveBeenCalled();
    });

    it('should emit submitted event on onSubmit if form is valid', () => {
      const mockValidValue = { billingAddress: {} };
      jest.spyOn(component.formGroup, 'valid', 'get').mockReturnValue(true);
      jest.spyOn(component.submitted, 'emit');
      component.formGroup.patchValue(mockValidValue);

      component.onSubmit();

      expect(component.submitted.emit).toHaveBeenCalledWith(mockValidValue.billingAddress);
    });

    it('should not dispatch PatchFormState and PatchFlow actions on submit if form is invalid', () => {
      jest.spyOn(component.formGroup, 'valid', 'get').mockReturnValue(false);
      jest.spyOn(store, 'dispatch');
      component['formGroupDirective'] = {
        onSubmit: jest.fn(),
      } as unknown as FormGroupDirective;

      component.submit();

      expect(component['formGroupDirective'].onSubmit).toHaveBeenCalledWith(null);
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should not emit submitted event on onSubmit if form is invalid', () => {
      jest.spyOn(component.formGroup, 'valid', 'get').mockReturnValue(false);
      jest.spyOn(component.submitted, 'emit');

      component.onSubmit();

      expect(component.submitted.emit).not.toHaveBeenCalled();
    });

    it('should get addressParams', (done) => {
      component['addressParams$'].subscribe((addressParams) => {
        expect(addressParams).toMatchObject({
          ...params,
          forceAddressOnlyFillEmptyAllowed: false,
        });
        done();
      });
    });
  });
});
