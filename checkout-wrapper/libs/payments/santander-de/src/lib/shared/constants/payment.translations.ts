import { EmploymentChoice, MaritalStatusEnum, ResidenceTypes } from '../types';

export interface ValuesTranslationsType {
  [key: string]: (defaultValue: string) => string
}

export const DE_EMPLOYMENT_TYPES: ValuesTranslationsType = {
  [EmploymentChoice.EMPLOYEE]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.employmentTypes.4:${defaultValue}`,
  [EmploymentChoice.MANAGING_EMPLOYEE]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.employmentTypes.6:${defaultValue}`,
  [EmploymentChoice.EMPLOYEE_IN_PUB_SERVICES]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.employmentTypes.7:${defaultValue}`,
  [EmploymentChoice.WORKER]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.employmentTypes.8:${defaultValue}`,
  [EmploymentChoice.UNEMPLOYED]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.employmentTypes.9:${defaultValue}`,
  [EmploymentChoice.DOCTOR_IN_PERMANENT]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.employmentTypes.10:${defaultValue}`,
  [EmploymentChoice.TRAINEE]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.employmentTypes.11:${defaultValue}`,
  [EmploymentChoice.OFFICAL]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.employmentTypes.12:${defaultValue}`,
  [EmploymentChoice.FEDERAL_VOLUNTARY_SERVICE]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.employmentTypes.27:${defaultValue}`,
  [EmploymentChoice.HOUSEWIFE_HOMEMAKER]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.employmentTypes.16:${defaultValue}`,
  [EmploymentChoice.PENSIONER1]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.employmentTypes.22:${defaultValue}`,
  [EmploymentChoice.PENSIONER2]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.employmentTypes.23:${defaultValue}`,
  [EmploymentChoice.SCHOLAR]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.employmentTypes.24:${defaultValue}`,
  [EmploymentChoice.SELF_EMPLOYED]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.employmentTypes.self_employed:${defaultValue}`,
  [EmploymentChoice.SOLDIER_FOREIGN_FORCES]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.employmentTypes.5:${defaultValue}`,
  [EmploymentChoice.SOLDIER_PROFESSIONAL]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.employmentTypes.13:${defaultValue}`,
  [EmploymentChoice.SOLDIER_SHORT_SERVICE]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.employmentTypes.30:${defaultValue}`,
  [EmploymentChoice.STUDENT]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.employmentTypes.28:${defaultValue}`,
};

export const DE_RESIDENTIAL_TYPES: ValuesTranslationsType = {
  [ResidenceTypes.FOR_RENT]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.residentialTypes.1:${defaultValue}`,
  [ResidenceTypes.WITH_PARENTS]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.residentialTypes.2:${defaultValue}`,
  [ResidenceTypes.PROPERTY]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.residentialTypes.10:${defaultValue}`,
  [ResidenceTypes.PAID_PROPERTY]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.residentialTypes.12:${defaultValue}`,
};

export const DE_MARTIAL_STATUSES: ValuesTranslationsType = {
  [MaritalStatusEnum.MARRIED]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.maritalStatuses.15:${defaultValue}`,
  [MaritalStatusEnum.SINGLE]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.maritalStatuses.16:${defaultValue}`,
  [MaritalStatusEnum.SEPARATED]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.maritalStatuses.17:${defaultValue}`,
  [MaritalStatusEnum.DIVORCE]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.maritalStatuses.18:${defaultValue}`,
  [MaritalStatusEnum.WIDOWED]: (defaultValue: string) => $localize`:@@santander-de.choose_payment.maritalStatuses.19:${defaultValue}`,
};
