import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Actions, Store } from '@ngxs/store';
import { Subject } from 'rxjs';

import { ModeEnum } from '@pe/checkout/form-utils';
import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { ABSTRACT_PAYMENT_SERVICE } from '@pe/checkout/payment';
import { AddressStorageService, PaymentInquiryStorage } from '@pe/checkout/storage';
import { OpenNextStepSuccess, PatchFormState, PatchPaymentResponse, SetFlow } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  FinishDeclarationsTestHelper,
  StoreHelper,
} from '@pe/checkout/testing';
import { NodePaymentResponseInterface } from '@pe/checkout/types';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';
import { CheckoutUiTooltipModule } from '@pe/checkout/ui/tooltip';

import { flowWithPaymentOptionsFixture } from '../../../../test';
import { AmlFormComponent } from '../aml';
import { DebtFormComponent } from '../debt';
import { MortgageLoansFormComponent, SecuredLoansFormComponent, StudentLoansFormComponent } from '../loans';
import { MonthlyExpensesFormComponent } from '../monthly-expenses';
import { PersonalFormComponent } from '../personal';

import { DetailsFormComponent } from './details-form.component';


describe('DetailsFormComponent', () => {
  const storeHelper = new StoreHelper();
  let component: DetailsFormComponent;
  let fixture: ComponentFixture<DetailsFormComponent>;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        PaymentTextModule,
        CheckoutUiTooltipModule,
        CheckoutFormsInputCurrencyModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        AddressStorageService,
        Actions,
        { provide: PaymentInquiryStorage, useValue: {} },
        { provide: ABSTRACT_PAYMENT_SERVICE, useValue: {} },
      ],
      declarations: [
        ...FinishDeclarationsTestHelper(),
        PersonalFormComponent,
        DebtFormComponent,
        MortgageLoansFormComponent,
        SecuredLoansFormComponent,
        StudentLoansFormComponent,
        MonthlyExpensesFormComponent,
        AmlFormComponent,
        DetailsFormComponent,
      ],
    }).compileComponents();

    storeHelper.setMockData();
    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new PatchPaymentResponse({
      payment: {},
      paymentDetails: {},
    }));

    fixture = TestBed.createComponent(DetailsFormComponent);
    component = fixture.componentInstance;

    component.mode = ModeEnum.Edit;

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  describe('Constructor', () => {
    it('Should check if component defined.', () => {
      expect(component).toBeDefined();
    });
  });


  describe('ngOnInit', () => {
    it('should call submit method if not need more info', () => {
      const mockNodeResult = {
        paymentDetails: {
          applicationNumber: 'applicationNumber',
        },
      } as NodePaymentResponseInterface<unknown>;
      jest.spyOn(component['nodeFlowService'], 'getFinalResponse').mockReturnValue(mockNodeResult);
      jest.spyOn(component['santanderNoFlowService'], 'isNeedMoreInfo').mockReturnValue(false);
      jest.spyOn(component.submitted, 'emit');

      component.ngOnInit();

      expect(component.submitted.emit).toHaveBeenCalledWith(component.formGroup.value);
    });

    it('should emit events and do necessary setups if need more info', () => {
      const mockNodeResult = {
        paymentDetails: {
          applicationNumber: 'applicationNumber',
        },
      } as NodePaymentResponseInterface<unknown>;
      jest.spyOn(component['nodeFlowService'], 'getFinalResponse').mockReturnValue(mockNodeResult);
      jest.spyOn(component['santanderNoFlowService'], 'isNeedMoreInfo').mockReturnValue(true);
      jest.spyOn(component.submitted, 'emit');
      jest.spyOn(component['trackingService'], 'doEmitPaymentStepReached');
      jest.spyOn(component['analyticsFormService'], 'emitEventFormItself');

      component.ngOnInit();

      expect(component.submitted.emit).not.toHaveBeenCalled();
      expect(component['trackingService'].doEmitPaymentStepReached).toHaveBeenCalled();
      expect(component['analyticsFormService'].emitEventFormItself).toHaveBeenCalled();
    });
  });

  describe('submit', () => {
    it('should dispatch PatchFormState and emit submitted if the form is valid', () => {
      const mockFormValue = {};
      const mockFormGroup = {
        valid: true,
        value: mockFormValue,
      };
      component.formGroup = mockFormGroup as any;
      jest.spyOn(component['formGroupDirective'].ngSubmit, 'emit');
      jest.spyOn(component['formGroupDirective'], 'onSubmit');
      jest.spyOn(store, 'dispatch');
      jest.spyOn(component.submitted, 'emit');

      component.submit();

      expect(component['formGroupDirective'].ngSubmit.emit).toHaveBeenCalledWith(mockFormValue);
      expect(component['formGroupDirective'].onSubmit).toHaveBeenCalledWith(null);
      expect(store.dispatch).toHaveBeenCalledWith(new PatchFormState(mockFormValue));
      expect(component.submitted.emit).toHaveBeenCalledWith(mockFormValue);
    });

    it('should not dispatch PatchFormState and emit submitted if the form is not valid', () => {
      const mockFormValue = {};
      const mockFormGroup = {
        valid: false,
        value: mockFormValue,
      };
      component.formGroup = mockFormGroup as any;
      jest.spyOn(component['formGroupDirective'].ngSubmit, 'emit');
      jest.spyOn(component['formGroupDirective'], 'onSubmit');
      jest.spyOn(store, 'dispatch');
      jest.spyOn(component.submitted, 'emit');

      component.submit();

      expect(component['formGroupDirective'].ngSubmit.emit).toHaveBeenCalledWith(mockFormValue);
      expect(component['formGroupDirective'].onSubmit).toHaveBeenCalledWith(null);
      expect(store.dispatch).not.toHaveBeenCalled();
      expect(component.submitted.emit).not.toHaveBeenCalled();
    });

    it('should return loading false', (done) => {
      component.loading$.subscribe((condition) => {
        expect(condition).toBeFalsy();
        done();
      });

      store.dispatch(new OpenNextStepSuccess());
    });

    it('should emit submitted', () => {
      const subject = new Subject<void>();
      const emit = jest.spyOn(component.submitted, 'emit');

      component.submit$ = subject;
      component.ngOnInit();
      subject.next();
      expect(emit).toHaveBeenCalled();
    });
  });
});
