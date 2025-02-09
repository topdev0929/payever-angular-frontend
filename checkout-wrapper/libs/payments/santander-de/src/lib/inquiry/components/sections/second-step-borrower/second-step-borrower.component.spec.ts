import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { BehaviorSubject } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import {
  PatchFormState,
  PaymentState,
  SetFlow,
  SetFormState,
  SetPayments,
  SetSteps,
  SubmitPayment,
} from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper, StoreHelper } from '@pe/checkout/testing';

import { EmploymentFormComponent, IncomeFormComponent } from '../../../../shared/sections/components';
import { IncomeService } from '../../../../shared/services';
import { flowWithPaymentOptionsFixture } from '../../../../test';

import { SecondStepBorrowerFormComponent } from './second-step-borrower.component';
import { SecondStepBorrowerModule } from './second-step-borrower.module';

describe('SecondStepFormComponent', () => {
  const storeHelper = new StoreHelper();

  let component: SecondStepBorrowerFormComponent;
  let fixture: ComponentFixture<SecondStepBorrowerFormComponent>;
  let store: Store;
  let incomeService: IncomeService;
  const cpiTariff$ = new BehaviorSubject<number>(1);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        NgControl,
        importProvidersFrom(SecondStepBorrowerModule),
        {
          provide: IncomeService,
          useValue: {
            cpiTariff$,
          },
        },
      ],
      declarations: [
        IncomeFormComponent,
        EmploymentFormComponent,
        SecondStepBorrowerFormComponent,
      ],
    }).compileComponents();

    jest.useFakeTimers();

    storeHelper.setMockData();
    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetSteps([]));
    store.dispatch(new SetPayments({
      santander_installment: {
        ...store.selectSnapshot(PaymentState),
      },
    }));
    store.dispatch(new SetFormState({
      ratesForm: {
        customer: {
          employment: 'employed',
          freelancer: false,
        },
      },
      customerForm: {},
    }));

    fixture = TestBed.createComponent(SecondStepBorrowerFormComponent);
    component = fixture.componentInstance;
    incomeService = TestBed.inject(IncomeService);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });

  describe('loading$', () => {
    it('should set loading$ to true on form submission', (done) => {
      const expectedLoadingValue = true;

      component['loading$'].subscribe((value) => {
        expect(value).toBe(expectedLoadingValue);
        done();
      });

      component.submitted.emit(true);
    });

    it('should set loading$ to false on SubmitPayment action completion', (done) => {
      const expectedLoadingValue = false;

      component.submitted.emit(true);

      component['loading$'].subscribe((value) => {
        expect(value).toBe(expectedLoadingValue);
        done();
      });

      store.dispatch(new SubmitPayment());
    });

  });

  describe('ngOnInit', () => {
    it('should toggle the protection from based on cpiTariff', () => {
      component.ngOnInit();

      return incomeService.cpiTariff$.pipe(
        take(2),
        tap((cpiTariff) => {
          const protectionFormEnabled = component.formGroup.get('protectionForm').enabled;
          expect(protectionFormEnabled).toBe(Boolean(cpiTariff));
          cpiTariff$.next(0);
        })
      ).toPromise();
    });

    it('should dispatch PatchFormState on form value changes', () => {
      jest.spyOn(store, 'dispatch');

      component.ngOnInit();
      component.formGroup.valueChanges.subscribe({
        next: () => {
          expect(store.dispatch).toHaveBeenCalledWith(expect.any(PatchFormState));
        },
      });

      component.formGroup.patchValue({
        incomeForm: 'mockIncome',
        bankForm: 'mockBankForm',
        protectionForm: 'mockProtectionForm',
      });
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

  describe('translations', () => {
    it('should handle if is last step', () => {
      jest.spyOn(store, 'selectSnapshot')
        .mockReturnValueOnce(false)
        .mockReturnValueOnce(flowWithPaymentOptionsFixture());
      fixture.destroy();
      fixture = TestBed.createComponent(SecondStepBorrowerFormComponent);
      component = fixture.componentInstance;

      fixture.detectChanges();
      expect(component.translations).toEqual({ buttonText: $localize`:@@actions.pay:` });
    });

    it('should handle if is not last step', () => {
      jest.spyOn(store, 'selectSnapshot')
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(flowWithPaymentOptionsFixture());
      fixture.destroy();
      fixture = TestBed.createComponent(SecondStepBorrowerFormComponent);
      component = fixture.componentInstance;

      fixture.detectChanges();

      expect(component.translations).toEqual({ buttonText: $localize`:@@actions.continue:` });
    });
  });
});

