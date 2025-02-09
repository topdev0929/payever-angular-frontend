import { InjectionToken } from '@angular/core';

export enum EmploymentChoice {
  EMPLOYEE = '4',
  SOLDIER_FOREIGN_FORCES = '5',
  MANAGING_EMPLOYEE = '6',
  EMPLOYEE_IN_PUB_SERVICES = '7',
  WORKER = '8',
  UNEMPLOYED = '9',
  DOCTOR_IN_PERMANENT = '10',
  TRAINEE = '11',
  OFFICAL = '12',
  SOLDIER_PROFESSIONAL = '13',
  HOUSEWIFE_HOMEMAKER = '16',
  PENSIONER1 = '22',
  PENSIONER2 = '23',
  SCHOLAR = '24',
  FEDERAL_VOLUNTARY_SERVICE = '27',
  STUDENT = '28',
  SOLDIER_SHORT_SERVICE = '30',
  SELF_EMPLOYED = 'SELBSTAENDIGER'
}

export enum ResidenceTypes {
  PAID_PROPERTY = '12',
  FOR_RENT = '1',
  PROPERTY = '10',
  WITH_PARENTS = '2'
}

export enum PersonTypeEnum {
  Customer = 'customer',
  Guarantor = 'guarantor',
}

export enum WebIDIdentMode {
  VideoIdent = 'video_ident',
  PayIdent = 'pay_ident',
}

export const EMPLOYMENT_NOT_WORKING: EmploymentChoice[] = [
  EmploymentChoice.UNEMPLOYED,
  EmploymentChoice.PENSIONER1,
  EmploymentChoice.PENSIONER2,
  EmploymentChoice.HOUSEWIFE_HOMEMAKER,
  EmploymentChoice.FEDERAL_VOLUNTARY_SERVICE,
];

export const EMPLOYMENT_STUDY: EmploymentChoice[] = [
  EmploymentChoice.STUDENT,
  EmploymentChoice.SCHOLAR,
];

export enum CommodityGroups {
  NOT_SELECTED = '147;-1',
  OTHER = '147;9'
}

export enum MaritalStatusEnum {
  MARRIED = '15',
  SINGLE = '16',
  SEPARATED = '17',
  DIVORCE = '18',
  WIDOWED = '19',
}

export enum GuarantorRelation {
  OTHER_HOUSEHOLD = 'OTHER_HOUSEHOLD',
  EQUIVALENT_HOUSEHOLD = 'EQUIVALENT_HOUSEHOLD',
  NONE = 'NONE',
}

export const DOWN_PAYMENT_SUB = 100;
export const NET_INCOME_TOO_SMALL = 700;

export const CREDIT_AMOUNT_LIMIT_STUDENT = 1200;
export const CREDIT_AMOUNT_LIMIT_TRAINEE = 1000;

export enum SandtanderDocs {
  SCBGudula = 'SCB_Gudula_Datenschutzhinweis_Ratenkredit_180301_ANSICHT.pdf',
  Datenschutzhinweise = 'M0_55007_1_SCB_Datenschutzhinweise_180229_ANSICHT.pdf',
  ZurDaten = 'M0_55010_Informationen_zur_Daten.pdf',
  Advertising = 'M0_55008_SCB_Information_regarding_advertising_180119_ANSICHT.pdf',
  ProcessingAndTransfer = 'data-processing-and-transfer.pdf',
}


export enum InquireSectionConfig {
  SecondStepBorrower = 'secondStepBorrower',
  FirstStepBorrower = 'firstStepBorrower',

  FirstStepGuarantor = 'firstStepGuarantor',
  SecondStepGuarantor = 'secondStepGuarantor',

  Finish = 'finish',
}

export const PERSON_TYPE = new InjectionToken<PersonTypeEnum>('PERSON_TYPE');
