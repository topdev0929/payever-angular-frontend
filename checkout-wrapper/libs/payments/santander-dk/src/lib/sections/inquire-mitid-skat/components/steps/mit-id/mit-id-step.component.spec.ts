import { CUSTOM_ELEMENTS_SCHEMA, importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';

import { ExternalNavigateData, ExternalRedirectStorage, FlowStorage } from '@pe/checkout/storage';
import { PatchFormState, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import { SantanderDkFlowService, SharedModule } from '../../../../../shared';
import { flowWithPaymentOptionsFixture, paymentFormFixture } from '../../../../../test';

import { MitIdStepComponent } from './mit-id-step.component';

describe('MitIdStepComponent', () => {

  let component: MitIdStepComponent;
  let fixture: ComponentFixture<MitIdStepComponent>;

  let store: Store;
  let flowService: SantanderDkFlowService;
  let externalNavigateData: ExternalNavigateData;
  let externalRedirectStorage: ExternalRedirectStorage;
  let flowStorage: FlowStorage;

  const defaultFormValue = {
    debtorId: 'debtor-id',
    applicationNumber: 'application-id',
  };

  let formGroup: InstanceType<typeof MitIdStepComponent>['formGroup'];

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [MitIdStepComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(SharedModule),
        ExternalNavigateData,
        ExternalRedirectStorage,
        SantanderDkFlowService,
        FlowStorage,
        { provide: NgControl, useValue: new FormControl() },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          form: paymentFormFixture(),
        },
      },
    }));
    flowService = TestBed.inject(SantanderDkFlowService);
    externalNavigateData = TestBed.inject(ExternalNavigateData);
    externalRedirectStorage = TestBed.inject(ExternalRedirectStorage);
    flowStorage = TestBed.inject(FlowStorage);

    jest.spyOn(externalNavigateData, 'getValue')
      .mockReturnValueOnce(defaultFormValue.debtorId)
      .mockReturnValueOnce(defaultFormValue.applicationNumber);

    fixture = TestBed.createComponent(MitIdStepComponent);
    component = fixture.componentInstance;

    formGroup = component.formGroup;

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should create form controls on initialization', () => {

    expect(formGroup.contains('debtorId')).toBeTruthy();
    expect(formGroup.contains('applicationNumber')).toBeTruthy();

  });

  it('should create form group with correct initial values', () => {

    fixture.detectChanges();
    expect(formGroup.get('debtorId').value).toEqual(defaultFormValue.debtorId);
    expect(formGroup.get('applicationNumber').value).toEqual(defaultFormValue.applicationNumber);

  });

  it('should dispatch PatchFormState action on form value change', () => {

    const patchFormStateSpy = jest.spyOn(store, 'dispatch');
    const passSpy = jest.spyOn(component, 'pass');
    const newValue = {
      debtorId: 'new-debtor-id',
      applicationNumber: 'new-application-number',
    };
    component.formGroup.setValue(newValue);
    component.pass();

    expect(passSpy).toHaveBeenCalled();
    expect(patchFormStateSpy).toHaveBeenCalledWith(new PatchFormState(newValue));

  });

  it('should trigger navigateSubject$ on navigate', () => {

    const navigateSubject$ = jest.spyOn(component['navigateSubject$'], 'next');

    component.navigate();

    expect(navigateSubject$).toHaveBeenCalled();

  });

  it('should loading if navigateSubject$ is trigger', (done) => {

    component.loading$.subscribe((condition) => {
      expect(condition).toBeTruthy();

      done();
    });

    component['navigateSubject$'].next();

  });

  it('should redirect to the provided URL on successful MitID auth preparation', (done) => {

    const preparationReturnValue = {
      applicationNumber: 'applicationNumber',
      redirectUrl: 'https://payever-redirect-url.com',
    };
    const wrapperUrl = 'https://payever-wrapper-url.com';

    jest.spyOn(externalNavigateData, 'clearValue')
      .mockReturnValue(null);
    const prepareMitIDAuthRedirect = jest.spyOn(flowService, 'prepareMitIDAuthRedirect')
      .mockReturnValue(of(preparationReturnValue));
    const dispatch = jest.spyOn(store, 'dispatch')
      .mockReturnValue(of(null));
    const redirect = jest.spyOn((component as any), 'redirect')
      .mockReturnValue(null);
    jest.spyOn((component as any), 'wrapperUrl', 'get')
      .mockReturnValue(wrapperUrl);

    component['navigate$'].subscribe(() => {
      expect(component.navigationError).toBeNull();
      expect(prepareMitIDAuthRedirect).toHaveBeenCalledWith({
        productId: Number(paymentFormFixture().ratesForm.productId),
        duration: Number(paymentFormFixture().ratesForm.creditDurationInMonths),
        frontPostBackUrl: wrapperUrl,
      });
      expect(component.formGroup.get('applicationNumber').value).toEqual(preparationReturnValue.applicationNumber);
      expect(dispatch).toHaveBeenCalledWith(new PatchFormState({ mitIdForm: formGroup.value }));
      expect(redirect).toHaveBeenCalledWith(preparationReturnValue.redirectUrl);

      done();
    });

    component['navigateSubject$'].next();

  });

  it('should handle errors during MitId auth preparation', (done) => {

    const testError = new Error('Navigation Error');
    jest.spyOn(externalNavigateData, 'clearValue')
      .mockReturnValue(null);
    jest.spyOn(flowService, 'prepareMitIDAuthRedirect')
      .mockReturnValue(throwError(testError));
    const dispatch = jest.spyOn(store, 'dispatch')
      .mockReturnValue(null);
    const redirect = jest.spyOn((component as any), 'redirect')
      .mockReturnValue(null);

    component['navigate$'].subscribe(() => {
      expect(component.navigationError).toBeNull();
      expect(component.formGroup.get('applicationNumber').value).toEqual(defaultFormValue.applicationNumber);
      expect(dispatch).not.toHaveBeenCalled();
      expect(redirect).not.toHaveBeenCalledWith();

      done();
    });

    component['navigateSubject$'].next();

  });

  it('should validate the form correctly', () => {

    component.formGroup.setValue({
      debtorId: '', applicationNumber: '',
    });

    const errors = component.validate(component.formGroup);
    expect(errors).toEqual({ invalid: true });

  });

  it('should disable navigation if debtorId is not present', async () => {

    component.formGroup.get('debtorId').setValue(null);

    component.isStepActive$.subscribe(active => expect(active).toBeFalsy());

  });

  it('should enable navigation if debtorId is present', () => {

    component.formGroup.get('debtorId').setValue('debtor-id');

    component.isStepActive$.subscribe(active => expect(active).toBeTruthy());

  });

  it('should storage restore form values', () => {

    const storagePaymentState = { [PaymentMethodEnum.SANTANDER_INSTALLMENT_DK]: {} };
    const storageDebtorId = 'storage-debtor-id';

    const restoreAndClearData = jest.spyOn(externalRedirectStorage, 'restoreAndClearData')
      .mockReturnValue(of(true));
    const getStoragePaymentState = jest.spyOn(flowStorage, 'getData')
      .mockReturnValue(storagePaymentState);
    const dispatch = jest.spyOn(store, 'dispatch')
      .mockReturnValue(null);
    const getDebtorId = jest.spyOn(externalNavigateData, 'getValue')
      .mockReturnValue(storageDebtorId);

    component.storage();

    expect(restoreAndClearData).toHaveBeenCalledWith(flowWithPaymentOptionsFixture().id);
    expect(getStoragePaymentState).toHaveBeenCalledWith(flowWithPaymentOptionsFixture().id, 'paymentData');
    expect(dispatch).toHaveBeenCalledWith(new SetPayments(storagePaymentState));
    expect(getDebtorId).toHaveBeenCalledWith(flowWithPaymentOptionsFixture().id, 'debtorId');
    expect(formGroup.get('debtorId').value).toEqual(storageDebtorId);
    expect(dispatch).toHaveBeenCalledWith(new PatchFormState({ mitIdForm: formGroup.value }));

  });

});
