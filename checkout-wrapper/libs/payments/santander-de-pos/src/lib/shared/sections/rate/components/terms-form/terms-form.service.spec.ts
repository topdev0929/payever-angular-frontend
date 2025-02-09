import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';

import { PaymentState, SetFlow, SetPayments } from '@pe/checkout/store';
import { CommonImportsTestHelper, CommonProvidersTestHelper } from '@pe/checkout/testing';
import { PaymentMethodEnum } from '@pe/checkout/types';

import {
  flowWithPaymentOptionsFixture, paymentFormFixture,
  paymentOptionsFixture,
} from '../../../../../test/fixtures';
import { TermsFormValue } from '../../../../common';
import { RateModule } from '../../rate.module';

import { TermsFormService } from './terms-form.service';

describe('TermsFormService', () => {

  let service: TermsFormService;
  let store: Store;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [
        ...CommonImportsTestHelper(),
      ],
      providers: [
        ...CommonProvidersTestHelper(),
        importProvidersFrom(RateModule),
        TermsFormService,
      ],
    }).compileComponents();

    store = TestBed.inject(Store);

    store.dispatch(new SetFlow(flowWithPaymentOptionsFixture()));
    store.dispatch(new SetPayments({
      [PaymentMethodEnum.SANTANDER_POS_INSTALLMENT]: {
        [flowWithPaymentOptionsFixture().connectionId]: {
          ...store.selectSnapshot(PaymentState),
          form: paymentFormFixture(),
          formOptions: paymentOptionsFixture,
        },
      },
    }));

    service = TestBed.inject(TermsFormService);

  });

  afterEach(() => {

    jest.clearAllMocks();

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should get termsForm return details form from state', () => {

    expect(service.termsForm).toEqual(paymentFormFixture().termsForm);

  });

  it('should get initial terms form correctly', () => {

    const expectedInitialTermsForm: TermsFormValue = {
      forOwnAccount: paymentFormFixture().termsForm.customerConditionsAccepted,
      _borrowerAgreeToBeAdvised: paymentFormFixture().termsForm.advertisementConsent,
      dataPrivacy: paymentFormFixture().termsForm.customerConditionsAccepted,
      _agreeToBeAdvised: paymentFormFixture().termsForm.advertisementConsent,
      advertisementConsent: true,
      customerConditionsAccepted: true,
      webIdConditionsAccepted: true,
    };

    expect(service.initialTermsForm).toMatchObject(expectedInitialTermsForm);

  });

});
