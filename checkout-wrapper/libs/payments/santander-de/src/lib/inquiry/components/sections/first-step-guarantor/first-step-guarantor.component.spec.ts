import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { ModeEnum } from '@pe/checkout/form-utils';
import { PatchFormState, PaymentState, SetFlow, SetPaymentOptions } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';
import { SalutationEnum } from '@pe/checkout/types';
import { ContinueButtonComponent } from '@pe/checkout/ui/continue-button';
import { ProgressButtonContentComponent } from '@pe/checkout/ui/progress-button-content';
import { CheckoutUiTooltipModule } from '@pe/checkout/ui/tooltip';

import { CustomerFormComponent } from '../../../../shared/sections/components';
import { GuarantorRelation } from '../../../../shared/types';
import { flowWithPaymentOptionsFixture, formOptionsInstallmentFixture } from '../../../../test';

import { FirstStepGuarantorFormComponent } from './first-step-guarantor.component';
import { FirstStepGuarantorModule } from './first-step-guarantor.module';

describe('FirstStepGuarantorFormComponent', () => {
  const storeHelper = new StoreHelper();

  let component: FirstStepGuarantorFormComponent;
  let fixture: ComponentFixture<FirstStepGuarantorFormComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        CheckoutUiTooltipModule,
        FirstStepGuarantorModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
      ],
      declarations: [
        CustomerFormComponent,
        ContinueButtonComponent,
        ProgressButtonContentComponent,
        FirstStepGuarantorFormComponent,
      ],
    }).compileComponents();

    storeHelper.setMockData();
    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPaymentOptions({
      ...flowWithPaymentOptionsFixture().paymentOptions,
      formOptions: formOptionsInstallmentFixture,
    }));
    store.dispatch(new PatchFormState({
      customer: {
        personalForm: {
          typeOfGuarantorRelation: GuarantorRelation.EQUIVALENT_HOUSEHOLD,
        },
      },
    }));

    fixture = TestBed.createComponent(FirstStepGuarantorFormComponent);
    component = fixture.componentInstance;

    component.mode = ModeEnum.Edit;

    fixture.detectChanges();
  });

  describe('Constructor', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });

  describe('loading$', () => {
    it('should set loading$ to true on form submission', (done) => {
      jest.spyOn(component.submitted, 'emit');
      const expectedLoadingValue = true;

      component.loading$.subscribe((value) => {
        expect(value).toBe(expectedLoadingValue);
        done();
      });

      component.submitted.emit(true);
    });
  });

  describe('ngOnInit', () => {
    it('should set formGroup values in ngOnInit', () => {
      const mockFlow = {
        billingAddress: {
          salutation: SalutationEnum.SALUTATION_MR,
          firstName: 'John',
          lastName: 'Doe',
          phone: '+4985012345',
        },
      };


      component['flow'].billingAddress = mockFlow.billingAddress;

      const spyPatchValue = jest.spyOn(component.formGroup, 'patchValue');

      component.ngOnInit();

      store.selectOnce(PaymentState.form).subscribe(() => {
        expect(spyPatchValue).toHaveBeenCalledWith({
          ...component.formGroup.value,
          personalForm: {
            ...component.formGroup.get('personalForm').value,
            addressLandlinePhone: '',
            addressCellPhone: '',
          },
        });
      });
    });

    it('should set formGroup values with empty phone values when phone type is not FIXED_LINE', () => {
      const mockFlow = {
        billingAddress: {
          salutation: SalutationEnum.SALUTATION_MR,
          firstName: 'John',
          lastName: 'Doe',
          phone: '+4985012345',
        },
      };

      component['flow'].billingAddress = mockFlow.billingAddress;

      const spyPatchValue = jest.spyOn(component.formGroup, 'patchValue');

      component.ngOnInit();

      store.selectOnce(PaymentState.form).subscribe(
        () => {
          expect(spyPatchValue).toHaveBeenCalledWith({
            ...component.formGroup.value,
            personalForm: {
              ...component.formGroup.get('personalForm').value,
              addressLandlinePhone: '',
              addressCellPhone: '',
            },
          });
        }
      );
    });

    it('should dispatch PatchFormState action on form value changes', () => {
      const mockFormValue: any = {
        personalForm: {
          addressCellPhone: '',
          addressLandlinePhone: '',
          addressResidentSince: null,
          identificationDateOfExpiry: null,
          identificationDateOfIssue: null,
          identificationNumber: null,
          identificationPlaceOfIssue: null,
          personalBirthName: '',
          personalMaritalStatus: null,
          personalNationality: null,
          personalOtherNationality: null,
          personalPlaceOfBirth: null,
          personalSalutation: null,
          personalTitle: '',
          typeOfIdentification: null,
        },
        bankForm: {
          bank_i_b_a_n: null,
        },
        addressForm: {},
      };

      const spyDispatch = jest.spyOn(component['store'], 'dispatch');

      component.formGroup.valueChanges.subscribe({
        next: () => {
          expect(spyDispatch).toHaveBeenCalledWith(new PatchFormState(mockFormValue));
        },
      });
      component.formGroup.patchValue(mockFormValue);
    });
  });

  describe('onContinue', () => {
    it('should call onSubmit on formGroupDirective and emit submitted event if form is valid', () => {
      const mockFormGroupDirective = {
        onSubmit: jest.fn(),
      };

      const spyEmit = jest.spyOn(component.submitted, 'emit');

      jest.spyOn(component.formGroup, 'valid', 'get').mockReturnValueOnce(true);

      component['formGroupDirective'] = mockFormGroupDirective as any;

      component.onContinue();

      expect(mockFormGroupDirective.onSubmit).toHaveBeenCalledWith(null);
      expect(spyEmit).toHaveBeenCalled();
    });

    it('should not emit submitted event if form is invalid', () => {
      const mockFormGroupDirective = {
        onSubmit: jest.fn(),
      };

      const spyEmit = jest.spyOn(component.submitted, 'emit');

      jest.spyOn(component.formGroup, 'valid', 'get').mockReturnValueOnce(false);

      component['formGroupDirective'] = mockFormGroupDirective as any;

      component.onContinue();

      expect(mockFormGroupDirective.onSubmit).toHaveBeenCalledWith(null);
      expect(spyEmit).not.toHaveBeenCalled();
    });
  });
});
