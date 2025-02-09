import { importProvidersFrom } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, NgControl } from '@angular/forms';
import { Store } from '@ngxs/store';

import { CompositeForm } from '@pe/checkout/forms';
import { ParamsState, PaymentState, SetFlow, SetParams, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import {
  flowWithPaymentOptionsFixture,
  paymentFormFixture,
  paymentOptionsFixture,
} from '../../../../../test/fixtures';
import { RateModule } from '../../rate.module';

import { TermsFormComponent } from './terms-form.component';

describe('TermsFormComponent', () => {

  let component: TermsFormComponent;
  let fixture: ComponentFixture<TermsFormComponent>;

  let formGroup: InstanceType<typeof TermsFormComponent>['formGroup'];
  let store: Store;

  beforeEach(() => {

    const fb = new FormBuilder();
    const formControl = fb.control(null, []);

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(RateModule),
        { provide: NgControl, useValue: formControl },

      ],
      declarations: [
        TermsFormComponent,
      ],
      schemas: [],
    }).compileComponents();

    store = TestBed.inject(Store);
    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          form: paymentFormFixture(),
          formOptions: paymentOptionsFixture(),
        },
      },
    }));
    store.dispatch(new SetParams({
      ...store.selectSnapshot(ParamsState),
      merchantMode: true,
    }));

    fixture = TestBed.createComponent(TermsFormComponent);
    component = fixture.componentInstance;

    formGroup = component.formGroup;

  });

  afterEach(() => {

    jest.clearAllMocks();
    fixture?.destroy();

  });

  it('should create an instance', () => {

    expect(component).toBeTruthy();
    expect(component instanceof CompositeForm).toBe(true);

  });

  it('should defined formGroup', () => {

    expect(formGroup.get('forOwnAccount')).toBeTruthy();
    expect(formGroup.get('forOwnAccount').disabled).toBeFalsy();
    expect(formGroup.get('forOwnAccount').validator).toBeTruthy();

    expect(formGroup.get('_borrowerAgreeToBeAdvised')).toBeTruthy();
    expect(formGroup.get('_borrowerAgreeToBeAdvised').disabled).toBeFalsy();
    expect(formGroup.get('_borrowerAgreeToBeAdvised').validator).toBeFalsy();

    expect(formGroup.get('dataPrivacy')).toBeTruthy();
    expect(formGroup.get('dataPrivacy').disabled).toBeFalsy();
    expect(formGroup.get('dataPrivacy').validator).toBeTruthy();

    expect(formGroup.get('_agreeToBeAdvised')).toBeTruthy();
    expect(formGroup.get('_agreeToBeAdvised').disabled).toBeTruthy();
    expect(formGroup.get('_agreeToBeAdvised').validator).toBeFalsy();

    expect(formGroup.get('advertisementConsent')).toBeTruthy();
    expect(formGroup.get('advertisementConsent').disabled).toBeFalsy();
    expect(formGroup.get('advertisementConsent').validator).toBeFalsy();

    expect(formGroup.get('customerConditionsAccepted')).toBeTruthy();
    expect(formGroup.get('customerConditionsAccepted').disabled).toBeFalsy();
    expect(formGroup.get('customerConditionsAccepted').validator).toBeFalsy();

    expect(formGroup.get('webIdConditionsAccepted')).toBeTruthy();
    expect(formGroup.get('webIdConditionsAccepted').disabled).toBeFalsy();
    expect(formGroup.get('webIdConditionsAccepted').validator).toBeTruthy();

  });

  it('should correct update isComfortCardCondition', (done) => {

    component.isComfortCardCondition$.subscribe(((condition) => {
      expect(condition).toBeTruthy();

      done();
    }));

  });

  it('should correct update advertisementConsent and customerConditionsAccepted if value changes', () => {

    component.ngOnInit();

    formGroup.get('_borrowerAgreeToBeAdvised').setValue(false);
    formGroup.get('_agreeToBeAdvised').setValue(false);
    expect(formGroup.get('advertisementConsent').value).toBeFalsy();

    formGroup.get('_borrowerAgreeToBeAdvised').setValue(true);
    formGroup.get('_agreeToBeAdvised').setValue(false);
    expect(formGroup.get('advertisementConsent').value).toBeTruthy();

    formGroup.get('_borrowerAgreeToBeAdvised').setValue(true);
    formGroup.get('_agreeToBeAdvised').setValue(true);
    expect(formGroup.get('advertisementConsent').value).toBeTruthy();

    formGroup.get('forOwnAccount').setValue(false);
    formGroup.get('dataPrivacy').setValue(false);
    expect(formGroup.get('customerConditionsAccepted').value).toBeFalsy();

    formGroup.get('forOwnAccount').setValue(true);
    formGroup.get('dataPrivacy').setValue(false);
    expect(formGroup.get('customerConditionsAccepted').value).toBeFalsy();

    formGroup.get('forOwnAccount').setValue(false);
    formGroup.get('dataPrivacy').setValue(true);
    expect(formGroup.get('customerConditionsAccepted').value).toBeFalsy();

    formGroup.get('forOwnAccount').setValue(true);
    formGroup.get('dataPrivacy').setValue(true);
    expect(formGroup.get('customerConditionsAccepted').value).toBeTruthy();

  });

});
