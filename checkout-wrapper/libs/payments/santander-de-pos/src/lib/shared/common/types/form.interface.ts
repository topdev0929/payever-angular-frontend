import { GuarantorRelation, PersonTypeEnum, WeekOfDelivery } from './enums';
import { RateInterface } from './rate';

export interface RatesFormValue {
  _rate: RateInterface;
  creditDurationInMonths: number;
  desiredInstalment: number;
  _desiredInstalmentView: number;
}

export interface DetailsFormValue {
  commodityGroup: string;
  condition: string;
  _condition_view: string;
  _program_view: string;
  [PersonTypeEnum.Customer]: {
    profession: string;
    personalDateOfBirth: string | Date;
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

export interface TermsFormValue {
  forOwnAccount: boolean;
  _borrowerAgreeToBeAdvised: boolean;
  dataPrivacy: boolean;
  _agreeToBeAdvised: boolean;
  advertisementConsent: boolean;
  customerConditionsAccepted: boolean;
  webIdConditionsAccepted?: boolean;
}

export interface PersonalFields {
  _idPassed: boolean;

  profession: string;
  personalDateOfBirth: Date;
  typeOfIdentification: string;

  addressResidentSince: Date;
  addressPhoneNumber: string;
  addressMobilePhoneNumber: string;
  identificationNumber: string;
  identificationPlaceOfIssue: string;
  identificationDateOfIssue: Date;
  identificationDateOfExpiry: Date;
  identificationIssuingAuthority: string;
  personalMaritalStatus: string;
  personalNationality: string;
  personalPlaceOfBirth: string;
  personalBirthName: string;
  numberOfChildren?: number;
}

export interface AddressFormValue {
  salutation: string;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  zipCode: string;
  street: string;
  streetName: string;
  streetNumber: string;
  email?: string;
  fullAddress?: string;
}

export interface GuarantorAddressFields {
  contactEmail: string;
  addressSalutation: string;
  addressFirstName: string;
  addressLastName: string;
  _full_address: string;
  addressCountry: string;
  addressCity: string;
  addressZip: string;
  addressStreet: string;
  addressStreetNumber: string;
}

export interface BankFields {
  bankIBAN: string;
  bankBIC: string;
}


export interface BankFormValue {
  customer?: BankFields;
}

export interface ProtectionFormValue {
  _yes: boolean;
  _no: boolean;
  creditProtectionInsurance: boolean;
  dataForwardingRsv?: boolean;
  cpiCreditDurationInMonths?: number;
}

export interface IncomeFields {
  netIncome: number;
  partnerIncomeNet: number;
  otherIncomeFromHousehold: number;
  typeOfResident: number;
  incomeFromRent: number;
  housingCosts: number;
  supportPayment: number;
  incomeInfo?: string;
}

export interface IncomeFormValue {
  customer?: IncomeFields;
  guarantor?: IncomeFields;
}
export interface EmploymentFields {
  employer: string;
  employedSince: Date;
  _isTemporaryUntil: boolean;
  temporaryEmployedUntil: Date;
}

export interface EmploymentFormValue {
  customer?: EmploymentFields;
  guarantor?: EmploymentFields;
}

export interface PrevAddressFields {
  prevAddressResidentSince?: Date;
  prevAddressCountry?: string;
  prevAddressCity?: string;
  prevAddressZip?: string;
  prevAddressStreet?: string;
  prevAddressStreetNumber?: string;
  _prevAddressLine?: string;
}

export interface PrevAddressFormValue {
  customer?: PrevAddressFields;
  guarantor?: PrevAddressFields;
}

export interface IdentifyAddressForm {
  customer?: AddressFormValue;
  guarantor?: AddressFormValue;
}

export interface GuarantorAddressFormValue {
  guarantor?: GuarantorAddressFields;
}

export interface FormValue {
  ratesForm: RatesFormValue;
  detailsForm: DetailsFormValue;
  termsForm: TermsFormValue;
  addressForm: AddressFormValue;
  guarantorAddress: GuarantorAddressFormValue;
  guarantorDetailsForm: Partial<GuarantorAddressFormValue>;
  prevAddressForm: PrevAddressFormValue;
  bankForm: BankFormValue;
  incomeForm: IncomeFormValue;
  employmentForm: EmploymentFormValue;
  protectionForm: ProtectionFormValue;
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
