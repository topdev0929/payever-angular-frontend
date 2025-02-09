import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';

import { ModeEnum } from '@pe/checkout/form-utils';
import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import {
  EmploymentFormComponent,
  IncomeFormComponent,
  IncomeService,
  NO_EMPLOYMENT_PROFESSIONS,
  PERSON_TYPE,
  PersonTypeEnum,
  ProtectionFormComponent,
  RatesCalculationApiService,
  RatesCalculationService,
} from '@pe/checkout/santander-de-pos/shared';
import { PatchFormState, SetFlow, SetParams } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';

import { GuarantorRelation } from '../../../../shared';
import { flowWithPaymentOptionsFixture } from '../../../../test';

import { InquireFormIncomeBorrowerComponent } from './inquire-form-income-borrower.component';

describe('InquireFormIncomeBorrowerComponent', () => {
  const storeHelper = new StoreHelper();

  let component: InquireFormIncomeBorrowerComponent;
  let fixture: ComponentFixture<InquireFormIncomeBorrowerComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        CheckoutFormsInputCurrencyModule,
      ],
      declarations: [
        IncomeFormComponent,
        EmploymentFormComponent,
        ProtectionFormComponent,
        InquireFormIncomeBorrowerComponent,
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
    store.dispatch(new SetParams({
      merchantMode: false,
    }));

    fixture = TestBed.createComponent(InquireFormIncomeBorrowerComponent);
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
    it('should initialize formGroup with incomeForm, employmentForm, and protectionForm controls', () => {
      const incomeFormControl = component.formGroup.get('incomeForm');
      const employmentFormControl = component.formGroup.get('employmentForm');
      const protectionFormControl = component.formGroup.get('protectionForm');

      expect(incomeFormControl).toBeTruthy();
      expect(employmentFormControl).toBeTruthy();
      expect(protectionFormControl).toBeTruthy();
    });

    it('should enable employmentForm control if the customer has a valid profession', () => {
      const cProfession = 'validProfession';
      component.formGroup.patchValue({ employmentForm: { profession: cProfession } });
      jest.spyOn(component.formGroup.get('employmentForm'), 'enable');

      component.ngOnInit();

      expect(component.formGroup.get('employmentForm').enable).toHaveBeenCalled();
    });

    it('should disable employmentForm control if the customer has an invalid profession', () => {
      const cProfession: string = NO_EMPLOYMENT_PROFESSIONS[0];
      jest.spyOn(store, 'selectSnapshot').mockReturnValueOnce({
        [PersonTypeEnum.Customer]: {
          personalForm: { profession: cProfession },
        },
      });
      jest.spyOn(component.formGroup.get('employmentForm'), 'disable');

      component.ngOnInit();

      expect(component.formGroup.get('employmentForm').disable).toHaveBeenCalled();
    });

    it('should trigger protectionFormEnabled$ with true', () => {
      const protectionFormEnabledNext = jest.spyOn(component.protectionFormEnabled$, 'next');
      component['incomeService'].cpiTariff$ = new BehaviorSubject<number>(100);

      component.ngOnInit();
      expect(component['merchantMode']).toEqual(false);
      expect(protectionFormEnabledNext).toHaveBeenCalledWith(true);
    });

    it('should trigger protectionFormEnabled$ with true if guarantorRelation is NONE', () => {
      const protectionFormEnabledNext = jest.spyOn(component.protectionFormEnabled$, 'next');
      component['incomeService'].cpiTariff$ = new BehaviorSubject<number>(100);

      store.dispatch(new PatchFormState({
        detailsForm: {
          typeOfGuarantorRelation: GuarantorRelation.NONE,
        },
      }));
      component.ngOnInit();
      expect(component['merchantMode']).toEqual(false);
      expect(protectionFormEnabledNext).toHaveBeenCalledWith(true);
    });

    it('should trigger protectionFormEnabled$ with false', () => {
      const protectionFormEnabledNext = jest.spyOn(component.protectionFormEnabled$, 'next');
      component['incomeService'].cpiTariff$ = new BehaviorSubject<number>(null);

      component.ngOnInit();
      expect(component['merchantMode']).toEqual(false);
      expect(protectionFormEnabledNext).toHaveBeenCalledWith(false);
    });
  });

  describe('Form Submission', () => {
    it('should call formGroupDirective.onSubmit on submit', fakeAsync(() => {
      component.protectionFormEnabled$.next(true);

      tick();

      jest.spyOn(component['formGroupDirective'], 'onSubmit');

      component.submit();

      expect(component['formGroupDirective'].onSubmit).toHaveBeenCalledWith(null);
    }));

    it('should dispatch PatchFormState on submit', () => {
      component.formGroup.patchValue({
        incomeForm: {},
        employmentForm: {},
        protectionForm: {},
      });
      jest.spyOn(store, 'dispatch');

      component.submit();

      expect(store.dispatch).toHaveBeenCalled();
    });

    it('should call formGroupDirective.onSubmit and emit submitted event on onSubmit if form is valid', () => {
      jest.spyOn(component.formGroup, 'valid', 'get').mockReturnValue(true);
      component.formGroup.patchValue({
        incomeForm: {},
        employmentForm: {},
        protectionForm: {},
      });
      jest.spyOn(component.submitted, 'emit');

      component.onSubmit();

      expect(component.submitted.emit).toHaveBeenCalledWith(component.formGroup.value);
    });

    it('should not call formGroupDirective.onSubmit or emit submitted event on onSubmit if form is invalid', () => {
      jest.spyOn(component.formGroup, 'valid', 'get').mockReturnValue(false);
      jest.spyOn(component.submitted, 'emit');

      component.onSubmit();

      expect(component.submitted.emit).not.toHaveBeenCalled();
    });
  });
});
