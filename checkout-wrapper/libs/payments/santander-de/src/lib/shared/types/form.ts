import { RateInterface } from './rate';

export interface FormRatesMainInterface {
  credit_duration_in_months?: number;
  commodity_group?: string;
  condition?: string;
  credit_due_date?: string;
  _down_payment_view?: number;
  down_payment?: number;
  customer?: {
    personalDateOfBirth?: string;
    employment?: string;
    freelancer?: boolean;
  };
}

export interface FormRatesCheckboxes1InterfaceInterface {
  credit_protection_insurance?: boolean;
  _agreement_for_data_processing_and_transfer?: boolean;
}

export interface FormRatesCheckboxes2InterfaceInterface {
  credit_accepts_requests_to_credit_agencies?: boolean;
}

export interface FormRatesCheckboxes3InterfaceInterface {
  allow_promo_email?: boolean;
  allow_promo_phone?: boolean;
  allow_promo_letter?: boolean;
  allow_promo_others?: boolean;
}

export interface FormCustomerDetailsInterface {
  customer?: {
    personalSalutation?: string;
    _firstName?: string;
    _lastName?: string;
    personalBirthName?: string;
    personalTitle?: string;
    addressLandlinePhone?: string;
    addressCellPhone?: string;
    personalNationality?: string;
    personalMaritalStatus?: string;
    personalOtherNationality?: string;
    typeOfIdentification?: string;
    identificationNumber?: string;
    identificationPlaceOfIssue?: string;
    identificationDateOfIssue?: string;
    identificationDateOfExpiry?: string;
    personalPlaceOfBirth?: string;
    addressResidentSince?: string;
    _prevAddressLine?: string;
    prevAddressCity?: string;
    prevAddressStreet?: string;
    prevAddressStreetNumber?: string;
    prevAddressZip?: string;
    prevAddressResidentSince?: string;
    personalResidencePermit?: boolean;
    personalChildren?: number;
  };
}

export interface FormBankInterface {
  bank_i_b_a_n?: string;
  bank_b_i_c?: string;
  bank_account_bank_name?: string;
}

export interface FormSellerInterface {
  seller_name?: string;
  note?: string;
}

export interface FormCustomerIncomeInterface {
  customer?: {
    netIncome?: number;
    netIncomePartner?: number;
    otherIncome?: number;
    sortOfIncome?: string;
    rentalIncome?: number;
    incomeResidence?: string;
    housingCosts?: number;
    monthlyMaintenancePayments?: number;
  };
}

export interface FormCustomerEmploymentInterface {
  customer?: {
    freelancerEmployedSince?: string;
    freelancerCompanyName?: string;
    employer?: string;
    employedSince?: string;
    prevEmployer?: string;
    prevEmployedSince?: string;
    employmentLimited?: boolean;
    employedUntil?: string;
  };
}

export interface FormInterface {
  formRatesMain?: FormRatesMainInterface;
  formRatesCheckboxes1?: FormRatesCheckboxes1InterfaceInterface;
  formRatesCheckboxes2?: FormRatesCheckboxes2InterfaceInterface;
  formRatesCheckboxes3?: FormRatesCheckboxes3InterfaceInterface;

  formCustomerDetails?: FormCustomerDetailsInterface;
  formBank?: FormBankInterface;
  formSeller?: FormSellerInterface;

  formCustomerIncome?: FormCustomerIncomeInterface;
  formCustomerEmployment?: FormCustomerEmploymentInterface;
}

export interface FetchRatesSubjectInterface {
  hash: string,
  rates: RateInterface[],
}
