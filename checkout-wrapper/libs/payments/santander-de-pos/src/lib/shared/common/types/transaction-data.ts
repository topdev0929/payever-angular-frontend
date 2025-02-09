export interface TransactionDataPersonInterface {
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
}

export interface TransactionDataInterface {
  creditProtectionInsurance: boolean;
  desiredInstalment: number;
  customer: TransactionDataPersonInterface
  guarantor?: TransactionDataPersonInterface;
  commodityGroup: string;
  condition: string;
  creditDurationInMonths: number;
  posVerifyType: number;
  frontendCancelUrl: string;
  frontendFailureUrl: string;
  frontendSuccessUrl: string;
  posMerchantMode: boolean;
}
