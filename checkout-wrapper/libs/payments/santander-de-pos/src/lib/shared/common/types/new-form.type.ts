
import { GuarantorRelation, PersonTypeEnum, WeekOfDelivery } from './enums';
import { RateInterface } from './rate';

export interface DetailsFormValue {
  commodityGroup: string;
  condition: string;
  _condition_view: string;
  _program_view: string;
  [PersonTypeEnum.Customer]: {
    profession: string;
    personalDateOfBirth: Date;
  };
  typeOfGuarantorRelation: GuarantorRelation;
  weekOfDelivery: string;
  _weekOfDelivery_view: WeekOfDelivery;
  _customWeekOfDelivery_view: string | Date;
  dayOfFirstInstalment: number;
  downPayment: number;
  _downPayment_view: number;
  _enableDesiredInstalment: boolean;
}

export interface RatesFormValue {
  _rate: RateInterface;
  creditDurationInMonths: number;
  desiredInstalment: number;
  _desiredInstalmentView: number;
}

export interface TermsFormValue {
  forOwnAccount: boolean;
  _borrowerAgreeToBeAdvised: boolean;
  dataPrivacy: boolean;
  _agreeToBeAdvised: boolean;
  advertisementConsent: boolean;
  customerConditionsAccepted: boolean;
  webIdConditionsAccepted?: boolean;
}

export interface IdentifyFormValue {
  typeOfIdentification: string;
  identificationNumber: string;
  identificationPlaceOfIssue: string;
  identificationDateOfIssue: Date;
  identificationDateOfExpiry: Date;
  identificationIssuingAuthority: string;
  personalDateOfBirth: Date;
  personalNationality: string;
  personalPlaceOfBirth: string;
  personalBirthName: string;
  _idPassed: boolean;
  _docsMarkAsUploaded: boolean;
  _docsOtherType: string;
}

export interface AddressFormValue {
  id?: number;
  city: string;
  country: string;
  organizationName?: string;
  email: string;
  firstName: string;
  fullAddress: string;
  lastName: string;
  phone?: number;
  salutation: string;
  street: string;
  streetName: string; // Hidden
  streetNumber: string; // Hidden
  socialSecurityNumber?: string;
  zipCode?: string;
}

export interface EmploymentFormValue {
  employer: string;
  employedSince: Date;
  _isTemporaryUntil: boolean;
  temporaryEmployedUntil: Date;
}

export interface IncomeFormValue {
  netIncome: number;
  partnerIncomeNet: number;
  otherIncomeFromHousehold: number;
  typeOfResident: number;
  incomeFromRent: number;
  housingCosts: number;
  supportPayment: number;
  incomeInfo?: string;
}

export interface BankFormValue {
  bankIBAN: string;
  bankBIC: string;
}

export interface ProtectionFormValue {
  _yes: boolean;
  _no: boolean;
  creditProtectionInsurance: boolean;
  dataForwardingRsv?: boolean;
  _cpiCreditDurationInMonths?: number;
}

export interface PrevAddressFormValue {
  prevAddressResidentSince?: Date;
  prevAddressCountry?: string;
  prevAddressCity?: string;
  prevAddressZip?: string;
  prevAddressStreet?: string;
  prevAddressStreetNumber?: string;
  _prevAddressLine?: string;
}

export interface PersonFormValue {
  _identifyForm: IdentifyFormValue;
  addressForm: AddressFormValue;
  employmentForm?: EmploymentFormValue;
  incomeForm: IncomeFormValue;
  bankForm: BankFormValue;
  protectionForm: ProtectionFormValue;
  personalForm: PersonalFormValue;
  prevAddressForm: PrevAddressFormValue;
}

export interface GuarantorDetailsFormValue {
  email: string;
  salutation: string;
  firstName: string;
  lastName: string;
}

export interface GuarantorFormValue extends PersonFormValue {
  detailsForm: GuarantorDetailsFormValue;
}

export interface PersonalFormValue extends IdentifyFormValue {
  personalMaritalStatus: string;
  profession: string;
  addressMobilePhoneNumber: string;
  addressPhoneNumber: string;
  addressResidentSince: Date;
  numberOfChildren: number;
}

export type FormValue = {
  ratesForm: RatesFormValue;
  detailsForm: DetailsFormValue;
  termsForm: TermsFormValue;
  billingAddress: AddressFormValue;
  protectionForm?: ProtectionFormValue,

  [PersonTypeEnum.Customer]: PersonFormValue;
  [PersonTypeEnum.Guarantor]?: GuarantorFormValue;
}

export interface EditFormValue extends FormValue {
  prevAddressCustomerForm?: PrevAddressFormValue;
  prevAddressGuarantorForm?: PrevAddressFormValue;
  protectionCustomerForm?: ProtectionFormValue;
  protectionGuarantorForm?: ProtectionFormValue;
  employmentCustomerForm: EmploymentFormValue;
  employmentGuarantorForm: EmploymentFormValue;
  incomeCustomerForm: IncomeFormValue;
  incomeGuarantorForm: IncomeFormValue;
}
