import { EventEmitter } from '@angular/core';

import { RateInterface } from './rate';

export interface SelectedRateDataInterface {
  duration?: number;
  interestRate?: number;
  flatRate?: number;
  monthlyPayment?: number;
  firstMonthPayment?: number;
  lastMonthPayment?: number;
  interest?: number;
  totalCreditCost?: number;
  downPayment?: number;
  amount?: number;
}

export interface FormRatesMainInterface extends SelectedRateDataInterface {
  downPayment: number; // Real deposit is hidden
  _deposit_view: number;
}

export type FormInterface = FormRatesMainInterface

export interface NodeAdditionalPaymentDetailsInterface {
  frontendFinishUrl?: string;
  // frontendFailureUrl?: string;
}

export interface NodePaymentDetailsInterface extends
  // FormSSNInterface,
  FormRatesMainInterface,
  NodeAdditionalPaymentDetailsInterface {
  // Just all fields merged flat way
  // inquiryId?: string; // This one we request and fill before submit
  __?: void;
}


export interface NodePaymentResponseDetailsInterface {
  signingUrl: string;
}

export interface NodePaymentRedirectInterface {
  postParam: string;
  postUrl: string;
  postValue: string;
}

export interface FormStepperInitConfigInterface {
  currencyCode: string;
  initialRate: RateInterface;
  ratesLoading: EventEmitter<boolean>;
}
