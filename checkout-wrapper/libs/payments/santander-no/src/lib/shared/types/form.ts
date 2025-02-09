
import { Observable, ReplaySubject } from 'rxjs';

import { AddressInterface } from '@pe/checkout/types';

import { ScenarioEnum } from '../components';

import { ProductTypeEnum } from './enums';
import { FormOptionsInterface } from './form-options';
import { RatesFormInterface } from './form-rates.interface';

export interface SelectedRateDataInterface { // Sale as FormRatesMainInterface
  campaignCode?: string; // Hidden
  monthlyAmount?: number; // Hidden
}

export interface FormRatesMainInterface extends SelectedRateDataInterface {
  creditType?: ProductTypeEnum; // Hidden
  socialSecurityNumber?: string;
  telephoneMobile?: string;
}

export interface FormRatesCheckboxes1Interface {
  acceptedCreditCheck?: boolean;
}

export interface FormHiddenInterface {
  applicationNumber?: string; // Hidden
  needMoreInfoScenario?: string; // Hidden
  amlEnabled?: boolean; // Hidden
}

export interface FormPersonalInterface {
  norwegianCitizen?: boolean;
  residentialStatus?: string;
  maritalStatus?: string;
  professionalStatus?: string;
  employer?: string;
  employedSince?: string;
  employmentPercent?: number;
  netMonthlyIncome?: number;
  rentIncome?: string;
  numberOfChildren?: number;
}

export interface FormDebtInterface {
  totalDebt?: string;
}


export interface FormMortgageLoanDetailsInterface {
  loanAmount: number;
  remainingTerms: number;
  interestRate: number;
}

export interface FormMortgageLoansCountInterface {
  _mortgageLoansCount?: number;
}

export interface FormMortgageLoansDetailsInterface {
  _mortgageLoan_0_loanAmount?: number;
  _mortgageLoan_1_loanAmount?: number;
  _mortgageLoan_2_loanAmount?: number;
  _mortgageLoan_0_remainingTerms?: number;
  _mortgageLoan_1_remainingTerms?: number;
  _mortgageLoan_2_remainingTerms?: number;
  _mortgageLoan_0_interestRate?: number;
  _mortgageLoan_1_interestRate?: number;
  _mortgageLoan_2_interestRate?: number;

  // `_mortgageLoan_{x}_...` are transformed into `mortgageLoans` on fly
  mortgageLoans?: FormMortgageLoanDetailsInterface[];
}


export interface FormSecuredLoanDetailsInterface {
  loanAmount: number;
  remainingTerms: number;
  interestRate: number;
}

export interface FormSecuredLoansCountInterface {
  _securedLoansCount?: number;
}

export interface FormSecuredLoansDetailsInterface {
  _securedLoan_0_loanAmount?: number;
  _securedLoan_1_loanAmount?: number;
  _securedLoan_2_loanAmount?: number;
  _securedLoan_0_remainingTerms?: number;
  _securedLoan_1_remainingTerms?: number;
  _securedLoan_2_remainingTerms?: number;
  _securedLoan_0_interestRate?: number;
  _securedLoan_1_interestRate?: number;
  _securedLoan_2_interestRate?: number;
  securedLoans?: FormSecuredLoanDetailsInterface[]; // `_securedLoan_{x}_...` are transformed into `securedLoans` on fly
}


export interface FormStudentLoanDetailsInterface {
  loanAmount: number;
  remainingTerms: number;
}

export interface FormStudentLoansCountInterface {
  _studentLoansCount?: number;
}

export interface FormStudentLoansDetailsInterface {
  _studentLoan_0_loanAmount?: number;
  _studentLoan_1_loanAmount?: number;
  _studentLoan_2_loanAmount?: number;
  _studentLoan_0_remainingTerms?: number;
  _studentLoan_1_remainingTerms?: number;
  _studentLoan_2_remainingTerms?: number;
  studentLoans?: FormStudentLoanDetailsInterface[]; // `_studentLoan_{x}_...` are transformed into `studentLoans` on fly
}


export interface FormMonthlyExpensesInterface {
  otherMonthlyExpenses?: string;
}

export interface FormAmlInterface {
  politicalExposedPerson?: boolean;
  appliedOnBehalfOfOthers?: boolean;
  paySource?: string;

  payWithMainIncome?: boolean;
  otherPaySource?: string;
}

export interface FormInterface {
  // STEP 1
  formRates?: RatesFormInterface;
  // STEP 2
  formHidden?: FormHiddenInterface;
  formPersonal?: FormPersonalInterface;

  formMortgageLoansCount?: FormMortgageLoansCountInterface;
  formMortgageLoansDetails?: FormMortgageLoansDetailsInterface;
  formSecuredLoansCount?: FormSecuredLoansCountInterface;
  formSecuredLoansDetails?: FormSecuredLoansDetailsInterface;
  formStudentLoansCount?: FormStudentLoansCountInterface;
  formStudentLoansDetails?: FormStudentLoansDetailsInterface;

  formDebt?: FormDebtInterface;
  formMonthlyExpenses?: FormMonthlyExpensesInterface;
  // formSchool?: FormSchoolInterface;
  formAml?: FormAmlInterface;
  currentStep?: string;
  //it passed from BE
  'pe-form-token'?: string;
}

export interface NodePaymentDetailsInterface extends
  FormRatesMainInterface,
  FormRatesCheckboxes1Interface,
  FormHiddenInterface,
  FormPersonalInterface,
  FormMortgageLoansCountInterface,
  FormMortgageLoansDetailsInterface,
  FormSecuredLoansCountInterface,
  FormSecuredLoansDetailsInterface,
  FormStudentLoansCountInterface,
  FormStudentLoansDetailsInterface,
  FormDebtInterface,
  FormAmlInterface {
  // Just all fields merged flat way
}

export interface NodePaymentResponseDetailsInterface {
  applicantSignReferenceUrl: string;
  applicationNumber: string;
  kid: string;
  frontendSuccessUrl: string;
  frontendFailureUrl: string;
  frontendCancelUrl: string;
}

export interface FormStepperInitConfigInterface {
  billingAddress: AddressInterface;
  stringToDate: (value: string | Date) => Date;
  fieldActive$: (key: string) => Observable<boolean>;
  currencyCode: string;
  needMoreInfoScenario: ScenarioEnum;
  applicationNumber: string;
  isAmlEnabled: boolean;
  nodeFormOptions: FormOptionsInterface;
  destroyed$: ReplaySubject<boolean>;
}
