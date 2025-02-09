import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { delay, take, tap } from 'rxjs/operators';

import { ModeEnum } from '@pe/checkout/form-utils';
import { AddressAutocompleteService } from '@pe/checkout/forms/address-autocomplete';
import { PatchFormState, PaymentState, SetFlow, SetFormState, SetPaymentOptions } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper, clearValidators } from '@pe/checkout/testing';
import { SalutationEnum } from '@pe/checkout/types';
import { ContinueButtonComponent } from '@pe/checkout/ui/continue-button';
import { ProgressButtonContentComponent } from '@pe/checkout/ui/progress-button-content';
import { CheckoutUiTooltipModule } from '@pe/checkout/ui/tooltip';

import { CustomerFormComponent } from '../../../../shared/sections/components/customer-form';
import { flowWithPaymentOptionsFixture, formOptionsInstallmentFixture } from '../../../../test';

import { FirstStepBorrowerFormComponent } from './first-step-borrower.component';
import { FirstStepBorrowerModule } from './first-step-borrower.module';

describe('FirstStepFormComponent', () => {
  const storeHelper = new StoreHelper();

  let component: FirstStepBorrowerFormComponent;
  let fixture: ComponentFixture<FirstStepBorrowerFormComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        CheckoutUiTooltipModule,
        FirstStepBorrowerModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        AddressAutocompleteService,
        NgControl,
      ],
      declarations: [
        CustomerFormComponent,
        ContinueButtonComponent,
        ProgressButtonContentComponent,
        FirstStepBorrowerFormComponent,
      ],
    }).compileComponents();

    storeHelper.setMockData();
    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPaymentOptions(formOptionsInstallmentFixture));
    store.dispatch(new SetFormState({
      customerForm: {},
    }));

    fixture = TestBed.createComponent(FirstStepBorrowerFormComponent);
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

      jest.spyOn(component as any, 'isPhoneTypeMatches').mockReturnValueOnce(false);

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

    it('should dispatch PatchFormState action on form value changes', (done) => {
      const mockFormValue: any = {
        personalForm: {
          addressCellPhone: '',
          addressLandlinePhone: '',
          addressResidentSince: null,
          personalBirthName: '',
          personalMaritalStatus: null,
          personalNationality: null,
          personalPlaceOfBirth: null,
          personalSalutation: null,
          personalTitle: '',
          typeOfIdentification: null,
        },
        employmentForm: {
        },
      };

      const spyDispatch = jest.spyOn(component['store'], 'dispatch');

      component.formGroup.valueChanges.pipe(
        delay(300),
        take(1),
        tap((value) => {
          expect(spyDispatch).toHaveBeenCalledWith(new PatchFormState({ customer: value }));
          done();
        })
      ).subscribe();

      component.formGroup.patchValue(mockFormValue);
    });
  });

  describe('onContinue', () => {
    it('should call onSubmit on formGroupDirective and emit submitted event if form is valid', () => {
      const mockFormGroupDirective = {
        onSubmit: jest.fn(),
      };

      const spyEmit = jest.spyOn(component.submitted, 'emit');
      clearValidators(component.formGroup);

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
