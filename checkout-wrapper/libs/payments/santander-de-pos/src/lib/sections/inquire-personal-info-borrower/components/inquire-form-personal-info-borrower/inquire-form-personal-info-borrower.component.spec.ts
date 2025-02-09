import { TestBed, ComponentFixture } from '@angular/core/testing';
import { FormGroupDirective } from '@angular/forms';
import { Store } from '@ngxs/store';

import { ModeEnum } from '@pe/checkout/form-utils';
import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import {
  PreviousAddressFormComponent,
  BankFormComponent,
  IncomeService,
  PERSON_TYPE,
  PersonTypeEnum,
  PersonalFormComponent,
  RatesCalculationApiService,
  RatesCalculationService,
} from '@pe/checkout/santander-de-pos/shared';
import { PatchFormState, SetFlow } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';

import { flowWithPaymentOptionsFixture } from '../../../../test';

import { InquireFormPersonalInfoBorrowerComponent } from './inquire-form-personal-info-borrower.component';

describe('InquireFormPersonalInfoBorrowerComponent', () => {
  const storeHelper = new StoreHelper();

  let component: InquireFormPersonalInfoBorrowerComponent;
  let fixture: ComponentFixture<InquireFormPersonalInfoBorrowerComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        CheckoutFormsInputCurrencyModule,
      ],
      declarations: [
        PersonalFormComponent,
        PreviousAddressFormComponent,
        BankFormComponent,
        InquireFormPersonalInfoBorrowerComponent,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        IncomeService,
        RatesCalculationService,
        RatesCalculationApiService,
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
      [PersonTypeEnum.Customer]: {
          personalForm: {},
      },
    }));

    fixture = TestBed.createComponent(InquireFormPersonalInfoBorrowerComponent);
    component = fixture.componentInstance;
    component.mode = ModeEnum.Edit;

    fixture.detectChanges();
  });

  describe('constructor', () => {
    it('Should check if component defined', () => {
      expect(component).toBeDefined();
    });
  });

  describe('Initialization', () => {
    it('should initialize formGroup with personalForm, prevAddressForm, and bankForm controls', () => {
      const personalFormControl = component.formGroup.get('personalForm');
      const prevAddressFormControl = component.formGroup.get('prevAddressForm');
      const bankFormControl = component.formGroup.get('bankForm');

      expect(personalFormControl).toBeTruthy();
      expect(prevAddressFormControl).toBeTruthy();
      expect(bankFormControl).toBeTruthy();
    });

    it('should disable prevAddressForm control on initialization', () => {
      expect(component.formGroup.get('prevAddressForm').disabled).toEqual(true);
    });

    it('should patch formGroup with values from the store on initialization', () => {
      jest.spyOn(component.formGroup, 'patchValue');

      component.ngOnInit();

      expect(component.formGroup.patchValue).toHaveBeenCalled();
    });
  });

  describe('Toggle Prev Address', () => {
    it('should enable prevAddressForm control when isPrevAddress is true', () => {
      const date = new Date('2023-01-01');

      jest.spyOn(component.formGroup.get('prevAddressForm'), 'enable');

      component.togglePrevAddress({ date, isPrevAddress: true });

      expect(component.formGroup.get('prevAddressForm').enable).toHaveBeenCalled();
    });

    it('should disable prevAddressForm control when isPrevAddress is false', () => {
      const date = new Date('2023-01-01');

      jest.spyOn(component.formGroup.get('prevAddressForm'), 'disable');

      component.togglePrevAddress({ date, isPrevAddress: false });

      expect(component.formGroup.get('prevAddressForm').disable).toHaveBeenCalled();
    });

    it('should update addressResidentSince$ with the provided date', () => {
      const date = new Date('2023-01-01');

      jest.spyOn(component.addressResidentSince$, 'next');

      component.togglePrevAddress({ date, isPrevAddress: true });

      expect(component.addressResidentSince$.next).toHaveBeenCalledWith(date);
    });
  });

  describe('Form Submission', () => {
    it('should call formGroupDirective.onSubmit on submit', () => {
      component['formGroupDirective'] = {
        onSubmit: jest.fn(),
      } as unknown as FormGroupDirective;

      component.submit();

      expect(component['formGroupDirective'].onSubmit).toHaveBeenCalled();
    });

    it('should dispatch PatchFormState on submit', () => {
      jest.spyOn(store, 'dispatch');

      component.submit();

      expect(store.dispatch).toHaveBeenCalled();
    });

    it('should call formGroupDirective.onSubmit and emit submitted event on onSubmit if form is valid', () => {
      jest.spyOn(component.formGroup, 'valid', 'get').mockReturnValue(true);
      jest.spyOn(component.submitted, 'emit');

      component.onSubmit();

      expect(component.submitted.emit).toHaveBeenCalledWith(component.formGroup.value);
    });

    it('should not call formGroupDirective.onSubmit or emit submitted event on onSubmit if form is invalid', () => {
      jest.spyOn(component.formGroup, 'valid', 'get').mockReturnValue(false);
      component['formGroupDirective'] = {
        onSubmit: jest.fn(),
      } as unknown as FormGroupDirective;
      jest.spyOn(component.submitted, 'emit');

      component.onSubmit();

      expect(component['formGroupDirective'].onSubmit).not.toHaveBeenCalled();
      expect(component.submitted.emit).not.toHaveBeenCalled();
    });
  });
});
