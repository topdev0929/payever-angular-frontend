
export interface NodePaymentDetailsInterface {
  creditDurationInMonths: number,
  cpiDurationInMonths?: number;
  dayOfFirstInstalment: number,
  desiredInstalment?: number;
  commodityGroup: string,
  condition: string,
  customer: NodePaymentDetailsCustomerInterface,
  typeOfGuarantorRelation: string,
  weekOfDelivery: string,
  downPayment?: number,
  forOwnAccount: boolean,
  dataPrivacy: boolean,
  advertisementConsent: boolean,
  customerConditionsAccepted: boolean,
  webIdConditionsAccepted: boolean,
  guarantor?: NodePaymentDetailsGuarantorInterface,
  creditProtectionInsurance: boolean,
  dataForwardingRsv: boolean,
  addressCountry?: string
}

export interface NodePaymentDetailsCustomerInterface {
  personalDateOfBirth?: Date | string,
  profession: string,
  typeOfIdentification: string,
  addressResidentSince: Date | string,
  addressPhoneNumber: string,
  addressMobilePhoneNumber: string,
  identificationNumber: string,
  identificationPlaceOfIssue: string,
  identificationDateOfIssue: Date | string,
  identificationDateOfExpiry: Date | string,
  identificationIssuingAuthority: string,
  personalMaritalStatus: string,
  personalNationality: string,
  personalPlaceOfBirth: string,
  numberOfChildren: number,
  bankIBAN: string,
  netIncome: number,
  partnerIncomeNet: number,
  otherIncomeFromHousehold: number,
  typeOfResident: string,
  incomeFromRent: number,
  housingCosts: number,
  supportPayment: any,
  employer: string,
  employedSince: Date | string,
  temporaryEmployedUntil: Date | string,
  personalBirthName?: string,
  bankBIC?: string,
  incomeInfo?: string;
  addressCountry?: string
}

export interface NodePaymentDetailsGuarantorInterface {
  typeOfIdentification: string,
  profession: string,
  personalDateOfBirth: Date,
  addressResidentSince: Date,
  addressPhoneNumber: string,
  addressMobilePhoneNumber: string,
  identificationNumber: string | number,
  identificationPlaceOfIssue: string,
  identificationDateOfIssue: Date,
  identificationDateOfExpiry: Date,
  identificationIssuingAuthority: string,
  personalMaritalStatus: string,
  personalNationality: string,
  personalPlaceOfBirth: string,
  numberOfChildren: number,
  contactEmail?: string,
  addressSalutation: string,
  addressFirstName: string,
  addressLastName: string,
  addressCountry: string,
  addressCity: string,
  addressZip: string,
  addressStreet: string,
  addressStreetNumber: string,
  netIncome: number,
  partnerIncomeNet: number,
  otherIncomeFromHousehold: number,
  typeOfResident: string,
  incomeFromRent: number,
  housingCosts: number,
  supportPayment: any,
  employer: string,
  employedSince: Date | string,
  temporaryEmployedUntil: Date,
  personalBirthName?: string,
}

export interface NodePaymentDetailsResponseInterface {
  redirectUrl: string;
  customerSigningLink: string;
  guarantorSigningLink: string;
  isCustomerSigningTriggered?: boolean;
  isGuarantorSigningTriggered?: boolean;
  isFullySigned?: boolean;
  customerSigned?: boolean;
  guarantorSigned?: boolean;
}
