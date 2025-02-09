import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';

import { AnalyticConsentEventEnum } from '@pe/checkout/analytics';
import { FlowState, PaymentState } from '@pe/checkout/store';
import { FlowInterface } from '@pe/checkout/types';

import {
  FormOptionsInterface,
  FormValue,
  TermsFormValue,
} from '../../../../common';



@Injectable()
export class TermsFormService {
  @SelectSnapshot(FlowState.flow) flow!: FlowInterface;

  public readonly options: FormOptionsInterface = this.store
    .selectSnapshot(PaymentState.options);

  public readonly analyticConsentEventEnum = AnalyticConsentEventEnum;

  private readonly paymentForm: FormValue = this.store.selectSnapshot(PaymentState.form);


  get termsForm(): TermsFormValue {
    return this.paymentForm?.termsForm ?? {} as TermsFormValue;
  }

  get initialTermsForm(): TermsFormValue {
    return {
      forOwnAccount: this.termsForm.forOwnAccount ?? this.termsForm.customerConditionsAccepted,
      _borrowerAgreeToBeAdvised: this.termsForm._borrowerAgreeToBeAdvised ?? this.termsForm.advertisementConsent,
      dataPrivacy: this.termsForm.dataPrivacy ?? this.termsForm.customerConditionsAccepted,
      _agreeToBeAdvised: this.termsForm._agreeToBeAdvised ?? this.termsForm.advertisementConsent,
      advertisementConsent: this.termsForm.advertisementConsent ?? false,
      customerConditionsAccepted: this.termsForm.customerConditionsAccepted ?? false,
      webIdConditionsAccepted: this.termsForm.webIdConditionsAccepted ?? false,
    };
  }

  constructor(
    private store: Store,
  ) { }
}
