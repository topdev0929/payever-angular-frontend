
import { GuarantorRelation } from './constants';

export interface BasePaymentDataCustomerInterface {
  addressResidentSince?: string | Date;
  employedSince?: string | Date;
  employedUntil?: string | Date;
  employer?: string;
  employment?: string;
  profession?: string;
  employmentLimited?: boolean;
  freelancer?: boolean;
  freelancerCompanyName?: string;
  freelancerEmployedSince?: string;
  housingCosts?: number;
  /** @deprecated removed on the new flow, for now removing it causes validation errors*/
  identificationDateOfExpiry?: string | Date;
  /** @deprecated removed on the new flow, for now removing it causes validation errors*/
  identificationIssuingAuthority?: string;
  /** @deprecated removed on the new flow, for now removing it causes validation errors*/
  identificationDateOfIssue?: string | Date;
  /** @deprecated removed on the new flow, for now removing it causes validation errors*/
  identificationNumber?: string;
  /** @deprecated removed on the new flow, for now removing it causes validation errors*/
  identificationPlaceOfIssue?: string;
  incomeResidence?: string;
  supportPayment?: number;
  netIncome?: number;
  netIncomePartner?: number;
  partnerIncomeNet?: number;
  otherIncomeFromHousehold?: number;
  personalSalutation?: string;
  personalBirthName?: string;
  personalDateOfBirth?: string | Date;
  personalMaritalStatus?: string;
  personalNationality?: string;
  personalOtherNationality?: string;
  personalPlaceOfBirth?: string;
  personalResidencePermit?: boolean;
  personalTitle?: string;
  prevAddressCity?: string;
  prevAddressResidentSince?: string | Date;
  prevAddressStreet?: string;
  prevAddressStreetNumber?: string;
  prevAddressZip?: string;
  prevEmployedSince?: string | Date;
  prevEmployer?: string;
  rentalIncome?: number;
  incomeFromRent?: number;
  incomeInfo?: string | number;
  typeOfIdentification?: string;
  prevAddressCountry?: string;
}

export interface RatesMinMaxInterface {
  durationMin?: number;
  durationMax?: number;
  installmentMin?: number;
  installmentMax?: number;
}

export interface PaymentDataInterface {
  credit_due_date: number;
  down_payment: number;
  freelancer: boolean;
  amount?: number;
  cpi: boolean;
  dateOfBirth: string;
  employment: string;
  commodity_group: string;
}

export interface PaymentDataCustomerInterface extends BasePaymentDataCustomerInterface {
  addressCellPhone?: string;
  addressLandlinePhone?: string;
  addressMobilePhoneNumber?: string;
  addressCity?: string;
  addressCountry?: string;
  contactEmail?: string;
  addressFirstName?: string;
  addressLastName?: string;
  addressSalutation?: string;
  addressStreet?: string;
  addressStreetNumber?: string;
  addressZip?: string;
  addressResidentSince?: string;

  bankIBAN?: string;
  bankBIC?: string;
  bankName?: string;
  typeOfResident?: string;
  addressPhoneNumber?: string;
  employer?: string;
  profession?: string;
  freelancer?: boolean;
  typeOfGuarantorRelation?: GuarantorRelation
}

export interface RedirectUrls {
  frontendSuccessUrl: string;
  frontendFailureUrl: string;
  frontendCancelUrl: string;
}

export interface NodePaymentDetailsInterface extends RedirectUrls {
  typeOfGuarantorRelation?: GuarantorRelation
  downPayment?: number;
  duration?: number;
  creditProtectionInsurance?: boolean;
  advertisementConsent?: boolean;
  dayOfFirstInstalment?: number;
  commodityGroup?: string;
  customer: PaymentDataCustomerInterface;
  guarantor?: PaymentDataCustomerInterface;
  dataForwardingRsv?: boolean;
  
  finishOnContractCenter?: boolean;
}
