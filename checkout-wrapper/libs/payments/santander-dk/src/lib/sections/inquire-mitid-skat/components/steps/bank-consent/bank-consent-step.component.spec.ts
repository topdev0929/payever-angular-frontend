import { CUSTOM_ELEMENTS_SCHEMA, importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';

import { ExternalNavigateData } from '@pe/checkout/storage';
import { PatchFormState, SetPayments, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum, PollingError } from '@pe/checkout/types';

import { SantanderDkFlowService, SharedModule } from '../../../../../shared';
import { flowWithPaymentOptionsFixture, paymentFormFixture } from '../../../../../test';

import { BankConsentStepComponent } from './bank-consent-step.component';

describe('BankConsentStepComponent', () => {

  let component: BankConsentStepComponent;
  let fixture: ComponentFixture<BankConsentStepComponent>;

  let store: Store;
  let flowService: SantanderDkFlowService;
  let externalNavigateData: ExternalNavigateData;

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [BankConsentStepComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(SharedModule),
        ExternalNavigateData,
        { provide: NgControl, useValue: new FormControl() },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

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

    fixture = TestBed.createComponent(BankConsentStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  afterEach(() => {
    fixture?.destroy();
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  describe('pollDenmarkFormConfig', () => {
    let getFormConfigSpy: jest.SpyInstance;
    beforeEach(() => {
      getFormConfigSpy = jest.spyOn(flowService, 'getFormConfig');
    });
    it('should return formConfig', (done) => {
      const expectedConfig = { cprProcess: true, taxProcess: true };

      getFormConfigSpy.mockReturnValueOnce(of(expectedConfig));

      (component as any).pollDenmarkFormConfig().subscribe((config: any) => {
        expect(config).toEqual(expectedConfig);
        done();
      });
    });

    it('should pollDenmarkFormConfig handle PollingError', (done) => {
      const error = new PollingError('timeout', '400');
      getFormConfigSpy.mockReturnValue(throwError(error));
      (component as any).pollDenmarkFormConfig().subscribe({
        next: (config: any) => {
          expect(config).toEqual(undefined);
          done();
        },
      });
    });

    it('should pollDenmarkFormConfig handle default error', (done) => {
      const error = new Error('test error');
      getFormConfigSpy.mockReturnValue(throwError(error));
      (component as any).pollDenmarkFormConfig().subscribe({
        error: (err: any) => {
          expect(err).toEqual(error);
          done();
        },
      });
    });
  });

  describe('Getter', () => {
    let getValue: jest.SpyInstance;
    const formState = paymentFormFixture();
    beforeEach(() => {
      getValue = jest.spyOn(externalNavigateData, 'getValue')
        .mockImplementation((_, key) => key);
    });
    it('should get debtorId from formData', () => {
      expect(component['debtorId']).toEqual(formState.mitIdForm.debtorId);
      expect(getValue).not.toHaveBeenCalled();
    });
    it('should get applicationNumber from formData', () => {
      expect(component['applicationNumber']).toEqual(formState.mitIdForm.applicationNumber);
      expect(getValue).not.toHaveBeenCalled();
    });

    it('should get debtorId from externalNavigateData if not provided in state', () => {
      store.dispatch(new PatchFormState({
        ...formState,
        mitIdForm: {
          ...formState,
          debtorId: null,
        },
      }));
      fixture.destroy();
      fixture = TestBed.createComponent(BankConsentStepComponent);
      component = fixture.componentInstance;
      expect(component['debtorId']).toEqual('debtorId');
      expect(getValue).toHaveBeenCalledWith(flowWithPaymentOptionsFixture().id, 'debtorId');
    });
    it('should get applicationNumber from externalNavigateData if not provided in state', () => {
      store.dispatch(new PatchFormState({
        ...formState,
        mitIdForm: {
          ...formState,
          applicationNumber: null,
        },
      }));
      fixture.destroy();
      fixture = TestBed.createComponent(BankConsentStepComponent);
      component = fixture.componentInstance;
      expect(component['applicationNumber']).toEqual('applicationId');
      expect(getValue).toHaveBeenCalledWith(flowWithPaymentOptionsFixture().id, 'applicationId');
    });
  });

  it('should initialize formGroup correctly', () => {
    expect(component.formGroup.get('_bankConsentReady')).toBeTruthy();
    expect(component.formGroup.get('_psd2Status')).toBeTruthy();
    expect(component.formGroup.get('wasCPRProcessed')).toBeTruthy();
    expect(component.formGroup.get('wasTaxProcessed')).toBeTruthy();
    expect(component.formGroup.get('_insuranceEnabled')).toBeTruthy();
    expect(component.formGroup.get('_insuranceMonthlyCost')).toBeTruthy();
    expect(component.formGroup.get('_insurancePercent')).toBeTruthy();
  });

  it('should redirect to the provided URL', () => {

    const expectedUrl = {
      url: 'https://redirect-url.com',
    };

    const clearValueSpy = jest.spyOn(externalNavigateData, 'clearValue');
    const prepareBankConsentRedirectSpy = jest.spyOn(flowService, 'prepareBankConsentRedirect')
      .mockReturnValue(of(expectedUrl));
    const redirectSpy = jest.spyOn((component as any), 'redirect');

    component.navigate();
    component['navigate$'].subscribe();

    expect(component.navigationError).toBeNull();
    expect(clearValueSpy).toHaveBeenCalledWith(flowWithPaymentOptionsFixture().id, 'failed');
    expect(prepareBankConsentRedirectSpy).toHaveBeenCalled();
    expect(redirectSpy).toHaveBeenCalledWith(expectedUrl.url);

  });


  it('should handle navigation error', () => {

    const testError = new Error('Navigation Error');

    jest.spyOn(flowService, 'prepareBankConsentRedirect').mockReturnValue(throwError(() => testError));

    component.navigate();
    component['navigate$'].subscribe(
      {
        error: () => {
          expect(component.navigationError).toEqual(testError.message);
        },
      },
    );

  });

  it('should dispatch PatchFormState and emit submitted on pass$', () => {

    const dispatchSpy = jest.spyOn(store, 'dispatch');
    const emitSpy = jest.spyOn(component.submitted, 'emit');

    const getInsuranceConfigReturnData = {
      insuranceEnabled: true,
      insuranceMonthlyCost: 100,
      insurancePercent: 10,
    };

    const pollDenmarkFormConfigReturnData = {
      cprProcess: true,
      taxProcess: true,
    };

    jest.spyOn(flowService, 'getInsuranceConfig').mockReturnValue(of(getInsuranceConfigReturnData));
    jest.spyOn(component as any, 'pollDenmarkFormConfig').mockReturnValue(of(
      pollDenmarkFormConfigReturnData,
    ));

    component.pass();

    component['pass$'].subscribe({
      next: () => {
        expect(dispatchSpy).toHaveBeenCalledWith(new PatchFormState({
              bankConsentForm: {
                ...pollDenmarkFormConfigReturnData,
                ...getInsuranceConfigReturnData,
              },
            },
          ),
        );
        expect(emitSpy).toHaveBeenCalled();
      },
    });

  });

  it('should handle step error', () => {

    const testError = new Error('Step Error');

    jest.spyOn(flowService, 'getInsuranceConfig').mockReturnValue(throwError(() => testError));

    component.pass();
    component['pass$'].subscribe(
      {
        error: () => {
          expect(component.navigationError).toEqual(testError.message);
        },
      },
    );

  });

  it('should isStepActive$ emit correct values', () => {

    const mockFormValue = {
      mitIdForm: { debtorId: '123' },
      skatIdForm: { _skatReady: true },
    };
    jest.spyOn(store, 'select').mockReturnValue(of(mockFormValue));

    let isStepActive: boolean;

    component.isStepActive$.subscribe(
      {
        next: _isStepActive => isStepActive = _isStepActive,
      },
    );

    component.formGroup.patchValue({
      _bankConsentReady: false,
    });
    expect(isStepActive).toBeTruthy();

    component.formGroup.patchValue({
      _bankConsentReady: true,
    });
    expect(isStepActive).toBeFalsy();

  });

  it('should isReady$ emit true when _bankConsentReady is true', () => {

    let isReady: boolean;
    component.isReady$.subscribe(
      {
        next: _isReady => isReady = _isReady,
      },
    );

    component.formGroup.patchValue({ _bankConsentReady: true });
    expect(isReady).toBeTruthy();

    component.formGroup.patchValue({ _bankConsentReady: false });
    expect(isReady).toBeFalsy();

  });

  it('should loading$ emit correctly', () => {

    let isLoading: boolean;
    component.loading$.subscribe({
      next: _isLoading => isLoading = _isLoading,
    });

    component['navigateSubject$'].next();
    component['passSubject$'].next();

    expect(isLoading).toBeTruthy();

  });

  it('should update psd2Status from storage', () => {

    const expectedValue = true;

    const clearValueSpy = jest.spyOn(externalNavigateData, 'clearValue');
    const getValueSpy = jest.spyOn(externalNavigateData, 'getValue')
      .mockReturnValue(expectedValue.toString());
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    component.storage();

    expect(clearValueSpy).toHaveBeenCalledWith(flowWithPaymentOptionsFixture().id, 'failed');
    expect(getValueSpy).toHaveBeenCalledWith(flowWithPaymentOptionsFixture().id, 'psd2Status');
    expect(component.formGroup.get('_psd2Status').value).toEqual(expectedValue);
    expect(dispatchSpy).toHaveBeenCalledWith(new PatchFormState({ bankConsentForm: component.formGroup.value }));

  });
});
