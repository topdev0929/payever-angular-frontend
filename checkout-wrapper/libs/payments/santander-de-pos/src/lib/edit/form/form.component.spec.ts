import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import { MockProvider } from 'ng-mocks';
import { combineLatest } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { EditTransactionStorageService } from '@pe/checkout/api/edit-transaction';
import { CheckoutFormsInputCurrencyModule } from '@pe/checkout/forms/currency';
import { RateUtilsService } from '@pe/checkout/rates';
import { PersonTypeEnum, PERSON_TYPE } from '@pe/checkout/santander-de-pos/shared';
import { AddressFormComponent } from '@pe/checkout/sections/address-edit';
import { PaymentInquiryStorage } from '@pe/checkout/storage';
import { PatchParams, PaymentState, SetFlow, SetPayments, SetSteps } from '@pe/checkout/store';
import {
  CommonImportsTestHelper,
  CommonProvidersTestHelper,
  QueryChildByDirective,
  StoreHelper,
} from '@pe/checkout/testing';
import { FlowStateEnum, NodePaymentResponseInterface, PaymentMethodEnum } from '@pe/checkout/types';
import { PaymentTextModule } from '@pe/checkout/ui/payment-text';
import { ProgressButtonContentComponent } from '@pe/checkout/ui/progress-button-content';
import { PaymentHelperService } from '@pe/checkout/utils';

import {
  BankFormComponent,
  DetailsFormComponent,
  DetailsFormService,
  EmploymentFormComponent,
  FilePickerComponent,
  FormIdentifyComponent,
  GuarantorDetailsFormComponent,
  ImageCaptureComponent,
  PosImageCaptureStyleComponent,
  IncomeFormComponent,
  PersonalFormComponent,
  ProtectionFormComponent,
  ProtectionFormStylesComponent,
  RateEditListComponent,
  TermsFormComponent,
  EditFormValue,
  GuarantorRelation,
  IncomeService,
  RatesCalculationApiService,
  RatesCalculationService,
} from '../../shared';
import { flowWithPaymentOptionsFixture, paymentOptionFixture } from '../../test';

import { EditFormComponent } from './form.component';
import { EditFormService } from './form.service';

describe('EditFormComponent', () => {
  const storeHelper = new StoreHelper();

  let component: EditFormComponent;
  let fixture: ComponentFixture<EditFormComponent>;
  let store: Store;
  let editTransactionStorageService: EditTransactionStorageService;
  let paymentHelperService: PaymentHelperService;


  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
        AddressFormComponent,
        PaymentTextModule,
        CheckoutFormsInputCurrencyModule,
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        IncomeService,
        RatesCalculationService,
        RatesCalculationApiService,
        EditFormService,
        EditFormService,
        RateUtilsService,
        PaymentInquiryStorage,
        {
          provide: PERSON_TYPE,
          useValue: PersonTypeEnum.Customer,
        },
        MockProvider(DetailsFormService),
      ],
      declarations: [
        RateEditListComponent,
        DetailsFormComponent,
        TermsFormComponent,
        FormIdentifyComponent,
        FilePickerComponent,
        PersonalFormComponent,
        BankFormComponent,
        IncomeFormComponent,
        EmploymentFormComponent,
        ProtectionFormComponent,
        ProgressButtonContentComponent,
        ImageCaptureComponent,
        ProtectionFormStylesComponent,
        PosImageCaptureStyleComponent,
        GuarantorDetailsFormComponent,
        EditFormComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    editTransactionStorageService = TestBed.inject(EditTransactionStorageService);
    paymentHelperService = TestBed.inject(PaymentHelperService);
    storeHelper.setMockData();
    store = TestBed.inject(Store);
    store.dispatch(new SetSteps([]));
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          formOptions: paymentOptionFixture(),
        },
      },
    }));

    fixture = TestBed.createComponent(EditFormComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    jest.spyOn(editTransactionStorageService as any, 'getTransactionData').mockReturnValue({
      paymentDetails: {
        weekOfDelivery: '',
        dayOfFirstInstalment: '12',
        guarantor: {},
      },
      payment: {},
    } as NodePaymentResponseInterface<any>);

    fixture.detectChanges();
  });

  describe('Constructor', () => {
    it('Should create component instance', () => {
      expect(component).toBeDefined();
    });
  });

  describe('get formData()', () => {
    it('should return the form data from PaymentState', () => {
      const mockFormData = {
        employmentCustomerForm: {},
      } as EditFormValue;

      jest.spyOn(store, 'selectSnapshot').mockReturnValueOnce(mockFormData);

      const result = component.formData;

      expect(result).toEqual(mockFormData);
    });
  });

  describe('IO', () => {
    it('should update paymentHelperService on rate selected', (done) => {
      const { child: rateEditList } = QueryChildByDirective(fixture, RateEditListComponent);
      component['formGroup'].get('detailsForm').setValue({
        downPayment: 1000,
      });
      combineLatest([
        paymentHelperService.downPayment$,
        paymentHelperService.totalAmount$,
      ]).pipe(
        take(1),
        tap(([downPayment, totalAmount]) => {
          expect(downPayment).toBe(1000);
          expect(totalAmount).toBe(6000);
          done();
        }),
      ).subscribe();
      rateEditList.selected.emit({
        data: null,
        rate: {
          'amount': 5000,
          'annualPercentageRate': 0,
          'dateOfFirstInstalment': '2024-07-15',
          'duration': 12,
          'interest': 0,
          'interestRate': 34.699,
          'lastMonthPayment': -500,
          'monthlyPayment': 500,
          'specificData': {
            'firstInstalment': 500,
            'processingFee': 0,
            'rsvTariff': null,
            'rsvTotal': 0,
          },
          'totalCreditCost': 5000,
        },
      });
    });
  });

  describe('ngOnInit()', () => {
    const identifyFormValue = {
      typeOfIdentification: 'typeOfIdentification',
      identificationNumber: 'identificationNumber',
      identificationPlaceOfIssue: 'identificationPlaceOfIssue',
      identificationDateOfIssue: new Date('2023-01-01'),
      identificationDateOfExpiry: new Date('2023-01-01'),
      identificationIssuingAuthority: '',
      personalDateOfBirth: new Date('2023-01-01'),
      personalNationality: 'personalNationality',
      personalPlaceOfBirth: 'personalPlaceOfBirth',
      personalBirthName: 'personalBirthName',
      _idPassed: false,
      _docsMarkAsUploaded: true,
      _docsOtherType: 'registrationCertificate',
    };
    it('should dispatch PatchParams and call patchForm on ngOnInit', () => {
      jest.spyOn(store, 'dispatch');
      jest.spyOn(component as any, 'patchForm');

      component.ngOnInit();

      expect(store.dispatch).toHaveBeenCalledWith(new PatchParams({ sendingPaymentSigningLink: false }));
      expect(component['patchForm']).toHaveBeenCalled();
    });

    it('should subscribe to customerIdentifyValueChanges and update billingAddress and personalForm', fakeAsync(() => {
      jest.spyOn(component['formGroup'].get('billingAddress'), 'setValue');
      jest.spyOn(component['customerForm'].get('personalForm'), 'setValue');

      component.ngOnInit();

      component['customerForm'].get('_identifyForm').patchValue(identifyFormValue);

      tick(500);
      discardPeriodicTasks();

      expect(component['formGroup'].get('billingAddress').setValue).toHaveBeenCalled();
      expect(component['customerForm'].get('personalForm').setValue).toHaveBeenCalled();
    }));

    it('should subscribe to guarantorIdentifyValueChanges$ and update guarantorForm on value change', fakeAsync(() => {
      jest.spyOn(component['guarantorForm'], 'patchValue');

      component.ngOnInit();

      component['guarantorForm'].get('_identifyForm').patchValue({ ...identifyFormValue });

      tick(500);

      component['guarantorForm'].get('_identifyForm').patchValue({ ...identifyFormValue });

      tick(500);

      discardPeriodicTasks();

      expect(component['guarantorForm'].patchValue).toHaveBeenCalled();
    }));

    it('should initEditMode with correct value from params on init', () => {
      const editMode = true;
      store.dispatch(new PatchParams({ editMode }));
      fixture.destroy();
      fixture = TestBed.createComponent(EditFormComponent);
      component = fixture.componentInstance;

      const initEditMode = jest.spyOn(component['analyticsFormService'], 'initEditMode');

      component.ngOnInit();
      expect(initEditMode).toHaveBeenCalledWith(editMode);
    });

  });

  describe('isFlowHasFinishedPayment()', () => {
    it('should return true when flow state is FINISH', () => {
      component.flow.state = FlowStateEnum.FINISH;

      const result = component['isFlowHasFinishedPayment']();

      expect(result).toBe(true);
    });

    it('should return true when flow state is CANCEL', () => {
      component.flow.state = FlowStateEnum.CANCEL;

      const result = component['isFlowHasFinishedPayment']();

      expect(result).toBe(true);
    });

    it('should return false when flow state is not FINISH or CANCEL', () => {
      component.flow.state = FlowStateEnum.PROGRESS;

      const result = component['isFlowHasFinishedPayment']();

      expect(result).toBe(false);
    });
  });


  describe('submit()', () => {
    it('should call onSubmit for each FormGroupDirective in formGroupDirectiveList', () => {
      const formGroupDirectiveListSpy = component['formGroupDirectiveList'].map(fg => jest.spyOn(fg, 'onSubmit'));

      component['submit']();

      formGroupDirectiveListSpy.forEach((fg) => {
        expect(fg).toHaveBeenCalledWith(null);
      });
    });
  });

  describe('firstInitAddress()', () => {
    it('should set addressForm value for Customer when personType is Customer', () => {
      const mockAddress = {};
      jest.spyOn(store, 'selectSnapshot').mockReturnValueOnce(mockAddress);

      component['firstInitAddress'](PersonTypeEnum.Customer);

      expect(component['customerForm'].get('addressForm').value).toEqual(mockAddress);
    });

    it('should not set addressForm value for Customer when personType is not Customer', () => {
      const mockAddress = {};
      jest.spyOn(store, 'selectSnapshot').mockReturnValueOnce(mockAddress);

      component['firstInitAddress'](PersonTypeEnum.Guarantor);

      expect(component['customerForm'].get('addressForm').value).toBeUndefined();
    });
  });

  describe('onSubmit()', () => {
    it('should emit submitted event if the form is valid', () => {
      jest.spyOn(component.submitted, 'emit');
      jest.spyOn(component['formGroup'], 'valid', 'get').mockReturnValue(true);

      component['onSubmit']();

      expect(component.submitted.emit).toHaveBeenCalledWith(component['formGroup'].value);
    });

    it('should not emit submitted event if the form is invalid', () => {
      jest.spyOn(component.submitted, 'emit');
      jest.spyOn(component['formGroup'], 'valid', 'get').mockReturnValue(false);

      component['onSubmit']();

      expect(component.submitted.emit).not.toHaveBeenCalled();
    });
  });


  describe('updatedFormData()', () => {
    it('should toggle controls correctly when guarantorRelation is NONE', () => {
      const formData = {
        detailsForm: { typeOfGuarantorRelation: GuarantorRelation.NONE },
        guarantor: { personalForm: { profession: 'someProfession' } },
        customer: { personalForm: { profession: 'someProfession' } },
      };
      const cpiTariff = 0;

      jest.spyOn(component as any, 'toggleControl');

      component['updatedFormData'](formData as any, cpiTariff);

      expect(component['toggleControl']).toHaveBeenCalledWith('guarantor', false);
      expect(component['toggleControl']).toHaveBeenCalledWith('guarantor.addressForm', false);
      expect(component['toggleControl']).toHaveBeenCalledWith('guarantor.detailsForm', false);
      expect(component['toggleControl']).toHaveBeenCalledWith('guarantor.incomeForm', false);
      expect(component['toggleControl']).toHaveBeenCalledWith('guarantor._identifyForm', false);
      expect(component['toggleControl']).toHaveBeenCalledWith('customer.employmentForm', true);
      expect(component['toggleControl']).toHaveBeenCalledWith('guarantor.employmentForm', false);
      expect(component['toggleControl']).toHaveBeenCalledWith('customer.protectionForm', false);
      expect(component['toggleControl']).toHaveBeenCalledWith('guarantor.protectionForm', false);
    });

    it('should toggle controls correctly when guarantorRelation is OTHER_HOUSEHOLD', () => {
      const formData = {
        detailsForm: { typeOfGuarantorRelation: GuarantorRelation.OTHER_HOUSEHOLD },
        guarantor: { personalForm: { profession: 'someProfession' } },
        customer: { personalForm: { profession: 'someProfession' } },
      };
      const cpiTariff = 0;

      jest.spyOn(component as any, 'toggleControl');

      component['updatedFormData'](formData as any, cpiTariff);

      expect(component['toggleControl']).toHaveBeenCalledWith('guarantor', true);
      expect(component['toggleControl']).toHaveBeenCalledWith('guarantor.addressForm', true);
      expect(component['toggleControl']).toHaveBeenCalledWith('guarantor.detailsForm', false);
      expect(component['toggleControl']).toHaveBeenCalledWith('guarantor.incomeForm', true);
      expect(component['toggleControl']).toHaveBeenCalledWith('guarantor._identifyForm', true);
      expect(component['toggleControl']).toHaveBeenCalledWith('customer.employmentForm', true);
      expect(component['toggleControl']).toHaveBeenCalledWith('guarantor.employmentForm', true);
      expect(component['toggleControl']).toHaveBeenCalledWith('customer.protectionForm', false);
      expect(component['toggleControl']).toHaveBeenCalledWith('guarantor.protectionForm', false);
    });
  });
});
