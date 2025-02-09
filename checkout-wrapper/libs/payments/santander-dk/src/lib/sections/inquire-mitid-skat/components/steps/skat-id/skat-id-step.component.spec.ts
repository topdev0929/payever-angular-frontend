import { CUSTOM_ELEMENTS_SCHEMA, importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { of, throwError } from 'rxjs';

import { ExternalNavigateData, ExternalRedirectStorage } from '@pe/checkout/storage';
import { PatchFormState, SetFlow } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { NodeAuthSkatRedirectData } from '@pe/checkout/types';

import { SantanderDkFlowService, SharedModule } from '../../../../../shared';
import { flowWithPaymentOptionsFixture, paymentFormFixture } from '../../../../../test';

import { SkatIdStepComponent } from './skat-id-step.component';

describe('SkatIdStepComponent', () => {

  let component: SkatIdStepComponent;
  let fixture: ComponentFixture<SkatIdStepComponent>;

  let store: Store;
  let flowService: SantanderDkFlowService;
  let externalNavigateData: ExternalNavigateData;
  let externalRedirectStorage: ExternalRedirectStorage;

  HTMLFormElement.prototype.submit = jest.fn();

  beforeEach(() => {

    TestBed.configureTestingModule({
      declarations: [SkatIdStepComponent],
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(SharedModule),
        ExternalNavigateData,
        ExternalRedirectStorage,
        { provide: NgControl, useValue: new FormControl() },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new PatchFormState(paymentFormFixture()));

    flowService = TestBed.inject(SantanderDkFlowService);
    externalNavigateData = TestBed.inject(ExternalNavigateData);
    externalRedirectStorage = TestBed.inject(ExternalRedirectStorage);

    fixture = TestBed.createComponent(SkatIdStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

  });

  it('should be defined', () => {

    expect(component).toBeDefined();

  });

  it('should successfully navigate', () => {

    const wrapperUrl = 'wrapperUrl';
    jest.spyOn(component as any, 'wrapperUrl', 'get').mockReturnValue(wrapperUrl);
    const mockRedirectData: NodeAuthSkatRedirectData = { postUrl: 'test', postValues: [] };
    const prepareSkatAuthRedirect = jest.spyOn(flowService, 'prepareSkatAuthRedirect')
      .mockReturnValue(of(mockRedirectData));
    jest.spyOn(externalNavigateData, 'clearValue').mockReturnValue(null);
    jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect').mockReturnValue(of(null));

    component.navigate();
    const navigationResult = component['navigate$'].toPromise();

    expect(navigationResult).toBeTruthy();
    expect(prepareSkatAuthRedirect).toHaveBeenCalledWith({
      applicationNumber: String(paymentFormFixture().mitIdForm.applicationNumber),
      debtorId: String(paymentFormFixture().mitIdForm.debtorId),
      frontPostBackUrl: wrapperUrl,
    });
    expect(component.formRedirectData).toEqual(mockRedirectData);
    expect(component.navigationError).toBeNull();
  });

  it('should get value from externalNavigateData for prepareSkatAuthRedirect', () => {

    store.dispatch(new PatchFormState({
      ...paymentFormFixture(),
      mitIdForm: null,
    }));
    fixture.destroy();
    fixture = TestBed.createComponent(SkatIdStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    const wrapperUrl = 'wrapperUrl';
    jest.spyOn(component as any, 'wrapperUrl', 'get').mockReturnValue(wrapperUrl);
    const mockRedirectData: NodeAuthSkatRedirectData = { postUrl: 'test', postValues: [] };
    const prepareSkatAuthRedirect = jest.spyOn(flowService, 'prepareSkatAuthRedirect')
      .mockReturnValue(of(mockRedirectData));
    jest.spyOn(externalNavigateData, 'getValue')
      .mockImplementation((_, key) => key);
    jest.spyOn(externalNavigateData, 'clearValue').mockReturnValue(null);
    jest.spyOn(externalRedirectStorage, 'saveDataBeforeRedirect').mockReturnValue(of(null));

    component.navigate();
    const navigationResult = component['navigate$'].toPromise();

    expect(navigationResult).toBeTruthy();
    expect(prepareSkatAuthRedirect).toHaveBeenCalledWith({
      applicationNumber: 'applicationId',
      debtorId: 'debtorId',
      frontPostBackUrl: wrapperUrl,
    });
    expect(component.formRedirectData).toEqual(mockRedirectData);
    expect(component.navigationError).toBeNull();
  });

  it('should handle error during SkatId auth preparation', () => {

    const testError = new Error('Navigation Error');

    jest.spyOn(flowService, 'prepareSkatAuthRedirect').mockReturnValue(throwError(testError));
    component.navigate();
    component['navigate$'].toPromise();

    expect(component.navigationError).toEqual(testError.message);

  });

  it('should initialize form group with required validators', () => {

    const skatReadyControl = component.formGroup.get('_skatReady');
    expect(skatReadyControl.validator).toBeDefined();

    skatReadyControl.setValue(null);
    expect(skatReadyControl.valid).toBeFalsy();

    skatReadyControl.setValue(true);
    expect(skatReadyControl.valid).toBeTruthy();

  });

  it('should dispatch form state on pass', () => {

    const mockFormGroupValue = { _skatReady: true };

    component.formGroup.setValue(mockFormGroupValue);
    const spyDispatch = jest.spyOn(store, 'dispatch');

    component.pass();
    expect(spyDispatch).toHaveBeenCalledWith(new PatchFormState({ skatIdForm: mockFormGroupValue }));

  });

  it('should clear failed navigation and update form on storage call', () => {

    const spyMarkForCheck = jest.spyOn(component['cdr'], 'markForCheck');
    const spyClearValue = jest.spyOn(externalNavigateData, 'clearValue');

    component.storage();

    expect(spyClearValue).toHaveBeenCalled();
    expect(component.formGroup.get('_skatReady').value).toBeTruthy();
    expect(spyMarkForCheck).toHaveBeenCalled();

  });

  it('should return true if navigateSubject$ is trigger', (done) => {
    component.loading$.subscribe((condition) => {
      expect(condition).toBeTruthy();
      done();
    });
    component['navigateSubject$'].next();
  });

  describe('isStepActive$', () => {
    it('should isStepActive$ return true', (done) => {
      store.dispatch(new PatchFormState(paymentFormFixture()));
      component.formGroup.get('_skatReady').patchValue(false);
      component['isStepActive$'].subscribe((active) => {
        expect(active).toBeTruthy();
        done();
      });
    });
    it('should isStepActive$ return false if skatReady true', (done) => {
      store.dispatch(new PatchFormState(paymentFormFixture()));
      component.formGroup.get('_skatReady').patchValue(true);
      component['isStepActive$'].subscribe((active) => {
        expect(active).toBeFalsy();
        done();
      });
    });
    it('should isStepActive$ return false if debtorId null', (done) => {
      store.dispatch(new PatchFormState({
        ...paymentFormFixture(),
        mitIdForm: {
          ...paymentFormFixture().mitIdForm,
          debtorId: null,
        },
      }));
      component.formGroup.get('_skatReady').patchValue(false);
      component['isStepActive$'].subscribe((active) => {
        expect(active).toBeFalsy();
        done();
      });
    });
  });

});
