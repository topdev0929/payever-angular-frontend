import { TestBed, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { FormGroupDirective } from '@angular/forms';
import { Store } from '@ngxs/store';

import { ModeEnum } from '@pe/checkout/form-utils';
import {
  PreviousAddressFormComponent,
  GuarantorDetailsFormComponent,
  GuarantorRelation,
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

import { InquireFormPersonalInfoGuarantorComponent } from './inquire-form-personal-info-guarantor.component';

describe('InquireFormPersonalInfoGuarantorComponent', () => {
  const storeHelper = new StoreHelper();

  let component: InquireFormPersonalInfoGuarantorComponent;
  let fixture: ComponentFixture<InquireFormPersonalInfoGuarantorComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      declarations: [
        PersonalFormComponent,
        PreviousAddressFormComponent,
        GuarantorDetailsFormComponent,
        InquireFormPersonalInfoGuarantorComponent,
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

    fixture = TestBed.createComponent(InquireFormPersonalInfoGuarantorComponent);
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
    it('should initialize the form group with the correct structure', () => {
      expect(component.formGroup.get('addressForm')).toBeTruthy();
      expect(component.formGroup.get('personalForm')).toBeTruthy();
      expect(component.formGroup.get('prevAddressForm')).toBeTruthy();
    });

    it('should update form group on ngOnInit', () => {
      component.ngOnInit();

      expect(component.formGroup.value).toEqual({
        personalForm: expect.anything(),
      });
    });
  });

  describe('Form Handling', () => {
    it('should enable or disable addressForm based on toggleDetailsForm$', fakeAsync(() => {
      const formData = {
        detailsForm: {
          typeOfGuarantorRelation: GuarantorRelation.EQUIVALENT_HOUSEHOLD,
        },
      };

      component.ngOnInit();

      store.dispatch(new PatchFormState(formData));

      tick();

      expect(component.formGroup.get('addressForm').enabled).toBe(true);
    }));

    it('should call formGroupDirective.onSubmit on submit', () => {
      component['formGroupDirective'] = {
        onSubmit: jest.fn(),
      } as unknown as FormGroupDirective;

      component.submit();

      expect(component['formGroupDirective'].onSubmit).toHaveBeenCalledWith(null);
    });

    it('should dispatch PatchFormState action on submit if form is valid', () => {
      jest.spyOn(component.formGroup, 'valid', 'get').mockReturnValueOnce(true);
      jest.spyOn(component.submitted, 'emit');
      jest.spyOn(store, 'dispatch');

      component.onSubmit();

      expect(component.submitted.emit).toHaveBeenCalledWith(component.formGroup.value);
    });
  });

  describe('Address Form Toggling', () => {
    it('should toggle prevAddressForm based on togglePrevAddress', () => {
      const event = { date: new Date('2023-01-01'), isPrevAddress: true };

      component.togglePrevAddress(event);

      expect(component.formGroup.get('prevAddressForm').enabled).toBe(true);
    });
  });
});
