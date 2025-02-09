import { Observable, ReplaySubject } from 'rxjs';

import { AddressInterface } from '@pe/checkout/types';

import {
  BankConsentFormValue,
  BankDetailsFormValue,
  CarsFormValue,
  ChildrenFormValue,
  ConfirmFormValue,
  CprDetailsFormValue,
  ExposedPersonFormValue,
  FinanceDetailsFormValue,
  MitIdFormValue,
  PersonalFormValue,
  RatesFormValue,
  SafeInsuranceForm,
  SkatIdFormValue,
  TermsFormValue,
} from './form.interface';

export interface SelectedRateDataInterface {

  // Selected product:
  productId?: string;
  _isSafeInsuranceAllowed?: boolean;

  // Selected rate:
  monthlyAmount?: number;
  totalCreditAmount?: number;
  creditDurationInMonths?: number;
}


export const LEASED_WITHOUT_SERVICE_FIX_KEY = 'leased_without_service';

export type ValuesOf<T> = T[keyof T];


export interface NodePaymentDetailsInterface extends
  RatesFormValue,
  TermsFormValue,
  MitIdFormValue,
  SkatIdFormValue,
  BankConsentFormValue,
  BankDetailsFormValue,
  CarsFormValue,
  ChildrenFormValue,
  Omit<CprDetailsFormValue, '_insuranceEnabled' | '_insuranceMonthlyCost' | '_insurancePercent'>,
  ExposedPersonFormValue,
  FinanceDetailsFormValue,
  PersonalFormValue,
  SafeInsuranceForm,
  ConfirmFormValue
  {
  childrenLivingHome: number;
  carsHousehold: number;

  purposeOfLoan: string;
  marketingSmsConsent: boolean;
  marketingEmailConsent: boolean;
  allowCreditStatusLookUp: boolean;
  productConsent: boolean;
}

// eslint-disable-next-line
export interface NodePaymentResponseDetailsInterface {}

export interface FormStepperInitConfigInterface {
  billingAddress: AddressInterface;
  stringToDate: (value: string | Date) => Date;
  fieldValue$: (key: string) => Observable<any>;
  currencyCode: string;
  destroyed$: ReplaySubject<boolean>;
}
