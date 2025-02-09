import { SalesScoringType } from '@pe/checkout/types';

import { MobileSigningStatusesEnum } from '../../enums';


export interface SelectedRateDataInterface {
  campaignCode?: string;
}

export interface FormRatesMainInterface extends SelectedRateDataInterface {
  _: void; // To hide compile error
}

export interface FormSSNInterface {
  socialSecurityNumber?: string;
  inquiryId?: string; // Hidden
  salesScoringType?: SalesScoringType; // Hidden
  phone?: string;
}

export interface FormRatesCheckboxes1Interface {
  acceptConditions?: boolean;
}

export interface FormAppDetailsInterface {
  citizenship?: string;
  citizenshipSecond?: string;
  salesScoringType?: SalesScoringType;
  monthlyGrossIncome?: number;
}

export interface FormExposedPersonInterface {
  politicallyExposedPerson?: boolean;
}

export interface FormFinanceDetailsInterface {
  employmentType?: string;
  employer?: string;
  primaryIncomeRepayment: boolean;
  repaymentSource: string;
  repaymentSourceOther: string;
}

export interface FormHouseholdExpensesInterface {
  accommodationType?: string;
  housingCostPerMonth?: string;
  numberOfChildren?: number;
}

export interface FormConfirmInterface {
  thirdPartyDeclaration: boolean;
}

export interface RatesFormValue {
  campaignCode: string;
  inquiryId: string;
  salesScoringType: SalesScoringType;
}

export interface SsnFormValue {
  socialSecurityNumber: string;
  phone: string;
}

export interface TermsFormValue {
  acceptConditions: boolean;
}

export interface PersonalFormValue {
  citizenship: string;
  citizenshipSecond: string;
  salesScoringType: SalesScoringType;
  monthlyGrossIncome: number;
}

export interface ExposedPersonFormValue {
  politicallyExposedPerson: boolean;
}

export interface FinanceDetailsFormValue {
  employmentType: string;
  employer: string;
  primaryIncomeRepayment: boolean;
  repaymentSource: string;
  repaymentSourceOther: string;
}

export interface HouseholdFormValue {
  accommodationType: string;
  housingCostPerMonth: string;
  numberOfChildren: number;
}

export interface ExistingLoansFormValue {
  totalDebtAmountExcludingMortgages: number;
  totalMonthlyDebtCostExcludingMortgages: number;
}

export interface FormInterface {
  ratesForm?: RatesFormValue;
  ssnForm?: SsnFormValue;
  termsForm?: TermsFormValue;
  personalForm?: PersonalFormValue;
  exposedPersonForm?: ExposedPersonFormValue;
}

export interface NodePaymentDetailsInterface extends
  FormRatesMainInterface,
  FormSSNInterface,
  FormRatesCheckboxes1Interface,
  FormAppDetailsInterface {
  // Just all fields merged flat way
  inquiryId?: string; // This one we request and fill before submit
  employmentType: string; // Should be filled with the "Permanent" value if it's empty
}

export interface NodePaymentResponseDetailsInterface {
  signingUrl: string;
  mobileSigningStatus: MobileSigningStatusesEnum;
}
