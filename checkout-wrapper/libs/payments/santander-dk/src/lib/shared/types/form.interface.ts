export interface TermsFormValue {
  digitalConsent: boolean;
  acceptBusinessTerms: boolean;
}

export interface RatesFormValue {
  _isSafeInsuranceAllowed: boolean;
  productId: string;
  monthlyAmount: number;
  totalCreditAmount: number;
  creditDurationInMonths: number;
}

export interface MitIdFormValue {
  debtorId: string;
  applicationNumber: string;
}

export interface SkatIdFormValue {
  _skatReady: boolean;
}

export interface BankConsentFormValue {
  _bankConsentReady: boolean;
  _psd2Status: boolean;
  _insuranceEnabled?: boolean;
  _insuranceMonthlyCost?: number;
  _insurancePercent?: number;
  _insuranceProcessed?: boolean;
  wasCPRProcessed?: boolean;
  wasTaxProcessed?: boolean;
}

export interface BankDetailsFormValue {
  bankRegistrationNumber: string;
  bankAccountNumber: string;
  eCard: boolean;
}

export interface FinancedTypeView {
  title: string;
  label: string;
  value: string;
  index: number;
}

export interface CarsFormValue {
  _count: number;
  cars: { age: number; monthlyExpense: number; financedType: string | number; financedTypeView: FinancedTypeView }[];
}

export interface ChildrenFormValue {
  _count: number;
  children: { age: number }[];
}

export interface CprDetailsFormValue {
  _addressLine: string;
  firstName: string;
  lastName: string;
  socialSecurityNumber: string;
  city: string;
  address: string;
  postalCode: string;
  _insuranceEnabled: boolean;
  _insuranceMonthlyCost: number;
  _insurancePercent: number;
}

export interface ExposedPersonFormValue {
  politicalExposedPerson: boolean;
}

export interface FinanceDetailsFormValue {
  monthlySalaryBeforeTax: number;
  totalDebt: number;
  totalTransportCostMonthly: number;
  totalRentMonthly: number;
  insuranceFormUnemployment: boolean;
  payWithMainIncome: boolean;
  paySource: string;
  otherPaySource: string;
}

export interface PersonalFormValue {
  phoneNumber: string;
  emailAddress: string;
  _confirmEmail: string;
  productConsentOptOut: boolean;
  maritalStatus: string;
  citizenship: string;
  _householdExpenses: string;
  householdBudgetPercentage: number;
  residencePermitNumber: string;
  residencePermitType: string;
  residencePermitDate: string;
  employmentType: number;
  employedSince: string;
  residentialType: string;
  currentYearDebt: number;
  _disableSafeInsurance: boolean;
}

export interface SafeInsuranceForm {
  wantsSafeInsurance: boolean;
  insuranceForUnemployment: boolean;
}

export interface ConfirmFormValue {
  applyOnBehalfOfOther: boolean;
  confirmEnteredData: boolean;
  _agreeObtainCreditStatus: boolean;
}

export interface FormValue {
  ratesForm: RatesFormValue;
  termsForm: TermsFormValue;
  mitIdForm: MitIdFormValue;
  skatIdForm: SkatIdFormValue;
  bankConsentForm: BankConsentFormValue;
  bankDetailsForm: BankDetailsFormValue;
  carsForm: CarsFormValue;
  childrenForm: ChildrenFormValue;
  cprDetailsForm: CprDetailsFormValue;
  exposedPersonForm: ExposedPersonFormValue;
  financeDetailsForm: FinanceDetailsFormValue;
  personalForm: PersonalFormValue;
  safeInsuranceForm: SafeInsuranceForm;
  confirmForm: ConfirmFormValue;
}
