
import { GuarantorRelation, PersonTypeEnum } from './constants';

export interface HiddenFormValue {
  credit_duration_in_months: number;
}

export interface RatesFormValue {
  credit_due_date: number;
  commodity_group: string;
  condition: string;
  _down_payment_view: number;
  down_payment: number;
}

export interface TermsFormValue {
  credit_protection_insurance: boolean;
  _agreement_for_data_processing_and_transfer: boolean;
  credit_accepts_requests_to_credit_agencies: boolean;
  allow_promo_email: boolean;
  allow_promo_phone: boolean;
  allow_promo_letter: boolean;
  allow_promo_others: boolean;
}

export interface BankFormValue {
  bank_i_b_a_n: string;
  bank_b_i_c: string;
  bank_account_bank_name: string;
}

export interface CustomerPrevAddressFormValue {
  _prevAddressLine: string;
  prevAddressCity: string;
  prevAddressStreet: string;
  prevAddressStreetNumber: string;
  prevAddressZip: string;
  prevAddressResidentSince: string;
  prevAddressCountry: string;
}

export interface PersonalFormValue {
  personalPlaceOfBirth: string;
  personalBirthName: string;
  addressLandlinePhone: string;
  addressCellPhone: string;
  personalNationality: string;
  personalMaritalStatus: string;
  addressResidentSince: string;
  prevAddress?: CustomerPrevAddressFormValue;
  personalDateOfBirth: string;
  employment: string;
  freelancer: boolean;
  typeOfGuarantorRelation?: GuarantorRelation;
  _isValid?: boolean;
}

export interface IncomeFormValue {
  netIncome: number;
  netIncomePartner: number;
  otherIncome: number;
  sortOfIncome: string;
  rentalIncome: number;
  incomeResidence: string;
  housingCosts: number;
  monthlyMaintenancePayments: number;
}

export interface EmploymentFormValue {
  freelancer: {
    freelancerEmployedSince: Date;
    freelancerCompanyName: string;
  },
  employer: string;
  employedSince: Date;
  prevEmployer: string;
  prevEmployedSince: Date;
  employmentLimited: boolean;
  employedUntil: Date;
}

export interface GuarantorDetailsFormValue {
  email: string;
  salutation: string;
  firstName: string;
  lastName: string;
}
export interface PersonFormValue {
  personalForm: PersonalFormValue;
  incomeForm: IncomeFormValue;
  protectionForm?: ProtectionFormValue;
  employmentForm: EmploymentFormValue;
  bankForm: BankFormValue;
}

export interface GuarantorFormValue extends PersonFormValue {
  addressForm: {
    city?: string;
    country?: string;
    organizationName?: string;
    email?: string;
    firstName?: string;
    fullAddress?: string;
    lastName?: string;
    phone?: number;
    salutation?: string;
    street?: string;
    streetName?: string;
    streetNumber?: string;
    select_address?: string;
    socialSecurityNumber?: string;
    zipCode?: string;
  };
}

export interface FormValue {
  hiddenForm: HiddenFormValue;
  ratesForm: RatesFormValue;
  termsForm: TermsFormValue;
  [PersonTypeEnum.Customer]: PersonFormValue;
  [PersonTypeEnum.Guarantor]?: GuarantorFormValue;
}



export interface ProtectionFormValue {
  _yes: boolean;
  _no: boolean;
  creditProtectionInsurance: boolean;
  dataForwardingRsv?: boolean
}
